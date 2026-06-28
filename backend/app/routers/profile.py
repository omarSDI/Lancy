"""
Lansy.ai — Profile Router
User profile CRUD for pre-filling CV forms.
"""

import logging

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.database import get_db
from app.models.user import User
from app.models.user_profile import UserProfile
from app.routers.auth import get_current_user
from app.schemas.user import UserProfileUpdate, UserProfileResponse

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/profile", tags=["Profile"])


@router.get("", response_model=UserProfileResponse | None)
async def get_profile(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get the saved user profile for pre-filling CV forms."""
    result = await db.execute(
        select(UserProfile).where(UserProfile.user_id == current_user.id)
    )
    profile = result.scalar_one_or_none()

    if not profile:
        return None

    return UserProfileResponse.model_validate(profile)


@router.put("", response_model=UserProfileResponse)
async def update_profile(
    data: UserProfileUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Create or update the user profile.
    Upsert: creates if doesn't exist, updates if it does.
    """
    result = await db.execute(
        select(UserProfile).where(UserProfile.user_id == current_user.id)
    )
    profile = result.scalar_one_or_none()

    if profile:
        # Update existing profile
        if data.personal_info is not None:
            profile.personal_info = data.personal_info
        if data.education is not None:
            profile.education = data.education
        if data.experience is not None:
            profile.experience = data.experience
        if data.skills is not None:
            profile.skills = data.skills
        if data.languages is not None:
            profile.languages = data.languages
    else:
        # Create new profile
        profile = UserProfile(
            user_id=current_user.id,
            personal_info=data.personal_info,
            education=data.education,
            experience=data.experience,
            skills=data.skills,
            languages=data.languages,
        )
        db.add(profile)

    await db.flush()
    logger.info(f"Profile updated for user {current_user.id}")

    return UserProfileResponse.model_validate(profile)
