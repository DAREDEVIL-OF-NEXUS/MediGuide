"""
Medicines Router.

Endpoints for viewing the shared Medicine Knowledge Base / Drug Database.
"""

from __future__ import annotations

import logging
from typing import List

from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.dependencies import get_current_active_user
from app.database import get_db
from app.models.medicine import Medicine
from app.models.user import User

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/medicines", tags=["Medicine Library"])

@router.get("", summary="List all medicines in the Knowledge Base")
async def list_medicines(
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
) -> List[dict]:
    """Retrieve the shared Drug Database built by AI extraction."""
    stmt = select(Medicine).order_by(Medicine.name.asc()).offset(skip).limit(limit)
    result = await db.execute(stmt)
    medicines = result.scalars().all()
    
    return [
        {
            "id": str(m.id),
            "name": m.name,
            "generic_name": m.generic_name,
            "category": m.category,
            "description": m.description,
            "side_effects": m.side_effects,
            "interactions": m.interactions,
            "contraindications": m.contraindications,
            "usage_instructions": m.usage_instructions,
        }
        for m in medicines
    ]
