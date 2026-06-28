"""
Lansy.ai — CV Generation Router
Main CV generation pipeline: analyze offer → RAG context → generate CV → ATS score.
"""

import uuid
import logging

from fastapi import APIRouter, Depends, HTTPException, status, Response, Request
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func

from app.database import get_db
from app.config import settings
from app.models.user import User
from app.models.cv_session import CVSession
from app.models.user_profile import UserProfile
from app.routers.auth import get_current_user
from app.services import token_service
from app.services.gemini_service import analyze_offer, generate_cv, cv_to_text
from app.services.rag_service import query_relevant_context
from app.services.ats_service import calculate_ats_score
from app.services.pdf_service import generate_pdf
from app.schemas.cv import (
    OfferAnalysisRequest,
    OfferAnalysisResponse,
    CVGenerateRequest,
    CVGenerateResponse,
    CVSessionResponse,
    CVSessionListItem,
    CVHistoryResponse,
    CustomPDFRequest,
)
from app.limiter import limiter

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/cv", tags=["CV Generation"])


@router.post("/analyze-offer", response_model=OfferAnalysisResponse)
@limiter.limit("30/minute")
async def analyze_job_offer(
    request: Request,
    body: OfferAnalysisRequest,
    current_user: User = Depends(get_current_user),
):
    """
    Analyze a job offer to extract keywords, skills, and requirements.
    This endpoint is FREE — no token cost. Rate limited: 30/min per IP.
    """
    try:
        analysis = await analyze_offer(body.offer_text)
        return OfferAnalysisResponse(**analysis)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=str(e),
        )
    except Exception as e:
        logger.error(f"Offer analysis error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erreur interne lors de l'analyse de l'offre. Veuillez réessayer.",
        )


