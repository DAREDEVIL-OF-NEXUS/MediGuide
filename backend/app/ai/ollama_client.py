import httpx
import base64
import logging
from typing import List, Optional

logger = logging.getLogger(__name__)

class OllamaClient:
    def __init__(self, base_url: str = "http://localhost:11434"):
        self.base_url = base_url

    async def generate_text(self, model: str, prompt: str, system: Optional[str] = None) -> str:
        """Generate text using a language model (e.g., llama3.3)."""
        payload = {
            "model": model,
            "prompt": prompt,
            "stream": False,
        }
        if system:
            payload["system"] = system

        async with httpx.AsyncClient() as client:
            try:
                response = await client.post(f"{self.base_url}/api/generate", json=payload, timeout=60.0)
                response.raise_for_status()
                return response.json().get("response", "")
            except Exception as e:
                logger.error(f"Ollama text generation failed: {e}")
                raise e

    async def analyze_image(self, model: str, prompt: str, image_bytes: bytes) -> str:
        """Analyze an image using a vision model (e.g., llava)."""
        image_b64 = base64.b64encode(image_bytes).decode('utf-8')
        payload = {
            "model": model,
            "prompt": prompt,
            "images": [image_b64],
            "stream": False,
        }

        async with httpx.AsyncClient() as client:
            try:
                response = await client.post(f"{self.base_url}/api/generate", json=payload, timeout=120.0)
                response.raise_for_status()
                return response.json().get("response", "")
            except Exception as e:
                logger.error(f"Ollama image analysis failed: {e}")
                raise e

ollama_client = OllamaClient()
