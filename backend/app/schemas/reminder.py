"""
Reminder Pydantic Schemas.

Structures reminder configurations, triggers, and state flags for patient schedules.
"""

from __future__ import annotations

from datetime import time
from uuid import UUID

from pydantic import BaseModel, ConfigDict


class ReminderResponse(BaseModel):
    """Medication reminder settings response schema."""

    model_config = ConfigDict(from_attributes=True)

    id: UUID
    schedule_id: UUID
    reminder_time: time
    minutes_before: int
    is_enabled: bool
    channel: str

    # Joined fields for UI context
    medicine_name: str
    dosage: str
    scheduled_time: time
