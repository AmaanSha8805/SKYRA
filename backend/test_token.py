import asyncio
from app.core.security import decode_access_token
from app.db.session import async_session_maker
from sqlalchemy import select
from app.models.user import User

# Test decoding a token
token = "YOUR_TOKEN_HERE"  # Replace with actual token
payload = decode_access_token(token)
print(f"Payload: {payload}")

if payload:
    user_id = payload.get("sub")
    print(f"User ID from token: {user_id}")
    
    async def check_user():
        async with async_session_maker() as db:
            result = await db.execute(select(User).where(User.id == user_id))
            user = result.scalar_one_or_none()
            if user:
                print(f"User found: {user.email}, Active: {user.is_active}")
            else:
                print("User not found")
    
    asyncio.run(check_user())
