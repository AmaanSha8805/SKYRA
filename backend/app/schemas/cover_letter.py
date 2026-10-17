from pydantic import BaseModel, Field
from typing import Optional


class CoverLetterGenerateRequest(BaseModel):
    resume_id: str
    job_title: str = Field(..., min_length=1, max_length=255)
    company_name: str = Field(..., min_length=1, max_length=255)
    job_description: Optional[str] = Field(None, max_length=5000)


class CoverLetterResponse(BaseModel):
    cover_letter: str
    word_count: int
