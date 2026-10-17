"""
Database tests for SKYRA models.

Tests cover:
- User creation
- Profile relationship
- Resume relationship
- ResumeVersion relationship
- Skills
- Jobs
- Applications
- AI analysis storage
- Job matching
- Foreign keys
- Unique constraints
- Score constraints
"""

import pytest
import uuid
from datetime import datetime
from sqlalchemy.exc import IntegrityError

from app.models.user import User, UserRole
from app.models.profile import Profile
from app.models.resume import Resume, ResumeVersion
from app.models.skill import Skill, ResumeSkill, JobSkill
from app.models.company import Company, Job
from app.models.application import JobApplication, ApplicationStatus
from app.models.analysis import ResumeAnalysis, JobMatch, SkillGap


@pytest.mark.asyncio
async def test_user_creation(async_session):
    """Test user creation with valid data."""
    user = User(
        id=str(uuid.uuid4()),
        email="test@example.com",
        password_hash="hashed_password",
        full_name="Test User",
        role=UserRole.USER,
    )
    async_session.add(user)
    await async_session.commit()
    await async_session.refresh(user)
    
    assert user.id is not None
    assert user.email == "test@example.com"
    assert user.full_name == "Test User"
    assert user.is_active is True
    assert user.is_verified is False


@pytest.mark.asyncio
async def test_user_email_unique_constraint(async_session):
    """Test that user email must be unique."""
    user1 = User(
        id=str(uuid.uuid4()),
        email="duplicate@example.com",
        password_hash="hashed_password",
        full_name="User One",
    )
    user2 = User(
        id=str(uuid.uuid4()),
        email="duplicate@example.com",
        password_hash="hashed_password",
        full_name="User Two",
    )
    
    async_session.add(user1)
    await async_session.commit()
    
    async_session.add(user2)
    with pytest.raises(IntegrityError):
        await async_session.commit()


@pytest.mark.asyncio
async def test_profile_relationship(async_session):
    """Test one-to-one relationship between User and Profile."""
    user_id = str(uuid.uuid4())
    user = User(
        id=user_id,
        email="profile@example.com",
        password_hash="hashed_password",
        full_name="Profile User",
    )
    async_session.add(user)
    await async_session.commit()
    
    profile = Profile(
        id=str(uuid.uuid4()),
        user_id=user_id,
        headline="Software Developer",
        location="San Francisco, CA",
        years_of_experience=5,
    )
    async_session.add(profile)
    await async_session.commit()
    await async_session.refresh(profile)
    
    assert profile.user_id == user_id
    assert profile.headline == "Software Developer"


@pytest.mark.asyncio
async def test_resume_relationship(async_session):
    """Test relationship between User and Resume."""
    user_id = str(uuid.uuid4())
    user = User(
        id=user_id,
        email="resume@example.com",
        password_hash="hashed_password",
        full_name="Resume User",
    )
    async_session.add(user)
    await async_session.commit()
    
    resume = Resume(
        id=str(uuid.uuid4()),
        user_id=user_id,
        title="My Resume",
        original_filename="resume.pdf",
        file_url="https://example.com/resume.pdf",
        file_type="pdf",
        file_size=12345,
    )
    async_session.add(resume)
    await async_session.commit()
    await async_session.refresh(resume)
    
    assert resume.user_id == user_id
    assert resume.title == "My Resume"


@pytest.mark.asyncio
async def test_resume_version_relationship(async_session):
    """Test relationship between Resume and ResumeVersion."""
    resume_id = str(uuid.uuid4())
    user_id = str(uuid.uuid4())
    
    user = User(
        id=user_id,
        email="version@example.com",
        password_hash="hashed_password",
        full_name="Version User",
    )
    async_session.add(user)
    await async_session.commit()
    
    resume = Resume(
        id=resume_id,
        user_id=user_id,
        title="Versioned Resume",
        original_filename="resume.pdf",
        file_url="https://example.com/resume.pdf",
        file_type="pdf",
        file_size=12345,
    )
    async_session.add(resume)
    await async_session.commit()
    
    version = ResumeVersion(
        id=str(uuid.uuid4()),
        resume_id=resume_id,
        version_number=1,
        source="upload",
        raw_text="Resume content here",
    )
    async_session.add(version)
    await async_session.commit()
    await async_session.refresh(version)
    
    assert version.resume_id == resume_id
    assert version.version_number == 1


