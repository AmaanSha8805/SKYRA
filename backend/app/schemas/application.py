from pydantic import BaseModel, Field
from datetime import datetime, date
from typing import Optional
from app.models.application_tracker import ApplicationStatus


class ApplicationBase(BaseModel):
    company_name: str = Field(..., min_length=1, max_length=255)
    job_title: str = Field(..., min_length=1, max_length=255)
    job_url: Optional[str] = Field(None, max_length=500)
    status: ApplicationStatus = Field(default=ApplicationStatus.SAVED)
    applied_date: Optional[date] = None
    notes: Optional[str] = None


class ApplicationCreate(ApplicationBase):
    pass


class ApplicationUpdate(BaseModel):
    status: Optional[ApplicationStatus] = None
    notes: Optional[str] = None


class ApplicationResponse(BaseModel):
    id: str
    user_id: str
    company_name: str
    job_title: str
    job_url: Optional[str]
    status: ApplicationStatus
    applied_date: Optional[date]
    notes: Optional[str]
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class ApplicationListResponse(BaseModel):
    applications: list[ApplicationResponse]
    total: int
