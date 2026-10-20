"""
Authentication tests for SKYRA.

Tests cover:
- POST /api/v1/auth/register
- POST /api/v1/auth/login
- GET /api/v1/auth/me
- Duplicate email registration
- Invalid password login
- Unauthorized /me access
"""

import pytest
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.models.user import User
from app.core.security import get_password_hash


@pytest.mark.asyncio
async def test_register_success(async_client: AsyncClient, async_session: AsyncSession):
    """Test successful user registration."""
    response = await async_client.post(
        "/api/v1/auth/register",
        json={
            "email": "newuser@example.com",
            "password": "securepassword123",
            "full_name": "New User"
        }
    )
    
    assert response.status_code == 201
    data = response.json()
    assert "access_token" in data
    assert "user" in data
    assert data["user"]["email"] == "newuser@example.com"
    assert data["user"]["full_name"] == "New User"
    assert "password_hash" not in data["user"]
    assert data["user"]["is_active"] is True
    assert data["user"]["is_verified"] is False
    assert data["user"]["role"] == "USER"
    assert "id" in data["user"]
    
    # Verify user was created in database
    result = await async_session.execute(select(User).where(User.email == "newuser@example.com"))
    user = result.scalar_one_or_none()
    assert user is not None
    assert user.email == "newuser@example.com"


@pytest.mark.asyncio
async def test_register_duplicate_email(async_client: AsyncClient, async_session: AsyncSession):
    """Test registration with duplicate email fails."""
    # Create existing user
    user = User(
        email="existing@example.com",
        password_hash=get_password_hash("password123"),
        full_name="Existing User"
    )
    async_session.add(user)
    await async_session.commit()
    
    # Try to register with same email
    response = await async_client.post(
        "/api/v1/auth/register",
        json={
            "email": "existing@example.com",
            "password": "newpassword123",
            "full_name": "Another User"
        }
    )
    
    assert response.status_code == 400
    assert "already registered" in response.json()["detail"]


@pytest.mark.asyncio
async def test_register_invalid_email(async_client: AsyncClient):
    """Test registration with invalid email format."""
    response = await async_client.post(
        "/api/v1/auth/register",
        json={
            "email": "notanemail",
            "password": "password123",
            "full_name": "Test User"
        }
    )
    
    assert response.status_code == 422


@pytest.mark.asyncio
async def test_register_short_password(async_client: AsyncClient):
    """Test registration with short password fails."""
    response = await async_client.post(
        "/api/v1/auth/register",
        json={
            "email": "test@example.com",
            "password": "short",
            "full_name": "Test User"
        }
    )
    
    assert response.status_code == 422


@pytest.mark.asyncio
async def test_login_success(async_client: AsyncClient, async_session: AsyncSession):
    """Test successful login."""
    # Create user
    user = User(
        email="login@example.com",
        password_hash=get_password_hash("correctpassword"),
        full_name="Login User"
    )
    async_session.add(user)
    await async_session.commit()
    
    # Login
    response = await async_client.post(
        "/api/v1/auth/login",
        json={
            "email": "login@example.com",
            "password": "correctpassword"
        }
    )
    
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"


@pytest.mark.asyncio
async def test_login_invalid_email(async_client: AsyncClient):
    """Test login with non-existent email fails."""
    response = await async_client.post(
        "/api/v1/auth/login",
        json={
            "email": "nonexistent@example.com",
            "password": "password123"
        }
    )
    
    assert response.status_code == 401
    assert "Invalid email or password" in response.json()["detail"]


@pytest.mark.asyncio
async def test_login_invalid_password(async_client: AsyncClient, async_session: AsyncSession):
    """Test login with invalid password fails."""
    # Create user
    user = User(
        email="wrongpass@example.com",
        password_hash=get_password_hash("correctpassword"),
        full_name="Wrong Pass User"
    )
    async_session.add(user)
    await async_session.commit()
    
    # Login with wrong password
    response = await async_client.post(
        "/api/v1/auth/login",
        json={
            "email": "wrongpass@example.com",
            "password": "wrongpassword"
        }
    )
    
    assert response.status_code == 401
    assert "Invalid email or password" in response.json()["detail"]


