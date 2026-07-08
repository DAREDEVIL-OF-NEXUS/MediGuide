"""
MedicationLog ORM model.

Records whether a user actually took, missed, or skipped a scheduled dose.
"""

from __future__ import annotations

import uuid
from datetime import date, datetime, time
from typing import TYPE_CHECKING, Optional

from sqlalchemy import Date, DateTime, ForeignKey, String, Text, Time, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base

if TYPE_CHECKING:
    from app.models.schedule import MedicationSchedule
    from app.models.user import User


class MedicationLog(Base):
    """Adherence log entry for a single scheduled dose."""

    __tablename__ = "medication_logs"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )

    # ── References ───────────────────────────────────────────────────────
    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id"), nullable=False, index=True
    )
    schedule_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("medication_schedules.id"),
        nullable=False,
        index=True,
    )

    # ── Log data ─────────────────────────────────────────────────────────
    log_date: Mapped[date] = mapped_column(Date, nullable=False)
    scheduled_time: Mapped[time] = mapped_column(Time, nullable=False)
    actual_time: Mapped[Optional[time]] = mapped_column(Time, nullable=True)
    status: Mapped[str] = mapped_column(
        String(20), nullable=False
    )  # taken | missed | skipped | late
    notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    # ── Timestamps ───────────────────────────────────────────────────────
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )

    # ── Relationships ────────────────────────────────────────────────────
    user: Mapped["User"] = relationship(
        back_populates="medication_logs", lazy="selectin"
    )
    schedule: Mapped["MedicationSchedule"] = relationship(
        back_populates="medication_logs", lazy="selectin"
    )

    def __repr__(self) -> str:
        return f"<MedicationLog {self.log_date} status={self.status!r}>"
