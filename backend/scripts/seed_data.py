"""
Seed data script for SKYRA database development.

This script creates minimal development seed data for:
- Skills
- Companies
- Jobs

Run with: python -m scripts.seed_data
"""

import asyncio
import sys
from pathlib import Path

# Add backend to path
sys.path.insert(0, str(Path(__file__).parent.parent))

from sqlalchemy.ext.asyncio import AsyncSession
from app.db.session import async_session_maker
from app.models.skill import Skill
from app.models.company import Company, Job
from datetime import datetime, timedelta


async def seed_skills(session: AsyncSession):
    """Seed initial skills data."""
    skills_data = [
        {"name": "Python", "normalized_name": "python", "category": "Programming Language"},
        {"name": "JavaScript", "normalized_name": "javascript", "category": "Programming Language"},
        {"name": "TypeScript", "normalized_name": "typescript", "category": "Programming Language"},
        {"name": "React", "normalized_name": "react", "category": "Framework"},
        {"name": "Next.js", "normalized_name": "nextjs", "category": "Framework"},
        {"name": "FastAPI", "normalized_name": "fastapi", "category": "Framework"},
        {"name": "SQL", "normalized_name": "sql", "category": "Database"},
        {"name": "PostgreSQL", "normalized_name": "postgresql", "category": "Database"},
        {"name": "Docker", "normalized_name": "docker", "category": "DevOps"},
        {"name": "Git", "normalized_name": "git", "category": "Version Control"},
        {"name": "AWS", "normalized_name": "aws", "category": "Cloud"},
        {"name": "Machine Learning", "normalized_name": "machine learning", "category": "AI/ML"},
        {"name": "Data Analysis", "normalized_name": "data analysis", "category": "Data"},
        {"name": "Project Management", "normalized_name": "project management", "category": "Soft Skills"},
        {"name": "Communication", "normalized_name": "communication", "category": "Soft Skills"},
    ]
    
    for skill_data in skills_data:
        skill = Skill(**skill_data)
        session.add(skill)
    
    await session.commit()
    print(f"Seeded {len(skills_data)} skills")


async def seed_companies(session: AsyncSession):
    """Seed initial companies data."""
    companies_data = [
        {
            "name": "TechCorp Inc.",
            "normalized_name": "techcorp inc",
            "website": "https://techcorp.example.com",
            "industry": "Technology",
            "location": "San Francisco, CA"
        },
        {
            "name": "DataFlow Systems",
            "normalized_name": "dataflow systems",
            "website": "https://dataflow.example.com",
            "industry": "Data Analytics",
            "location": "New York, NY"
        },
        {
            "name": "CloudScale Solutions",
            "normalized_name": "cloudscale solutions",
            "website": "https://cloudscale.example.com",
            "industry": "Cloud Computing",
            "location": "Austin, TX"
        },
    ]
    
    for company_data in companies_data:
        company = Company(**company_data)
        session.add(company)
    
    await session.commit()
    print(f"Seeded {len(companies_data)} companies")


async def seed_jobs(session: AsyncSession):
    """Seed initial jobs data."""
    # First get companies to reference
    from sqlalchemy import select
    result = await session.execute(select(Company))
    companies = result.scalars().all()
    
    if not companies:
        print("No companies found, skipping job seeding")
        return
    
    jobs_data = [
        {
            "company_id": companies[0].id,
            "title": "Senior Python Developer",
            "normalized_title": "senior python developer",
            "description": "We are looking for an experienced Python developer to join our team.",
            "location": "San Francisco, CA",
            "employment_type": "Full-time",
            "experience_level": "Senior",
            "salary_min": 120000,
            "salary_max": 180000,
            "salary_currency": "USD",
            "remote_type": "Hybrid",
            "source": "internal",
            "posted_at": datetime.utcnow() - timedelta(days=5),
            "expires_at": datetime.utcnow() + timedelta(days=30),
        },
        {
            "company_id": companies[0].id,
            "title": "Frontend Developer",
            "normalized_title": "frontend developer",
            "description": "Join our frontend team to build amazing user experiences.",
            "location": "San Francisco, CA",
            "employment_type": "Full-time",
            "experience_level": "Mid",
            "salary_min": 100000,
            "salary_max": 140000,
            "salary_currency": "USD",
            "remote_type": "Remote",
            "source": "internal",
            "posted_at": datetime.utcnow() - timedelta(days=3),
            "expires_at": datetime.utcnow() + timedelta(days=30),
        },
        {
            "company_id": companies[1].id,
            "title": "Data Engineer",
            "normalized_title": "data engineer",
            "description": "Build and maintain our data pipelines and infrastructure.",
            "location": "New York, NY",
            "employment_type": "Full-time",
            "experience_level": "Senior",
            "salary_min": 130000,
            "salary_max": 170000,
            "salary_currency": "USD",
            "remote_type": "On-site",
            "source": "internal",
            "posted_at": datetime.utcnow() - timedelta(days=7),
            "expires_at": datetime.utcnow() + timedelta(days=30),
        },
        {
            "company_id": companies[2].id,
            "title": "DevOps Engineer",
            "normalized_title": "devops engineer",
            "description": "Help us scale our cloud infrastructure.",
            "location": "Austin, TX",
            "employment_type": "Full-time",
            "experience_level": "Mid",
            "salary_min": 110000,
            "salary_max": 150000,
            "salary_currency": "USD",
            "remote_type": "Hybrid",
            "source": "internal",
            "posted_at": datetime.utcnow() - timedelta(days=2),
            "expires_at": datetime.utcnow() + timedelta(days=30),
        },
    ]
    
    for job_data in jobs_data:
        job = Job(**job_data)
        session.add(job)
    
    await session.commit()
    print(f"Seeded {len(jobs_data)} jobs")


async def main():
    """Main seed function."""
    print("Starting seed data insertion...")
    
    async with async_session_maker() as session:
        try:
            await seed_skills(session)
            await seed_companies(session)
            await seed_jobs(session)
            print("Seed data insertion completed successfully!")
        except Exception as e:
            print(f"Error during seed data insertion: {e}")
            await session.rollback()
            raise


if __name__ == "__main__":
    asyncio.run(main())
