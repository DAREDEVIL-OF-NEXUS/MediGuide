"""
MedicationSchedule ORM model.

Defines *when* a specific prescription medicine should be taken.
"""

from __future__ import annotations

import uuid
from datetime import date, datetime, time
from typing import TYPE_CHECKING, List, Optional

from sqlalchemy import (
    Boolean,
    Date,
    DateTime,
    ForeignKey,
    String,
    Time,
    func,
)
from sqlalchemy.dialects.postgresql import JSON, UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base

if TYPE_CHECKING:
    from app.models.medication_log import MedicationLog
    from app.models.prescription import PrescriptionMedicine
    from app.models.reminder import Reminder
    from app.models.user import User


class MedicationSchedule(Base):
    """A scheduled time slot for taking a medicine."""

    __tablename__ = "medication_schedules"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )

    # ── References ───────────────────────────────────────────────────────
    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id"), nullable=False, index=True
    )
    prescription_medicine_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("prescription_medicines.id"),
        nullable=False,
        index=True,
    )

    # ── Schedule details ─────────────────────────────────────────────────
    scheduled_time: Mapped[time] = mapped_column(Time, nullable=False)
    day_pattern: Mapped[str] = mapped_column(
        String(50), default="daily", server_default="daily"
    )
    specific_days: Mapped[Optional[list]] = mapped_column(JSON, nullable=True)

    # ── Active window ────────────────────────────────────────────────────
    start_date: Mapped[date] = mapped_column(Date, nullable=False)
    end_date: Mapped[Optional[date]] = mapped_column(Date, nullable=True)
    is_active: Mapped[bool] = mapped_column(
        Boolean, default=True, server_default="t"
    )

    # ── Timestamps ───────────────────────────────────────────────────────
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )

    # ── Relationships ────────────────────────────────────────────────────
    user: Mapped["User"] = relationship(
        back_populates="medication_schedules", lazy="selectin"
    )
    prescription_medicine: Mapped["PrescriptionMedicine"] = relationship(
        back_populates="medication_schedules", lazy="selectin"
    )
    medication_logs: Mapped[List["MedicationLog"]] = relationship(
        back_populates="schedule",
        cascade="all, delete-orphan",
        lazy="selectin",
    )
    reminders: Mapped[List["Reminder"]] = relationship(
        back_populates="schedule",
        cascade="all, delete-orphan",
        lazy="selectin",
    )

    def __repr__(self) -> str:
        return (
            f"<MedicationSchedule {self.id} "
            f"time={self.scheduled_time} pattern={self.day_pattern!r}>"
        )
