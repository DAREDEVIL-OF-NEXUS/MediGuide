"""
MedicalHistory ORM model.

Stores known medical conditions for a user to enable safety checks
during prescription processing.
"""

from __future__ import annotations

import uuid
from datetime import date, datetime
from typing import TYPE_CHECKING, Optional

from sqlalchemy import Boolean, Date, DateTime, ForeignKey, String, Text, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base

if TYPE_CHECKING:
    from app.models.user import User


class MedicalHistory(Base):
    """A single medical-condition record in a user's history."""

    __tablename__ = "medical_history"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )

    # ── Owner ────────────────────────────────────────────────────────────
    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id"), nullable=False, index=True
    )

    # ── Condition data ───────────────────────────────────────────────────
    condition: Mapped[str] = mapped_column(String(255), nullable=False)
    diagnosed_date: Mapped[Optional[date]] = mapped_column(Date, nullable=True)
    severity: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    treatment_notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    is_active: Mapped[bool] = mapped_column(
        Boolean, default=True, server_default="t"
    )

    # ── Timestamps ───────────────────────────────────────────────────────
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )

    # ── Relationships ────────────────────────────────────────────────────
    user: Mapped["User"] = relationship(
        back_populates="medical_history", lazy="selectin"
    )

    def __repr__(self) -> str:
        return f"<MedicalHistory {self.condition!r} active={self.is_active}>"
