"""
AI Assistant Pydantic Schemas.
"""

from __future__ import annotations

from typing import List, Optional
from pydantic import BaseModel, Field


class ChatMessage(BaseModel):
    """A message in the chat conversation history."""
    role: str = Field(..., description="Role of the sender, e.g., 'user' or 'assistant'")
    content: str = Field(..., description="Content of the message")


class ChatRequest(BaseModel):
    """Request payload for sending a chat message to the assistant."""
    message: str = Field(..., description="The user's input message")
    conversation_history: Optional[List[ChatMessage]] = Field(default_factory=list, description="Previous messages in the chat session")


class ChatResponse(BaseModel):
    """Response payload containing the assistant's reply."""
    reply: str = Field(..., description="The assistant's text reply")
