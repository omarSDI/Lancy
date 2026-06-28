"""
Lansy.ai — Auth Router
Handles Supabase user sync and JWT verification.
"""

import uuid
import logging
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status, Header
from pydantic import BaseModel, EmailStr
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
import jwt

from app.database import get_db
from app.config import settings
from app.models.user import User
from app.models.token_balance import TokenBalance, TokenTransaction
from app.schemas.user import UserSync, UserResponse

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/auth", tags=["Authentication"])


async def get_current_user(
    authorization: Annotated[str | None, Header()] = None,
    db: AsyncSession = Depends(get_db),
) -> User:
    """
    FastAPI dependency to extract and verify the current user from
    a Supabase JWT in the Authorization header.
    Verifies JWT locally (no network call) using supabase_jwt_secret.
    """
    if not authorization:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token d'authentification manquant",
            headers={"WWW-Authenticate": "Bearer"},
        )

    parts = authorization.split()
    if len(parts) != 2 or parts[0].lower() != "bearer":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Format de token invalide. Utilisez 'Bearer <token>'",
        )

    token = parts[1]

    # --- Verify JWT using Supabase Client (handles RS256 seamlessly) ---
    import hashlib
    import asyncio
    from supabase import create_client
    from app.main import redis_client
    
    token_hash = hashlib.sha256(token.encode()).hexdigest()
    cache_key = f"auth:token:{token_hash}"
    user_id = None
    
    # Check cache first
    if redis_client:
        try:
            user_id = await redis_client.get(cache_key)
        except Exception:
            pass

    if not user_id:
        def _verify():
            try:
                # Need a fresh client to override auth header
                client = create_client(settings.supabase_url, settings.supabase_service_key)
                # get_user takes the token directly
                resp = client.auth.get_user(token)
                if resp and resp.user:
                    return resp.user.id
                return None
            except Exception as e:
                logger.warning(f"Supabase auth error: {e}")
                return None

        user_id = await asyncio.to_thread(_verify)
        if not user_id:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Session expirée. Veuillez vous reconnecter.",
            )
            
        # Cache for 10 minutes to reduce network calls
        if redis_client:
            try:
                await redis_client.setex(cache_key, 600, user_id)
            except Exception:
                pass

    # Find the user in our database
    result = await db.execute(
        select(User).where(User.id == uuid.UUID(user_id))
    )
    user = result.scalar_one_or_none()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Utilisateur non trouvé. Veuillez synchroniser votre compte.",
        )

    return user



@router.post("/sync-user", response_model=UserResponse)
async def sync_user(
    user_data: UserSync,
    db: AsyncSession = Depends(get_db),
):
    """
    Sync a Supabase Auth user to our local database.
    Creates the user and initial token balance if they don't exist.
    Called from the frontend after successful Supabase auth.
    """
    # Check if user already exists
    result = await db.execute(
        select(User).where(User.id == user_data.id)
    )
    existing_user = result.scalar_one_or_none()

    if existing_user:
        # Update existing user
        existing_user.email = user_data.email
        if user_data.full_name:
            existing_user.full_name = user_data.full_name
        if user_data.avatar_url:
            existing_user.avatar_url = user_data.avatar_url
        await db.flush()
        logger.info(f"Updated existing user: {user_data.email}")
        return existing_user

    # Create new user
    new_user = User(
        id=user_data.id,
        email=user_data.email,
        full_name=user_data.full_name,
        avatar_url=user_data.avatar_url,
    )
    db.add(new_user)
    
    from sqlalchemy.exc import IntegrityError
    try:
        await db.flush()
    except IntegrityError:
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Un compte avec cet email existe déjà dans la base de données. Si vous avez recréé votre compte, veuillez supprimer l'ancien profil dans Supabase."
        )

    # Create initial token balance (3 free tokens)
    token_balance = TokenBalance(
        user_id=new_user.id,
        balance=3,
        lifetime_used=0,
    )
    db.add(token_balance)

    # Log the signup bonus transaction
    signup_transaction = TokenTransaction(
        user_id=new_user.id,
        amount=3,
        type="signup_bonus",
        description="Bonus d'inscription — 3 tokens offerts",
    )
    db.add(signup_transaction)

    await db.flush()
    logger.info(f"Created new user with 3 free tokens: {user_data.email}")

    return new_user


# ---------------------------------------------------------------
# Register — bypass Supabase SMTP, use Admin API
# ---------------------------------------------------------------

class RegisterRequest(BaseModel):
    """Schema for direct registration bypassing email confirmation."""
    email: EmailStr
    password: str
    full_name: str | None = None


class RegisterResponse(BaseModel):
    """Schema for registration response."""
    access_token: str
    refresh_token: str
    user_id: str
    email: str
    full_name: str | None = None


@router.post("/register", response_model=RegisterResponse)
async def register_user(
    request: RegisterRequest,
    db: AsyncSession = Depends(get_db),
):
    """
    Register a new user:
    1. Create in Supabase via Admin API (no SMTP needed, email auto-confirmed)
    2. Create in local DB with 3 tokens
    3. Sign in and return session tokens
    """
    from supabase import create_client
    supa = create_client(settings.supabase_url, settings.supabase_service_key)

    # 1. Create user in Supabase
    try:
        res = supa.auth.admin.create_user({
            "email": request.email,
            "password": request.password,
            "email_confirm": True,
            "user_metadata": {"full_name": request.full_name or ""},
        })
        supabase_user = res.user
        if not supabase_user:
            raise ValueError("No user returned")
    except Exception as e:
        err_msg = str(e).lower()
        if "already" in err_msg or "exists" in err_msg or "duplicate" in err_msg:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Un compte avec cet email existe d\u00e9j\u00e0. Veuillez vous connecter.",
            )
        logger.error(f"Supabase admin create_user failed: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erreur lors de la cr\u00e9ation du compte. Veuillez r\u00e9essayer.",
        )

    # 2. Create user in local DB
    new_user = User(
        id=supabase_user.id,
        email=request.email,
        full_name=request.full_name,
    )
    db.add(new_user)

    from sqlalchemy.exc import IntegrityError
    try:
        await db.flush()
    except IntegrityError:
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Un compte avec cet email existe d\u00e9j\u00e0 dans notre syst\u00e8me.",
        )

    token_balance = TokenBalance(
        user_id=new_user.id,
        balance=3,
        lifetime_used=0,
    )
    db.add(token_balance)
    signup_transaction = TokenTransaction(
        user_id=new_user.id,
        amount=3,
        type="signup_bonus",
        description="Bonus d'inscription \u2014 3 tokens offerts",
    )
    db.add(signup_transaction)
    await db.flush()
    logger.info(f"Registered new user: {request.email} with 3 tokens")

    # 3. Sign in to get a session
    try:
        session_res = supa.auth.sign_in_with_password({
            "email": request.email,
            "password": request.password,
        })
        session = session_res.session
    except Exception as e:
        logger.error(f"Sign-in after register failed: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Compte cr\u00e9\u00e9 mais la connexion automatique a \u00e9chou\u00e9. Veuillez vous connecter manuellement.",
        )

    return RegisterResponse(
        access_token=session.access_token,
        refresh_token=session.refresh_token,
        user_id=str(supabase_user.id),
        email=request.email,
        full_name=request.full_name,
    )
