"""
Medications Router.

Endpoints for viewing daily schedules, logging dose compliance, and
retrieving adherence analytics.
"""

from __future__ import annotations

import logging
from datetime import date, datetime, timedelta
from typing import List, Optional
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, Response, status
from sqlalchemy import and_, func, or_, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.dependencies import get_current_active_user
from app.database import get_db
from app.models.medication_log import MedicationLog
from app.models.prescription import PrescriptionMedicine
from app.models.schedule import MedicationSchedule
from app.models.user import User
from app.schemas.medication import (
    AdherenceStatsResponse,
    MedicationLogCreate,
    MedicationLogResponse,
    MedicationScheduleResponse,
)

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/medications", tags=["Medications"])


# ═══════════════════════════════════════════════════════════════════════════
# Daily Dosing Schedule
# ═══════════════════════════════════════════════════════════════════════════
@router.get(
    "/schedule",
    response_model=List[MedicationScheduleResponse],
    summary="Get dosing schedule for a specific date",
)
async def get_schedule(
    date_str: Optional[str] = Query(None, alias="date", description="Query date in YYYY-MM-DD format"),
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
) -> List[MedicationScheduleResponse]:
    """Retrieve all active scheduled doses for the user on a specific date,

    including any logged compliance status for that date.
    """
    # 1. Parse date (default to local today)
    target_date = date.today()
    if date_str:
        try:
            target_date = date.fromisoformat(date_str)
        except ValueError:
            raise HTTPException(
                status_code=400,
                detail="Invalid date format. Use YYYY-MM-DD.",
            )

    # 2. Query active schedules joined with medicines and logs for target_date
    stmt = (
        select(
            MedicationSchedule,
            PrescriptionMedicine.medicine_name,
            PrescriptionMedicine.dosage,
            PrescriptionMedicine.frequency,
            PrescriptionMedicine.timing,
            PrescriptionMedicine.special_instructions,
            MedicationLog.id.label("log_id"),
            MedicationLog.status.label("log_status"),
            MedicationLog.actual_time.label("actual_time"),
        )
        .join(
            PrescriptionMedicine,
            MedicationSchedule.prescription_medicine_id == PrescriptionMedicine.id,
        )
        .outerjoin(
            MedicationLog,
            and_(
                MedicationLog.schedule_id == MedicationSchedule.id,
                MedicationLog.log_date == target_date,
            ),
        )
        .where(
            MedicationSchedule.user_id == current_user.id,
            MedicationSchedule.is_active == True,
            MedicationSchedule.start_date <= target_date,
            or_(
                MedicationSchedule.end_date == None,
                MedicationSchedule.end_date >= target_date,
            ),
        )
        .order_by(MedicationSchedule.scheduled_time.asc())
    )

    result = await db.execute(stmt)
    schedules = []

    for row in result.all():
        sched, name, dose, freq, tim, inst, log_id, log_status, act_time = row
        schedules.append(
            MedicationScheduleResponse(
                id=sched.id,
                scheduled_time=sched.scheduled_time,
                day_pattern=sched.day_pattern,
                start_date=sched.start_date,
                end_date=sched.end_date,
                is_active=sched.is_active,
                created_at=sched.created_at,
                medicine_name=name,
                dosage=dose,
                frequency=freq,
                timing=tim,
                instructions=inst,
                log_id=log_id,
                log_status=log_status,
                actual_time=act_time,
            )
        )

    return schedules


