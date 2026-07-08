"""
Reminder & Notification Dispatch Service.

Periodically queries active medication schedules to check if any dosing alerts are due.
Logs notifications to the database and prints notification payloads to the terminal
as a local emulator fallback.
"""

from __future__ import annotations

import logging
from datetime import date, datetime, timedelta
from sqlalchemy import func, or_, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.notification import Notification
from app.models.prescription import PrescriptionMedicine
from app.models.reminder import Reminder
from app.models.schedule import MedicationSchedule

logger = logging.getLogger(__name__)


async def dispatch_due_reminders(db: AsyncSession) -> int:
    """Scan active schedules, identify due alerts, and dispatch notifications.

    Dispatches only if no notification was already sent today for the reminder slot.
    Returns:
        The count of newly sent notifications.
    """
    today_date = date.today()
    now_dt = datetime.now()

    # 1. Query all active schedules with enabled reminders
    stmt = (
        select(Reminder, MedicationSchedule, PrescriptionMedicine)
        .join(MedicationSchedule, Reminder.schedule_id == MedicationSchedule.id)
        .join(
            PrescriptionMedicine,
            MedicationSchedule.prescription_medicine_id == PrescriptionMedicine.id,
        )
        .where(
            Reminder.is_enabled == True,
            MedicationSchedule.is_active == True,
            MedicationSchedule.start_date <= today_date,
            or_(
                MedicationSchedule.end_date == None,
                MedicationSchedule.end_date >= today_date,
            ),
        )
    )

    result = await db.execute(stmt)
    rows = result.all()

    dispatched_count = 0

    for rem, sched, pm in rows:
        # 2. Check if a notification was already sent today for this reminder slot
        sent_stmt = select(Notification).where(
            Notification.reminder_id == rem.id,
            func.date(Notification.created_at) == today_date,
        )
        sent_res = await db.execute(sent_stmt)
        if sent_res.scalars().all():
            continue

        # 3. Check if current time lies in the activation window
        # (from reminder_time up to 30 minutes after)
        reminder_datetime = datetime.combine(today_date, rem.reminder_time)
        time_diff = now_dt - reminder_datetime

        if timedelta(seconds=0) <= time_diff <= timedelta(minutes=30):
            # 4. Save notification log
            notification = Notification(
                user_id=sched.user_id,
                reminder_id=rem.id,
                type="reminder",
                title="MediGuide Reminder ⏰",
                body=(
                    f"It's time to take your {pm.medicine_name} ({pm.dosage or '1 dose'})"
                    f"{' - ' + pm.timing if pm.timing else ''}."
                ),
                status="sent",
            )
            db.add(notification)

            # 5. Local Emulator Console Fallback
            print(
                f"\n=== [NOTIFICATION EMULATOR] ==="
                f"\nSending alert to User: {sched.user_id}"
                f"\nTitle: {notification.title}"
                f"\nBody:  {notification.body}"
                f"\n===============================\n"
            )
            logger.info("Reminder dispatched for schedule slot: %s", sched.id)
            dispatched_count += 1

    if dispatched_count > 0:
        await db.flush()

    return dispatched_count
