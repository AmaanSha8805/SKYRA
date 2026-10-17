from pydantic import BaseModel, Field
from typing import Optional, List


class PersonalInfo(BaseModel):
    name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    location: Optional[str] = None
    linkedin: Optional[str] = None
    github: Optional[str] = None
    website: Optional[str] = None


class ExperienceItem(BaseModel):
    company: str = Field(..., min_length=1)
    title: str = Field(..., min_length=1)
    location: Optional[str] = None
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    is_current: bool = False
    description: Optional[str] = None
    achievements: List[str] = Field(default_factory=list)


class EducationItem(BaseModel):
    institution: str = Field(..., min_length=1)
    degree: str = Field(..., min_length=1)
    field_of_study: Optional[str] = None
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    grade: Optional[str] = None


class ProjectItem(BaseModel):
    name: str = Field(..., min_length=1)
    description: Optional[str] = None
    url: Optional[str] = None
    technologies: List[str] = Field(default_factory=list)


class CertificationItem(BaseModel):
    name: str = Field(..., min_length=1)
    issuer: str = Field(..., min_length=1)
    issue_date: Optional[str] = None
    expiry_date: Optional[str] = None
    credential_url: Optional[str] = None


class ParsedResumeData(BaseModel):
    personal_info: PersonalInfo = Field(default_factory=PersonalInfo)
    summary: Optional[str] = None
    skills: List[str] = Field(default_factory=list)
    experience: List[ExperienceItem] = Field(default_factory=list)
    education: List[EducationItem] = Field(default_factory=list)
    projects: List[ProjectItem] = Field(default_factory=list)
    certifications: List[CertificationItem] = Field(default_factory=list)