# ═══════════════════════════════════════════════════════════════════════════
# Log Dosing Status
# ═══════════════════════════════════════════════════════════════════════════
@router.post(
    "/log",
    response_model=MedicationLogResponse,
    summary="Record dosing compliance status",
)
async def log_dose(
    data: MedicationLogCreate,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
) -> MedicationLogResponse:
    """Log or update a compliance record (taken, skipped, missed) for a scheduled dose."""
    # 1. Verify schedule ownership
    sched_stmt = select(MedicationSchedule).where(
        MedicationSchedule.id == data.schedule_id,
        MedicationSchedule.user_id == current_user.id,
    )
    sched_res = await db.execute(sched_stmt)
    schedule = sched_res.scalar_one_or_none()
    if not schedule:
        raise HTTPException(
            status_code=404,
            detail="Medication schedule slot not found.",
        )

    # 2. Check if a log entry already exists for this date
    log_stmt = select(MedicationLog).where(
        MedicationLog.schedule_id == data.schedule_id,
        MedicationLog.log_date == data.log_date,
    )
    log_res = await db.execute(log_stmt)
    log = log_res.scalar_one_or_none()

    # 3. Resolve actual intake time
    actual_time = data.actual_time
    if data.status == "taken" and not actual_time:
        actual_time = datetime.now().time()

    if log:
        # Update existing record
        log.status = data.status
        log.actual_time = actual_time
        log.notes = data.notes
        logger.info("Updated adherence log for schedule %s: %s", data.schedule_id, data.status)
    else:
        # Create new log entry
        log = MedicationLog(
            user_id=current_user.id,
            schedule_id=data.schedule_id,
            log_date=data.log_date,
            scheduled_time=schedule.scheduled_time,
            actual_time=actual_time,
            status=data.status,
            notes=data.notes,
        )
        db.add(log)
        logger.info("Created adherence log for schedule %s: %s", data.schedule_id, data.status)

    await db.flush()
    await db.refresh(log)
    return MedicationLogResponse.model_validate(log)


# ═══════════════════════════════════════════════════════════════════════════
# Adherence Compliance Analytics
# ═══════════════════════════════════════════════════════════════════════════
@router.get(
    "/adherence",
    response_model=AdherenceStatsResponse,
    summary="Get dosing adherence metrics",
)
async def get_adherence(
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
) -> AdherenceStatsResponse:
    """Calculate the user's dosing adherence rate over the last 30 days."""
    today = date.today()
    thirty_days_ago = today - timedelta(days=30)

    # 1. Fetch active schedules
    sched_stmt = select(MedicationSchedule).where(
        MedicationSchedule.user_id == current_user.id,
        MedicationSchedule.is_active == True,
    )
    sched_res = await db.execute(sched_stmt)
    schedules = sched_res.scalars().all()

    # 2. Count active slots over 30 days timeline
    total_scheduled = 0
    for i in range(31):  # inclusive of 30 days ago to today
        d = thirty_days_ago + timedelta(days=i)
        for s in schedules:
            if s.start_date <= d and (s.end_date is None or s.end_date >= d):
                total_scheduled += 1

    # 3. Fetch count of taken log entries in the same range
    taken_stmt = (
        select(func.count())
        .select_from(MedicationLog)
        .where(
            MedicationLog.user_id == current_user.id,
            MedicationLog.log_date >= thirty_days_ago,
            MedicationLog.log_date <= today,
            MedicationLog.status == "taken",
        )
    )
    taken_res = await db.execute(taken_stmt)
    total_taken = taken_res.scalar_one()

    # 4. Adherence rate percentage calculation
    rate = (total_taken / total_scheduled * 100.0) if total_scheduled > 0 else 100.0

    # 5. Calculate Streaks & Badges (Phase 4 Gamification)
    # Simple logic: for every 3 taken doses, user gets a streak.
    # Badges are awarded based on adherence thresholds.
    streak_days = total_taken // 3
    badges = []
    
    if rate >= 90:
        badges.append("Consistency Champion 🏆")
    if rate >= 70:
        badges.append("On Track ✅")
    if total_taken >= 10:
        badges.append("10 Doses Milestone 🌟")

    return AdherenceStatsResponse(
        total_scheduled=total_scheduled,
        total_taken=total_taken,
        adherence_rate=round(rate, 1),
        streak_days=streak_days,
        badges=badges
    )
