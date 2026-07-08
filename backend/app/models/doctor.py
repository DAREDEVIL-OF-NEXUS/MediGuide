"""
Doctor ORM model.

Represents a prescribing doctor, optionally linked to a user who created
the record.
"""

from __future__ import annotations

import uuid
from datetime import datetime
from typing import TYPE_CHECKING, List, Optional

from sqlalchemy import DateTime, ForeignKey, String, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base

if TYPE_CHECKING:
    from app.models.prescription import Prescription
    from app.models.user import User


class Doctor(Base):
    """Prescribing physician record."""

    __tablename__ = "doctors"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    specialization: Mapped[Optional[str]] = mapped_column(
        String(255), nullable=True
    )
    registration_number: Mapped[str] = mapped_column(
        String(100), unique=True, nullable=False
    )
    clinic_name: Mapped[Optional[str]] = mapped_column(
        String(255), nullable=True
    )
    phone: Mapped[Optional[str]] = mapped_column(String(20), nullable=True)

    # ── Creator reference ────────────────────────────────────────────────
    created_by: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id"), nullable=True
    )

    # ── Timestamps ───────────────────────────────────────────────────────
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )

    # ── Relationships ────────────────────────────────────────────────────
    creator: Mapped[Optional["User"]] = relationship(lazy="selectin")
    prescriptions: Mapped[List["Prescription"]] = relationship(
        back_populates="doctor", lazy="selectin"
    )

    def __repr__(self) -> str:
        return f"<Doctor {self.name!r}>"
