import asyncio
from app.database import engine, Base
from app.models import user, doctor, medicine, prescription, schedule, ai_extraction_log

async def reset():
    print("Dropping all tables...")
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
    print("Creating all tables...")
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    print("Database reset complete.")
    await engine.dispose()

if __name__ == "__main__":
    asyncio.run(reset())
