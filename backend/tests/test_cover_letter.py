"""
Cover letter generation tests for SKYRA.

Tests cover:
- POST /api/v1/cover-letter/generate (authenticated)
- POST /api/v1/cover-letter/generate (unauthenticated rejection)
- POST /api/v1/cover-letter/generate (ownership protection)
- POST /api/v1/cover-letter/generate (missing parsed data)
- POST /api/v1/cover-letter/generate (AI failure)
- POST /api/v1/cover-letter/generate (successful generation)
"""

import pytest
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from unittest.mock import AsyncMock, patch

from app.models.user import User
from app.models.resume import Resume, ResumeVersion
from app.core.security import get_password_hash


@pytest.mark.asyncio
async def test_generate_cover_letter_authenticated(async_client: AsyncClient, async_session: AsyncSession):
    """Test successful cover letter generation by authenticated user."""
    # Create user
    user = User(
        email="coverletter@example.com",
        password_hash=get_password_hash("password123"),
        full_name="Cover Letter User"
    )
    async_session.add(user)
    await async_session.commit()
    await async_session.refresh(user)

    # Login to get token
    login_response = await async_client.post(
        "/api/v1/auth/login",
        json={"email": "coverletter@example.com", "password": "password123"}
    )
    token = login_response.json()["access_token"]

    # Create resume with parsed data
    resume = Resume(
        user_id=str(user.id),
        title="Test Resume",
        original_filename="test.pdf",
        file_url="uploads/test.pdf",
        file_type="application/pdf",
        file_size=1000,
        is_active=True
    )
    async_session.add(resume)
    await async_session.flush()

    resume_version = ResumeVersion(
        resume_id=str(resume.id),
        version_number=1,
        source="upload",
        raw_text="Sample resume text",
        parsed_data={
            "personal_info": {"name": "John Doe", "email": "john@example.com"},
            "skills": ["Python", "JavaScript"],
            "experience": [],
            "education": []
        }
    )
    async_session.add(resume_version)
    await async_session.commit()
    await async_session.refresh(resume)

    # Mock AI cover letter service
    mock_cover_letter_data = {
        "cover_letter": "Dear Hiring Manager,\n\nI am writing to express my interest in the Senior Software Engineer position at Google. With my experience in Python and JavaScript, I am confident in my ability to contribute to your team.\n\nSincerely,\nJohn Doe",
        "word_count": 42
    }

    with patch('app.api.v1.cover_letter.cover_letter_service.generate_cover_letter', new_callable=AsyncMock) as mock_generate:
        mock_generate.return_value = mock_cover_letter_data

        # Generate cover letter
        response = await async_client.post(
            "/api/v1/cover-letter/generate",
            headers={"Authorization": f"Bearer {token}"},
            json={
                "resume_id": str(resume.id),
                "job_title": "Senior Software Engineer",
                "company_name": "Google",
                "job_description": "We are looking for a senior software engineer..."
            }
        )

        assert response.status_code == 200
        data = response.json()
        assert "cover_letter" in data
        assert "word_count" in data
        assert data["word_count"] == 42
        assert "Dear Hiring Manager" in data["cover_letter"]


@pytest.mark.asyncio
async def test_generate_cover_letter_unauthenticated(async_client: AsyncClient, async_session: AsyncSession):
    """Test cover letter generation without authentication fails."""
    # Create user and resume
    user = User(
        email="unauth@example.com",
        password_hash=get_password_hash("password123"),
        full_name="Unauth User"
    )
    async_session.add(user)
    await async_session.commit()
    await async_session.flush()

    resume = Resume(
        user_id=str(user.id),
        title="Test Resume",
        original_filename="test.pdf",
        file_url="uploads/test.pdf",
        file_type="application/pdf",
        file_size=1000,
        is_active=True
    )
    async_session.add(resume)
    await async_session.commit()
    await async_session.refresh(resume)

    # Try to generate without authentication
    response = await async_client.post(
        "/api/v1/cover-letter/generate",
        json={
            "resume_id": str(resume.id),
            "job_title": "Software Engineer",
            "company_name": "Test Company"
        }
    )

    assert response.status_code == 403


@pytest.mark.asyncio
async def test_generate_cover_letter_ownership(async_client: AsyncClient, async_session: AsyncSession):
    """Test users can only generate cover letters for their own resumes."""
    # Create two users
    user1 = User(
        email="owner@example.com",
        password_hash=get_password_hash("password123"),
        full_name="Owner User"
    )
    user2 = User(
        email="other@example.com",
        password_hash=get_password_hash("password123"),
        full_name="Other User"
    )
    async_session.add(user1)
    async_session.add(user2)
    await async_session.commit()

    # Login as user1
    login1 = await async_client.post(
        "/api/v1/auth/login",
        json={"email": "owner@example.com", "password": "password123"}
    )
    token1 = login1.json()["access_token"]

    # Create resume for user1
    resume = Resume(
        user_id=str(user1.id),
        title="User1 Resume",
        original_filename="user1.pdf",
        file_url="uploads/user1.pdf",
        file_type="application/pdf",
        file_size=1000,
        is_active=True
    )
    async_session.add(resume)
    await async_session.flush()

    resume_version = ResumeVersion(
        resume_id=str(resume.id),
        version_number=1,
        source="upload",
        raw_text="Sample",
        parsed_data={"skills": ["Python"]}
    )
    async_session.add(resume_version)
    await async_session.commit()
    await async_session.refresh(resume)

    # Login as user2
    login2 = await async_client.post(
        "/api/v1/auth/login",
        json={"email": "other@example.com", "password": "password123"}
    )
    token2 = login2.json()["access_token"]

    # Try to generate cover letter for user1's resume as user2
    response = await async_client.post(
        "/api/v1/cover-letter/generate",
        headers={"Authorization": f"Bearer {token2}"},
        json={
            "resume_id": str(resume.id),
            "job_title": "Software Engineer",
            "company_name": "Test Company"
        }
    )

    assert response.status_code == 404