@router.post("/generate", response_model=CVGenerateResponse)
@limiter.limit("10/minute")
async def generate_tailored_cv(
    request: Request,
    body: CVGenerateRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Generate a tailored CV — Full pipeline. Rate limited: 10/min per IP.
    """
    # Step 1: Verify token balance
    balance = await token_service.get_balance(db, current_user.id)
    if balance.balance < 1:
        raise HTTPException(
            status_code=status.HTTP_402_PAYMENT_REQUIRED,
            detail="Solde de tokens insuffisant. Achetez des tokens pour générer un CV.",
        )

    try:
        # Step 2: Analyze offer
        if body.offer_analysis:
            offer_analysis = body.offer_analysis
        else:
            offer_analysis = await analyze_offer(body.offer_text)

        # Step 3: RAG context retrieval
        rag_keywords = (
            offer_analysis.get("ats_keywords", []) +
            offer_analysis.get("technical_skills", [])
        )
        rag_context = await query_relevant_context(
            keywords=rag_keywords,
            n_results=5,
            language=body.language,
        )

        # Step 4: Build user profile for Gemini
        user_profile = {
            "personal_info": body.personal_info,
            "education": body.education,
            "experience": body.experience,
            "skills": body.skills,
            "languages": body.languages,
        }
        cv_data = await generate_cv(
            user_profile=user_profile,
            offer_analysis=offer_analysis,
            rag_context=rag_context,
            language=body.language,
        )

        # Step 5: ATS scoring
        cv_text = cv_to_text(cv_data)
        ats_result = calculate_ats_score(cv_text, offer_analysis)

        # Step 6: Save CV session FIRST (before deducting token)
        # This way, if the session save fails, the token is NOT lost
        session = CVSession(
            user_id=current_user.id,
            offer_text=body.offer_text,
            offer_analysis=offer_analysis,
            generated_cv=cv_data,
            generated_cv_text=cv_text,
            ats_score=ats_result["score"],
            ats_details=ats_result,
            template_id=body.template_id,
            tokens_used=1,
            language=body.language,
        )
        db.add(session)

        # Save profile if requested
        if body.save_profile:
            result = await db.execute(
                select(UserProfile).where(UserProfile.user_id == current_user.id)
            )
            profile = result.scalar_one_or_none()
            if profile:
                profile.personal_info = body.personal_info
                profile.education = body.education
                profile.experience = body.experience
                profile.skills = body.skills
                profile.languages = body.languages
            else:
                profile = UserProfile(
                    user_id=current_user.id,
                    personal_info=body.personal_info,
                    education=body.education,
                    experience=body.experience,
                    skills=body.skills,
                    languages=body.languages,
                )
                db.add(profile)

        # Flush session + profile BEFORE deducting — if this fails, token is safe
        await db.flush()

        # Step 7: Deduct token (atomic, row-level lock)
        new_balance = await token_service.deduct_token(
            db=db,
            user_id=current_user.id,
            amount=1,
            transaction_type="use_cv",
            description=f"Génération CV — {offer_analysis.get('job_title', 'N/A')}",
        )

        logger.info(
            f"CV generated for user {current_user.id}: "
            f"session={session.id}, ATS={ats_result['score']}/100"
        )

        return CVGenerateResponse(
            session_id=session.id,
            generated_cv=cv_data,
            ats_score=ats_result["score"],
            ats_details=ats_result,
            offer_analysis=offer_analysis,
            template_id=body.template_id,
            language=body.language,
            tokens_remaining=new_balance,
        )

    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=str(e),
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"CV generation pipeline error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erreur interne lors de la génération du CV. Veuillez réessayer.",
        )


@router.get("/history", response_model=CVHistoryResponse)
async def get_cv_history(
    page: int = 1,
    per_page: int = 10,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get paginated list of past CV sessions."""
    # Count total
    count_result = await db.execute(
        select(func.count(CVSession.id))
        .where(CVSession.user_id == current_user.id)
    )
    total = count_result.scalar()

    # Fetch paginated
    offset = (page - 1) * per_page
    result = await db.execute(
        select(CVSession)
        .where(CVSession.user_id == current_user.id)
        .order_by(CVSession.created_at.desc())
        .offset(offset)
        .limit(per_page)
    )
    sessions = result.scalars().all()

    items = []
    for s in sessions:
        job_title = None
        if s.offer_analysis and isinstance(s.offer_analysis, dict):
            job_title = s.offer_analysis.get("job_title")

        items.append(CVSessionListItem(
            id=s.id,
            job_title=job_title,
            ats_score=s.ats_score,
            template_id=s.template_id,
            language=s.language,
            created_at=s.created_at,
        ))

    return CVHistoryResponse(
        items=items,
        total=total,
        page=page,
        per_page=per_page,
    )


@router.get("/{session_id}", response_model=CVSessionResponse)
async def get_cv_session(
    session_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get a specific CV session by ID."""
    result = await db.execute(
        select(CVSession).where(
            CVSession.id == session_id,
            CVSession.user_id == current_user.id,
        )
    )
    session = result.scalar_one_or_none()

    if not session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Session CV non trouvée.",
        )

    return CVSessionResponse.model_validate(session)


@router.get("/{session_id}/html", response_class=Response)
async def get_cv_html(
    session_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get the raw HTML of a generated CV session."""
    result = await db.execute(
        select(CVSession).where(
            CVSession.id == session_id,
            CVSession.user_id == current_user.id,
        )
    )
    session = result.scalar_one_or_none()

    if not session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Session CV non trouvée.",
        )

    if not session.generated_cv:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Aucun CV généré pour cette session.",
        )

    personal_info = {}
    profile_result = await db.execute(
        select(UserProfile).where(UserProfile.user_id == current_user.id)
    )
    profile = profile_result.scalar_one_or_none()
    if profile and profile.personal_info:
        personal_info = profile.personal_info

    try:
        from app.services.pdf_service import generate_html
        html_content = generate_html(
            cv_data=session.generated_cv,
            personal_info=personal_info,
            template_id=session.template_id or "modern",
            language=session.language or "fr",
        )
        return Response(content=html_content, media_type="text/html")
    except Exception as e:
        logger.error(f"HTML generation failed: {e}")
        raise HTTPException(status_code=500, detail="Erreur lors de la génération du HTML.")


