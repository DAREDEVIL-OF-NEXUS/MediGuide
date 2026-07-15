"""
Prescription service — upload, AI processing, and CRUD operations.

Orchestrates image storage, the Gemini extraction pipeline, and
prescription record management.
"""

from __future__ import annotations

import logging
from typing import List, Optional
from uuid import UUID

from fastapi import UploadFile
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.ai.extraction import GeminiExtractor
from app.ai.validation import validate_extraction
from app.core.exceptions import AIExtractionError, NotFoundError
from app.models.ai_extraction_log import AIExtractionLog
from app.models.prescription import Prescription, PrescriptionMedicine
from app.schemas.prescription import ExtractionResult
from app.utils.storage import StorageService

logger = logging.getLogger(__name__)

# Singleton instances (stateless, safe to reuse)
_storage = StorageService()
_extractor = GeminiExtractor()


# ═══════════════════════════════════════════════════════════════════════════
# CRUD
# ═══════════════════════════════════════════════════════════════════════════

async def create_prescription(
    db: AsyncSession,
    user_id: UUID,
    file: UploadFile,
    notes: Optional[str] = None,
) -> Prescription:
    """Upload a prescription image, store it, and create the DB record.

    The AI pipeline is **not** triggered here — call
    ``process_prescription`` separately (or from the router after
    returning the initial response).

    Returns:
        The new ``Prescription`` row with status ``"pending"``.
    """
    # 1. Upload image to Supabase storage
    image_url = await _storage.upload_prescription_image(file, user_id)
    logger.info("Image uploaded for user %s → %s", user_id, image_url)

    # 2. Persist the prescription record
    prescription = Prescription(
        user_id=user_id,
        image_url=image_url,
        status="pending",
        notes=notes,
    )
    db.add(prescription)
    await db.flush()
    await db.refresh(prescription)

    logger.info("Prescription created: %s", prescription.id)
    return prescription


async def get_prescription(
    db: AsyncSession, prescription_id: UUID, user_id: UUID
) -> Prescription:
    """Fetch a single prescription owned by *user_id*.

    Raises:
        NotFoundError: If the prescription doesn't exist or doesn't
            belong to the requesting user.
    """
    result = await db.execute(
        select(Prescription)
        .options(selectinload(Prescription.prescription_medicines))
        .where(
            Prescription.id == prescription_id,
            Prescription.user_id == user_id,
        )
    )
    prescription = result.scalar_one_or_none()
    if prescription is None:
        raise NotFoundError("Prescription not found")
    return prescription


async def list_prescriptions(
    db: AsyncSession,
    user_id: UUID,
    skip: int = 0,
    limit: int = 20,
) -> tuple[List[Prescription], int]:
    """Return a paginated list of prescriptions for *user_id*.

    Returns:
        A tuple of ``(items, total_count)``.
    """
    # Total count
    count_result = await db.execute(
        select(func.count())
        .select_from(Prescription)
        .where(Prescription.user_id == user_id)
    )
    total: int = count_result.scalar_one()

    # Items
    result = await db.execute(
        select(Prescription)
        .options(selectinload(Prescription.prescription_medicines))
        .where(Prescription.user_id == user_id)
        .order_by(Prescription.created_at.desc())
        .offset(skip)
        .limit(limit)
    )
    items = list(result.scalars().all())
    return items, total


