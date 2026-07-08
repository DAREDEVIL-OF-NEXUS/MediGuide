"""
Medication Scheduling Service.

Parses unstructured dosing frequencies (e.g. "twice daily") and timings
(e.g. "after meals") into structured, daily MedicationSchedule and Reminder records.
"""

from __future__ import annotations

import logging
from datetime import date, time, timedelta
from typing import List
from uuid import UUID

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.prescription import Prescription, PrescriptionMedicine
from app.models.schedule import MedicationSchedule
from app.models.reminder import Reminder

logger = logging.getLogger(__name__)


def parse_dosing_times(frequency_str: str | None, timing_str: str | None) -> List[time]:
    """Parse frequency and timing text strings into a list of daily times.

    Frequencies supported: once daily, twice daily, three times daily, etc.
    Timings supported: before meals, after meals, empty stomach, bedtime, etc.
    """
    freq = (frequency_str or "").lower().strip()
    tim = (timing_str or "").lower().strip()

    # 1. Base times mapping
    morning = time(9, 0)
    afternoon = time(14, 0)
    evening = time(18, 0)
    bedtime = time(21, 30)
    default_time = time(10, 0)

    # 2. Map frequency to base time slots
    if any(x in freq for x in ("twice", "2 times", "2x", "bid")):
        times = [morning, bedtime]
    elif any(x in freq for x in ("three", "3 times", "3x", "tid")):
        times = [morning, afternoon, bedtime]
    elif any(x in freq for x in ("four", "4 times", "4x", "qid")):
        times = [time(8, 0), time(13, 0), time(18, 0), time(22, 0)]
    elif any(x in freq for x in ("once", "1 time", "1x", "daily", "qd", "every day")):
        # For once daily, determine best slot based on timing details
        if any(x in tim or x in freq for x in ("night", "bedtime", "evening", "dinner")):
            times = [bedtime]
        elif any(x in tim or x in freq for x in ("lunch", "afternoon")):
            times = [afternoon]
        else:
            times = [morning]
    else:
        # Default fallback (e.g. "as needed", "SOS", or empty)
        times = [default_time]

    # 3. Apply timing modifiers to shift the time slots slightly for better UX
    adjusted_times = []
    for t in times:
        hour, minute = t.hour, t.minute

        # Shifts for morning slots (08:00 - 10:00)
        if 8 <= hour <= 10:
            if "before breakfast" in tim or "empty stomach" in tim:
                hour, minute = 8, 0
            elif "after breakfast" in tim:
                hour, minute = 9, 30

        # Shifts for afternoon slots (13:00 - 14:30)
        elif 13 <= hour <= 14:
            if "before lunch" in tim:
                hour, minute = 12, 30
            elif "after lunch" in tim:
                hour, minute = 14, 30

        # Shifts for evening/night slots (18:00 - 22:00)
        elif 18 <= hour <= 22:
            if "before dinner" in tim:
                hour, minute = 19, 30
            elif "after dinner" in tim:
                hour, minute = 21, 30
            elif "bedtime" in tim or "night" in tim:
                hour, minute = 22, 0

        adjusted_times.append(time(hour, minute))

    return adjusted_times


async def generate_schedules_for_prescription(
    db: AsyncSession, user_id: UUID, prescription_id: UUID
) -> None:
    """Generate MedicationSchedule and Reminder records for all medicines in a prescription."""
    # 1. Fetch prescription with medicines
    result = await db.execute(
        select(Prescription)
        .options(selectinload(Prescription.prescription_medicines))
        .where(Prescription.id == prescription_id, Prescription.user_id == user_id)
    )
    prescription = result.scalar_one_or_none()
    if not prescription:
        logger.warning("Prescription %s not found for user %s. Skipping scheduling.", prescription_id, user_id)
        return

    start_date = prescription.prescription_date or date.today()

    # 2. Iterate through each medicine
    for pm in prescription.prescription_medicines:
        # Check if schedules already exist for this prescription medicine
        existing_stmt = select(MedicationSchedule).where(
            MedicationSchedule.prescription_medicine_id == pm.id
        )
        existing_res = await db.execute(existing_stmt)
        if existing_res.scalars().all():
            logger.info("Schedules already exist for medicine: %s", pm.medicine_name)
            continue

        # Parse schedule times
        times = parse_dosing_times(pm.frequency, pm.timing)
        duration = pm.duration_days or 7  # default to 1 week
        end_date = start_date + timedelta(days=duration - 1)

        logger.info(
            "Generating %d schedule times for medicine %s (duration: %d days)",
            len(times),
            pm.medicine_name,
            duration,
        )

        for t in times:
            # Create schedule
            schedule = MedicationSchedule(
                user_id=user_id,
                prescription_medicine_id=pm.id,
                scheduled_time=t,
                day_pattern="daily",
                start_date=start_date,
                end_date=end_date,
                is_active=True,
            )
            db.add(schedule)
            await db.flush()

            # Create corresponding reminder
            reminder = Reminder(
                schedule_id=schedule.id,
                reminder_time=t,
                minutes_before=10,
                is_enabled=True,
                channel="push",
            )
            db.add(reminder)

    logger.info("Successfully generated medication schedules and reminders for prescription %s", prescription_id)
