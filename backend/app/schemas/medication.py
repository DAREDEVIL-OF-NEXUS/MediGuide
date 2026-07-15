"""
Medication & Scheduling Pydantic Schemas.

Defines validation and structure for schedule views, log entries, and compliance statistics.
"""

from __future__ import annotations

from datetime import date, time, datetime
from typing import Optional
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field


# ═══════════════════════════════════════════════════════════════════════════
# Schedules
# ═══════════════════════════════════════════════════════════════════════════

class MedicationScheduleResponse(BaseModel):
    """Represents a scheduled dosing slot with parent medicine details and log status."""

    model_config = ConfigDict(from_attributes=True)

    id: UUID
    scheduled_time: time
    day_pattern: str
    start_date: date
    end_date: Optional[date] = None
    is_active: bool
    created_at: datetime

    # Parent medicine details (joined at query time)
    medicine_name: str
    dosage: Optional[str] = None
    frequency: Optional[str] = None
    timing: Optional[str] = None
    instructions: Optional[str] = None

    # Compliance log context (populated for specific date query)
    log_id: Optional[UUID] = None
    log_status: Optional[str] = None  # e.g., "taken", "missed", "skipped"
    actual_time: Optional[time] = None


# ═══════════════════════════════════════════════════════════════════════════
# Medication Logs
# ═══════════════════════════════════════════════════════════════════════════

class MedicationLogCreate(BaseModel):
    """Payload to record or update a medication adherence log."""

    schedule_id: UUID
    log_date: date
    status: str = Field(..., description="Dose status: taken, missed, skipped")
    actual_time: Optional[time] = None
    notes: Optional[str] = Field(None, max_length=1000)


class MedicationLogResponse(BaseModel):
    """Adherence log entry response."""

    model_config = ConfigDict(from_attributes=True)

    id: UUID
    user_id: UUID
    schedule_id: UUID
    log_date: date
    scheduled_time: time
    actual_time: Optional[time] = None
    status: str
    notes: Optional[str] = None
    created_at: datetime


# ═══════════════════════════════════════════════════════════════════════════
# Analytics / Statistics
# ═══════════════════════════════════════════════════════════════════════════

class AdherenceStatsResponse(BaseModel):
    """Dosing compliance metrics for dashboard progress charts."""

    total_scheduled: int
    total_taken: int
    adherence_rate: float = Field(..., description="Adherence rate percentage (0.0 to 100.0)")
    streak_days: int = 0
    badges: list[str] = Field(default_factory=list)
