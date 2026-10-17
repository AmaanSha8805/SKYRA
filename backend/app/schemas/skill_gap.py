from pydantic import BaseModel, Field
from typing import Optional, List


class SkillGapAnalyzeRequest(BaseModel):
    resume_id: str
    target_role: str = Field(..., min_length=1, max_length=255)


class LearningResource(BaseModel):
    title: str
    url: Optional[str] = None
    description: Optional[str] = None


class MissingSkill(BaseModel):
    skill: str
    priority: str = Field(..., pattern="^(high|medium|low)$")
    reason: str
    learning_resources: List[LearningResource]


class SkillGapResponse(BaseModel):
    current_skills: List[str]
    required_skills: List[str]
    missing_skills: List[MissingSkill]
    strong_skills: List[str]
    overall_readiness_percentage: int
