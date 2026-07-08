"""
Medical History Router.

Endpoints for managing patient medical profiles, allergies, and chronic conditions.
"""

from __future__ import annotations

import logging
from typing import List
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Response, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.dependencies import get_current_active_user
from app.database import get_db
from app.models.medical_history import MedicalHistory
from app.models.user import User
from app.schemas.medical_history import MedicalHistoryCreate, MedicalHistoryResponse

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/medical-history", tags=["Medical History"])


@router.get(
    "",
    response_model=List[MedicalHistoryResponse],
    summary="List patient medical history records",
)
async def list_medical_history(
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
) -> List[MedicalHistoryResponse]:
    """Retrieve all logged medical conditions, chronic illnesses, and allergies for the user."""
    stmt = (
        select(MedicalHistory)
        .where(MedicalHistory.user_id == current_user.id)
        .order_by(MedicalHistory.diagnosed_date.desc(), MedicalHistory.created_at.desc())
    )
    result = await db.execute(stmt)
    records = result.scalars().all()
    return [MedicalHistoryResponse.model_validate(r) for r in records]


@router.post(
    "",
    response_model=MedicalHistoryResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Add a medical history record",
)
async def add_medical_history(
    data: MedicalHistoryCreate,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
) -> MedicalHistoryResponse:
    """Log a new medical condition, chronic illness, or allergy to the patient's profile."""
    record = MedicalHistory(
        user_id=current_user.id,
        condition=data.condition.strip(),
        diagnosed_date=data.diagnosed_date,
        severity=data.severity,
        treatment_notes=data.treatment_notes,
        is_active=data.is_active,
    )
    db.add(record)
    await db.flush()
    await db.refresh(record)
    logger.info("Added medical history record '%s' for user %s", data.condition, current_user.id)
    return MedicalHistoryResponse.model_validate(record)


@router.delete(
    "/{record_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    response_class=Response,
    summary="Delete a medical history record",
)
async def delete_medical_history(
    record_id: UUID,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
) -> Response:
    """Delete a medical history record belonging to the logged-in user."""
    stmt = select(MedicalHistory).where(
        MedicalHistory.id == record_id, MedicalHistory.user_id == current_user.id
    )
    result = await db.execute(stmt)
    record = result.scalar_one_or_none()

    if not record:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Medical history record not found.",
        )

    await db.delete(record)
    await db.flush()
    logger.info("Deleted medical history record %s for user %s", record_id, current_user.id)
    return Response(status_code=204)