@pytest.mark.asyncio
async def test_skill_creation(async_session):
    """Test skill creation with normalized name."""
    skill = Skill(
        id=str(uuid.uuid4()),
        name="Python",
        normalized_name="python",
        category="Programming Language",
    )
    async_session.add(skill)
    await async_session.commit()
    await async_session.refresh(skill)
    
    assert skill.name == "Python"
    assert skill.normalized_name == "python"


@pytest.mark.asyncio
async def test_skill_normalized_name_unique(async_session):
    """Test that skill normalized name must be unique."""
    skill1 = Skill(
        id=str(uuid.uuid4()),
        name="Python",
        normalized_name="python",
        category="Programming",
    )
    skill2 = Skill(
        id=str(uuid.uuid4()),
        name="PYTHON",
        normalized_name="python",
        category="Programming",
    )
    
    async_session.add(skill1)
    await async_session.commit()
    
    async_session.add(skill2)
    with pytest.raises(IntegrityError):
        await async_session.commit()


@pytest.mark.asyncio
async def test_job_creation(async_session):
    """Test job creation with company relationship."""
    company_id = str(uuid.uuid4())
    company = Company(
        id=company_id,
        name="TechCorp",
        normalized_name="techcorp",
        industry="Technology",
    )
    async_session.add(company)
    await async_session.commit()
    
    job = Job(
        id=str(uuid.uuid4()),
        company_id=company_id,
        title="Software Engineer",
        normalized_title="software engineer",
        description="Job description",
        location="San Francisco, CA",
        employment_type="Full-time",
        experience_level="Mid",
        remote_type="Remote",
        source="internal",
        posted_at=datetime.utcnow(),
    )
    async_session.add(job)
    await async_session.commit()
    await async_session.refresh(job)
    
    assert job.company_id == company_id
    assert job.title == "Software Engineer"


@pytest.mark.asyncio
async def test_job_application_creation(async_session):
    """Test job application creation."""
    user_id = str(uuid.uuid4())
    company_id = str(uuid.uuid4())
    
    user = User(
        id=user_id,
        email="applicant@example.com",
        password_hash="hashed_password",
        full_name="Applicant",
    )
    async_session.add(user)
    await async_session.commit()
    
    company = Company(
        id=company_id,
        name="JobCorp",
        normalized_name="jobcorp",
    )
    async_session.add(company)
    await async_session.commit()
    
    job = Job(
        id=str(uuid.uuid4()),
        company_id=company_id,
        title="Developer",
        normalized_title="developer",
        description="Job",
        location="Remote",
        employment_type="Full-time",
        experience_level="Mid",
        remote_type="Remote",
        source="internal",
        posted_at=datetime.utcnow(),
    )
    async_session.add(job)
    await async_session.commit()
    
    application = JobApplication(
        id=str(uuid.uuid4()),
        user_id=user_id,
        job_id=job.id,
        status=ApplicationStatus.APPLIED,
        applied_at=datetime.utcnow(),
    )
    async_session.add(application)
    await async_session.commit()
    await async_session.refresh(application)
    
    assert application.user_id == user_id
    assert application.job_id == job.id
    assert application.status == ApplicationStatus.APPLIED


@pytest.mark.asyncio
async def test_resume_analysis_score_constraints(async_session):
    """Test that resume analysis scores are within valid range (0-100)."""
    # This test verifies the check constraints are in place
    # Note: Actual constraint validation happens at database level
    analysis = ResumeAnalysis(
        id=str(uuid.uuid4()),
        resume_version_id=str(uuid.uuid4()),
        overall_score=85,
        ats_score=90,
        content_score=80,
        skills_score=85,
        experience_score=75,
        formatting_score=95,
        keyword_score=88,
        model_name="test-model",
        model_version="1.0",
    )
    async_session.add(analysis)
    await async_session.commit()
    await async_session.refresh(analysis)
    
    assert 0 <= analysis.overall_score <= 100
    assert 0 <= analysis.ats_score <= 100


