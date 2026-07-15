"""
Prescription & PrescriptionMedicine ORM models.

A Prescription is an uploaded image + its AI-extracted / validated data.
PrescriptionMedicine is the association table that stores each medicine line
item extracted from a prescription, along with dosage metadata.
"""

from __future__ import annotations

import uuid
from datetime import date, datetime
from typing import TYPE_CHECKING, List, Optional

from sqlalchemy import (
    Date,
    DateTime,
    ForeignKey,
    Integer,
    Float,
    String,
    Text,
    func,
)
from sqlalchemy.dialects.postgresql import JSON, UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base

if TYPE_CHECKING:
    from app.models.ai_extraction_log import AIExtractionLog
    from app.models.doctor import Doctor
    from app.models.medicine import Medicine
    from app.models.schedule import MedicationSchedule
    from app.models.user import User


class Prescription(Base):
    """An uploaded prescription image and its processing state."""

    __tablename__ = "prescriptions"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )

    # ── Owner & doctor ───────────────────────────────────────────────────
    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id"), nullable=False, index=True
    )
    doctor_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True), ForeignKey("doctors.id"), nullable=True
    )

    # ── Image / processing ───────────────────────────────────────────────
    image_url: Mapped[Optional[str]] = mapped_column(String(1024), nullable=True)
    status: Mapped[str] = mapped_column(
        String(50), default="pending", server_default="pending"
    )

    # ── AI extraction payloads ───────────────────────────────────────────
    raw_extraction: Mapped[Optional[dict]] = mapped_column(JSON, nullable=True)
    validated_data: Mapped[Optional[dict]] = mapped_column(JSON, nullable=True)

    # ── Dates ────────────────────────────────────────────────────────────
    prescription_date: Mapped[Optional[date]] = mapped_column(Date, nullable=True)
    valid_until: Mapped[Optional[date]] = mapped_column(Date, nullable=True)
    notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    # ── Timestamps ───────────────────────────────────────────────────────
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
    updated_at: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True), onupdate=func.now(), nullable=True
    )

    # ── Relationships ────────────────────────────────────────────────────
    user: Mapped["User"] = relationship(back_populates="prescriptions", lazy="selectin")
    doctor: Mapped[Optional["Doctor"]] = relationship(
        back_populates="prescriptions", lazy="selectin"
    )
    prescription_medicines: Mapped[List["PrescriptionMedicine"]] = relationship(
        back_populates="prescription",
        cascade="all, delete-orphan",
        lazy="selectin",
    )
    ai_extraction_logs: Mapped[List["AIExtractionLog"]] = relationship(
        back_populates="prescription",
        cascade="all, delete-orphan",
        lazy="selectin",
    )

    def __repr__(self) -> str:
        return f"<Prescription {self.id} status={self.status!r}>"


class PrescriptionMedicine(Base):
    """Individual medicine line item extracted from a prescription."""

    __tablename__ = "prescription_medicines"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )

    # ── Links ────────────────────────────────────────────────────────────
    prescription_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("prescriptions.id"),
        nullable=False,
        index=True,
    )
    medicine_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True), ForeignKey("medicines.id"), nullable=True
    )

    # ── Extracted data ───────────────────────────────────────────────────
    medicine_name: Mapped[str] = mapped_column(String(255), nullable=False)
    dosage: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    frequency: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    timing: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    duration_days: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    special_instructions: Mapped[Optional[str]] = mapped_column(
        Text, nullable=True
    )
    
    # ── Explainable AI ───────────────────────────────────────────────────
    bbox: Mapped[Optional[list]] = mapped_column(JSON, nullable=True)
    confidence: Mapped[Optional[float]] = mapped_column(Float, nullable=True)

    # ── Timestamps ───────────────────────────────────────────────────────
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )

    # ── Relationships ────────────────────────────────────────────────────
    prescription: Mapped["Prescription"] = relationship(
        back_populates="prescription_medicines", lazy="selectin"
    )
    medicine: Mapped[Optional["Medicine"]] = relationship(
        back_populates="prescription_medicines", lazy="selectin"
    )
    medication_schedules: Mapped[List["MedicationSchedule"]] = relationship(
        back_populates="prescription_medicine",
        cascade="all, delete-orphan",
        lazy="selectin",
    )

    def __repr__(self) -> str:
        return f"<PrescriptionMedicine {self.medicine_name!r}>"
