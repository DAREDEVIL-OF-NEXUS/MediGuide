"""
Medical History Pydantic Schemas.

Validates inputs and structures outputs for diagnosed conditions, chronic illnesses, and allergies.
"""

from __future__ import annotations

from datetime import date, datetime
from typing import Optional
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field


class MedicalHistoryCreate(BaseModel):
    """Payload to record a new diagnosed condition or chronic illness."""

    condition: str = Field(..., min_length=1, max_length=255, description="Name of the condition or allergy")
    diagnosed_date: Optional[date] = Field(None, description="Date of diagnosis")
    severity: str = Field("Moderate", description="Severity level: Mild, Moderate, Severe")
    treatment_notes: Optional[str] = Field(None, max_length=2000, description="Associated doctor instructions/treatment")
    is_active: bool = Field(True, description="Whether the condition is currently active")


class MedicalHistoryResponse(BaseModel):
    """Serialized medical history entry response."""

    model_config = ConfigDict(from_attributes=True)

    id: UUID
    user_id: UUID
    condition: str
    diagnosed_date: Optional[date] = None
    severity: str
    treatment_notes: Optional[str] = None
    is_active: bool
    created_at: datetime
