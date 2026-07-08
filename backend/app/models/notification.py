"""
Notification ORM model.

Tracks every notification dispatched (or scheduled) for a user, regardless
of delivery channel.
"""

from __future__ import annotations

import uuid
from datetime import datetime
from typing import TYPE_CHECKING, Optional

from sqlalchemy import DateTime, ForeignKey, String, Text, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base

if TYPE_CHECKING:
    from app.models.reminder import Reminder
    from app.models.user import User


class Notification(Base):
    """A notification record for a user."""

    __tablename__ = "notifications"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )

    # ── References ───────────────────────────────────────────────────────
    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id"), nullable=False, index=True
    )
    reminder_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True), ForeignKey("reminders.id"), nullable=True
    )

    # ── Content ──────────────────────────────────────────────────────────
    type: Mapped[str] = mapped_column(String(50), nullable=False)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    body: Mapped[str] = mapped_column(Text, nullable=False)

    # ── Delivery state ───────────────────────────────────────────────────
    status: Mapped[str] = mapped_column(
        String(50), default="pending", server_default="pending"
    )
    sent_at: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True), nullable=True
    )
    read_at: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True), nullable=True
    )

    # ── Timestamps ───────────────────────────────────────────────────────
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )

    # ── Relationships ────────────────────────────────────────────────────
    user: Mapped["User"] = relationship(
        back_populates="notifications", lazy="selectin"
    )
    reminder: Mapped[Optional["Reminder"]] = relationship(
        back_populates="notifications", lazy="selectin"
    )

    def __repr__(self) -> str:
        return f"<Notification {self.id} type={self.type!r} status={self.status!r}>"
