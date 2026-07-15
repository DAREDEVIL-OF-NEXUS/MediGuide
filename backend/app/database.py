"""
Async database engine, session factory, and dependency injection helper.

Uses SQLAlchemy 2.0 async APIs backed by ``asyncpg``.
"""

from __future__ import annotations

from typing import AsyncGenerator

import socket
import urllib.parse
from sqlalchemy.ext.asyncio import (
    AsyncSession,
    async_sessionmaker,
    create_async_engine,
    AsyncEngine,
)
from sqlalchemy.orm import DeclarativeBase
from app.config import settings
import logging

logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Fallback logic
# ---------------------------------------------------------------------------
def _is_port_open(host: str, port: int, timeout: float = 1.0) -> bool:
    try:
        with socket.create_connection((host, port), timeout=timeout):
            return True
    except OSError:
        return False

def _get_engine() -> AsyncEngine:
    db_url = settings.database_url
    
    if settings.use_sqlite_fallback and db_url.startswith("postgresql"):
        parsed = urllib.parse.urlparse(db_url)
        host = parsed.hostname or "localhost"
        port = parsed.port or 5432
        
        if not _is_port_open(host, port):
            logger.warning("PostgreSQL unreachable at %s:%s. Falling back to SQLite.", host, port)
            db_url = "sqlite+aiosqlite:///./mediguide_fallback.db"

    connect_args = {}
    if db_url.startswith("postgresql"):
        connect_args.update({
            "pool_size": 20,
            "max_overflow": 10,
            "pool_pre_ping": True,
        })
    elif db_url.startswith("sqlite"):
        # SQLite needs this to allow multiple async access
        connect_args.update({"check_same_thread": False})

    return create_async_engine(
        db_url,
        echo=settings.debug,
        future=True,
        **connect_args
    )

engine = _get_engine()

# ---------------------------------------------------------------------------
# Session factory
# ---------------------------------------------------------------------------
async_session_factory = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,
)


# ---------------------------------------------------------------------------
# Declarative base — all models inherit from this
# ---------------------------------------------------------------------------
class Base(DeclarativeBase):
    """Shared declarative base for all ORM models."""

    pass


# ---------------------------------------------------------------------------
# FastAPI dependency
# ---------------------------------------------------------------------------
async def get_db() -> AsyncGenerator[AsyncSession, None]:
    """Yield an async database session, ensuring cleanup on exit.

    Usage::

        @router.get("/")
        async def handler(db: AsyncSession = Depends(get_db)):
            ...
    """
    async with async_session_factory() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()
