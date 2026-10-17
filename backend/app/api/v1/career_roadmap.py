from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
import asyncio
from app.api.dependencies import get_db, get_current_user
from app.models.user import User
from app.models.resume import Resume, ResumeVersion
from app.schemas.career_roadmap import CareerRoadmapGenerateRequest, CareerRoadmapResponse
from app.services.ai_career_roadmap import career_roadmap_service
from app.services.email_service import email_service

router = APIRouter(prefix="/career-roadmap", tags=["career-roadmap"])


@router.post("/generate", response_model=CareerRoadmapResponse, status_code=status.HTTP_200_OK)
async def generate_career_roadmap(
    request: CareerRoadmapGenerateRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Generate a personalized career roadmap based on resume and target role"""
    # Verify resume ownership
    result = await db.execute(
        select(Resume)
        .where(Resume.id == request.resume_id, Resume.user_id == str(current_user.id))
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
            detail="Resume must be parsed before generating career roadmap. Please parse the resume first."
        )
    
    # Generate career roadmap with AI
    try:
        roadmap_data = await career_roadmap_service.generate_career_roadmap(
            parsed_data=latest_version.parsed_data,
            target_role=request.target_role,
            timeline_months=request.timeline_months
        )
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=f"AI career roadmap service unavailable: {str(e)}"
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate career roadmap: {str(e)}"
        )
    
    # Send career roadmap email in background
    email_content = email_service.career_roadmap_email(
        current_user.full_name,
        request.target_role
    )
    asyncio.create_task(
        email_service.send_email(
            to_email=current_user.email,
            subject="Your Career Roadmap is Ready",
            html_content=email_content
        )
    )
    
    return CareerRoadmapResponse(
        target_role=roadmap_data["target_role"],
        timeline_months=roadmap_data["timeline_months"],
        phases=roadmap_data["phases"],
        overall_strategy=roadmap_data["overall_strategy"]
    )
