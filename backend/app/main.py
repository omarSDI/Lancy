"""
Lansy.ai — FastAPI Main Application
Entry point for the backend API server.
"""

import logging
from contextlib import asynccontextmanager

import redis.asyncio as redis
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from slowapi.middleware import SlowAPIMiddleware

from app.config import settings
from app.database import init_db
from app.limiter import limiter
from app.services.rag_service import seed_if_empty

# Import all models so SQLAlchemy discovers them
from app.models import User, TokenBalance, TokenTransaction, CVSession, UserProfile  # noqa: F401

# Import routers
from app.routers import auth, cv, tokens, profile, ats

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s — %(name)s — %(levelname)s — %(message)s",
)
logger = logging.getLogger(__name__)

# Redis client (lazy)
redis_client = None


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan: startup and shutdown events."""
    # --- Startup ---
    logger.info("🚀 Starting Lansy.ai Backend...")

    # Initialize database tables
    await init_db()
    logger.info("✅ Database tables initialized")

    # Initialize Redis
    global redis_client
    try:
        redis_client = redis.from_url(settings.redis_url, decode_responses=True)
        await redis_client.ping()
        logger.info("✅ Redis connected")
    except Exception as e:
        logger.warning(f"⚠️ Redis connection failed: {e}")
        redis_client = None

    # Seed ChromaDB if empty
    try:
        await seed_if_empty()
        logger.info("✅ ChromaDB initialized")
    except Exception as e:
        logger.warning(f"⚠️ ChromaDB initialization failed: {e}")

    logger.info("✅ Lansy.ai Backend ready!")

    yield

    # --- Shutdown ---
    logger.info("Shutting down Lansy.ai Backend...")
    if redis_client:
        await redis_client.close()


# Create FastAPI app
app = FastAPI(
    title="Lansy.ai API",
    description=(
        "API pour Lansy.ai — Générateur de CV optimisé par IA "
        "pour le marché tunisien. Utilisez Google Gemini et un "
        "pipeline RAG pour créer des CVs adaptés à chaque offre."
    ),
    version="1.0.0",
    lifespan=lifespan,
    docs_url="/docs" if settings.debug else None,
    redoc_url="/redoc" if settings.debug else None,
)

# Rate limiting
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)
app.add_middleware(SlowAPIMiddleware)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        settings.frontend_url,
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:3001",
        "http://127.0.0.1:3001",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router, prefix="/api/v1")
app.include_router(cv.router, prefix="/api/v1")
app.include_router(tokens.router, prefix="/api/v1")
app.include_router(profile.router, prefix="/api/v1")
app.include_router(ats.router, prefix="/api/v1")


@app.get("/health", tags=["Health"])
async def health_check():
    """
    Health check endpoint.
    Verifies connectivity to: Database, Redis, and Gemini.
    """
    health = {
        "status": "ok",
        "services": {},
    }

    # Check Database
    try:
        from app.database import engine
        from sqlalchemy import text
        async with engine.connect() as conn:
            await conn.execute(text("SELECT 1"))
        health["services"]["database"] = "✅ connected"
    except Exception as e:
        health["services"]["database"] = f"❌ error: {str(e)}"
        health["status"] = "degraded"

    # Check Redis
    try:
        if redis_client:
            await redis_client.ping()
            health["services"]["redis"] = "✅ connected"
        else:
            health["services"]["redis"] = "⚠️ not initialized"
            health["status"] = "degraded"
    except Exception as e:
        health["services"]["redis"] = f"❌ error: {str(e)}"
        health["status"] = "degraded"

    # Check Gemini API key
    if settings.gemini_api_key:
        health["services"]["gemini"] = "✅ API key configured"
    else:
        health["services"]["gemini"] = "⚠️ API key not set"
        health["status"] = "degraded"

    # Check ChromaDB
    try:
        from app.services.rag_service import _get_client
        client = _get_client()
        client.heartbeat()
        health["services"]["chromadb"] = "✅ connected"
    except Exception as e:
        health["services"]["chromadb"] = f"⚠️ error: {str(e)}"

    return health


@app.get("/", tags=["Root"])
async def root():
    """Root endpoint — API info."""
    return {
        "name": "Lansy.ai API",
        "version": "1.0.0",
        "docs": "/docs",
        "health": "/health",
    }
