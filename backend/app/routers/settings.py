from fastapi import APIRouter, Depends
from pydantic import BaseModel
from app.config import settings

router = APIRouter(prefix="/settings", tags=["Settings"])

class SettingsUpdate(BaseModel):
    use_offline_ai: bool

@router.get("")
async def get_settings():
    return {"use_offline_ai": settings.use_offline_ai}

@router.put("")
async def update_settings(data: SettingsUpdate):
    settings.use_offline_ai = data.use_offline_ai
    return {"use_offline_ai": settings.use_offline_ai, "status": "updated"}