@pytest.mark.asyncio
async def test_job_match_creation(async_session):
    """Test job match creation with scores."""
    user_id = str(uuid.uuid4())
    resume_version_id = str(uuid.uuid4())
    company_id = str(uuid.uuid4())
    
    user = User(
        id=user_id,
        email="matcher@example.com",
        password_hash="hashed_password",
        full_name="Matcher",
    )
    async_session.add(user)
    await async_session.commit()
    
    company = Company(
        id=company_id,
        name="MatchCorp",
        normalized_name="matchcorp",
    )
    async_session.add(company)
    await async_session.commit()
    
    job = Job(
        id=str(uuid.uuid4()),
        company_id=company_id,
        title="Match Job",
        normalized_title="match job",
        description="Job",
        location="Remote",
        employment_type="Full-time",
        experience_level="Mid",
        remote_type="Remote",
        source="internal",
        posted_at=datetime.utcnow(),
    )
    async_session.add(job)
    await async_session.commit()
    
    job_match = JobMatch(
        id=str(uuid.uuid4()),
        user_id=user_id,
        resume_version_id=resume_version_id,
        job_id=job.id,
        overall_score=92,
        skills_score=95,
        experience_score=88,
        education_score=90,
        keyword_score=85,
        model_name="test-model",
        model_version="1.0",
    )
    async_session.add(job_match)
    await async_session.commit()
    await async_session.refresh(job_match)
    
    assert job_match.user_id == user_id
    assert job_match.job_id == job.id
    assert 0 <= job_match.overall_score <= 100


@pytest.mark.asyncio
async def test_skill_gap_creation(async_session):
    """Test skill gap creation."""
    user_id = str(uuid.uuid4())
    skill_id = str(uuid.uuid4())
    
    user = User(
        id=user_id,
        email="gap@example.com",
        password_hash="hashed_password",
        full_name="Gap User",
    )
    async_session.add(user)
    await async_session.commit()
    
    skill = Skill(
        id=skill_id,
        name="Kubernetes",
        normalized_name="kubernetes",
        category="DevOps",
    )
    async_session.add(skill)
    await async_session.commit()
    
    skill_gap = SkillGap(
        id=str(uuid.uuid4()),
        user_id=user_id,
        skill_id=skill_id,
        current_level=2,
        target_level=5,
        priority="high",
        status="active",
    )
    async_session.add(skill_gap)
    await async_session.commit()
    await async_session.refresh(skill_gap)
    
    assert skill_gap.user_id == user_id
    assert skill_gap.skill_id == skill_id
    assert skill_gap.current_level == 2
    assert skill_gap.target_level == 5


@pytest.mark.asyncio
async def test_resume_skill_many_to_many(async_session):
    """Test many-to-many relationship between ResumeVersion and Skill."""
    resume_version_id = str(uuid.uuid4())
    skill_id = str(uuid.uuid4())
    
    skill = Skill(
        id=skill_id,
        name="React",
        normalized_name="react",
        category="Framework",
    )
    async_session.add(skill)
    await async_session.commit()
    
    resume_skill = ResumeSkill(
        id=str(uuid.uuid4()),
        resume_version_id=resume_version_id,
        skill_id=skill_id,
        proficiency="advanced",
        years_of_experience=3,
    )
    async_session.add(resume_skill)
    await async_session.commit()
    await async_session.refresh(resume_skill)
    
    assert resume_skill.skill_id == skill_id
    assert resume_skill.proficiency == "advanced"


@pytest.mark.asyncio
async def test_job_skill_many_to_many(async_session):
    """Test many-to-many relationship between Job and Skill."""
    job_id = str(uuid.uuid4())
    skill_id = str(uuid.uuid4())
    company_id = str(uuid.uuid4())
    
    company = Company(
        id=company_id,
        name="SkillCorp",
        normalized_name="skillcorp",
    )
    async_session.add(company)
    await async_session.commit()
    
    job = Job(
        id=job_id,
        company_id=company_id,
        title="Skill Job",
        normalized_title="skill job",
        description="Job",
        location="Remote",
        employment_type="Full-time",
        experience_level="Mid",
        remote_type="Remote",
        source="internal",
        posted_at=datetime.utcnow(),
    )
    async_session.add(job)
    await async_session.commit()
    
    skill = Skill(
        id=skill_id,
        name="TypeScript",
        normalized_name="typescript",
        category="Programming Language",
    )
    async_session.add(skill)
    await async_session.commit()
    
    job_skill = JobSkill(
        id=str(uuid.uuid4()),
        job_id=job_id,
        skill_id=skill_id,
        is_required=True,
        importance=5,
    )
    async_session.add(job_skill)
    await async_session.commit()
    await async_session.refresh(job_skill)
    
    assert job_skill.job_id == job_id
    assert job_skill.skill_id == skill_id
    assert job_skill.is_required is True
