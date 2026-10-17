"""
Resume analysis tests for SKYRA.

Tests cover:
- POST /api/v1/resumes/{resume_id}/analyze (authenticated)
- POST /api/v1/resumes/{resume_id}/analyze (unauthenticated rejection)
- POST /api/v1/resumes/{resume_id}/analyze (ownership protection)
- POST /api/v1/resumes/{resume_id}/analyze (missing parsed data)
- POST /api/v1/resumes/{resume_id}/analyze (AI failure)
- POST /api/v1/resumes/{resume_id}/analyze (successful analysis persistence)
- GET /api/v1/resumes/{resume_id}/analysis (get analysis)
"""

import pytest
import io
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from unittest.mock import AsyncMock, patch

from app.models.user import User
from app.models.resume import Resume, ResumeVersion
from app.models.analysis import ResumeAnalysis
from app.core.security import get_password_hash


@pytest.mark.asyncio
async def test_analyze_resume_authenticated(async_client: AsyncClient, async_session: AsyncSession):
    """Test successful resume analysis by authenticated user."""
    # Create user
    user = User(
        email="analysis@example.com",
        password_hash=get_password_hash("password123"),
        full_name="Analysis User"
    )
    async_session.add(user)
    await async_session.commit()
    await async_session.refresh(user)
    
    # Login to get token
    login_response = await async_client.post(
        "/api/v1/auth/login",
        json={"email": "analysis@example.com", "password": "password123"}
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
    
    # Mock AI analysis service
    mock_analysis_data = {
        "overall_score": 85,
        "ats_score": 80,
        "content_score": 85,
        "skills_score": 90,
        "experience_score": 85,
        "formatting_score": 80,
        "keyword_score": 85,
        "strengths": ["Strong technical skills", "Clear experience"],
        "weaknesses": ["Missing certifications"],
        "recommendations": ["Add more achievements"],
        "missing_keywords": ["Agile", "Docker"],
        "detected_skills": ["Python", "JavaScript"]
    }
    
    with patch('app.api.v1.resume.resume_analysis_service.analyze_resume', new_callable=AsyncMock) as mock_analyze:
        mock_analyze.return_value = mock_analysis_data
        
        # Analyze resume
        response = await async_client.post(
            f"/api/v1/resumes/{resume.id}/analyze",
            headers={"Authorization": f"Bearer {token}"}
        )
        
        assert response.status_code == 201
        data = response.json()
        assert data["overall_score"] == 85
        assert data["ats_score"] == 80
        assert data["strengths"] == ["Strong technical skills", "Clear experience"]
        assert data["missing_keywords"] == ["Agile", "Docker"]
        assert data["detected_skills"] == ["Python", "JavaScript"]
        assert "id" in data


@pytest.mark.asyncio
async def test_analyze_resume_unauthenticated(async_client: AsyncClient, async_session: AsyncSession):
    """Test resume analysis without authentication fails."""
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
    
    # Try to analyze without authentication
    response = await async_client.post(f"/api/v1/resumes/{resume.id}/analyze")
    
    assert response.status_code == 403


@pytest.mark.asyncio
async def test_analyze_resume_ownership(async_client: AsyncClient, async_session: AsyncSession):
    """Test users can only analyze their own resumes."""
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
    
    # Try to analyze user1's resume as user2
    response = await async_client.post(
        f"/api/v1/resumes/{resume.id}/analyze",
        headers={"Authorization": f"Bearer {token2}"}
    )
    
    assert response.status_code == 404


@pytest.mark.asyncio
async def test_analyze_resume_missing_parsed_data(async_client: AsyncClient, async_session: AsyncSession):
    """Test analysis fails when resume has no parsed data."""
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
    
    # Try to analyze
    response = await async_client.post(
        f"/api/v1/resumes/{resume.id}/analyze",
        headers={"Authorization": f"Bearer {token}"}
    )
    
    assert response.status_code == 400
    assert "must be parsed" in response.json()["detail"]


@pytest.mark.asyncio
async def test_analyze_resume_ai_failure(async_client: AsyncClient, async_session: AsyncSession):
    """Test analysis handles AI service failure gracefully."""
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
    with patch('app.api.v1.resume.resume_analysis_service.analyze_resume', new_callable=AsyncMock) as mock_analyze:
        mock_analyze.side_effect = ValueError("AI service unavailable")
        
        # Try to analyze
        response = await async_client.post(
            f"/api/v1/resumes/{resume.id}/analyze",
            headers={"Authorization": f"Bearer {token}"}
        )
        
        assert response.status_code == 503
        assert "AI analysis service unavailable" in response.json()["detail"]


@pytest.mark.asyncio
async def test_analyze_resume_persistence(async_client: AsyncClient, async_session: AsyncSession):
    """Test analysis is properly persisted in database."""
    # Create user
    user = User(
        email="persist@example.com",
        password_hash=get_password_hash("password123"),
        full_name="Persist User"
    )
    async_session.add(user)
    await async_session.commit()
    await async_session.refresh(user)
    
    # Login
    login_response = await async_client.post(
        "/api/v1/auth/login",
        json={"email": "persist@example.com", "password": "password123"}
    )
    token = login_response.json()["access_token"]
    
    # Create resume with parsed data
    resume = Resume(
        user_id=str(user.id),
        title="Persist Resume",
        original_filename="persist.pdf",
        file_url="uploads/persist.pdf",
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
    
    # Mock AI analysis
    mock_analysis_data = {
        "overall_score": 75,
        "ats_score": 70,
        "content_score": 75,
        "skills_score": 80,
        "experience_score": 75,
        "formatting_score": 70,
        "keyword_score": 75,
        "strengths": ["Good skills"],
        "weaknesses": ["Needs improvement"],
        "recommendations": ["Add more"],
        "missing_keywords": ["Docker"],
        "detected_skills": ["Python"]
    }
    
    with patch('app.api.v1.resume.resume_analysis_service.analyze_resume', new_callable=AsyncMock) as mock_analyze:
        mock_analyze.return_value = mock_analysis_data
        
        # Analyze resume
        response = await async_client.post(
            f"/api/v1/resumes/{resume.id}/analyze",
            headers={"Authorization": f"Bearer {token}"}
        )
        
        assert response.status_code == 201
        analysis_id = response.json()["id"]
        
        # Verify analysis is in database
        result = await async_session.execute(
            select(ResumeAnalysis).where(ResumeAnalysis.id == analysis_id)
        )
        analysis = result.scalar_one_or_none()
        
        assert analysis is not None
        assert analysis.overall_score == 75
        assert analysis.ats_score == 70
        assert analysis.resume_version_id == str(resume_version.id)


@pytest.mark.asyncio
async def test_get_resume_analysis(async_client: AsyncClient, async_session: AsyncSession):
    """Test getting existing analysis for a resume."""
    # Create user
    user = User(
        email="getanalysis@example.com",
        password_hash=get_password_hash("password123"),
        full_name="Get Analysis User"
    )
    async_session.add(user)
    await async_session.commit()
    await async_session.refresh(user)
    
    # Login
    login_response = await async_client.post(
        "/api/v1/auth/login",
        json={"email": "getanalysis@example.com", "password": "password123"}
    )
    token = login_response.json()["access_token"]
    
    # Create resume and version
    resume = Resume(
        user_id=str(user.id),
        title="Get Analysis Resume",
        original_filename="getanalysis.pdf",
        file_url="uploads/getanalysis.pdf",
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
    await async_session.flush()
    
    # Create analysis
    analysis = ResumeAnalysis(
        resume_version_id=str(resume_version.id),
        overall_score=90,
        ats_score=85,
        content_score=90,
        skills_score=95,
        experience_score=90,
        formatting_score=85,
        keyword_score=90,
        strengths=["Excellent"],
        weaknesses=["None"],
        recommendations=["Keep it up"],
        missing_keywords=[],
        detected_skills=["Python"],
        model_name="gpt-4o-mini",
        model_version="1"
    )
    async_session.add(analysis)
    await async_session.commit()
    await async_session.refresh(resume)
    
    # Get analysis
    response = await async_client.get(
        f"/api/v1/resumes/{resume.id}/analysis",
        headers={"Authorization": f"Bearer {token}"}
    )
    
    assert response.status_code == 200
    data = response.json()
    assert data["overall_score"] == 90
    assert data["ats_score"] == 85
    assert data["strengths"] == ["Excellent"]


@pytest.mark.asyncio
async def test_get_resume_analysis_not_found(async_client: AsyncClient, async_session: AsyncSession):
    """Test getting analysis for resume without analysis returns 404."""
    # Create user
    user = User(
        email="noanalysis@example.com",
        password_hash=get_password_hash("password123"),
        full_name="No Analysis User"
    )
    async_session.add(user)
    await async_session.commit()
    
    # Login
    login_response = await async_client.post(
        "/api/v1/auth/login",
        json={"email": "noanalysis@example.com", "password": "password123"}
    )
    token = login_response.json()["access_token"]
    
    # Create resume without analysis
    resume = Resume(
        user_id=str(user.id),
        title="No Analysis Resume",
        original_filename="noanalysis.pdf",
        file_url="uploads/noanalysis.pdf",
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
    
    # Try to get analysis
    response = await async_client.get(
        f"/api/v1/resumes/{resume.id}/analysis",
        headers={"Authorization": f"Bearer {token}"}
    )
    
    assert response.status_code == 404
    assert "No analysis found" in response.json()["detail"]
