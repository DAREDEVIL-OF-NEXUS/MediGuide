"""
Prescriptions router.

Upload, list, detail, reprocess, and delete prescription images.
"""

from __future__ import annotations

import logging
from uuid import UUID

from fastapi import APIRouter, Depends, File, Form, Query, UploadFile, Response
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.dependencies import get_current_active_user
from app.database import get_db
from app.models.user import User
from app.schemas.prescription import (
    PrescriptionListResponse,
    PrescriptionResponse,
    ExtractionResult,
)
from app.services import prescription_service

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/prescriptions", tags=["Prescriptions"])


# ═══════════════════════════════════════════════════════════════════════════
# Upload
# ═══════════════════════════════════════════════════════════════════════════
@router.post(
    "/upload",
    response_model=PrescriptionResponse,
    status_code=201,
    summary="Upload a prescription image",
)
async def upload_prescription(
    file: UploadFile = File(..., description="Prescription image (JPEG/PNG)"),
    notes: str | None = Form(None, description="Optional notes"),
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
) -> PrescriptionResponse:
    """Upload a prescription image and kick off AI processing.

    The image is stored in Supabase, a DB record is created with status
    ``"pending"``, and the extraction pipeline runs immediately.
    """
    # 1. Create the record + upload the image
    prescription = await prescription_service.create_prescription(
        db, current_user.id, file, notes
    )

    # 2. Run AI extraction (synchronous within this request for simplicity)
    try:
        prescription = await prescription_service.process_prescription(
            db, prescription.id
        )
    except Exception:
        # Even if extraction fails, the upload itself succeeded —
        # return the prescription with status "failed".
        logger.warning(
            "AI processing failed for prescription %s — returning pending record",
            prescription.id,
        )

    # Fetch clean, fully loaded prescription record from DB with selectinload to avoid lazy-loading issues
    clean_prescription = await prescription_service.get_prescription(
        db, prescription.id, current_user.id
    )
    return PrescriptionResponse.model_validate(clean_prescription)


# ═══════════════════════════════════════════════════════════════════════════
# List
# ═══════════════════════════════════════════════════════════════════════════
@router.get(
    "",
    response_model=PrescriptionListResponse,
    summary="List prescriptions",
)
async def list_prescriptions(
    skip: int = Query(0, ge=0, description="Number of records to skip"),
    limit: int = Query(20, ge=1, le=100, description="Max records to return"),
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
) -> PrescriptionListResponse:
    """Return a paginated list of the current user's prescriptions."""
    items, total = await prescription_service.list_prescriptions(
        db, current_user.id, skip=skip, limit=limit
    )
    return PrescriptionListResponse(
        items=[PrescriptionResponse.model_validate(p) for p in items],
        total=total,
        skip=skip,
        limit=limit,
    )


# ═══════════════════════════════════════════════════════════════════════════
# Detail
# ═══════════════════════════════════════════════════════════════════════════
@router.get(
    "/{prescription_id}",
    response_model=PrescriptionResponse,
    summary="Get prescription details",
)
async def get_prescription(
    prescription_id: UUID,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
) -> PrescriptionResponse:
    """Fetch a single prescription by ID."""
    prescription = await prescription_service.get_prescription(
        db, prescription_id, current_user.id
    )
    return PrescriptionResponse.model_validate(prescription)


# ═══════════════════════════════════════════════════════════════════════════
# Reprocess
# ═══════════════════════════════════════════════════════════════════════════
@router.post(
    "/{prescription_id}/reprocess",
    response_model=PrescriptionResponse,
    summary="Re-run AI extraction",
)
async def reprocess_prescription(
    prescription_id: UUID,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
) -> PrescriptionResponse:
    """Re-trigger the AI extraction pipeline on an existing prescription."""
    # Verify ownership first
    await prescription_service.get_prescription(
        db, prescription_id, current_user.id
    )
    prescription = await prescription_service.process_prescription(
        db, prescription_id
    )
    clean_prescription = await prescription_service.get_prescription(
        db, prescription_id, current_user.id
    )
    return PrescriptionResponse.model_validate(clean_prescription)

# ═══════════════════════════════════════════════════════════════════════════
# Verify
# ═══════════════════════════════════════════════════════════════════════════
@router.post(
    "/{prescription_id}/verify",
    response_model=PrescriptionResponse,
    summary="Submit human-verified extracted data",
)
async def verify_prescription(
    prescription_id: UUID,
    verified_data: ExtractionResult,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
) -> PrescriptionResponse:
    """Submit the human-verified extraction result to finalize processing.
    
    This creates the medication tracking records and generates schedules/reminders.
    """
    prescription = await prescription_service.verify_prescription(
        db, prescription_id, current_user.id, verified_data
    )
    # Fetch fully loaded
    clean_prescription = await prescription_service.get_prescription(
        db, prescription_id, current_user.id
    )
    return PrescriptionResponse.model_validate(clean_prescription)



# ═══════════════════════════════════════════════════════════════════════════
# Delete
# ═══════════════════════════════════════════════════════════════════════════
@router.delete(
    "/{prescription_id}",
    status_code=204,
    response_class=Response,
    summary="Delete a prescription",
)
async def delete_prescription(
    prescription_id: UUID,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
) -> Response:
    """Delete a prescription and its associated image from storage."""
    await prescription_service.delete_prescription(
        db, prescription_id, current_user.id
    )
    return Response(status_code=204)
