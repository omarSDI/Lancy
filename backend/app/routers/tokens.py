"""
Lansy.ai — Tokens Router
Endpoints for token balance, purchase, and history.
"""

import logging
import uuid

from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.ext.asyncio import AsyncSession
import httpx

from app.database import get_db
from app.config import settings
from app.models.user import User
from app.routers.auth import get_current_user
from app.services import token_service
from app.schemas.token import (
    TokenBalanceResponse,
    TokenPurchaseRequest,
    TokenPurchaseResponse,
    KonnectWebhookPayload,
    TokenTransactionResponse,
    TokenHistoryResponse,
    PACKAGES,
)

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/tokens", tags=["Tokens"])


@router.get("/balance", response_model=TokenBalanceResponse)
async def get_balance(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get current token balance for the authenticated user."""
    balance = await token_service.get_balance(db, current_user.id)
    return TokenBalanceResponse(
        balance=balance.balance,
        lifetime_used=balance.lifetime_used,
    )


@router.post("/purchase", response_model=TokenPurchaseResponse)
async def purchase_tokens(
    request: TokenPurchaseRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Initiate a token purchase via Konnect payment gateway.
    Returns a redirect URL to the Konnect payment page.
    """
    package = PACKAGES.get(request.package_id)
    if not package:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Package invalide: '{request.package_id}'. "
                   f"Options disponibles: {', '.join(PACKAGES.keys())}",
        )

    payment_ref = f"lansy_{current_user.id}_{request.package_id}_{uuid.uuid4().hex[:8]}"

    try:
        # Call Konnect API to create payment
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{settings.konnect_api_url}/payments/init-payment",
                headers={
                    "x-api-key": settings.konnect_api_key,
                    "Content-Type": "application/json",
                },
                json={
                    "receiverWalletId": settings.konnect_wallet_id,
                    "token": "TND",
                    "amount": package["amount_millimes"],
                    "type": "immediate",
                    "description": f"Lansy.ai — {package['name']} ({package['tokens']} tokens)",
                    "acceptedPaymentMethods": ["wallet", "bank_card", "e-DINAR"],
                    "lifespan": 30,  # 30 minutes
                    "checkoutForm": True,
                    "addPaymentFeesToAmount": False,
                    "orderId": payment_ref,
                    "webhook": f"{settings.frontend_url}/api/tokens/webhook",
                    "silentWebhook": True,
                    "successUrl": f"{settings.frontend_url}/tokens?status=success&ref={payment_ref}",
                    "failUrl": f"{settings.frontend_url}/tokens?status=fail&ref={payment_ref}",
                    "theme": "light",
                },
            )

            if response.status_code != 200:
                logger.error(f"Konnect API error: {response.text}")
                raise HTTPException(
                    status_code=status.HTTP_502_BAD_GATEWAY,
                    detail="Erreur de connexion au service de paiement. Veuillez réessayer.",
                )

            konnect_data = response.json()
            payment_url = konnect_data.get("payUrl", "")

    except httpx.RequestError as e:
        logger.error(f"Konnect connection error: {e}")
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="Impossible de contacter le service de paiement. Veuillez réessayer plus tard.",
        )

    return TokenPurchaseResponse(
        payment_url=payment_url,
        payment_ref=payment_ref,
        package_id=request.package_id,
        tokens=package["tokens"],
        amount_dt=package["amount_dt"],
    )


@router.post("/webhook")
async def konnect_webhook(
    payload: KonnectWebhookPayload,
    db: AsyncSession = Depends(get_db),
):
    """
    Konnect payment webhook callback.
    Credits tokens to the user upon successful payment.
    Verifies payment with Konnect API before crediting (security).
    """
    if payload.status != "completed":
        logger.info(f"Payment {payload.payment_ref} status: {payload.status} — ignored")
        return {"status": "ignored"}

    # Parse payment ref: lansy_{user_id}_{package_id}_{random}
    try:
        parts = payload.payment_ref.split("_")
        if len(parts) < 4 or parts[0] != "lansy":
            raise ValueError("Invalid format")
        user_id = uuid.UUID(parts[1])
        package_id = parts[2]
    except (IndexError, ValueError) as e:
        logger.error(f"Invalid payment ref format: {payload.payment_ref}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Référence de paiement invalide",
        )

    package = PACKAGES.get(package_id)
    if not package:
        logger.error(f"Unknown package in webhook: {package_id}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Package inconnu",
        )

    # --- Idempotency: check if payment_ref already processed ---
    from sqlalchemy import select as sa_select
    from app.models.token_balance import TokenTransaction
    existing = await db.execute(
        sa_select(TokenTransaction).where(
            TokenTransaction.payment_ref == payload.payment_ref
        )
    )
    if existing.scalar_one_or_none():
        logger.warning(f"Duplicate webhook for payment_ref: {payload.payment_ref}")
        return {"status": "already_processed"}

    # --- Verify payment with Konnect API ---
    payment_verified = False
    if payload.payment_id and settings.konnect_api_key:
        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                verify_resp = await client.get(
                    f"{settings.konnect_api_url}/payments/{payload.payment_id}",
                    headers={"x-api-key": settings.konnect_api_key},
                )
                if verify_resp.status_code == 200:
                    konnect_data = verify_resp.json()
                    remote_status = konnect_data.get("payment", {}).get("status", "")
                    remote_amount = konnect_data.get("payment", {}).get("amount", 0)
                    if (
                        remote_status == "completed"
                        and remote_amount >= package["amount_millimes"]
                    ):
                        payment_verified = True
                    else:
                        logger.warning(
                            f"Konnect payment mismatch: status={remote_status}, "
                            f"amount={remote_amount} vs expected={package['amount_millimes']}"
                        )
        except Exception as e:
            logger.error(f"Konnect verification API error: {e}")
            # Fail safe: don't credit if we can't verify
            raise HTTPException(
                status_code=status.HTTP_502_BAD_GATEWAY,
                detail="Impossible de vérifier le paiement. Veuillez contacter le support.",
            )
    else:
        # No payment_id or no API key configured — skip verification (dev mode)
        logger.warning(f"Skipping Konnect verification (missing payment_id or api_key)")
        payment_verified = True

    if not payment_verified:
        logger.error(f"Payment verification FAILED for ref: {payload.payment_ref}")
        raise HTTPException(
            status_code=status.HTTP_402_PAYMENT_REQUIRED,
            detail="Paiement non vérifié",
        )

    # Credit tokens
    new_balance = await token_service.add_tokens(
        db=db,
        user_id=user_id,
        amount=package["tokens"],
        transaction_type="purchase",
        description=f"Achat — {package['name']} ({package['tokens']} tokens)",
        payment_ref=payload.payment_ref,
    )

    logger.info(
        f"Payment verified & credited: user={user_id}, package={package_id}, "
        f"tokens={package['tokens']}, new_balance={new_balance}"
    )

    return {"status": "ok", "tokens_credited": package["tokens"]}



@router.get("/history", response_model=TokenHistoryResponse)
async def get_transaction_history(
    page: int = 1,
    per_page: int = 20,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get paginated token transaction history."""
    transactions, total = await token_service.get_transaction_history(
        db, current_user.id, page, per_page
    )

    return TokenHistoryResponse(
        items=[
            TokenTransactionResponse.model_validate(t)
            for t in transactions
        ],
        total=total,
        page=page,
        per_page=per_page,
    )
