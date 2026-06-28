"""
Lansy.ai — Token Schemas
Pydantic v2 schemas for token operations.
"""

import uuid
from datetime import datetime

from pydantic import BaseModel, Field


class TokenBalanceResponse(BaseModel):
    """Current token balance for a user."""
    balance: int
    lifetime_used: int

    model_config = {"from_attributes": True}


class TokenPurchaseRequest(BaseModel):
    """Request to purchase tokens via Konnect."""
    package_id: str = Field(
        ...,
        description="Package identifier: 'starter', 'pro', 'premium', 'student'",
    )


class TokenPurchaseResponse(BaseModel):
    """Response with Konnect payment redirect URL."""
    payment_url: str
    payment_ref: str
    package_id: str
    tokens: int
    amount_dt: float  # Amount in Tunisian Dinar


class KonnectWebhookPayload(BaseModel):
    """Konnect payment webhook payload."""
    payment_ref: str
    payment_id: str | None = None  # Konnect payment ID for verification
    status: str  # 'completed', 'failed'
    amount: int | None = None  # Amount in millimes
    wallet_id: str | None = None


class TokenTransactionResponse(BaseModel):
    """Single token transaction record."""
    id: uuid.UUID
    amount: int
    type: str
    description: str | None = None
    payment_ref: str | None = None
    created_at: datetime

    model_config = {"from_attributes": True}


class TokenHistoryResponse(BaseModel):
    """Paginated token transaction history."""
    items: list[TokenTransactionResponse]
    total: int
    page: int
    per_page: int


# --- Token Packages ---

PACKAGES = {
    "starter": {
        "id": "starter",
        "name": "Starter",
        "tokens": 10,
        "amount_dt": 5.0,
        "amount_millimes": 5000,
    },
    "pro": {
        "id": "pro",
        "name": "Pro",
        "tokens": 35,
        "amount_dt": 15.0,
        "amount_millimes": 15000,
        "popular": True,
    },
    "premium": {
        "id": "premium",
        "name": "Premium",
        "tokens": 999999,  # Unlimited
        "amount_dt": 35.0,
        "amount_millimes": 35000,
        "monthly": True,
    },
    "student": {
        "id": "student",
        "name": "Étudiant",
        "tokens": 20,
        "amount_dt": 8.0,
        "amount_millimes": 8000,
        "discount": 20,
    },
}
