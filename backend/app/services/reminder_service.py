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
    """Real implementation of sending email reminders using SMTP."""
    from app.config import settings
    if not settings.use_email_reminders or not settings.smtp_username or not settings.smtp_password:
        logger.info(f"EMAIL DISPATCH: Skipping due to config. To: {email_to} -> {subject}")
        return

    import smtplib
    from email.mime.text import MIMEText
    from email.mime.multipart import MIMEMultipart

    msg = MIMEMultipart("alternative")
    msg["Subject"] = subject
    msg["From"] = settings.smtp_from_email
    msg["To"] = email_to

    # Plain text and HTML template
    text = body
    html = f"""
    <html>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <h2 style="color: #0ea5e9;">MediGuide AI Reminder</h2>
        <p style="font-size: 16px;">{body}</p>
        <hr style="border: none; border-top: 1px solid #eaeaea; margin: 20px 0;" />
        <p style="font-size: 12px; color: #888;">This is an automated message from your MediGuide AI assistant.</p>
      </body>
    </html>
    """

    part1 = MIMEText(text, "plain")
    part2 = MIMEText(html, "html")
    msg.attach(part1)
    msg.attach(part2)

    def _send():
        max_retries = 3
        for attempt in range(max_retries):
            try:
                server = smtplib.SMTP(settings.smtp_server, settings.smtp_port, timeout=10)
                server.ehlo()
                server.starttls()
                server.login(settings.smtp_username, settings.smtp_password)
                server.sendmail(settings.smtp_from_email, email_to, msg.as_string())
                server.quit()
                logger.info(f"EMAIL DISPATCH SUCCESS: Sent to {email_to}")
                break
            except Exception as e:
                logger.warning(f"Email attempt {attempt + 1} failed: {e}")
                import time
                time.sleep(2)
        else:
            logger.error(f"EMAIL DISPATCH FAILED: Could not send to {email_to} after {max_retries} attempts.")

    # Run in background to avoid blocking
    threading.Thread(target=_send, daemon=True).start()


from app.models.notification import Notification
from app.models.prescription import PrescriptionMedicine
from app.models.reminder import Reminder
from app.models.schedule import MedicationSchedule
from app.models.user import User
from app.models.medication_log import MedicationLog

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

    # --- Phase 4: Escalating Missed-Dose Notifications to Guardian ---
    # Find reminders that were due more than 2 hours ago today and have no "taken" log
    missed_count = 0
    missed_threshold_hours = 2

    for rem, sched, pm in rows:
        reminder_datetime = datetime.combine(today_date, rem.reminder_time)
        time_diff = now_dt - reminder_datetime

        if time_diff > timedelta(hours=missed_threshold_hours):
            # Check if user took the medication
            log_stmt = select(MedicationLog).where(
                MedicationLog.schedule_id == sched.id,
                MedicationLog.log_date == today_date,
                MedicationLog.scheduled_time == rem.reminder_time,
                MedicationLog.status == "taken"
            )
            log_res = await db.execute(log_stmt)
            if log_res.scalars().all():
                continue # User took it

            # Check if we already alerted the guardian today
            alert_stmt = select(Notification).where(
                Notification.reminder_id == rem.id,
                Notification.type == "guardian_alert",
                func.date(Notification.created_at) == today_date,
            )
            alert_res = await db.execute(alert_stmt)
            if alert_res.scalars().all():
                continue # Already alerted

            # Needs guardian alert
            guardian_notification = Notification(
                user_id=sched.user_id,
                reminder_id=rem.id,
                type="guardian_alert",
                title="URGENT: Missed Medication Alert",
                body=(
                    f"Your dependent {getattr(sched.user, 'full_name', 'Patient')} has missed their dose of "
                    f"{pm.medicine_name} scheduled for {rem.reminder_time.strftime('%I:%M %p')}. "
                    "Please check in with them to ensure they take their medication."
                ),
                status="sent",
            )
            db.add(guardian_notification)

            if getattr(sched.user, 'emergency_contacts', None):
                for contact in sched.user.emergency_contacts:
                    if contact.get('email'):
                        send_email_reminder(contact['email'], guardian_notification.title, guardian_notification.body)
                        logger.info(f"Escalated missed dose of {pm.medicine_name} to guardian: {contact['email']}")
            
            missed_count += 1

    if missed_count > 0:
        await db.flush()

    return dispatched_count