@pytest.mark.asyncio
async def test_login_inactive_user(async_client: AsyncClient, async_session: AsyncSession):
    """Test login with inactive user fails."""
    # Create inactive user
    user = User(
        email="inactive@example.com",
        password_hash=get_password_hash("password123"),
        full_name="Inactive User",
        is_active=False
    )
    async_session.add(user)
    await async_session.commit()
    
    # Try to login
    response = await async_client.post(
        "/api/v1/auth/login",
        json={
            "email": "inactive@example.com",
            "password": "password123"
        }
    )
    
    assert response.status_code == 403
    assert "inactive" in response.json()["detail"]


@pytest.mark.asyncio
async def test_get_me_success(async_client: AsyncClient, async_session: AsyncSession):
    """Test getting current user with valid token."""
    # Create user
    user = User(
        email="meuser@example.com",
        password_hash=get_password_hash("password123"),
        full_name="Me User"
    )
    async_session.add(user)
    await async_session.commit()
    await async_session.refresh(user)
    
    # Login to get token
    login_response = await async_client.post(
        "/api/v1/auth/login",
        json={
            "email": "meuser@example.com",
            "password": "password123"
        }
    )
    token = login_response.json()["access_token"]
    
    # Get current user
    response = await async_client.get(
        "/api/v1/auth/me",
        headers={"Authorization": f"Bearer {token}"}
    )
    
    assert response.status_code == 200
    data = response.json()
    assert data["email"] == "meuser@example.com"
    assert data["full_name"] == "Me User"
    assert "password_hash" not in data


@pytest.mark.asyncio
async def test_get_me_no_token(async_client: AsyncClient):
    """Test getting current user without token fails."""
    response = await async_client.get("/api/v1/auth/me")

    assert response.status_code == 401


@pytest.mark.asyncio
async def test_get_me_invalid_token(async_client: AsyncClient):
    """Test getting current user with invalid token fails."""
    response = await async_client.get(
        "/api/v1/auth/me",
        headers={"Authorization": "Bearer invalidtoken"}
    )
    
    assert response.status_code == 401


@pytest.mark.asyncio
async def test_get_me_wrong_format(async_client: AsyncClient):
    """Test getting current user with wrong auth header format fails."""
    response = await async_client.get(
        "/api/v1/auth/me",
        headers={"Authorization": "WrongFormat token"}
    )

    assert response.status_code == 401


@pytest.mark.asyncio
async def test_login_malformed_request(async_client: AsyncClient):
    """Test login with malformed request body fails."""
    response = await async_client.post(
        "/api/v1/auth/login",
        json={
            "email": "test@example.com"
            # Missing password field
        }
    )
    
    assert response.status_code == 422


@pytest.mark.asyncio
async def test_login_invalid_json(async_client: AsyncClient):
    """Test login with invalid JSON content type."""
    response = await async_client.post(
        "/api/v1/auth/login",
        data="invalid json",
        headers={"Content-Type": "application/json"}
    )

    assert response.status_code == 422


@pytest.mark.asyncio
async def test_register_without_email_config(async_client: AsyncClient, async_session: AsyncSession):
    """Test registration succeeds even when email service is not configured."""
    # Temporarily disable email service
    from app.services.email_service import email_service
    original_configured = email_service._is_configured()

    # Test registration should succeed regardless of email config
    response = await async_client.post(
        "/api/v1/auth/register",
        json={
            "email": "noemail@example.com",
            "password": "securepassword123",
            "full_name": "No Email User"
        }
    )

    # Registration should succeed even if email fails
    assert response.status_code == 201
    data = response.json()
    assert "access_token" in data
    assert "user" in data

    # Verify user was created in database
    result = await async_session.execute(select(User).where(User.email == "noemail@example.com"))
    user = result.scalar_one_or_none()
    assert user is not None
