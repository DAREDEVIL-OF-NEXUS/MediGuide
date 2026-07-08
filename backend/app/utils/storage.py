"""
Supabase Storage service for prescription images with local development fallback.

Handles upload, download, and deletion of files in the configured
Supabase bucket, with automatic fallback to local disk storage if
Supabase is not configured.
"""

from __future__ import annotations

import logging
import uuid
import os
from datetime import datetime
from pathlib import Path
from typing import Optional

import httpx
from fastapi import UploadFile

from app.config import settings

logger = logging.getLogger(__name__)


class StorageService:
    """Storage service supporting Supabase Storage REST API with local filesystem fallback.

    If settings.supabase_url is a placeholder or not provided, saves files to
    app/static/uploads/ and serves them via localhost:8000/static/uploads/.
    """

    def __init__(self) -> None:
        self._supabase_configured = (
            settings.supabase_url
            and "placeholder" not in settings.supabase_url.lower()
            and "your-supabase" not in settings.supabase_url.lower()
        )
        
        self._local_dir = Path("app/static/uploads")
        if self._supabase_configured:
            self._base_url = f"{settings.supabase_url}/storage/v1"
            self._bucket = settings.supabase_bucket
            self._headers = {
                "apikey": settings.supabase_key,
                "Authorization": f"Bearer {settings.supabase_key}",
            }
            logger.info("Supabase Storage configured successfully.")
        else:
            self._local_dir.mkdir(parents=True, exist_ok=True)
            logger.info("Supabase URL is placeholder or missing. Falling back to local storage in: %s", self._local_dir.absolute())

    # ------------------------------------------------------------------
    # Upload
    # ------------------------------------------------------------------

    async def upload_prescription_image(
        self, file: UploadFile, user_id: uuid.UUID
    ) -> str:
        """Upload a prescription image and return its URL.

        If Supabase is configured, uploads to Supabase.
        Otherwise, saves to app/static/uploads/ and returns a local URL.
        """
        ext = self._get_extension(file.filename)
        timestamp = datetime.utcnow().strftime("%Y%m%d%H%M%S")
        rand_id = uuid.uuid4().hex[:8]
        unique_name = f"{timestamp}_{rand_id}{ext}"
        
        # ── Local Fallback Mode ──────────────────────────────────────────
        if not self._supabase_configured:
            target_path = self._local_dir / f"{user_id}_{unique_name}"
            content = await file.read()
            # Ensure directories exist
            self._local_dir.mkdir(parents=True, exist_ok=True)
            with open(target_path, "wb") as f:
                f.write(content)
            
            public_url = f"http://localhost:8000/static/uploads/{user_id}_{unique_name}"
            logger.info("Saved local image → %s (%d bytes)", public_url, len(content))
            return public_url

        # ── Supabase Mode ────────────────────────────────────────────────
        file_path = f"{self._bucket}/{user_id}/{unique_name}"
        content = await file.read()

        async with httpx.AsyncClient() as client:
            resp = await client.post(
                f"{self._base_url}/object/{file_path}",
                headers={
                    **self._headers,
                    "Content-Type": file.content_type or "application/octet-stream",
                },
                content=content,
            )

        if resp.status_code not in (200, 201):
            logger.error("Supabase upload failed (%d): %s", resp.status_code, resp.text)
            raise RuntimeError(f"Image upload failed: {resp.text}")

        public_url = (
            f"{settings.supabase_url}/storage/v1/object/public/{file_path}"
        )
        logger.info("Uploaded image to Supabase → %s (%d bytes)", public_url, len(content))
        return public_url

    # ------------------------------------------------------------------
    # Download (used by the AI pipeline)
    # ------------------------------------------------------------------

    async def download_image(self, url: str) -> bytes:
        """Download an image by its URL.

        If local, reads from disk. Otherwise downloads via HTTP request.
        """
        # ── Local Fallback Mode ──────────────────────────────────────────
        if not self._supabase_configured or "localhost:8000/static/uploads" in url:
            filename = url.split("/")[-1]
            local_path = self._local_dir / filename
            if not local_path.exists():
                # Try relative from current dir
                local_path = Path("app/static/uploads") / filename
            
            if not local_path.exists():
                logger.error("Local image file not found: %s", local_path.absolute())
                raise RuntimeError(f"Local image file not found: {filename}")
                
            with open(local_path, "rb") as f:
                return f.read()

        # ── Supabase Mode ────────────────────────────────────────────────
        async with httpx.AsyncClient() as client:
            resp = await client.get(url)

        if resp.status_code != 200:
            logger.error("Image download failed (%d): %s", resp.status_code, url)
            raise RuntimeError(f"Image download failed: HTTP {resp.status_code}")

        return resp.content

    # ------------------------------------------------------------------
    # Delete
    # ------------------------------------------------------------------

    async def delete_image(self, url: str) -> None:
        """Delete an image from storage by its URL."""
        # ── Local Fallback Mode ──────────────────────────────────────────
        if not self._supabase_configured or "localhost:8000/static/uploads" in url:
            filename = url.split("/")[-1]
            local_path = self._local_dir / filename
            if not local_path.exists():
                local_path = Path("app/static/uploads") / filename
                
            if local_path.exists():
                try:
                    local_path.unlink()
                    logger.info("Deleted local storage object: %s", filename)
                except Exception as e:
                    logger.warning("Failed to delete local file: %s. Error: %s", local_path, e)
            return

        # ── Supabase Mode ────────────────────────────────────────────────
        # Extract the path after "/object/public/"
        marker = "/object/public/"
        idx = url.find(marker)
        if idx == -1:
            logger.warning("Cannot parse storage path from URL: %s", url)
            return

        # The path includes the bucket name; strip it for the delete call.
        full_path = url[idx + len(marker) :]
        parts = full_path.split("/", 1)
        if len(parts) < 2:
            logger.warning("Unexpected storage path format: %s", full_path)
            return
        object_path = parts[1]

        async with httpx.AsyncClient() as client:
            resp = await client.delete(
                f"{self._base_url}/object/{self._bucket}/{object_path}",
                headers=self._headers,
            )

        if resp.status_code not in (200, 204):
            logger.warning(
                "Supabase delete returned %d for %s", resp.status_code, object_path
            )
        else:
            logger.info("Deleted Supabase storage object: %s", object_path)

    # ------------------------------------------------------------------
    # Helpers
    # ------------------------------------------------------------------

    @staticmethod
    def _get_extension(filename: Optional[str]) -> str:
        """Extract the file extension including the leading dot."""
        if filename and "." in filename:
            return "." + filename.rsplit(".", 1)[-1].lower()
        return ".jpg"
