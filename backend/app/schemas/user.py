"""
Lansy.ai — User Schemas
Pydantic v2 schemas for user-related operations.
"""

import uuid
from datetime import datetime

from pydantic import BaseModel, EmailStr, Field


class UserSync(BaseModel):
    """Schema for syncing a Supabase user to our database."""
    id: uuid.UUID
    email: EmailStr
    full_name: str | None = None
    avatar_url: str | None = None


class UserResponse(BaseModel):
    """Schema for user responses."""
    id: uuid.UUID
    email: str
    full_name: str | None = None
    avatar_url: str | None = None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class UserProfileUpdate(BaseModel):
    """Schema for updating user profile data."""
    personal_info: dict | None = Field(
        default=None,
        description="Personal info: name, phone, email, address, linkedin, github",
    )
    education: list[dict] | None = Field(
        default=None,
        description="Array of education entries",
    )
    experience: list[dict] | None = Field(
        default=None,
        description="Array of experience entries",
    )
    skills: dict | None = Field(
        default=None,
        description="Technical skills and certifications",
    )
    languages: list[dict] | None = Field(
        default=None,
        description="Spoken languages with proficiency levels",
    )


class UserProfileResponse(BaseModel):
    """Schema for user profile responses."""
    id: uuid.UUID
    user_id: uuid.UUID
    personal_info: dict | None = None
    education: list[dict] | None = None
    experience: list[dict] | None = None
    skills: dict | None = None
    languages: list[dict] | None = None
    updated_at: datetime

    model_config = {"from_attributes": True}
