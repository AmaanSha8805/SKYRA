import pytest
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine, async_sessionmaker
from app.db.base import Base
from app.main import app
from app.core.config import settings
from app.models import user, resume, activity, analysis, application, career, company, interview, notification, profile, skill  # Import all models

# Use SQLite for testing
TEST_DATABASE_URL = "sqlite+aiosqlite:///:memory:"


@pytest.fixture(scope="function")
async def async_engine():
    engine = create_async_engine(TEST_DATABASE_URL, echo=False)
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield engine
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
    await engine.dispose()


@pytest.fixture(scope="function")
async def async_session(async_engine):
    async_session_maker = async_sessionmaker(
        async_engine, class_=AsyncSession, expire_on_commit=False
    )
    async with async_session_maker() as session:
        yield session


@pytest.fixture(scope="function")
async def async_client(async_session):
    from app.api.dependencies import get_db
    from app.db.session import async_session_maker as original_session_maker
    
    # Override the dependency
    async def override_get_db():
        yield async_session
    
    app.dependency_overrides[get_db] = override_get_db
    
    from httpx import ASGITransport
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        yield client
    
    app.dependency_overrides.clear()
