"""
User ORM model.

Represents a platform user who uploads prescriptions, tracks medications,
and receives adherence reminders.
"""

from __future__ import annotations

import uuid
from datetime import date, datetime
from typing import TYPE_CHECKING, List, Optional

from sqlalchemy import Boolean, Date, DateTime, String, func
from sqlalchemy.dialects.postgresql import JSON, UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base

if TYPE_CHECKING:
    from app.models.medical_history import MedicalHistory
    from app.models.medication_log import MedicationLog
    from app.models.notification import Notification
    from app.models.prescription import Prescription
    from app.models.schedule import MedicationSchedule


class User(Base):
    """Platform user account."""

    __tablename__ = "users"

    # ── Primary key ──────────────────────────────────────────────────────
    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
    )

    # ── Credentials ──────────────────────────────────────────────────────
    email: Mapped[str] = mapped_column(
        String(255), unique=True, index=True, nullable=False
    )
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)

    # ── Profile ──────────────────────────────────────────────────────────
    full_name: Mapped[str] = mapped_column(String(255), nullable=False)
    date_of_birth: Mapped[Optional[date]] = mapped_column(Date, nullable=True)
    phone: Mapped[Optional[str]] = mapped_column(String(20), nullable=True)
    gender: Mapped[Optional[str]] = mapped_column(String(20), nullable=True)

    # ── Medical info (JSON arrays) ───────────────────────────────────────
    allergies: Mapped[list] = mapped_column(JSON, default=list, server_default="[]")
    chronic_conditions: Mapped[list] = mapped_column(
        JSON, default=list, server_default="[]"
    )

    # ── Flags ────────────────────────────────────────────────────────────
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, server_default="t")

    # ── Timestamps ───────────────────────────────────────────────────────
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
    updated_at: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True), onupdate=func.now(), nullable=True
    )

    # ── Relationships ────────────────────────────────────────────────────
    prescriptions: Mapped[List["Prescription"]] = relationship(
        back_populates="user", cascade="all, delete-orphan", lazy="selectin"
    )
    medication_logs: Mapped[List["MedicationLog"]] = relationship(
        back_populates="user", cascade="all, delete-orphan", lazy="selectin"
    )
    medical_history: Mapped[List["MedicalHistory"]] = relationship(
        back_populates="user", cascade="all, delete-orphan", lazy="selectin"
    )
    notifications: Mapped[List["Notification"]] = relationship(
        back_populates="user", cascade="all, delete-orphan", lazy="selectin"
    )
    medication_schedules: Mapped[List["MedicationSchedule"]] = relationship(
        back_populates="user", cascade="all, delete-orphan", lazy="selectin"
    )

    def __repr__(self) -> str:
        return f"<User {self.email!r}>"
