"""
Lansy.ai — Token Service
Handles atomic token operations: balance check, deduction, and crediting.
"""

import uuid
import logging
from datetime import datetime

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update
from fastapi import HTTPException, status

from app.models.token_balance import TokenBalance, TokenTransaction

logger = logging.getLogger(__name__)


async def get_balance(db: AsyncSession, user_id: uuid.UUID) -> TokenBalance:
    """Get the current token balance for a user."""
    result = await db.execute(
        select(TokenBalance).where(TokenBalance.user_id == user_id)
    )
    balance = result.scalar_one_or_none()

    if not balance:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Solde de tokens non trouvé. Veuillez synchroniser votre compte.",
        )

    return balance


async def deduct_token(
    db: AsyncSession,
    user_id: uuid.UUID,
    amount: int = 1,
    transaction_type: str = "use_cv",
    description: str = "Génération de CV",
) -> int:
    """
    Atomically deduct tokens from a user's balance.
    Returns the new balance.
    Raises HTTPException if insufficient tokens.
    """
    # Get current balance with row-level lock
    result = await db.execute(
        select(TokenBalance)
        .where(TokenBalance.user_id == user_id)
        .with_for_update()
    )
    balance = result.scalar_one_or_none()

    if not balance:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Solde de tokens non trouvé",
        )

    if balance.balance < amount:
        raise HTTPException(
            status_code=status.HTTP_402_PAYMENT_REQUIRED,
            detail=f"Solde insuffisant. Vous avez {balance.balance} token(s), "
                   f"mais {amount} token(s) sont nécessaires. "
                   f"Achetez des tokens pour continuer.",
        )

    # Deduct tokens
    balance.balance -= amount
    balance.lifetime_used += amount
    balance.updated_at = datetime.utcnow()

    # Log the transaction
    transaction = TokenTransaction(
        user_id=user_id,
        amount=-amount,
        type=transaction_type,
        description=description,
    )
    db.add(transaction)

    await db.flush()

    logger.info(
        f"Deducted {amount} token(s) from user {user_id}. "
        f"New balance: {balance.balance}"
    )

    return balance.balance


async def add_tokens(
    db: AsyncSession,
    user_id: uuid.UUID,
    amount: int,
    transaction_type: str = "purchase",
    description: str = "Achat de tokens",
    payment_ref: str | None = None,
) -> int:
    """
    Add tokens to a user's balance.
    Returns the new balance.
    """
    result = await db.execute(
        select(TokenBalance)
        .where(TokenBalance.user_id == user_id)
        .with_for_update()
    )
    balance = result.scalar_one_or_none()

    if not balance:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Solde de tokens non trouvé",
        )

    # Add tokens
    balance.balance += amount
    balance.updated_at = datetime.utcnow()

    # Log the transaction
    transaction = TokenTransaction(
        user_id=user_id,
        amount=amount,
        type=transaction_type,
        description=description,
        payment_ref=payment_ref,
    )
    db.add(transaction)

    await db.flush()

    logger.info(
        f"Added {amount} token(s) to user {user_id}. "
        f"New balance: {balance.balance}. "
        f"Payment ref: {payment_ref}"
    )

    return balance.balance


async def get_transaction_history(
    db: AsyncSession,
    user_id: uuid.UUID,
    page: int = 1,
    per_page: int = 20,
) -> tuple[list[TokenTransaction], int]:
    """
    Get paginated transaction history for a user.
    Returns (transactions, total_count).
    """
    # Count total
    from sqlalchemy import func
    count_result = await db.execute(
        select(func.count(TokenTransaction.id))
        .where(TokenTransaction.user_id == user_id)
    )
    total = count_result.scalar()

    # Fetch paginated results
    offset = (page - 1) * per_page
    result = await db.execute(
        select(TokenTransaction)
        .where(TokenTransaction.user_id == user_id)
        .order_by(TokenTransaction.created_at.desc())
        .offset(offset)
        .limit(per_page)
    )
    transactions = result.scalars().all()

    return transactions, total
