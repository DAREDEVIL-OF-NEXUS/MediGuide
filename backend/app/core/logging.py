"""
Structured logging configuration and request-logging middleware.

Call ``setup_logging()`` once at application startup to configure the
root logger.  Attach ``RequestLoggingMiddleware`` to the FastAPI app
to automatically log every incoming request with timing information.
"""

from __future__ import annotations

import logging
import sys
import time
from typing import Callable

from fastapi import FastAPI, Request, Response
from starlette.middleware.base import BaseHTTPMiddleware

from app.config import settings

# ---------------------------------------------------------------------------
# Logging setup
# ---------------------------------------------------------------------------
LOG_FORMAT = (
    "%(asctime)s | %(levelname)-8s | %(name)s:%(lineno)d | %(message)s"
)
DATE_FORMAT = "%Y-%m-%d %H:%M:%S"


def setup_logging() -> None:
    """Configure the root logger with a structured formatter.

    In debug mode, the level is ``DEBUG``; otherwise ``INFO``.
    """
    level = logging.DEBUG if settings.debug else logging.INFO
    handler = logging.StreamHandler(sys.stdout)
    handler.setFormatter(logging.Formatter(LOG_FORMAT, datefmt=DATE_FORMAT))

    root = logging.getLogger()
    root.setLevel(level)
    # Avoid duplicate handlers when ``setup_logging`` is called more than once
    # (e.g. during tests).
    if not root.handlers:
        root.addHandler(handler)

    # Quieten noisy third-party loggers
    logging.getLogger("uvicorn.access").setLevel(logging.WARNING)
    logging.getLogger("sqlalchemy.engine").setLevel(
        logging.INFO if settings.debug else logging.WARNING
    )


# ---------------------------------------------------------------------------
# Request-logging middleware
# ---------------------------------------------------------------------------
class RequestLoggingMiddleware(BaseHTTPMiddleware):
    """Log method, path, status code, and latency for every HTTP request."""

    async def dispatch(
        self, request: Request, call_next: Callable
    ) -> Response:
        start = time.perf_counter()
        response: Response = await call_next(request)
        elapsed_ms = (time.perf_counter() - start) * 1000

        logger = logging.getLogger("mediguide.request")
        logger.info(
            "%s %s → %d (%.1f ms)",
            request.method,
            request.url.path,
            response.status_code,
            elapsed_ms,
        )
        return response


def register_middleware(app: FastAPI) -> None:
    """Attach the request-logging middleware to the FastAPI app."""
    app.add_middleware(RequestLoggingMiddleware)
