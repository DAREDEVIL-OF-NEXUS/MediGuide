"""
Background Task Scheduler.

Uses APScheduler to run the Reminder Engine automatically every minute.
"""

from __future__ import annotations

import logging
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from app.database import async_session_factory
from app.services.reminder_service import dispatch_due_reminders

logger = logging.getLogger(__name__)

scheduler = AsyncIOScheduler()

async def run_reminder_job():
    """Job wrapper to run the reminder dispatch with a new DB session."""
    logger.info("Running background reminder job...")
    try:
        async with async_session_factory() as db:
            await dispatch_due_reminders(db)
    except Exception as exc:
        logger.error("Error in reminder job: %s", exc)

def start_scheduler():
    """Start the APScheduler for background tasks."""
    scheduler.add_job(run_reminder_job, "interval", minutes=1)
    scheduler.start()
    logger.info("APScheduler started: reminder engine running every 1 minute.")
