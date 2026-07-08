"""
Security utilities — password hashing and JWT management.

All cryptographic operations are centralised here so the rest of the
codebase never touches ``passlib`` or ``python-jose`` directly.
"""

from __future__ import annotations

import logging
from datetime import datetime, timedelta, timezone
from typing import Any, Optional
from uuid import UUID

from jose import JWTError, jwt
from pydantic import BaseModel
from app.config import settings
import bcrypt

logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Password hashing (direct bcrypt to avoid passlib compatibility bugs)
# ---------------------------------------------------------------------------


def hash_password(plain: str) -> str:
    """Return a bcrypt hash of *plain*."""
    plain_bytes = plain.encode("utf-8")
    salt = bcrypt.gensalt()
    hashed_bytes = bcrypt.hashpw(plain_bytes, salt)
    return hashed_bytes.decode("utf-8")


def verify_password(plain: str, hashed: str) -> bool:
    """Return ``True`` if *plain* matches the stored *hashed* value."""
    try:
        plain_bytes = plain.encode("utf-8")
        hashed_bytes = hashed.encode("utf-8")
        return bcrypt.checkpw(plain_bytes, hashed_bytes)
    except Exception:
        return False


# ---------------------------------------------------------------------------
# JWT tokens
# ---------------------------------------------------------------------------
class TokenPayload(BaseModel):
    """Decoded JWT payload."""

    sub: str  # user ID as string
    exp: datetime
    type: str  # "access" | "refresh"


def create_access_token(
    user_id: UUID,
    extra_claims: Optional[dict[str, Any]] = None,
) -> str:
    """Create a short-lived access JWT for *user_id*."""
    now = datetime.now(timezone.utc)
    expire = now + timedelta(minutes=settings.access_token_expire_minutes)
    payload: dict[str, Any] = {
        "sub": str(user_id),
        "exp": expire,
        "type": "access",
        "iat": now,
    }
    if extra_claims:
        payload.update(extra_claims)
    return jwt.encode(payload, settings.secret_key, algorithm=settings.algorithm)


def create_refresh_token(user_id: UUID) -> str:
    """Create a long-lived refresh JWT for *user_id*."""
    now = datetime.now(timezone.utc)
    expire = now + timedelta(days=settings.refresh_token_expire_days)
    payload: dict[str, Any] = {
        "sub": str(user_id),
        "exp": expire,
        "type": "refresh",
        "iat": now,
    }
    return jwt.encode(payload, settings.secret_key, algorithm=settings.algorithm)


def decode_token(token: str) -> TokenPayload:
    """Decode and validate a JWT.

    Raises:
        JWTError: If the token is expired, malformed, or tampered with.
    """
    try:
        raw = jwt.decode(
            token,
            settings.secret_key,
            algorithms=[settings.algorithm],
        )
        return TokenPayload(**raw)
    except JWTError:
        logger.warning("JWT decode failed for token (truncated): %s…", token[:20])
        raise
