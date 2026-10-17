from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional, List, Dict, Any
from uuid import UUID
from enum import Enum


class ResumeTemplate(str, Enum):
    """ATS-friendly resume template options"""
    CLASSIC = "classic"
    MODERN = "modern"
    MINIMAL = "minimal"
    PROFESSIONAL = "professional"


class TemplateInfo(BaseModel):
    """Template information for UI display"""
    id: str
    name: str
    description: str
    preview_url: Optional[str] = None
    features: List[str]


class ResumeBase(BaseModel):
    title: str = Field(..., min_length=1, max_length=255)


class ResumeCreate(ResumeBase):
    pass


class ResumeAnalysisSummary(BaseModel):
    id: str
    overall_score: int
    ats_score: int
    created_at: datetime
    
    class Config:
        from_attributes = True


class ResumeResponse(BaseModel):
    id: str
    user_id: str
    title: str
    original_filename: str
    file_url: str
    file_type: str
    file_size: int
    template_id: Optional[str] = "classic"
    is_active: bool
    created_at: datetime
    updated_at: datetime
    latest_analysis: Optional[ResumeAnalysisSummary] = None
    
    class Config:
        from_attributes = True


class ResumeListResponse(BaseModel):
    resumes: List[ResumeResponse]
    total: int


class ResumeVersionResponse(BaseModel):
    id: str
    resume_id: str
    version_number: int
    source: str
    raw_text: Optional[str] = None
    created_at: datetime
    
    class Config:
        from_attributes = True


class ResumeDetailResponse(BaseModel):
    resume: ResumeResponse
    latest_version: Optional[ResumeVersionResponse] = None
    latest_analysis: Optional[ResumeAnalysisSummary] = None
