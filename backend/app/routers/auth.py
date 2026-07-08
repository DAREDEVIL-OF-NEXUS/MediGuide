"""
Authentication router.

Endpoints for registration, login, token refresh, and profile management.
"""

from __future__ import annotations

import logging

from fastapi import APIRouter, Depends
from jose import JWTError
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.dependencies import get_current_active_user
from app.core.exceptions import AuthenticationError
from app.core.security import (
    create_access_token,
    create_refresh_token,
    decode_token,
)
from app.database import get_db
from app.models.user import User
from app.schemas.auth import (
    RefreshTokenRequest,
    TokenResponse,
    UserLogin,
    UserRegister,
    UserResponse,
    UserUpdate,
)
from app.services import auth_service

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/auth", tags=["Authentication"])


# ═══════════════════════════════════════════════════════════════════════════
# Registration
# ═══════════════════════════════════════════════════════════════════════════
@router.post(
    "/register",
    response_model=UserResponse,
    status_code=201,
    summary="Register a new user",
)
async def register(
    data: UserRegister,
    db: AsyncSession = Depends(get_db),
) -> UserResponse:
    """Create a new user account.

    Returns the public user profile (without the password hash).
    """
    user = await auth_service.register_user(db, data)
    return UserResponse.model_validate(user)


# ═══════════════════════════════════════════════════════════════════════════
# Login
# ═══════════════════════════════════════════════════════════════════════════
@router.post(
    "/login",
    response_model=TokenResponse,
    summary="Obtain access + refresh tokens",
)
async def login(
    data: UserLogin,
    db: AsyncSession = Depends(get_db),
) -> TokenResponse:
    """Authenticate with email & password and receive a JWT pair."""
    user = await auth_service.authenticate_user(db, data.email, data.password)
    return TokenResponse(
        access_token=create_access_token(user.id),
        refresh_token=create_refresh_token(user.id),
    )


# ═══════════════════════════════════════════════════════════════════════════
# Token refresh
# ═══════════════════════════════════════════════════════════════════════════
@router.post(
    "/refresh",
    response_model=TokenResponse,
    summary="Refresh an expired access token",
)
async def refresh_token(
    body: RefreshTokenRequest,
    db: AsyncSession = Depends(get_db),
) -> TokenResponse:
    """Exchange a valid refresh token for a new access + refresh token pair."""
    try:
        payload = decode_token(body.refresh_token)
    except JWTError:
        raise AuthenticationError("Invalid or expired refresh token")

    if payload.type != "refresh":
        raise AuthenticationError("Token is not a refresh token")

    # Verify the user still exists and is active
    user = await auth_service.get_user_by_id(db, payload.sub)
    if not user.is_active:
        raise AuthenticationError("User account is deactivated")

    return TokenResponse(
        access_token=create_access_token(user.id),
        refresh_token=create_refresh_token(user.id),
    )


# ═══════════════════════════════════════════════════════════════════════════
# Current user profile
# ═══════════════════════════════════════════════════════════════════════════
@router.get(
    "/me",
    response_model=UserResponse,
    summary="Get current user profile",
)
async def get_me(
    current_user: User = Depends(get_current_active_user),
) -> UserResponse:
    """Return the authenticated user's profile."""
    return UserResponse.model_validate(current_user)


@router.put(
    "/me",
    response_model=UserResponse,
    summary="Update current user profile",
)
async def update_me(
    data: UserUpdate,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
) -> UserResponse:
    """Update the authenticated user's profile fields."""
    user = await auth_service.update_user(db, current_user.id, data)
    return UserResponse.model_validate(user)
