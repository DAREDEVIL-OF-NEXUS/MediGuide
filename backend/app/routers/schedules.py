"""
Schedules router — view and manage medication schedules.
"""

from __future__ import annotations

import logging
from uuid import UUID

from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.dependencies import get_current_active_user
from app.database import get_db
from app.models.schedule import MedicationSchedule
from app.models.user import User

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/v1/schedules", tags=["Schedules"])


@router.get("/")
async def list_schedules(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """Return all medication schedules for the current user."""
    stmt = select(MedicationSchedule).where(
        MedicationSchedule.user_id == current_user.id
    )
    result = await db.execute(stmt)
    schedules = result.scalars().all()
    return [
        {
            "id": str(s.id),
            "prescription_medicine_id": str(s.prescription_medicine_id),
            "scheduled_time": s.scheduled_time.isoformat(),
            "day_pattern": s.day_pattern,
            "start_date": s.start_date.isoformat(),
            "end_date": s.end_date.isoformat() if s.end_date else None,
            "is_active": s.is_active,
        }
        for s in schedules
    ]


@router.patch("/{schedule_id}/toggle")
async def toggle_schedule(
    schedule_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """Activate or deactivate a medication schedule."""
    stmt = select(MedicationSchedule).where(
        MedicationSchedule.id == schedule_id,
        MedicationSchedule.user_id == current_user.id,
    )
    result = await db.execute(stmt)
    schedule = result.scalar_one_or_none()
    if not schedule:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="Schedule not found")

    schedule.is_active = not schedule.is_active
    await db.flush()
    await db.refresh(schedule)
    return {"id": str(schedule.id), "is_active": schedule.is_active}
