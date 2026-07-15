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
import threading

def play_alarm():
    """Play a local alarm sound."""
    try:
        import winsound
        # Play a sequence of beeps
        for _ in range(3):
            winsound.Beep(1000, 400)
            winsound.Beep(1500, 400)
    except Exception as e:
        logger.warning(f"winsound failed, trying pygame: {e}")
        try:
            import pygame
            pygame.mixer.init()
            # If we had a specific sound file, we would load it here.
            # Without a file, pygame can't easily synthesize a beep out of the box in 1 line
            logger.info("pygame initialized, but no sound file available for alarm.")
        except Exception as py_e:
            logger.warning(f"pygame also failed: {py_e}")

def send_email_reminder(email_to: str, subject: str, body: str):
    """Stub for sending email reminders (Priority 2)."""
    logger.info(f"EMAIL DISPATCH: Sending to {email_to} -> {subject}")
    # In a real app, this would use aiosmtplib or sendgrid to dispatch the email.
    pass


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

            # 5. Local Alarm (Priority 1)
            threading.Thread(target=play_alarm, daemon=True).start()
            
            # 6. Email Reminder (Priority 2)
            user_email = sched.user.email if hasattr(sched.user, 'email') else f"user_{sched.user_id}@mediguide.ai"
            send_email_reminder(user_email, notification.title, notification.body)

            # 7. Local Emulator Console Fallback
            print(
                f"\n=== [LOCAL ALARM & NOTIFICATION] ==="
                f"\nSending alert to User: {sched.user_id}"
                f"\nTitle: {notification.title}"
                f"\nBody:  {notification.body}"
                f"\n=====================================\n"
            )
            logger.info("Reminder dispatched for schedule slot: %s", sched.id)
            dispatched_count += 1

    if dispatched_count > 0:
        await db.flush()

    return dispatched_count
