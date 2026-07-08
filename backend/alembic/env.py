"""
Alembic environment configuration — async version.

This file is executed by Alembic whenever migrations are run.  It
configures the SQLAlchemy engine from the application's settings
(not from ``alembic.ini``) and uses the async engine for online
migrations.
"""

from __future__ import annotations

import asyncio
import os
import sys
from logging.config import fileConfig

from alembic import context
from sqlalchemy import pool
from sqlalchemy.engine import Connection
from sqlalchemy.ext.asyncio import async_engine_from_config

# ---------------------------------------------------------------------------
# Ensure the project root is on sys.path so ``app`` can be imported.
# ---------------------------------------------------------------------------
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

# Import ALL models so Alembic detects them for autogenerate.
from app.models import Base  # noqa: E402
from app.config import settings  # noqa: E402

# ---------------------------------------------------------------------------
# Alembic Config object — provides access to the values within alembic.ini.
# ---------------------------------------------------------------------------
config = context.config

# Override the sqlalchemy.url from settings (env var / .env file).
config.set_main_option("sqlalchemy.url", settings.database_url)

# Interpret the config file for Python logging.
if config.config_file_name is not None:
    fileConfig(config.config_file_name)

# The metadata object used by autogenerate.
target_metadata = Base.metadata


# ---------------------------------------------------------------------------
# Offline migrations (emit SQL to stdout)
# ---------------------------------------------------------------------------
def run_migrations_offline() -> None:
    """Run migrations in 'offline' mode.

    This configures the context with just a URL and not an Engine,
    though an Engine is acceptable here as well.  By skipping the
    Engine creation we don't even need a DBAPI to be available.

    Calls to ``context.execute()`` here emit the given string to the
    script output.
    """
    url = config.get_main_option("sqlalchemy.url")
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )

    with context.begin_transaction():
        context.run_migrations()


# ---------------------------------------------------------------------------
# Online migrations (run against a live DB)
# ---------------------------------------------------------------------------
def do_run_migrations(connection: Connection) -> None:
    """Execute migrations within a connection context."""
    context.configure(connection=connection, target_metadata=target_metadata)
    with context.begin_transaction():
        context.run_migrations()


async def run_async_migrations() -> None:
    """Create an async engine, connect, and run migrations."""
    connectable = async_engine_from_config(
        config.get_section(config.config_ini_section, {}),
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )

    async with connectable.connect() as connection:
        await connection.run_sync(do_run_migrations)

    await connectable.dispose()


def run_migrations_online() -> None:
    """Run migrations in 'online' mode — async variant."""
    asyncio.run(run_async_migrations())


# ---------------------------------------------------------------------------
# Dispatch
# ---------------------------------------------------------------------------
if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
