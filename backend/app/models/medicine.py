"""
Medicine ORM model.

Shared knowledge base of medicines.  Individual prescription items
reference this table when a match is found.
"""

from __future__ import annotations

import uuid
from datetime import datetime
from typing import TYPE_CHECKING, List, Optional

from sqlalchemy import DateTime, String, Text, func, JSON
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base

if TYPE_CHECKING:
    from app.models.prescription import PrescriptionMedicine


class Medicine(Base):
    """Canonical medicine entry in the knowledge base."""

    __tablename__ = "medicines"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    name: Mapped[str] = mapped_column(
        String(255), unique=True, index=True, nullable=False
    )
    generic_name: Mapped[Optional[str]] = mapped_column(
        String(255), nullable=True
    )
    category: Mapped[Optional[str]] = mapped_column(
        String(255), nullable=True
    )
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    photo_url: Mapped[Optional[str]] = mapped_column(String(1024), nullable=True)

    # ── Structured safety data (JSON arrays) ─────────────────────────────
    brand_names: Mapped[Optional[list]] = mapped_column(
        JSON, default=list, server_default="[]"
    )
    dosage_forms: Mapped[Optional[list]] = mapped_column(
        JSON, default=list, server_default="[]"
    )
    side_effects: Mapped[Optional[list]] = mapped_column(
        JSON, default=list, server_default="[]"
    )
    interactions: Mapped[Optional[list]] = mapped_column(
        JSON, default=list, server_default="[]"
    )
    contraindications: Mapped[Optional[list]] = mapped_column(
        JSON, default=list, server_default="[]"
    )
    warnings: Mapped[Optional[list]] = mapped_column(
        JSON, default=list, server_default="[]"
    )

    usage_instructions: Mapped[Optional[str]] = mapped_column(
        Text, nullable=True
    )
    pregnancy_category: Mapped[Optional[str]] = mapped_column(
        String(255), nullable=True
    )
    storage: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    
    source: Mapped[str] = mapped_column(
        String(50), default="Gemini", server_default="'Gemini'"
    )

    # ── Timestamps ───────────────────────────────────────────────────────
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )

    # ── Relationships ────────────────────────────────────────────────────
    prescription_medicines: Mapped[List["PrescriptionMedicine"]] = relationship(
        back_populates="medicine", lazy="selectin"
    )

    def __repr__(self) -> str:
        return f"<Medicine {self.name!r}>"
