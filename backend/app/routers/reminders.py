"""
Reminders Router.

Endpoints for checking, updating, and triggering patient schedule reminders.
"""

from __future__ import annotations

import logging
from typing import List
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.dependencies import get_current_active_user
from app.database import get_db
from app.models.prescription import PrescriptionMedicine
from app.models.reminder import Reminder
from app.models.schedule import MedicationSchedule
from app.models.user import User
from app.schemas.reminder import ReminderResponse
from app.services.reminder_service import dispatch_due_reminders

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/reminders", tags=["Reminders"])


@router.get(
    "",
    response_model=List[ReminderResponse],
    summary="List patient active reminders",
)
async def list_reminders(
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
) -> List[ReminderResponse]:
    """Retrieve all reminders registered under the logged-in user's schedules."""
    stmt = (
        select(
            Reminder,
            PrescriptionMedicine.medicine_name,
            PrescriptionMedicine.dosage,
            MedicationSchedule.scheduled_time,
        )
        .join(MedicationSchedule, Reminder.schedule_id == MedicationSchedule.id)
        .join(
            PrescriptionMedicine,
            MedicationSchedule.prescription_medicine_id == PrescriptionMedicine.id,
        )
        .where(MedicationSchedule.user_id == current_user.id)
        .order_by(Reminder.reminder_time.asc())
    )

    result = await db.execute(stmt)
    reminders = []

    for row in result.all():
        rem, name, dose, sched_time = row
        reminders.append(
            ReminderResponse(
                id=rem.id,
                schedule_id=rem.schedule_id,
                reminder_time=rem.reminder_time,
                minutes_before=rem.minutes_before,
                is_enabled=rem.is_enabled,
                channel=rem.channel,
                medicine_name=name,
                dosage=dose or "1 dose",
                scheduled_time=sched_time,
            )
        )

    return reminders


@router.put(
    "/{reminder_id}",
    response_model=ReminderResponse,
    summary="Update reminder configuration",
)
async def update_reminder(
    reminder_id: UUID,
    is_enabled: bool,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
) -> ReminderResponse:
    """Toggle a reminder's enabled/disabled status."""
    stmt = (
        select(
            Reminder,
            PrescriptionMedicine.medicine_name,
            PrescriptionMedicine.dosage,
            MedicationSchedule.scheduled_time,
        )
        .join(MedicationSchedule, Reminder.schedule_id == MedicationSchedule.id)
        .join(
            PrescriptionMedicine,
            MedicationSchedule.prescription_medicine_id == PrescriptionMedicine.id,
        )
        .where(Reminder.id == reminder_id, MedicationSchedule.user_id == current_user.id)
    )

    result = await db.execute(stmt)
    row = result.first()

    if not row:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Reminder slot not found.",
        )

    rem, name, dose, sched_time = row
    rem.is_enabled = is_enabled
    await db.flush()

    logger.info("Updated reminder status %s for user %s: is_enabled=%s", reminder_id, current_user.id, is_enabled)
    return ReminderResponse(
        id=rem.id,
        schedule_id=rem.schedule_id,
        reminder_time=rem.reminder_time,
        minutes_before=rem.minutes_before,
        is_enabled=rem.is_enabled,
        channel=rem.channel,
        medicine_name=name,
        dosage=dose or "1 dose",
        scheduled_time=sched_time,
    )


@router.post(
    "/trigger",
    summary="Manually trigger due reminders check",
)
async def trigger_reminders(
    db: AsyncSession = Depends(get_db),
) -> dict:
    """Manually invoke the background scanner to dispatch due alerts.

    Useful for scheduling cron tasks or testing local console emulation.
    """
    dispatched = await dispatch_due_reminders(db)
    return {
        "status": "success",
        "dispatched_count": dispatched,
    }
