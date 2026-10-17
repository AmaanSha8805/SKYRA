from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional, List


class ResumeAnalysisResponse(BaseModel):
    id: str
    resume_version_id: str
    overall_score: int = Field(..., ge=0, le=100)
    ats_score: int = Field(..., ge=0, le=100)
    content_score: int = Field(..., ge=0, le=100)
    skills_score: int = Field(..., ge=0, le=100)
    experience_score: int = Field(..., ge=0, le=100)
    formatting_score: int = Field(..., ge=0, le=100)
    keyword_score: int = Field(..., ge=0, le=100)
    strengths: Optional[List[str]] = None
    weaknesses: Optional[List[str]] = None
    recommendations: Optional[List[str]] = None
    missing_keywords: Optional[List[str]] = None
    detected_skills: Optional[List[str]] = None
    model_name: str
    model_version: str
    created_at: datetime
    
    class Config:
        from_attributes = True
