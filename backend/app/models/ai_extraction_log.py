"""
AIExtractionLog ORM model.

Audit trail for every AI extraction attempt on a prescription.
Stores the model used, raw API response, confidence, and timing metrics.
"""

from __future__ import annotations

import uuid
from datetime import datetime
from typing import TYPE_CHECKING, Optional

from sqlalchemy import DateTime, Float, ForeignKey, String, Text, func
from sqlalchemy import JSON
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base

if TYPE_CHECKING:
    from app.models.prescription import Prescription


class AIExtractionLog(Base):
    """Log entry for a single AI extraction run."""

    __tablename__ = "ai_extraction_logs"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )

    # ── Reference ────────────────────────────────────────────────────────
    prescription_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("prescriptions.id"),
        nullable=False,
        index=True,
    )

    # ── Model metadata ───────────────────────────────────────────────────
    model_used: Mapped[str] = mapped_column(String(100), nullable=False)
    confidence_score: Mapped[Optional[float]] = mapped_column(
        Float, nullable=True
    )

    # ── Payloads ─────────────────────────────────────────────────────────
    raw_response: Mapped[Optional[dict]] = mapped_column(JSON, nullable=True)
    detected_regions: Mapped[Optional[dict]] = mapped_column(JSON, nullable=True)

    # ── Performance ──────────────────────────────────────────────────────
    processing_time_ms: Mapped[Optional[float]] = mapped_column(
        Float, nullable=True
    )

    # ── Status ───────────────────────────────────────────────────────────
    status: Mapped[str] = mapped_column(String(50), nullable=False)
    error_message: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    # ── Timestamps ───────────────────────────────────────────────────────
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )

    # ── Relationships ────────────────────────────────────────────────────
    prescription: Mapped["Prescription"] = relationship(
        back_populates="ai_extraction_logs", lazy="selectin"
    )

    def __repr__(self) -> str:
        return (
            f"<AIExtractionLog {self.id} "
            f"model={self.model_used!r} status={self.status!r}>"
        )
