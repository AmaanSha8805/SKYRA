import aiosqlite
import asyncio

async def check():
    conn = await aiosqlite.connect('skyra_dev.db')
    cursor = await conn.execute('SELECT name FROM sqlite_master WHERE type="table"')
    tables = await cursor.fetchall()
    print('Tables:', tables)
    await conn.close()

asyncio.run(check())
