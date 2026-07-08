"""
Reminder ORM model.

Configures how and when a user is reminded about an upcoming dose.
"""

from __future__ import annotations

import uuid
from datetime import datetime, time
from typing import TYPE_CHECKING, List

from sqlalchemy import Boolean, DateTime, ForeignKey, Integer, String, Time, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base

if TYPE_CHECKING:
    from app.models.notification import Notification
    from app.models.schedule import MedicationSchedule


class Reminder(Base):
    """A reminder configuration attached to a medication schedule."""

    __tablename__ = "reminders"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )

    # ── Reference ────────────────────────────────────────────────────────
    schedule_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("medication_schedules.id"),
        nullable=False,
        index=True,
    )

    # ── Configuration ────────────────────────────────────────────────────
    reminder_time: Mapped[time] = mapped_column(Time, nullable=False)
    minutes_before: Mapped[int] = mapped_column(
        Integer, default=10, server_default="10"
    )
    is_enabled: Mapped[bool] = mapped_column(
        Boolean, default=True, server_default="t"
    )
    channel: Mapped[str] = mapped_column(
        String(50), default="push", server_default="push"
    )

    # ── Timestamps ───────────────────────────────────────────────────────
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )

    # ── Relationships ────────────────────────────────────────────────────
    schedule: Mapped["MedicationSchedule"] = relationship(
        back_populates="reminders", lazy="selectin"
    )
    notifications: Mapped[List["Notification"]] = relationship(
        back_populates="reminder",
        cascade="all, delete-orphan",
        lazy="selectin",
    )

    def __repr__(self) -> str:
        return (
            f"<Reminder schedule={self.schedule_id} "
            f"time={self.reminder_time} channel={self.channel!r}>"
        )
