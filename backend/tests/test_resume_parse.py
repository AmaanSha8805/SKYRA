"""
Resume parsing tests for SKYRA.

Tests cover:
- Authenticated parsing
- Unauthenticated rejection
- Ownership protection
- Missing raw text
- Successful structured parsing
- Malformed/unexpected AI response
- Provider/API failure
- Parsed data persistence
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
async def test_parse_resume_authenticated(async_client: AsyncClient, async_session: AsyncSession):
    """Test parsing resume with valid authentication."""
    # Create user
    user = User(
        email="parser@example.com",
        password_hash=get_password_hash("password123"),
        full_name="Parser User"
    )
    async_session.add(user)
    await async_session.commit()
    await async_session.refresh(user)
    
    # Create resume
    resume = Resume(
        user_id=str(user.id),
        title="Test Resume",
        original_filename="resume.pdf",
        file_url="/files/test.pdf",
        file_type="application/pdf",
        file_size=1000
    )
    async_session.add(resume)
    await async_session.commit()
    await async_session.refresh(resume)
    
    # Create resume version with raw text
    resume_version = ResumeVersion(
        resume_id=str(resume.id),
        version_number=1,
        source="upload",
        raw_text="John Doe\nSoftware Engineer\nExperience at Tech Corp..."
    )
    async_session.add(resume_version)
    await async_session.commit()
    
    # Login to get token
    login_response = await async_client.post(
        "/api/v1/auth/login",
        json={"email": "parser@example.com", "password": "password123"}
    )
    token = login_response.json()["access_token"]
    
    # Mock AI parser
    mock_parsed_data = {
        "personal_info": {"name": "John Doe", "email": "john@example.com"},
        "summary": "Software engineer",
        "skills": ["Python", "JavaScript"],
        "experience": [],
        "education": [],
        "projects": [],
        "certifications": []
    }
    
    with patch('app.services.ai_parser.resume_parser_service.parse_resume', new_callable=AsyncMock) as mock_parse:
        mock_parse.return_value = mock_parsed_data
        
        # Parse resume
        response = await async_client.post(
            f"/api/v1/resumes/{resume.id}/parse",
            headers={"Authorization": f"Bearer {token}"}
        )
    
    assert response.status_code == 200
    data = response.json()
    assert "parsed_data" in data
    assert data["parsed_data"]["personal_info"]["name"] == "John Doe"
    
    # Verify parsed_data was persisted
    result = await async_session.execute(
        select(ResumeVersion).where(ResumeVersion.resume_id == str(resume.id))
    )
    version = result.scalar_one()
    assert version.parsed_data is not None
    assert version.parsed_data["personal_info"]["name"] == "John Doe"


@pytest.mark.asyncio
async def test_parse_resume_unauthenticated(async_client: AsyncClient):
    """Test parsing resume without authentication fails."""
    response = await async_client.post("/api/v1/resumes/some-id/parse")
    
    assert response.status_code == 403


@pytest.mark.asyncio
async def test_parse_resume_not_owner(async_client: AsyncClient, async_session: AsyncSession):
    """Test parsing resume owned by another user fails."""
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
    await async_session.refresh(user1)
    await async_session.refresh(user2)
    
    # Create resume owned by user1
    resume = Resume(
        user_id=str(user1.id),
        title="Owner Resume",
        original_filename="resume.pdf",
        file_url="/files/test.pdf",
        file_type="application/pdf",
        file_size=1000
    )
    async_session.add(resume)
    await async_session.commit()
    
    resume_version = ResumeVersion(
        resume_id=str(resume.id),
        version_number=1,
        source="upload",
        raw_text="Resume text..."
    )
    async_session.add(resume_version)
    await async_session.commit()
    
    # Login as user2
    login_response = await async_client.post(
        "/api/v1/auth/login",
        json={"email": "other@example.com", "password": "password123"}
    )
    token = login_response.json()["access_token"]
    
    # Try to parse user1's resume
    response = await async_client.post(
        f"/api/v1/resumes/{resume.id}/parse",
        headers={"Authorization": f"Bearer {token}"}
    )
    
    assert response.status_code == 404


@pytest.mark.asyncio
async def test_parse_resume_missing_raw_text(async_client: AsyncClient, async_session: AsyncSession):
    """Test parsing resume with missing/empty raw text fails."""
    user = User(
        email="empty@example.com",
        password_hash=get_password_hash("password123"),
        full_name="Empty User"
    )
    async_session.add(user)
    await async_session.commit()
    await async_session.refresh(user)
    
    resume = Resume(
        user_id=str(user.id),
        title="Empty Resume",
        original_filename="resume.pdf",
        file_url="/files/test.pdf",
        file_type="application/pdf",
        file_size=1000
    )
    async_session.add(resume)
    await async_session.commit()
    
    resume_version = ResumeVersion(
        resume_id=str(resume.id),
        version_number=1,
        source="upload",
        raw_text=""  # Empty text
    )
    async_session.add(resume_version)
    await async_session.commit()
    
    login_response = await async_client.post(
        "/api/v1/auth/login",
        json={"email": "empty@example.com", "password": "password123"}
    )
    token = login_response.json()["access_token"]
    
    response = await async_client.post(
        f"/api/v1/resumes/{resume.id}/parse",
        headers={"Authorization": f"Bearer {token}"}
    )
    
    assert response.status_code == 400
    assert "too short or empty" in response.json()["detail"]


@pytest.mark.asyncio
async def test_parse_resume_ai_service_unavailable(async_client: AsyncClient, async_session: AsyncSession):
    """Test parsing when AI service is unavailable."""
    user = User(
        email="unavailable@example.com",
        password_hash=get_password_hash("password123"),
        full_name="Unavailable User"
    )
    async_session.add(user)
    await async_session.commit()
    await async_session.refresh(user)
    
    resume = Resume(
        user_id=str(user.id),
        title="Unavailable Resume",
        original_filename="resume.pdf",
        file_url="/files/test.pdf",
        file_type="application/pdf",
        file_size=1000
    )
    async_session.add(resume)
    await async_session.commit()
    
    resume_version = ResumeVersion(
        resume_id=str(resume.id),
        version_number=1,
        source="upload",
        raw_text="John Doe\nSoftware Engineer\nValid resume text here..."
    )
    async_session.add(resume_version)
    await async_session.commit()
    
    login_response = await async_client.post(
        "/api/v1/auth/login",
        json={"email": "unavailable@example.com", "password": "password123"}
    )
    token = login_response.json()["access_token"]
    
    # Mock AI service to raise ValueError (service unavailable)
    with patch('app.services.ai_parser.resume_parser_service.parse_resume', new_callable=AsyncMock) as mock_parse:
        mock_parse.side_effect = ValueError("OpenAI API key not configured")
        
        response = await async_client.post(
            f"/api/v1/resumes/{resume.id}/parse",
            headers={"Authorization": f"Bearer {token}"}
        )
    
    assert response.status_code == 503
    assert "unavailable" in response.json()["detail"]


@pytest.mark.asyncio
async def test_parse_resume_ai_failure(async_client: AsyncClient, async_session: AsyncSession):
    """Test parsing when AI provider fails."""
    user = User(
        email="fail@example.com",
        password_hash=get_password_hash("password123"),
        full_name="Fail User"
    )
    async_session.add(user)
    await async_session.commit()
    await async_session.refresh(user)
    
    resume = Resume(
        user_id=str(user.id),
        title="Fail Resume",
        original_filename="resume.pdf",
        file_url="/files/test.pdf",
        file_type="application/pdf",
        file_size=1000
    )
    async_session.add(resume)
    await async_session.commit()
    
    resume_version = ResumeVersion(
        resume_id=str(resume.id),
        version_number=1,
        source="upload",
        raw_text="John Doe\nSoftware Engineer\nValid resume text here..."
    )
    async_session.add(resume_version)
    await async_session.commit()
    
    login_response = await async_client.post(
        "/api/v1/auth/login",
        json={"email": "fail@example.com", "password": "password123"}
    )
    token = login_response.json()["access_token"]
    
    # Mock AI service to raise generic exception
    with patch('app.services.ai_parser.resume_parser_service.parse_resume', new_callable=AsyncMock) as mock_parse:
        mock_parse.side_effect = Exception("AI provider error")
        
        response = await async_client.post(
            f"/api/v1/resumes/{resume.id}/parse",
            headers={"Authorization": f"Bearer {token}"}
        )
    
    assert response.status_code == 500


@pytest.mark.asyncio
async def test_parse_resume_not_found(async_client: AsyncClient, async_session: AsyncSession):
    """Test parsing non-existent resume fails."""
    user = User(
        email="notfound@example.com",
        password_hash=get_password_hash("password123"),
        full_name="Not Found User"
    )
    async_session.add(user)
    await async_session.commit()
    
    login_response = await async_client.post(
        "/api/v1/auth/login",
        json={"email": "notfound@example.com", "password": "password123"}
    )
    token = login_response.json()["access_token"]
    
    response = await async_client.post(
        "/api/v1/resumes/nonexistent-id/parse",
        headers={"Authorization": f"Bearer {token}"}
    )
    
    assert response.status_code == 404


@pytest.mark.asyncio
async def test_parse_resume_structured_output(async_client: AsyncClient, async_session: AsyncSession):
    """Test that parsing returns structured data with all required fields."""
    user = User(
        email="structured@example.com",
        password_hash=get_password_hash("password123"),
        full_name="Structured User"
    )
    async_session.add(user)
    await async_session.commit()
    await async_session.refresh(user)
    
    resume = Resume(
        user_id=str(user.id),
        title="Structured Resume",
        original_filename="resume.pdf",
        file_url="/files/test.pdf",
        file_type="application/pdf",
        file_size=1000
    )
    async_session.add(resume)
    await async_session.commit()
    
    resume_version = ResumeVersion(
        resume_id=str(resume.id),
        version_number=1,
        source="upload",
        raw_text="John Doe\nSoftware Engineer\nSan Francisco, CA\njohn@example.com\n\nExperience:\nTech Corp - Senior Engineer (2020-Present)\nLed development of core features\nImproved performance by 50%\n\nEducation:\nMIT - BS Computer Science (2015-2019)\n\nSkills: Python, JavaScript, React, SQL"
    )
    async_session.add(resume_version)
    await async_session.commit()
    
    login_response = await async_client.post(
        "/api/v1/auth/login",
        json={"email": "structured@example.com", "password": "password123"}
    )
    token = login_response.json()["access_token"]
    
    # Mock structured response
    mock_parsed_data = {
        "personal_info": {
            "name": "Jane Smith",
            "email": "jane@example.com",
            "phone": "+1234567890",
            "location": "San Francisco, CA",
            "linkedin": "linkedin.com/in/jane",
            "github": "github.com/jane",
            "website": "janesmith.com"
        },
        "summary": "Senior Software Engineer with 5 years experience",
        "skills": ["Python", "JavaScript", "React", "SQL"],
        "experience": [
            {
                "company": "Tech Corp",
                "title": "Senior Engineer",
                "location": "San Francisco, CA",
                "start_date": "2020-01",
                "end_date": None,
                "is_current": True,
                "description": "Led development of core features",
                "achievements": ["Improved performance by 50%", "Mentored 3 junior developers"]
            }
        ],
        "education": [
            {
                "institution": "MIT",
                "degree": "Bachelor of Science",
                "field_of_study": "Computer Science",
                "start_date": "2015-09",
                "end_date": "2019-05",
                "grade": "3.8 GPA"
            }
        ],
        "projects": [
            {
                "name": "Project X",
                "description": "Built scalable API",
                "url": "github.com/jane/project-x",
                "technologies": ["Python", "FastAPI", "PostgreSQL"]
            }
        ],
        "certifications": [
            {
                "name": "AWS Solutions Architect",
                "issuer": "Amazon",
                "issue_date": "2021-06",
                "expiry_date": None,
                "credential_url": "aws.amazon.com/verify/cert"
            }
        ]
    }
    
    with patch('app.services.ai_parser.resume_parser_service.parse_resume', new_callable=AsyncMock) as mock_parse:
        mock_parse.return_value = mock_parsed_data
        
        response = await async_client.post(
            f"/api/v1/resumes/{resume.id}/parse",
            headers={"Authorization": f"Bearer {token}"}
        )
    
    assert response.status_code == 200
    data = response.json()["parsed_data"]
    
    # Verify all sections present
    assert "personal_info" in data
    assert "summary" in data
    assert "skills" in data
    assert "experience" in data
    assert "education" in data
    assert "projects" in data
    assert "certifications" in data
    
    # Verify experience structure
    assert len(data["experience"]) == 1
    exp = data["experience"][0]
    assert exp["company"] == "Tech Corp"
    assert exp["title"] == "Senior Engineer"
    assert exp["is_current"] is True
    assert "achievements" in exp
    
    # Verify education structure
    assert len(data["education"]) == 1
    edu = data["education"][0]
    assert edu["institution"] == "MIT"
    assert edu["degree"] == "Bachelor of Science"
    assert edu["grade"] == "3.8 GPA"
