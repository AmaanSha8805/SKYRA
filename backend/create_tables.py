import asyncio
from app.db.base import Base
from app.db.session import engine

async def main():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    print("All tables created!")

asyncio.run(main())
