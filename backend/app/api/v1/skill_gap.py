from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
import asyncio
from app.api.dependencies import get_db, get_current_user
from app.models.user import User
from app.models.resume import Resume, ResumeVersion
from app.schemas.skill_gap import SkillGapAnalyzeRequest, SkillGapResponse
from app.services.ai_skill_gap import skill_gap_service
from app.services.email_service import email_service

router = APIRouter(prefix="/skill-gap", tags=["skill-gap"])


@router.post("/analyze", response_model=SkillGapResponse, status_code=status.HTTP_200_OK)
async def analyze_skill_gap(
    request: SkillGapAnalyzeRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Analyze skill gaps between current resume skills and target role requirements"""
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
            detail="Resume must be parsed before analyzing skill gaps. Please parse the resume first."
        )
    
    # Analyze skill gap with AI
    try:
        skill_gap_data = await skill_gap_service.analyze_skill_gap(
            parsed_data=latest_version.parsed_data,
            target_role=request.target_role
        )
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=f"AI skill gap service unavailable: {str(e)}"
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to analyze skill gap: {str(e)}"
        )
    
    # Send skill gap email in background
    email_content = email_service.skill_gap_email(
        current_user.full_name,
        request.target_role,
        skill_gap_data["overall_readiness_percentage"]
    )
    asyncio.create_task(
        email_service.send_email(
            to_email=current_user.email,
            subject="Your Skill Gap Analysis",
            html_content=email_content
        )
    )
    
    return SkillGapResponse(
        current_skills=skill_gap_data["current_skills"],
        required_skills=skill_gap_data["required_skills"],
        missing_skills=skill_gap_data["missing_skills"],
        strong_skills=skill_gap_data["strong_skills"],
        overall_readiness_percentage=skill_gap_data["overall_readiness_percentage"]
    )
