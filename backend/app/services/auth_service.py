"""
Authentication service — user registration, login, and profile management.

All database mutations happen here; routers stay thin.
"""

from __future__ import annotations

import logging
from uuid import UUID

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import AuthenticationError, NotFoundError, ValidationError
from app.core.security import hash_password, verify_password
from app.models.user import User
from app.schemas.auth import UserRegister, UserUpdate

logger = logging.getLogger(__name__)


async def register_user(db: AsyncSession, data: UserRegister) -> User:
    """Create a new user account.

    Args:
        db: Async database session.
        data: Validated registration payload.

    Returns:
        The newly created ``User`` ORM instance.

    Raises:
        ValidationError: If the email is already registered.
    """
    result = await db.execute(select(User).where(User.email == data.email))
    if result.scalar_one_or_none() is not None:
        raise ValidationError(
            message="Email already registered",
            detail={"email": data.email},
        )

    user = User(
        email=data.email,
        password_hash=hash_password(data.password),
        full_name=data.full_name,
        emergency_contacts=[c.model_dump() for c in data.emergency_contacts] if getattr(data, 'emergency_contacts', None) else [],
    )
    db.add(user)
    await db.flush()  # populate id / defaults before returning
    await db.refresh(user)
    logger.info("Registered new user: %s (id=%s)", user.email, user.id)
    return user


async def authenticate_user(
    db: AsyncSession, email: str, password: str
) -> User:
    """Verify credentials and return the user.

    Raises:
        AuthenticationError: If the email doesn't exist or the password
            doesn't match.
    """
    result = await db.execute(select(User).where(User.email == email))
    user = result.scalar_one_or_none()

    if user is None or not verify_password(password, user.password_hash):
        raise AuthenticationError("Invalid email or password")

    if not user.is_active:
        raise AuthenticationError("User account is deactivated")

    logger.info("User authenticated: %s", email)
    return user


async def get_user_by_id(db: AsyncSession, user_id: UUID) -> User:
    """Fetch a user by primary key.

    Raises:
        NotFoundError: If no user matches the given ID.
    """
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if user is None:
        raise NotFoundError(message="User not found", detail={"id": str(user_id)})
    return user


async def update_user(
    db: AsyncSession, user_id: UUID, data: UserUpdate
) -> User:
    """Apply partial updates to a user profile.

    Only fields that are explicitly set (not ``None``) are written.

    Returns:
        The refreshed ``User`` instance.

    Raises:
        NotFoundError: If the user does not exist.
    """
    user = await get_user_by_id(db, user_id)

    update_data = data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(user, field, value)

    await db.flush()
    await db.refresh(user)
    logger.info("Updated user profile: %s", user.email)
    return user
