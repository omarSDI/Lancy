"""
Lansy.ai — Application Configuration
Uses pydantic-settings for typed, validated environment variables.
"""

from pydantic_settings import BaseSettings
from pydantic import Field


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""

    # --- Database ---
    database_url: str = Field(
        default="postgresql+asyncpg://postgres:password@localhost:5432/lansy",
        description="Async PostgreSQL connection string",
    )

    # --- Redis ---
    redis_url: str = Field(
        default="redis://localhost:6379",
        description="Redis connection URL",
    )

    # --- Supabase ---
    supabase_url: str = Field(
        default="",
        description="Supabase project URL",
    )
    supabase_service_key: str = Field(
        default="",
        description="Supabase service role key (server-side only)",
    )
    supabase_jwt_secret: str = Field(
        default="",
        description="Supabase JWT secret for token verification",
    )

    # --- Google Gemini ---
    gemini_api_key: str = Field(
        default="",
        description="Google Gemini API key",
    )
    gemini_model: str = Field(
        default="gemini-1.5-flash",
        description="Gemini model to use",
    )

    # --- ChromaDB ---
    chromadb_host: str = Field(
        default="localhost",
        description="ChromaDB server host",
    )
    chromadb_port: int = Field(
        default=8001,
        description="ChromaDB server port",
    )

    # --- Konnect Payment ---
    konnect_api_url: str = Field(
        default="https://api.konnect.network/api/v2",
        description="Konnect payment gateway API URL",
    )
    konnect_api_key: str = Field(
        default="",
        description="Konnect API key",
    )
    konnect_wallet_id: str = Field(
        default="",
        description="Konnect wallet ID",
    )

    # --- App ---
    secret_key: str = Field(
        default="change-me-to-a-random-32-char-string",
        description="Application secret key for signing",
    )
    frontend_url: str = Field(
        default="http://localhost:3000",
        description="Frontend URL for CORS and redirects",
    )
    debug: bool = Field(
        default=False,
        description="Debug mode flag — never True in production",
    )

    model_config = {
        "env_file": (".env", "../.env", "../../.env"),
        "env_file_encoding": "utf-8",
        "case_sensitive": False,
    }


# Singleton settings instance
settings = Settings()
