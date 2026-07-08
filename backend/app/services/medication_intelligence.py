"""
Medication Intelligence Service.

Enriches extracted medicine names with clinical context (descriptions, generic
names, side effects, interactions) via Gemini, building a shared knowledge base.
"""

from __future__ import annotations

import json
import logging
from typing import Any, Dict, List, Optional

from google import genai
from google.genai import types
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import settings
from app.models.medicine import Medicine

logger = logging.getLogger(__name__)


class MedicationIntelligenceService:
    """Queries Gemini to enrich medicine details and persists them to the database."""

    MODEL_NAME: str = "gemini-2.5-flash"

    def __init__(self) -> None:
        self._client = genai.Client(api_key=settings.gemini_api_key)

    async def get_or_enrich_medicine(
        self, db: AsyncSession, name: str
    ) -> Medicine:
        """Fetch a medicine by name.

        If it exists in the database, return it immediately.
        Otherwise, query Gemini, create the record, and return it.
        """
        normalised_name = " ".join(name.split()).title()

        # 1. Check if the medicine already exists in the database
        stmt = select(Medicine).where(func.lower(Medicine.name) == normalised_name.lower())
        result = await db.execute(stmt)
        medicine = result.scalar_one_or_none()

        if medicine:
            logger.info("Shared medicine cache hit: %s", normalised_name)
            return medicine

        # 2. Enrich via Gemini if not in cache
        logger.info("Cache miss for %s. Querying Medication Intelligence...", normalised_name)
        try:
            details = await self._query_gemini_details(normalised_name)
        except Exception as exc:
            logger.error("Failed to query Gemini for medicine %s: %s", normalised_name, exc)
            # Safe fallback: create a basic record so the user is not blocked
            details = {
                "generic_name": None,
                "category": "General Medication",
                "description": f"No details available for {normalised_name}.",
                "side_effects": [],
                "interactions": [],
                "contraindications": [],
                "usage_instructions": None,
            }

        # 3. Create and save the new Medicine record
        medicine = Medicine(
            name=normalised_name,
            generic_name=details.get("generic_name"),
            category=details.get("category") or "General Medication",
            description=details.get("description"),
            side_effects=details.get("side_effects") or [],
            interactions=details.get("interactions") or [],
            contraindications=details.get("contraindications") or [],
            usage_instructions=details.get("usage_instructions"),
        )
        db.add(medicine)
        await db.flush()
        await db.refresh(medicine)

        logger.info("Persisted enriched medicine: %s", normalised_name)
        return medicine

    async def _query_gemini_details(self, medicine_name: str) -> Dict[str, Any]:
        """Send a structured pharmacologist prompt to Gemini for drug data."""
        prompt = f"""You are an expert clinical pharmacologist.
Provide details about the medicine: "{medicine_name}".
Provide details strictly matching this JSON schema:
{{
  "generic_name": "string or null (e.g. Ibuprofen)",
  "category": "string or null (e.g. NSAID / Pain Reliever)",
  "description": "string (Short plain-language explanation of what it is and what it treats. Avoid jargon.)",
  "side_effects": ["list of strings (common or important side effects to watch out for)"],
  "interactions": ["list of strings (notable drug-drug or food-drug interactions)"],
  "contraindications": ["list of strings (conditions or scenarios where it should be avoided)"],
  "usage_instructions": "string or null (general advice on how to take it safely)"
}}
Return ONLY the raw JSON object. Do not include markdown code block formatting (```json).
"""
        response = self._client.models.generate_content(
            model=self.MODEL_NAME,
            contents=[types.Part.from_text(text=prompt)],
            config=types.GenerateContentConfig(
                temperature=0.2,
                max_output_tokens=1024,
                response_mime_type="application/json",
            ),
        )

        raw_text = response.text or ""
        text = raw_text.strip()
        
        # Strip optional markdown code fences if Gemini returns them
        if text.startswith("```"):
            lines = text.split("\n")
            lines = [line for line in lines if not line.strip().startswith("```")]
            text = "\n".join(lines).strip()

        return json.loads(text)
