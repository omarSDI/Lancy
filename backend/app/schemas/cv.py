"""
Lansy.ai — CV Schemas
Pydantic v2 schemas for CV generation operations.
"""

import uuid
from datetime import datetime

from pydantic import BaseModel, Field


# --- Offer Analysis ---

class OfferAnalysisRequest(BaseModel):
    """Request to analyze a job offer."""
    offer_text: str = Field(
        ...,
        min_length=50,
        max_length=10000,
        description="Raw job offer text pasted by the user",
    )


class OfferAnalysisResponse(BaseModel):
    """Parsed job offer analysis."""
    job_title: str
    technical_skills: list[str]
    soft_skills: list[str]
    experience_level: str  # 'junior', 'mid', 'senior'
    ats_keywords: list[str]
    sector: str
    responsibilities: list[str]
    qualifications: list[str]


# --- CV Generation ---

class CVGenerateRequest(BaseModel):
    """Request to generate a tailored CV."""
    offer_text: str = Field(
        ...,
        min_length=50,
        max_length=10000,
        description="Raw job offer text",
    )
    offer_analysis: dict | None = Field(
        default=None,
        description="Pre-computed offer analysis (optional, will re-analyze if missing)",
    )
    personal_info: dict = Field(
        ...,
        description="User's personal information",
    )
    education: list[dict] = Field(
        default_factory=list,
        description="Education history",
    )
    experience: list[dict] = Field(
        default_factory=list,
        description="Work experience",
    )
    skills: dict = Field(
        default_factory=dict,
        description="Technical and soft skills",
    )
    languages: list[dict] = Field(
        default_factory=list,
        description="Spoken languages",
    )
    template_id: str = Field(
        default="modern",
        description="CV template: 'modern', 'classic', 'minimal', or 'canva_1' through 'canva_6'",
    )
    language: str = Field(
        default="fr",
        description="Output language: 'fr', 'en', or 'ar'",
    )
    save_profile: bool = Field(
        default=False,
        description="Whether to save this data as the user's profile",
    )


class CVGenerateResponse(BaseModel):
    """Response from CV generation."""
    session_id: uuid.UUID
    generated_cv: dict
    ats_score: int
    ats_details: dict
    offer_analysis: dict
    template_id: str
    language: str
    tokens_remaining: int


class CustomPDFRequest(BaseModel):
    """Request to generate a PDF from custom HTML."""
    html_content: str = Field(
        ...,
        description="The modified HTML content to render as a PDF"
    )


# --- CV Session ---

class CVSessionResponse(BaseModel):
    """Single CV session detail."""
    id: uuid.UUID
    offer_text: str
    offer_analysis: dict | None = None
    generated_cv: dict | None = None
    generated_cv_text: str | None = None
    ats_score: int | None = None
    ats_details: dict | None = None
    template_id: str | None = None
    pdf_url: str | None = None
    tokens_used: int
    language: str
    created_at: datetime

    model_config = {"from_attributes": True}


class CVSessionListItem(BaseModel):
    """Summary item for CV history list."""
    id: uuid.UUID
    job_title: str | None = None
    ats_score: int | None = None
    template_id: str | None = None
    language: str
    created_at: datetime

    model_config = {"from_attributes": True}


class CVHistoryResponse(BaseModel):
    """Paginated CV history."""
    items: list[CVSessionListItem]
    total: int
    page: int
    per_page: int