@router.post("/{session_id}/custom-pdf", response_class=Response)
async def generate_custom_pdf(
    session_id: uuid.UUID,
    request: CustomPDFRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Generate a PDF from a custom HTML string for a specific session."""
    from app.services.pdf_service import generate_pdf_from_html
    import httpx
    from supabase import create_client
    from app.config import settings
    
    result = await db.execute(
        select(CVSession).where(
            CVSession.id == session_id,
            CVSession.user_id == current_user.id,
        )
    )
    session = result.scalar_one_or_none()

    if not session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Session CV non trouvée.",
        )

    job_title = "cv_custom"
    if session.offer_analysis and isinstance(session.offer_analysis, dict):
        job_title = session.offer_analysis.get("job_title", "cv").replace(" ", "_")
    filename = f"lansy_cv_{job_title}.pdf"

    try:
        pdf_bytes = await generate_pdf_from_html(request.html_content)
        
        # Override the cached PDF in Supabase if needed
        if settings.supabase_url and settings.supabase_service_key:
            try:
                import asyncio
                def _upload_to_supabase():
                    supabase = create_client(settings.supabase_url, settings.supabase_service_key)
                    bucket_name = "cv_pdfs"
                    file_path = f"{current_user.id}/{session.id}.pdf"
                    
                    supabase.storage.from_(bucket_name).upload(
                        path=file_path,
                        file=pdf_bytes,
                        file_options={"content-type": "application/pdf", "upsert": "true"}
                    )
                    return supabase.storage.from_(bucket_name).get_public_url(file_path)

                public_url = await asyncio.to_thread(_upload_to_supabase)
                if public_url:
                    session.pdf_url = public_url
                    db.add(session)
                    await db.commit()
            except Exception as e:
                logger.warning(f"Failed to cache custom PDF in Supabase: {e}")
                await db.rollback()
        
        return Response(
            content=pdf_bytes,
            media_type="application/pdf",
            headers={
                "Content-Disposition": f'attachment; filename="{filename}"',
                "Content-Length": str(len(pdf_bytes)),
            },
        )
    except Exception as e:
        logger.error(f"Custom PDF generation failed: {e}")
        raise HTTPException(status_code=500, detail="Erreur lors de la génération du PDF.")


@router.get("/{session_id}/pdf")
async def download_cv_pdf(
    session_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Download CV as PDF for a specific session."""
    import httpx
    from supabase import create_client
    from app.config import settings

    result = await db.execute(
        select(CVSession).where(
            CVSession.id == session_id,
            CVSession.user_id == current_user.id,
        )
    )
    session = result.scalar_one_or_none()

    if not session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Session CV non trouvée.",
        )

    if not session.generated_cv:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Aucun CV généré pour cette session.",
        )

    job_title = "cv"
    if session.offer_analysis and isinstance(session.offer_analysis, dict):
        job_title = session.offer_analysis.get("job_title", "cv").replace(" ", "_")
    filename = f"lansy_cv_{job_title}.pdf"

    # If PDF is already cached, fetch and return it
    if session.pdf_url:
        try:
            async with httpx.AsyncClient() as client:
                resp = await client.get(session.pdf_url)
                if resp.status_code == 200:
                    return Response(
                        content=resp.content,
                        media_type="application/pdf",
                        headers={
                            "Content-Disposition": f'attachment; filename="{filename}"',
                        },
                    )
        except Exception as e:
            logger.warning(f"Failed to fetch cached PDF from {session.pdf_url}: {e}")
            # Fall through to regenerate

    # Get personal info from user profile or session data
    personal_info = {}
    profile_result = await db.execute(
        select(UserProfile).where(UserProfile.user_id == current_user.id)
    )
    profile = profile_result.scalar_one_or_none()
    if profile and profile.personal_info:
        personal_info = profile.personal_info

    # Generate PDF
    try:
        pdf_bytes = await generate_pdf(
            cv_data=session.generated_cv,
            personal_info=personal_info,
            template_id=session.template_id or "modern",
            language=session.language or "fr",
        )

        # Cache the generated PDF in Supabase
        if not session.pdf_url and settings.supabase_url and settings.supabase_service_key:
            try:
                # Use asyncio.to_thread since supabase-py sync API is blocking
                import asyncio
                def _upload_to_supabase():
                    supabase = create_client(settings.supabase_url, settings.supabase_service_key)
                    bucket_name = "cv_pdfs"
                    file_path = f"{current_user.id}/{session.id}.pdf"
                    # Try to create bucket if it doesn't exist (fails silently if it does)
                    try:
                        supabase.storage.create_bucket(bucket_name, {"public": True})
                    except Exception:
                        pass
                    
                    supabase.storage.from_(bucket_name).upload(
                        path=file_path,
                        file=pdf_bytes,
                        file_options={"content-type": "application/pdf"}
                    )
                    return supabase.storage.from_(bucket_name).get_public_url(file_path)

                public_url = await asyncio.to_thread(_upload_to_supabase)
                if public_url:
                    session.pdf_url = public_url
                    db.add(session)
                    await db.commit()
            except Exception as e:
                logger.warning(f"Failed to cache PDF in Supabase: {e}")
                await db.rollback() # Ensure DB session is clean

        return Response(
            content=pdf_bytes,
            media_type="application/pdf",
            headers={
                "Content-Disposition": f'attachment; filename="{filename}"',
            },
        )
    except Exception as e:
        logger.error(f"PDF download error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erreur lors de la génération du PDF. Veuillez réessayer.",
        )
