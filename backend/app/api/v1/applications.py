from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, delete, func
from typing import Optional
from app.api.dependencies import get_db, get_current_user
from app.models.user import User
from app.models.application_tracker import Application, ApplicationStatus
from app.schemas.application import ApplicationCreate, ApplicationUpdate, ApplicationResponse, ApplicationListResponse
from datetime import datetime

router = APIRouter(prefix="/applications", tags=["applications"])


@router.post("", response_model=ApplicationResponse, status_code=status.HTTP_201_CREATED)
async def create_application(
    application_data: ApplicationCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Create a new job application"""
    try:
        application = Application(
            user_id=str(current_user.id),
            company_name=application_data.company_name,
            job_title=application_data.job_title,
            job_url=application_data.job_url,
            status=application_data.status,
            applied_date=application_data.applied_date,
            notes=application_data.notes
        )
        
        db.add(application)
        await db.commit()
        await db.refresh(application)
        
        return application
    except Exception as e:
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create application: {str(e)}"
        )


@router.get("", response_model=ApplicationListResponse)
async def list_applications(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """List all applications for the current user"""
    
    try:
        # Get total count
        count_query = select(func.count()).select_from(Application).where(
            Application.user_id == str(current_user.id)
        )
        total_result = await db.execute(count_query)
        total = total_result.scalar()
        
        # Get applications
        query = select(Application).where(
            Application.user_id == str(current_user.id)
        ).order_by(Application.created_at.desc())
        
        result = await db.execute(query)
        applications = result.scalars().all()
        
        return ApplicationListResponse(
            applications=applications,
            total=total
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to list applications: {str(e)}"
        )


@router.put("/{application_id}", response_model=ApplicationResponse)
async def update_application(
    application_id: str,
    application_update: ApplicationUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Update application status or notes"""
    try:
        # Get application
        query = select(Application).where(
            Application.id == application_id,
            Application.user_id == str(current_user.id)
        )
        result = await db.execute(query)
        application = result.scalar_one_or_none()
        
        if not application:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Application not found"
            )
        
        # Update fields
        if application_update.status is not None:
            application.status = application_update.status
        if application_update.notes is not None:
            application.notes = application_update.notes
        
        application.updated_at = datetime.utcnow()
        
        await db.commit()
        await db.refresh(application)
        
        return application
    except HTTPException:
        raise
    except Exception as e:
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update application: {str(e)}"
        )


@router.delete("/{application_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_application(
    application_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Delete an application"""
    try:
        # Check if application exists and belongs to user
        query = select(Application).where(
            Application.id == application_id,
            Application.user_id == str(current_user.id)
        )
        result = await db.execute(query)
        application = result.scalar_one_or_none()
        
        if not application:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Application not found"
            )
        
        # Delete application
        delete_query = delete(Application).where(
            Application.id == application_id,
            Application.user_id == str(current_user.id)
        )
        await db.execute(delete_query)
        await db.commit()
        
        return None
    except HTTPException:
        raise
    except Exception as e:
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to delete application: {str(e)}"
        )