async def process_prescription(
    db: AsyncSession, prescription_id: UUID
) -> Prescription:
    """Run the AI extraction + validation pipeline on a prescription.

    1. Download the image bytes from storage.
    2. Run ``GeminiExtractor.extract_prescription``.
    3. Validate the extraction.
    4. Persist medicines and update the prescription record.

    Returns:
        The updated ``Prescription`` with status ``"processed"``
        or ``"failed"``.
    """
    result = await db.execute(
        select(Prescription).where(Prescription.id == prescription_id)
    )
    prescription = result.scalar_one_or_none()
    if prescription is None:
        raise NotFoundError("Prescription not found")

    prescription.status = "processing"
    await db.flush()

    extraction_log = AIExtractionLog(
        prescription_id=prescription_id,
        model_used="gemini-2.5-flash",
        status="started",
    )
    db.add(extraction_log)
    await db.flush()

    try:
        # 1. Download image bytes
        image_bytes = await _storage.download_image(prescription.image_url or "")

        # 2. AI extraction
        raw_result = await _extractor.extract_prescription(image_bytes)

        # 3. Validate
        validated: ExtractionResult = validate_extraction(raw_result)

        # 4. Update prescription
        prescription.raw_extraction = raw_result
        prescription.validated_data = validated.model_dump()
        prescription.status = "waiting_for_verification"

        # 5. Update extraction log
        extraction_log.raw_response = raw_result
        extraction_log.confidence_score = validated.confidence_score
        extraction_log.status = "success"

        await db.flush()
        await db.refresh(prescription)

        logger.info(
            "Prescription %s processed — waiting for verification",
            prescription_id,
        )
        return prescription

    except Exception as exc:
        prescription.status = "failed"
        extraction_log.status = "failed"
        extraction_log.error_message = str(exc)
        await db.flush()

        logger.error(
            "AI extraction failed for prescription %s: %s",
            prescription_id,
            exc,
        )
        raise AIExtractionError(
            message="Failed to process prescription",
            detail=str(exc),
        ) from exc


async def delete_prescription(
    db: AsyncSession, prescription_id: UUID, user_id: UUID
) -> None:
    """Delete a prescription and its image from storage.

    Raises:
        NotFoundError: If the prescription doesn't exist or doesn't
            belong to the requesting user.
    """
    prescription = await get_prescription(db, prescription_id, user_id)

    # Remove the stored image (best-effort)
    if prescription.image_url:
        try:
            await _storage.delete_image(prescription.image_url)
        except Exception:
            logger.warning(
                "Failed to delete image for prescription %s", prescription_id
            )

    await db.delete(prescription)
    await db.flush()
    logger.info("Prescription %s deleted", prescription_id)

async def verify_prescription(
    db: AsyncSession, prescription_id: UUID, user_id: UUID, verified_data: ExtractionResult
) -> Prescription:
    """Take human-verified extraction data, create records and schedule."""
    prescription = await get_prescription(db, prescription_id, user_id)
    if prescription.status != "waiting_for_verification":
        raise ValueError(f"Prescription status is {prescription.status}, not waiting_for_verification")

    # Log user corrections
    original_data = prescription.validated_data or {}
    verified_dump = verified_data.model_dump()
    logger.info("Human Verification complete. Original: %s | Verified: %s", original_data, verified_dump)

    # Update validated data with human edits
    prescription.validated_data = verified_dump
    prescription.status = "processed"

    # Create medicine line items
    from app.services.medication_intelligence import MedicationIntelligenceService
    from app.services.schedule_service import generate_schedules_for_prescription
    
    med_intel_service = MedicationIntelligenceService()
    
    for med in verified_data.medicines:
        try:
            db_medicine = await med_intel_service.get_or_enrich_medicine(db, med.medicine_name)
            medicine_id = db_medicine.id
        except Exception as exc:
            logger.error("Failed to enrich/cache medicine %s: %s", med.medicine_name, exc)
            medicine_id = None
            
        pm = PrescriptionMedicine(
            prescription_id=prescription_id,
            medicine_id=medicine_id,
            medicine_name=med.medicine_name,
            dosage=med.dosage,
            frequency=med.frequency,
            timing=med.timing,
            duration_days=med.duration_days,
            special_instructions=med.special_instructions,
        )
        db.add(pm)

    await db.flush()
    
    # Auto-generate schedules & reminders
    try:
        await generate_schedules_for_prescription(db, prescription.user_id, prescription_id)
    except Exception as exc:
        logger.error("Failed to auto-generate schedules for prescription %s: %s", prescription_id, exc)
        
    await db.refresh(prescription)
    logger.info("Prescription %s verified and scheduled.", prescription_id)
    return prescription

