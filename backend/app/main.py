"""
MediGuide-AI — FastAPI application entry point.

Creates the app, wires up middleware, exception handlers, rate limiting,
and all routers under ``/api/v1``.
"""

from __future__ import annotations

import logging
import os
from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from slowapi.util import get_remote_address

from app.config import settings
from app.core.exceptions import register_exception_handlers
from app.core.logging import register_middleware, setup_logging
from app.routers import (
    analytics,
    assistant,
    auth,
    medical_history,
    medications,
    medicines,
    prescriptions,
    reminders,
    schedules,
    meditriage,
    settings as settings_router,
)
from app.scheduler import start_scheduler

# ---------------------------------------------------------------------------
# Logging (must be first so other modules' loggers pick up the config)
# ---------------------------------------------------------------------------
setup_logging()
logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Rate limiter
# ---------------------------------------------------------------------------
limiter = Limiter(key_func=get_remote_address, default_limits=["60/minute"])

# ---------------------------------------------------------------------------
# Application factory
# ---------------------------------------------------------------------------
@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    if settings.use_local_alarm or settings.use_email_reminders:
        start_scheduler()
    logger.info("%s v%s starting up…", settings.app_name, settings.app_version)
    yield
    # Shutdown
    logger.info("%s shutting down…", settings.app_name)

app = FastAPI(
    title=settings.app_name,
    description=(
        "AI-powered medication adherence platform — upload prescriptions, "
        "extract medicines via Gemini Vision, and track your dosing schedule."
    ),
    version=settings.app_version,
    docs_url="/api/v1/docs",
    redoc_url="/api/v1/redoc",
    openapi_url="/api/v1/openapi.json",
    lifespan=lifespan,
)

# -- State needed by slowapi -----------------------------------------------
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)  # type: ignore[arg-type]

# -- CORS -------------------------------------------------------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# -- Request logging --------------------------------------------------------
register_middleware(app)

# -- Exception handlers -----------------------------------------------------
register_exception_handlers(app)

# -- Routers ----------------------------------------------------------------
API_PREFIX = "/api/v1"
app.include_router(auth.router, prefix=API_PREFIX)
app.include_router(prescriptions.router, prefix=API_PREFIX)
app.include_router(medications.router, prefix=API_PREFIX)
app.include_router(medical_history.router, prefix=API_PREFIX)
app.include_router(reminders.router, prefix=API_PREFIX)
app.include_router(assistant.router)
app.include_router(medicines.router)
app.include_router(analytics.router)
app.include_router(meditriage.router, prefix=API_PREFIX)
app.include_router(settings_router.router, prefix=API_PREFIX)

# Mount local uploads static directory
os.makedirs("app/static/uploads", exist_ok=True)

app.mount("/static", StaticFiles(directory="app/static"), name="static")

from fastapi.responses import RedirectResponse

@app.get("/", include_in_schema=False)
async def root():
    return RedirectResponse(url="/api/v1/docs")

# ---------------------------------------------------------------------------
# Health check
# ---------------------------------------------------------------------------
@app.get(
    "/api/v1/health",
    tags=["System"],
    summary="Health check",
)
async def health_check() -> dict:
    """Return a simple health-check payload confirming the service is live."""
    return {
        "status": "healthy",
        "service": settings.app_name,
        "version": settings.app_version,
    }


# ---------------------------------------------------------------------------
# Startup / shutdown hooks
# ---------------------------------------------------------------------------
@app.on_event("startup")
async def on_startup() -> None:
    logger.info(
        "%s v%s starting up…",
        settings.app_name,
        settings.app_version,
    )


@app.on_event("shutdown")
async def on_shutdown() -> None:
    logger.info("%s shutting down…", settings.app_name)
