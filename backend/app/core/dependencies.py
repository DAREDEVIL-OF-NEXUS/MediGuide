"""
FastAPI dependencies used across multiple routers.

``get_current_user`` and ``get_current_active_user`` sit in the
dependency-injection chain for every authenticated endpoint.
"""

from __future__ import annotations

import logging
from uuid import UUID

from fastapi import Depends
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import AuthenticationError
from app.core.security import decode_token
from app.database import get_db
from app.models.user import User

logger = logging.getLogger(__name__)

# The ``tokenUrl`` matches the login endpoint so Swagger UI's
# "Authorize" dialog works out of the box.
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login")


async def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: AsyncSession = Depends(get_db),
) -> User:
    """Extract and validate the current user from the bearer token.

    Raises:
        AuthenticationError: If the token is invalid or the user cannot
            be found.
    """
    try:
        payload = decode_token(token)
    except JWTError:
        raise AuthenticationError("Invalid or expired token")

    if payload.type != "access":
        raise AuthenticationError("Invalid token type — access token required")

    try:
        user_id = UUID(payload.sub)
    except ValueError:
        raise AuthenticationError("Malformed token subject")

    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()

    if user is None:
        raise AuthenticationError("User not found")

    return user


async def get_current_active_user(
    current_user: User = Depends(get_current_user),
) -> User:
    """Ensure the authenticated user account is still active.

    Raises:
        AuthenticationError: If the account has been deactivated.
    """
    if not current_user.is_active:
        raise AuthenticationError("User account is deactivated")
    return current_user
