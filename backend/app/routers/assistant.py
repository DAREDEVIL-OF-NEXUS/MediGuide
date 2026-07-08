"""
AI Assistant Router.

Endpoints for interacting with the AI medication assistant.
"""

from __future__ import annotations

import logging
from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.dependencies import get_current_active_user
from app.database import get_db
from app.models.user import User
from app.schemas.assistant import ChatRequest, ChatResponse
from app.services.assistant_service import AssistantService

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/assistant", tags=["AI Assistant"])
assistant_service = AssistantService()


@router.post(
    "/chat",
    response_model=ChatResponse,
    status_code=status.HTTP_200_OK,
    summary="Chat with the AI assistant",
)
async def chat_with_assistant(
    data: ChatRequest,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
) -> ChatResponse:
    """Send a message to the AI Assistant and get a contextual reply based on the user's active medications."""
    reply = await assistant_service.get_reply(
        db=db,
        user_id=current_user.id,
        message=data.message,
        conversation_history=data.conversation_history,
    )
    return ChatResponse(reply=reply)
