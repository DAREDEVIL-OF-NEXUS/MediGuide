"""
Custom exception classes and FastAPI exception handlers.

Centralising exceptions ensures consistent JSON error responses across
every endpoint.
"""

from __future__ import annotations

import logging
from typing import Any, Optional

from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse

logger = logging.getLogger(__name__)


# ═══════════════════════════════════════════════════════════════════════════
# Base exception
# ═══════════════════════════════════════════════════════════════════════════
class MediGuideException(Exception):
    """Base exception for all MediGuide-AI domain errors."""

    def __init__(
        self,
        message: str = "An unexpected error occurred",
        status_code: int = 500,
        detail: Optional[Any] = None,
    ) -> None:
        self.message = message
        self.status_code = status_code
        self.detail = detail
        super().__init__(message)


# ═══════════════════════════════════════════════════════════════════════════
# Concrete exception types
# ═══════════════════════════════════════════════════════════════════════════
class AuthenticationError(MediGuideException):
    """Raised when authentication / authorisation fails."""

    def __init__(
        self,
        message: str = "Authentication failed",
        detail: Optional[Any] = None,
    ) -> None:
        super().__init__(message=message, status_code=401, detail=detail)


class NotFoundError(MediGuideException):
    """Raised when a requested resource does not exist."""

    def __init__(
        self,
        message: str = "Resource not found",
        detail: Optional[Any] = None,
    ) -> None:
        super().__init__(message=message, status_code=404, detail=detail)


class ValidationError(MediGuideException):
    """Raised when input data fails business-logic validation."""

    def __init__(
        self,
        message: str = "Validation error",
        detail: Optional[Any] = None,
    ) -> None:
        super().__init__(message=message, status_code=422, detail=detail)


class AIExtractionError(MediGuideException):
    """Raised when the AI prescription-extraction pipeline fails."""

    def __init__(
        self,
        message: str = "AI extraction failed",
        detail: Optional[Any] = None,
    ) -> None:
        super().__init__(message=message, status_code=502, detail=detail)


# ═══════════════════════════════════════════════════════════════════════════
# FastAPI exception handlers
# ═══════════════════════════════════════════════════════════════════════════
def _mediguide_exception_handler(
    _request: Request, exc: MediGuideException
) -> JSONResponse:
    """Convert any ``MediGuideException`` into a uniform JSON response."""
    logger.error(
        "%s (status=%d): %s",
        type(exc).__name__,
        exc.status_code,
        exc.message,
    )
    body: dict[str, Any] = {"error": exc.message}
    if exc.detail is not None:
        body["detail"] = exc.detail
    return JSONResponse(status_code=exc.status_code, content=body)


async def _unhandled_exception_handler(
    _request: Request, exc: Exception
) -> JSONResponse:
    """Catch-all for truly unexpected errors — never leak stack traces."""
    logger.exception("Unhandled exception: %s", exc)
    return JSONResponse(
        status_code=500,
        content={"error": "Internal server error"},
    )


def register_exception_handlers(app: FastAPI) -> None:
    """Attach all custom exception handlers to the FastAPI application."""
    app.add_exception_handler(MediGuideException, _mediguide_exception_handler)  # type: ignore[arg-type]
    app.add_exception_handler(Exception, _unhandled_exception_handler)  # type: ignore[arg-type]
