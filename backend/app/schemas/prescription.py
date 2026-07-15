"""
Prescription-related Pydantic schemas.

Covers creation, list / detail responses, and the structured AI-extraction
result model.
"""

from __future__ import annotations

from datetime import date, datetime
from typing import Any, Dict, List, Optional
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field, computed_field, field_validator


# ═══════════════════════════════════════════════════════════════════════════
# Extracted medicine (from AI)
# ═══════════════════════════════════════════════════════════════════════════
class MedicineExtracted(BaseModel):
    """A single medicine entry returned by the AI extraction pipeline."""

    medicine_name: str
    dosage: Optional[str] = None
    frequency: Optional[str] = None
    timing: Optional[str] = None
    duration_days: Optional[int] = None
    special_instructions: Optional[str] = None
    confidence: Optional[float] = None
    warnings: List[str] = Field(default_factory=list)


# ═══════════════════════════════════════════════════════════════════════════
# Extraction result wrapper
# ═══════════════════════════════════════════════════════════════════════════
class ExtractionResult(BaseModel):
    """Structured extraction payload returned by the Gemini pipeline."""

    doctor_name: Optional[str] = None
    patient_name: Optional[str] = None
    prescription_date: Optional[str] = None
    diagnosis: Optional[str] = None
    medicines: List[MedicineExtracted] = []
    notes: Optional[str] = None
    confidence_score: Optional[float] = None
    rule_engine_warnings: List[str] = Field(default_factory=list)


# ═══════════════════════════════════════════════════════════════════════════
# Create
# ═══════════════════════════════════════════════════════════════════════════
class PrescriptionCreate(BaseModel):
    """Minimal payload accompanying the uploaded image."""

    notes: Optional[str] = Field(None, max_length=2000)


# ═══════════════════════════════════════════════════════════════════════════
# Medicine response (within prescription detail)
# ═══════════════════════════════════════════════════════════════════════════
class PrescriptionMedicineResponse(BaseModel):
    """A medicine line-item within a prescription response."""

    model_config = ConfigDict(from_attributes=True)

    id: UUID
    medicine_name: str
    dosage: Optional[str] = None
    frequency: Optional[str] = None
    timing: Optional[str] = None
    duration_days: Optional[int] = None
    special_instructions: Optional[str] = None
    created_at: datetime


# ═══════════════════════════════════════════════════════════════════════════
# Prescription detail
# ═══════════════════════════════════════════════════════════════════════════
class PrescriptionResponse(BaseModel):
    """Full detail representation of a prescription."""

    model_config = ConfigDict(from_attributes=True)

    id: UUID
    user_id: UUID
    doctor_id: Optional[UUID] = None
    image_url: Optional[str] = None
    status: str
    raw_extraction: Optional[Dict[str, Any]] = None
    validated_data: Optional[Dict[str, Any]] = None
    prescription_date: Optional[date] = None
    valid_until: Optional[date] = None
    notes: Optional[str] = None
    prescription_medicines: List[PrescriptionMedicineResponse] = []
    created_at: datetime
    updated_at: Optional[datetime] = None

    @field_validator("status", mode="before")
    @classmethod
    def map_status(cls, val: Any) -> Any:
        if val == "processed":
            return "completed"
        return val

    @computed_field
    @property
    def extracted_data(self) -> Dict[str, Any]:
        source = self.validated_data or self.raw_extraction or {}
        
        # Extract medicines mapping
        raw_medicines = source.get("medicines") or []
        mapped_medicines = []
        for m in raw_medicines:
            mapped_medicines.append({
                "name": m.get("medicine_name") or m.get("name") or "",
                "dosage": m.get("dosage"),
                "frequency": m.get("frequency"),
                "timing": m.get("timing"),
                "duration": str(m.get("duration_days")) if m.get("duration_days") is not None else (m.get("duration") or ""),
                "instructions": m.get("special_instructions") or m.get("instructions") or "",
                "type": m.get("type") or ""
            })
            
        return {
            "doctor_info": {
                "name": source.get("doctor_name"),
                "specialization": source.get("doctor_specialization"),
                "registration_number": source.get("doctor_registration_no"),
                "clinic_name": source.get("clinic_name"),
                "address": source.get("clinic_address"),
                "phone": source.get("clinic_phone"),
            },
            "patient_info": {
                "name": source.get("patient_name"),
                "age": source.get("patient_age"),
                "gender": source.get("patient_gender"),
                "weight": source.get("patient_weight"),
            },
            "diagnosis": source.get("diagnosis"),
            "medicines": mapped_medicines,
            "instructions": source.get("notes") or source.get("general_instructions") or source.get("instructions"),
        }


# ═══════════════════════════════════════════════════════════════════════════
# Paginated list
# ═══════════════════════════════════════════════════════════════════════════
class PrescriptionListResponse(BaseModel):
    """Paginated list of prescriptions."""

    items: List[PrescriptionResponse]
    total: int
    skip: int
    limit: int
