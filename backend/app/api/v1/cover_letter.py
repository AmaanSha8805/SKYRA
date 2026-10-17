from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
import asyncio
from app.api.dependencies import get_db, get_current_user
from app.models.user import User
from app.models.resume import Resume, ResumeVersion
from app.schemas.cover_letter import CoverLetterGenerateRequest, CoverLetterResponse
from app.services.ai_cover_letter import cover_letter_service
from app.services.email_service import email_service

router = APIRouter(prefix="/cover-letter", tags=["cover-letter"])


@router.post("/generate", response_model=CoverLetterResponse, status_code=status.HTTP_200_OK)
async def generate_cover_letter(
    request: CoverLetterGenerateRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Generate a professional cover letter based on resume and job details"""
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
            detail="Resume must be parsed before generating a cover letter. Please parse the resume first."
        )
    
    # Generate cover letter with AI
    try:
        cover_letter_data = await cover_letter_service.generate_cover_letter(
            parsed_data=latest_version.parsed_data,
            job_title=request.job_title,
            company_name=request.company_name,
            job_description=request.job_description
        )
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=f"AI cover letter service unavailable: {str(e)}"
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate cover letter: {str(e)}"
        )
    
    # Send cover letter email in background
    email_content = email_service.cover_letter_email(
        current_user.full_name,
        request.company_name,
        request.job_title
    )
    asyncio.create_task(
        email_service.send_email(
            to_email=current_user.email,
            subject="Your Cover Letter is Ready",
            html_content=email_content
        )
    )
    
    return CoverLetterResponse(
        cover_letter=cover_letter_data["cover_letter"],
        word_count=cover_letter_data["word_count"]
    )
