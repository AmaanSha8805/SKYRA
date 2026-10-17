from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
import asyncio
from app.api.dependencies import get_db, get_current_user
from app.models.user import User
from app.models.resume import Resume, ResumeVersion
from app.schemas.interview import (
    InterviewStartRequest, 
    InterviewStartResponse, 
    InterviewAnswerRequest, 
    InterviewAnswerResponse
)
from app.services.ai_interview_coach import interview_coach_service
from app.services.email_service import email_service

router = APIRouter(prefix="/interview", tags=["interview"])


@router.post("/start", response_model=InterviewStartResponse)
async def start_interview(
    request: InterviewStartRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Generate interview questions based on resume and job title"""
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
            detail="Resume must be parsed before interview. Please parse the resume first."
        )
    
    # Generate questions with AI
    try:
        questions_data = await interview_coach_service.generate_questions(
            latest_version.parsed_data,
            request.job_title,
            request.difficulty
        )
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=f"AI interview service unavailable: {str(e)}"
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate interview questions: {str(e)}"
        )
    
    return questions_data


@router.post("/answer", response_model=InterviewAnswerResponse)
async def evaluate_answer(
    request: InterviewAnswerRequest,
    current_user: User = Depends(get_current_user)
):
    """Evaluate user's selected answer and provide feedback"""
    # Evaluate answer with AI
    try:
        evaluation_data = await interview_coach_service.evaluate_answer(
            request.question,
            request.selected_option,
            request.correct_answer,
            request.explanation
        )
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=f"AI interview service unavailable: {str(e)}"
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to evaluate answer: {str(e)}"
        )
    
    # Send interview result email if this is the last question and all required fields are provided
    if (request.question_number and request.total_questions and 
        request.total_score is not None and request.job_title and
        request.question_number == request.total_questions):
        email_content = email_service.interview_result_email(
            current_user.full_name,
            request.total_score,
            request.job_title
        )
        asyncio.create_task(
            email_service.send_email(
                to_email=current_user.email,
                subject="Your Interview Results",
                html_content=email_content
            )
        )
    
    return {"evaluation": evaluation_data}