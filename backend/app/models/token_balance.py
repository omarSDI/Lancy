"""
Lansy.ai — Token Balance & Transaction Models
"""

import uuid
from datetime import datetime

from sqlalchemy import String, Integer, Text, DateTime, ForeignKey, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class TokenBalance(Base):
    __tablename__ = "token_balance"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
    )
    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        unique=True,
        nullable=False,
    )
    balance: Mapped[int] = mapped_column(
        Integer,
        default=3,  # 3 free tokens on signup
    )
    lifetime_used: Mapped[int] = mapped_column(
        Integer,
        default=0,
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
    )

    # Relationships
    user = relationship("User", back_populates="token_balance")

    def __repr__(self) -> str:
        return f"<TokenBalance user={self.user_id} balance={self.balance}>"


class TokenTransaction(Base):
    __tablename__ = "token_transactions"

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
    amount: Mapped[int] = mapped_column(
        Integer,
        nullable=False,  # positive = credit, negative = debit
    )
    type: Mapped[str] = mapped_column(
        String(50),
        nullable=False,  # 'purchase', 'use_cv', 'use_cover_letter', 'referral', 'signup_bonus'
    )
    description: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )
    payment_ref: Mapped[str | None] = mapped_column(
        String(255),
        nullable=True,  # Konnect payment reference
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
    )

    # Relationships
    user = relationship("User", back_populates="token_transactions")

    def __repr__(self) -> str:
        return f"<TokenTransaction user={self.user_id} amount={self.amount} type={self.type}>"