@pytest.mark.asyncio
async def test_generate_cover_letter_missing_parsed_data(async_client: AsyncClient, async_session: AsyncSession):
    """Test cover letter generation fails when resume has no parsed data."""
    # Create user
    user = User(
        email="noparse@example.com",
        password_hash=get_password_hash("password123"),
        full_name="No Parse User"
    )
    async_session.add(user)
    await async_session.commit()

    # Login
    login_response = await async_client.post(
        "/api/v1/auth/login",
        json={"email": "noparse@example.com", "password": "password123"}
    )
    token = login_response.json()["access_token"]

    # Create resume without parsed data
    resume = Resume(
        user_id=str(user.id),
        title="No Parse Resume",
        original_filename="noparse.pdf",
        file_url="uploads/noparse.pdf",
        file_type="application/pdf",
        file_size=1000,
        is_active=True
    )
    async_session.add(resume)
    await async_session.flush()

    resume_version = ResumeVersion(
        resume_id=str(resume.id),
        version_number=1,
        source="upload",
        raw_text="Sample text",
        parsed_data=None  # No parsed data
    )
    async_session.add(resume_version)
    await async_session.commit()
    await async_session.refresh(resume)

    # Try to generate cover letter
    response = await async_client.post(
        "/api/v1/cover-letter/generate",
        headers={"Authorization": f"Bearer {token}"},
        json={
            "resume_id": str(resume.id),
            "job_title": "Software Engineer",
            "company_name": "Test Company"
        }
    )

    assert response.status_code == 400
    assert "must be parsed" in response.json()["detail"]


@pytest.mark.asyncio
async def test_generate_cover_letter_ai_failure(async_client: AsyncClient, async_session: AsyncSession):
    """Test cover letter generation handles AI service failure gracefully."""
    # Create user
    user = User(
        email="aifail@example.com",
        password_hash=get_password_hash("password123"),
        full_name="AI Fail User"
    )
    async_session.add(user)
    await async_session.commit()

    # Login
    login_response = await async_client.post(
        "/api/v1/auth/login",
        json={"email": "aifail@example.com", "password": "password123"}
    )
    token = login_response.json()["access_token"]

    # Create resume with parsed data
    resume = Resume(
        user_id=str(user.id),
        title="AI Fail Resume",
        original_filename="aifail.pdf",
        file_url="uploads/aifail.pdf",
        file_type="application/pdf",
        file_size=1000,
        is_active=True
    )
    async_session.add(resume)
    await async_session.flush()

    resume_version = ResumeVersion(
        resume_id=str(resume.id),
        version_number=1,
        source="upload",
        raw_text="Sample",
        parsed_data={"skills": ["Python"]}
    )
    async_session.add(resume_version)
    await async_session.commit()
    await async_session.refresh(resume)

    # Mock AI service failure
    with patch('app.api.v1.cover_letter.cover_letter_service.generate_cover_letter', new_callable=AsyncMock) as mock_generate:
        mock_generate.side_effect = ValueError("AI service unavailable")

        # Try to generate cover letter
        response = await async_client.post(
            "/api/v1/cover-letter/generate",
            headers={"Authorization": f"Bearer {token}"},
            json={
                "resume_id": str(resume.id),
                "job_title": "Software Engineer",
                "company_name": "Test Company"
            }
        )

        assert response.status_code == 503
        assert "AI cover letter service unavailable" in response.json()["detail"]


@pytest.mark.asyncio
async def test_generate_cover_letter_validation(async_client: AsyncClient, async_session: AsyncSession):
    """Test cover letter generation validates required fields."""
    # Create user
    user = User(
        email="validation@example.com",
        password_hash=get_password_hash("password123"),
        full_name="Validation User"
    )
    async_session.add(user)
    await async_session.commit()

    # Login
    login_response = await async_client.post(
        "/api/v1/auth/login",
        json={"email": "validation@example.com", "password": "password123"}
    )
    token = login_response.json()["access_token"]

    # Test missing job title
    response = await async_client.post(
        "/api/v1/cover-letter/generate",
        headers={"Authorization": f"Bearer {token}"},
        json={
            "resume_id": "some-id",
            "company_name": "Test Company"
        }
    )
    assert response.status_code == 422  # Validation error

    # Test missing company name
    response = await async_client.post(
        "/api/v1/cover-letter/generate",
        headers={"Authorization": f"Bearer {token}"},
        json={
            "resume_id": "some-id",
            "job_title": "Software Engineer"
        }
    )
    assert response.status_code == 422  # Validation error
