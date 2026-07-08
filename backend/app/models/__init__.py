"""
Models package — imports every ORM model so Alembic and the app can
discover them from a single import.

Usage::

    from app.models import Base, User, Prescription, ...
"""

from app.database import Base
from app.models.ai_extraction_log import AIExtractionLog
from app.models.doctor import Doctor
from app.models.medical_history import MedicalHistory
from app.models.medication_log import MedicationLog
from app.models.medicine import Medicine
from app.models.notification import Notification
from app.models.prescription import Prescription, PrescriptionMedicine
from app.models.reminder import Reminder
from app.models.schedule import MedicationSchedule
from app.models.user import User

__all__ = [
    "Base",
    "User",
    "Doctor",
    "Prescription",
    "PrescriptionMedicine",
    "Medicine",
    "MedicationSchedule",
    "MedicationLog",
    "Reminder",
    "Notification",
    "MedicalHistory",
    "AIExtractionLog",
]
