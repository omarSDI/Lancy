"""
Lansy.ai — CV Session Model
Stores each CV generation session with analysis, generated content, and ATS score.
"""

import uuid
from datetime import datetime

from sqlalchemy import String, Integer, Text, DateTime, ForeignKey, func
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class CVSession(Base):
    __tablename__ = "cv_sessions"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
    )
    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
    )
    offer_text: Mapped[str] = mapped_column(
        Text,
        nullable=False,  # Raw job offer pasted by user
    )
    offer_analysis: Mapped[dict | None] = mapped_column(
        JSONB,
        nullable=True,  # Extracted keywords, required skills, level
    )
    generated_cv: Mapped[dict | None] = mapped_column(
        JSONB,
        nullable=True,  # Structured CV data
    )
    generated_cv_text: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,  # Full CV as text for ATS analysis
    )
    ats_score: Mapped[int | None] = mapped_column(
        Integer,
        nullable=True,  # 0-100
    )
    ats_details: Mapped[dict | None] = mapped_column(
        JSONB,
        nullable=True,  # Matched/missing keywords
    )
    template_id: Mapped[str | None] = mapped_column(
        String(50),
        nullable=True,  # 'modern', 'classic', 'minimal'
    )
    pdf_url: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,  # Supabase storage URL
    )
    tokens_used: Mapped[int] = mapped_column(
        Integer,
        default=1,
    )
    language: Mapped[str] = mapped_column(
        String(10),
        default="fr",  # 'fr', 'en', 'ar'
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
    )

    # Relationships
    user = relationship("User", back_populates="cv_sessions")

    def __repr__(self) -> str:
        return f"<CVSession {self.id} user={self.user_id} score={self.ats_score}>"
