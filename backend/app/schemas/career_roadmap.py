from pydantic import BaseModel, Field
from typing import Optional, List


class CareerRoadmapPhase(BaseModel):
    phase_number: int
    title: str
    duration: str
    goals: List[str]
    skills_to_learn: List[str]
    milestones: List[str]


class CareerRoadmapGenerateRequest(BaseModel):
    resume_id: str
    target_role: str = Field(..., min_length=1, max_length=255)
    timeline_months: int = Field(..., ge=6, le=24)


class CareerRoadmapResponse(BaseModel):
    target_role: str
    timeline_months: int
    phases: List[CareerRoadmapPhase]
    overall_strategy: str
