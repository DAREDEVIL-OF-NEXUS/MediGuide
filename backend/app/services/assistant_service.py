"""
AI Assistant Service.

Handles AI chat interactions with Gemini, injecting user medication context.
"""

from __future__ import annotations

import logging
from typing import List, Optional
from uuid import UUID

from google import genai
from google.genai import types
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.config import settings
from app.models.prescription import Prescription
from app.schemas.assistant import ChatMessage

logger = logging.getLogger(__name__)


class AssistantService:
    """Orchestrates AI assistant queries using Gemini and database context."""

    MODEL_NAME: str = "gemini-2.5-flash"

    def __init__(self) -> None:
        self._client = genai.Client(api_key=settings.gemini_api_key)

    async def get_reply(
        self,
        db: AsyncSession,
        user_id: UUID,
        message: str,
        conversation_history: Optional[List[ChatMessage]] = None,
    ) -> str:
        """Query Gemini with the conversation history and user's medication context."""
        # 1. Fetch user's processed prescriptions to build medication context
        med_context = await self._build_medication_context(db, user_id)

        # 2. Setup the system prompt
        system_prompt = f"""You are MediGuide AI Assistant, an empathetic and highly knowledgeable AI specialized in medication guidance.
Your primary role is to help users understand their medications, schedules, side effects, drug-drug/food-drug interactions, and usage instructions based on their uploaded prescriptions.

Here is the context of the user's active prescriptions and medications recorded in MediGuide AI:
{med_context}

Please use this context as the source of truth for their medications when they ask questions about them.

Guidelines:
1. Be helpful, empathetic, clear, and concise. Use markdown formatting (bolding, lists) to make information readable.
2. If they ask about a medication not listed in their profile, provide general clinical information but gently remind them it is not in their registered prescriptions.
3. If they ask questions outside of medication/health guidance, politely steer them back to medication assistance.
4. **CRITICAL**: Always include a disclaimer at the end of your response stating that you are an AI assistant, not a doctor, and this guidance is for informational purposes and does not constitute medical advice.
"""

        # 3. Construct contents list for Gemini
        contents = []
        if conversation_history:
            for msg in conversation_history:
                # Gemini expects "user" and "model" roles
                role = "user" if msg.role == "user" else "model"
                contents.append(
                    types.Content(
                        role=role,
                        parts=[types.Part.from_text(text=msg.content)],
                    )
                )

        # Append the new user message
        contents.append(
            types.Content(
                role="user",
                parts=[types.Part.from_text(text=message)],
            )
        )

        # 4. Generate content from Gemini
        try:
            response = self._client.models.generate_content(
                model=self.MODEL_NAME,
                contents=contents,
                config=types.GenerateContentConfig(
                    system_instruction=system_prompt,
                    temperature=0.7,
                    max_output_tokens=2048,
                ),
            )
            reply = response.text or "I apologize, but I was unable to generate a response. Please try again."
        except Exception as exc:
            logger.error("Failed to generate response from Gemini: %s", exc)
            reply = (
                "I apologize, but I am having trouble connecting to my brain right now. "
                "Please verify your medication settings and try again. "
                "\n\n*Disclaimer: MediGuide AI Assistant is for informational purposes only. Please consult a doctor for medical advice.*"
            )

        return reply

    async def _build_medication_context(self, db: AsyncSession, user_id: UUID) -> str:
        """Fetch prescriptions and their medications to construct a context string."""
        stmt = (
            select(Prescription)
            .options(
                selectinload(Prescription.prescription_medicines).selectinload(
                    # Although selectin is set on models, selectinload ensures eager loading here
                    # without rely on model defaults.
                    # We can use options/selectinload for prescription_medicines
                )
            )
            .where(
                Prescription.user_id == user_id,
                Prescription.status == "processed",
            )
            .order_by(Prescription.created_at.desc())
        )
        res = await db.execute(stmt)
        prescriptions = res.scalars().all()

        if not prescriptions:
            return "The user has no recorded prescriptions or active medications in MediGuide AI."

        context_parts = []
        for p in prescriptions:
            p_date = p.prescription_date or p.created_at.date()
            context_parts.append(f"Prescription (Processed on {p_date}):")
            for pm in p.prescription_medicines:
                med_info = f"- Medication: {pm.medicine_name}"
                if pm.dosage:
                    med_info += f", Dosage: {pm.dosage}"
                if pm.frequency:
                    med_info += f", Frequency: {pm.frequency}"
                if pm.timing:
                    med_info += f", Timing: {pm.timing}"
                if pm.duration_days:
                    med_info += f", Duration: {pm.duration_days} days"
                if pm.special_instructions:
                    med_info += f", Special Instructions: {pm.special_instructions}"

                # Add safety data if available on the cached medicine entry
                if pm.medicine:
                    med = pm.medicine
                    safety = []
                    if med.generic_name:
                        safety.append(f"Generic: {med.generic_name}")
                    if med.description:
                        safety.append(f"Description: {med.description}")
                    if med.side_effects:
                        safety.append(f"Side Effects: {', '.join(med.side_effects)}")
                    if med.interactions:
                        safety.append(f"Interactions: {', '.join(med.interactions)}")
                    if med.contraindications:
                        safety.append(f"Contraindications: {', '.join(med.contraindications)}")
                    if safety:
                        med_info += f" [Knowledge Base Details: {'; '.join(safety)}]"

                context_parts.append(med_info)

        return "\n".join(context_parts)
