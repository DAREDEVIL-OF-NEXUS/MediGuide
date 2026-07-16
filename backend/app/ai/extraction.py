"""
Gemini-based prescription extraction.

Uses Google's ``google-genai`` SDK to send a pre-processed prescription
image to Gemini Vision and parse the structured JSON response.
"""

from __future__ import annotations

import asyncio
import json
import logging
import time
from typing import Any, Dict

from google import genai
from google.genai import types

from app.ai.preprocessing import preprocess_image
from app.ai.prompts import PRESCRIPTION_EXTRACTION_PROMPT
from app.config import settings
from app.core.exceptions import AIExtractionError
from app.ai.ollama_client import ollama_client

logger = logging.getLogger(__name__)


class GeminiExtractor:
    """Extract structured prescription data via Gemini Vision."""

    MODEL_NAME: str = "gemini-2.5-flash"

    def __init__(self) -> None:
        self._client = genai.Client(api_key=settings.gemini_api_key)

    # ------------------------------------------------------------------
    # Public API
    # ------------------------------------------------------------------

    async def extract_prescription(
        self, image_bytes: bytes
    ) -> Dict[str, Any]:
        """Run the full extraction pipeline on raw image bytes.

        1. Pre-process the image (grayscale, denoise, etc.).
        2. Send the processed image + prompt to Gemini.
        3. Parse the JSON response.

        Args:
            image_bytes: Raw prescription image data.

        Returns:
            A dict matching the schema defined in
            ``prompts.PRESCRIPTION_EXTRACTION_PROMPT``.

        Raises:
            AIExtractionError: On API failure or unparseable response.
        """
        start = time.perf_counter()

        # 1. Pre-process — skip threshold to preserve colour detail
        processed = preprocess_image(image_bytes, skip_threshold=True)

        # 2. Call Gemini (with retries on JSON parsing or API failure)
        max_retries = 3
        last_exception = None

        for attempt in range(1, max_retries + 1):
            try:
                logger.info("Attempting Gemini extraction (attempt %d/%d)...", attempt, max_retries)
                if settings.use_offline_ai:
                    logger.info("Using offline AI (LLaVA) for extraction.")
                    # LLaVA typically doesn't support JSON schema enforcement natively via the same API,
                    # but we can instruct it in the prompt and parse its output.
                    raw_text = await ollama_client.analyze_image(
                        model="llava",
                        prompt=PRESCRIPTION_EXTRACTION_PROMPT,
                        image_bytes=processed
                    )
                else:
                    response = self._client.models.generate_content(
                        model=self.MODEL_NAME,
                        contents=[
                            types.Content(
                                role="user",
                                parts=[
                                    types.Part.from_bytes(
                                        data=processed,
                                        mime_type="image/jpeg",
                                    ),
                                    types.Part.from_text(
                                        text=PRESCRIPTION_EXTRACTION_PROMPT
                                    ),
                                ],
                            )
                        ],
                        config=types.GenerateContentConfig(
                            temperature=0.1,
                            max_output_tokens=4096,
                            response_mime_type="application/json",
                        ),
                    )
                    raw_text = response.text or ""
                parsed = self._parse_response(raw_text)
                
                elapsed_ms = (time.perf_counter() - start) * 1000
                logger.info(
                    "Gemini extraction completed successfully on attempt %d in %.1f ms — %d medicines found",
                    attempt,
                    elapsed_ms,
                    len(parsed.get("medicines", [])),
                )
                return parsed

            except Exception as exc:
                logger.warning("Attempt %d failed: %s", attempt, exc)
                last_exception = exc
                if attempt < max_retries:
                    # Non-blocking sleep for exponential backoff
                    await asyncio.sleep(2 * attempt)

        # If all retries fail
        logger.error("All %d extraction attempts failed. Last error: %s", max_retries, last_exception)
        raise AIExtractionError(
            message="Failed to parse AI extraction response after multiple retries",
            detail=str(last_exception),
        ) from last_exception

    # ------------------------------------------------------------------
    # Helpers
    # ------------------------------------------------------------------

    @staticmethod
    def _parse_response(raw_text: str) -> Dict[str, Any]:
        """Parse the Gemini text response into a Python dict.

        Handles markdown-fenced JSON blocks (```json ... ```) that the
        model occasionally wraps its output in.

        Raises:
            AIExtractionError: If the text isn't valid JSON.
        """
        text = raw_text.strip()

        # Strip optional markdown code fences
        if text.startswith("```"):
            lines = text.split("\n")
            # Remove first and last fence lines
            lines = [
                line
                for line in lines
                if not line.strip().startswith("```")
            ]
            text = "\n".join(lines).strip()

        try:
            data = json.loads(text)
        except json.JSONDecodeError as exc:
            logger.error(
                "Failed to parse Gemini JSON response: %s\nRaw: %s",
                exc,
                raw_text[:500],
            )
            raise AIExtractionError(
                message="Failed to parse AI extraction response",
                detail=f"JSON decode error: {exc}",
            ) from exc

        if not isinstance(data, dict):
            raise AIExtractionError(
                message="AI response is not a JSON object",
                detail=f"Got {type(data).__name__}",
            )

        return data
