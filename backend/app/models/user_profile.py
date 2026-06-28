"""
Lansy.ai — User Profile Model
Stores pre-filled CV form data for reuse across sessions.
"""

import uuid
from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, func
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class UserProfile(Base):
    __tablename__ = "user_profiles"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
    )
    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        unique=True,  # One profile per user
        nullable=False,
    )
    personal_info: Mapped[dict | None] = mapped_column(
        JSONB,
        nullable=True,
        # Structure: {name, phone, email, address, linkedin, github}
    )
    education: Mapped[list | None] = mapped_column(
        JSONB,
        nullable=True,
        # Array of: {institution, degree, field, start_date, end_date, description}
    )
    experience: Mapped[list | None] = mapped_column(
        JSONB,
        nullable=True,
        # Array of: {company, title, start_date, end_date, current, bullet_points[]}
    )
    skills: Mapped[dict | None] = mapped_column(
        JSONB,
        nullable=True,
        # Structure: {technical: [], certifications: []}
    )
    languages: Mapped[list | None] = mapped_column(
        JSONB,
        nullable=True,
        # Array of: {language, level}  (e.g., "Français" / "Natif")
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
    )

    # Relationships
    user = relationship("User", back_populates="profile")

    def __repr__(self) -> str:
        return f"<UserProfile user={self.user_id}>"
