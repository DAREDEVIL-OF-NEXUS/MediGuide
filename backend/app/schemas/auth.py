"""
Auth-related Pydantic schemas.

Defines request bodies for registration / login, the token response shape,
and the public ``UserResponse`` that never exposes the password hash.
"""

from __future__ import annotations

from datetime import date, datetime
from typing import List, Optional
from uuid import UUID

from pydantic import BaseModel, ConfigDict, EmailStr, Field


class EmergencyContact(BaseModel):
    name: str
    relationship: str
    email: EmailStr
    phone: Optional[str] = None


# ═══════════════════════════════════════════════════════════════════════════
# Registration
# ═══════════════════════════════════════════════════════════════════════════
class UserRegister(BaseModel):
    """Payload for ``POST /auth/register``."""

    email: EmailStr
    password: str = Field(..., min_length=8, max_length=128)
    full_name: str = Field(..., min_length=1, max_length=255)
    emergency_contacts: Optional[List[EmergencyContact]] = []


# ═══════════════════════════════════════════════════════════════════════════
# Login
# ═══════════════════════════════════════════════════════════════════════════
class UserLogin(BaseModel):
    """Payload for ``POST /auth/login``."""

    email: EmailStr
    password: str


# ═══════════════════════════════════════════════════════════════════════════
# Token response
# ═══════════════════════════════════════════════════════════════════════════
class TokenResponse(BaseModel):
    """JWT pair returned after successful authentication."""

    access_token: str
    refresh_token: str
    token_type: str = "bearer"


class TokenPayload(BaseModel):
    """Decoded token claims (mirrors ``core.security.TokenPayload``)."""

    sub: str
    exp: datetime
    type: str


class RefreshTokenRequest(BaseModel):
    """Payload for ``POST /auth/refresh``."""

    refresh_token: str


# ═══════════════════════════════════════════════════════════════════════════
# User responses
# ═══════════════════════════════════════════════════════════════════════════
class UserResponse(BaseModel):
    """Public user representation — never includes the password hash."""

    model_config = ConfigDict(from_attributes=True)

    id: UUID
    email: str
    full_name: str
    date_of_birth: Optional[date] = None
    phone: Optional[str] = None
    gender: Optional[str] = None
    allergies: List[str] = []
    chronic_conditions: List[str] = []
    emergency_contacts: List[dict] = []
    is_active: bool
    created_at: datetime
    updated_at: Optional[datetime] = None


# ═══════════════════════════════════════════════════════════════════════════
# User update
# ═══════════════════════════════════════════════════════════════════════════
class UserUpdate(BaseModel):
    """Optional fields for ``PUT /auth/me``."""

    full_name: Optional[str] = Field(None, min_length=1, max_length=255)
    date_of_birth: Optional[date] = None
    phone: Optional[str] = Field(None, max_length=20)
    gender: Optional[str] = Field(None, max_length=20)
    allergies: Optional[List[str]] = None
    chronic_conditions: Optional[List[str]] = None
    emergency_contacts: Optional[List[EmergencyContact]] = None
