from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from pydantic import BaseModel
import asyncio
from app.api.dependencies import get_db, get_current_user
from app.models.user import User
from app.models.resume import Resume, ResumeVersion
from app.schemas.jobs import JobMatchResponse, JobMatchRequest
from app.services.ai_job_matcher import job_matcher_service
from app.services.email_service import email_service

router = APIRouter(prefix="/jobs", tags=["jobs"])


@router.post("/match", response_model=JobMatchResponse)
async def match_jobs(
    request: JobMatchRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Match resume with top 10 job roles using AI"""
    # Verify resume ownership
    result = await db.execute(
        select(Resume).where(
            Resume.id == request.resume_id,
            Resume.user_id == str(current_user.id)
        )
    )
    resume = result.scalar_one_or_none()
    
    if not resume:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Resume not found"
        )
    
    # Get latest resume version with parsed data
    version_result = await db.execute(
        select(ResumeVersion)
        .where(ResumeVersion.resume_id == request.resume_id)
        .order_by(ResumeVersion.version_number.desc())
        .limit(1)
    )
    latest_version = version_result.scalar_one_or_none()
    
    if not latest_version:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Resume version not found"
        )
    
    if not latest_version.parsed_data:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Resume must be parsed before job matching. Please parse the resume first."
        )
    
    # Match jobs with AI
    try:
        match_data = await job_matcher_service.match_jobs(latest_version.parsed_data)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=f"AI job matching service unavailable: {str(e)}"
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to match jobs: {str(e)}"
        )
    
    # Send job match email in background
    if match_data.get("matches") and len(match_data["matches"]) > 0:
        top_match = match_data["matches"][0]
        top_job = top_match.get("job_title", "Unknown")
        match_percentage = top_match.get("match_percentage", 0)
        email_content = email_service.job_match_email(current_user.full_name, top_job, match_percentage)
        asyncio.create_task(
            email_service.send_email(
                to_email=current_user.email,
                subject="Your AI Job Match Results",
                html_content=email_content
            )
        )
    
    return match_data