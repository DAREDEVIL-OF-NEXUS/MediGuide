"""
Analytics router — medication adherence statistics and insights.
"""

from __future__ import annotations

import logging
from datetime import date, timedelta
from uuid import UUID

from fastapi import APIRouter, Depends
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.dependencies import get_current_active_user
from app.database import get_db
from app.models.medication_log import MedicationLog
from app.models.schedule import MedicationSchedule
from app.models.user import User

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/v1/analytics", tags=["Analytics"])


@router.get("/adherence-summary")
async def adherence_summary(
    days: int = 7,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """Return adherence stats for the last N days."""
    since = date.today() - timedelta(days=days)

    # Total scheduled doses
    total_stmt = select(func.count(MedicationLog.id)).where(
        MedicationLog.user_id == current_user.id,
        MedicationLog.log_date >= since,
    )
    total_res = await db.execute(total_stmt)
    total = total_res.scalar() or 0

    # Taken doses
    taken_stmt = select(func.count(MedicationLog.id)).where(
        MedicationLog.user_id == current_user.id,
        MedicationLog.log_date >= since,
        MedicationLog.status == "taken",
    )
    taken_res = await db.execute(taken_stmt)
    taken = taken_res.scalar() or 0

    # Missed doses
    missed_stmt = select(func.count(MedicationLog.id)).where(
        MedicationLog.user_id == current_user.id,
        MedicationLog.log_date >= since,
        MedicationLog.status == "missed",
    )
    missed_res = await db.execute(missed_stmt)
    missed = missed_res.scalar() or 0

    adherence_rate = round((taken / total) * 100, 1) if total > 0 else 0.0

    return {
        "period_days": days,
        "total_doses": total,
        "taken": taken,
        "missed": missed,
        "skipped": total - taken - missed,
        "adherence_rate": adherence_rate,
    }
