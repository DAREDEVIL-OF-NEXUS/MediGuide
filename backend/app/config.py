"""
Application configuration module.

Loads all settings from environment variables (or a ``.env`` file) using
Pydantic Settings.  Every configurable knob lives here so the rest of the
codebase can simply ``from app.config import settings``.
"""

from __future__ import annotations

import json
from pathlib import Path
from typing import List

from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


# ---------------------------------------------------------------------------
# Resolve the project-level .env file (backend/.env)
# ---------------------------------------------------------------------------
_ENV_FILE: Path = Path(__file__).resolve().parent.parent / ".env"


class Settings(BaseSettings):
    """Central configuration for the MediGuide-AI backend."""

    model_config = SettingsConfigDict(
        env_file=str(_ENV_FILE),
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    # ── Database ─────────────────────────────────────────────────────────
    database_url: str = (
        "postgresql+asyncpg://mediguide:mediguide@localhost:5432/mediguide"
    )

    # ── Authentication / JWT ─────────────────────────────────────────────
    secret_key: str = "your-secret-key-change-in-production"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 15
    refresh_token_expire_days: int = 7

    # ── Google Gemini AI ─────────────────────────────────────────────────
    gemini_api_key: str = ""

    # ── Supabase Storage ─────────────────────────────────────────────────
    supabase_url: str = "your-supabase-url"
    supabase_key: str = "your-supabase-key"
    supabase_bucket: str = "prescriptions"

    # ── SMTP (Email Reminders) ───────────────────────────────────────────
    smtp_server: str = "smtp.gmail.com"
    smtp_port: int = 587
    smtp_username: str = ""
    smtp_password: str = ""
    smtp_from_email: str = "noreply@mediguide.ai"

    # ── CORS ─────────────────────────────────────────────────────────────
    cors_origins: List[str] = ["http://localhost:5173"]

    # ── Application ──────────────────────────────────────────────────────
    app_name: str = "MediGuide-AI"
    app_version: str = "1.0.0"
    debug: bool = False

    # Feature Flags
    use_gemini: bool = True
    use_yolo: bool = False
    use_rule_engine: bool = True
    use_local_alarm: bool = True
    use_email_reminders: bool = False
    use_sqlite_fallback: bool = True
    use_ai_assistant: bool = True
    use_medicine_library: bool = True
    use_rag: bool = False
    use_ollama: bool = False

    @field_validator("cors_origins", mode="before")
    @classmethod
    def parse_cors_origins(cls, value: str | List[str]) -> List[str]:
        """Accept either a JSON-encoded string or an actual list."""
        if isinstance(value, str):
            try:
                parsed = json.loads(value)
                if isinstance(parsed, list):
                    return parsed
            except (json.JSONDecodeError, TypeError):
                # Treat as a single-origin string
                return [value]
        return value  # type: ignore[return-value]


# Singleton – import this everywhere.
settings = Settings()
