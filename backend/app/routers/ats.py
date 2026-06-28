"""
Lansy.ai — ATS Analysis Router
Standalone ATS analysis endpoint.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field

from app.models.user import User
from app.routers.auth import get_current_user
from app.services.ats_service import calculate_ats_score

router = APIRouter(prefix="/ats", tags=["ATS Analysis"])


class ATSAnalysisRequest(BaseModel):
    """Request for standalone ATS analysis."""
    cv_text: str = Field(..., min_length=50, description="CV text to analyze")
    offer_analysis: dict = Field(..., description="Job offer analysis with ats_keywords")


class ATSAnalysisResponse(BaseModel):
    """ATS analysis result."""
    score: int
    matched_keywords: list[str]
    missing_keywords: list[str]
    recommendations: list[str]


@router.post("/analyze", response_model=ATSAnalysisResponse)
async def analyze_ats_score(
    request: ATSAnalysisRequest,
    current_user: User = Depends(get_current_user),
):
    """
    Analyze ATS compatibility of a CV text against an offer analysis.
    This is a standalone endpoint for re-analyzing without generating a new CV.
    """
    result = calculate_ats_score(request.cv_text, request.offer_analysis)
    return ATSAnalysisResponse(**result)
