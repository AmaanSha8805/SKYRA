from pydantic import BaseModel


class JobMatchRequest(BaseModel):
    resume_id: str


class ApplyLinks(BaseModel):
    linkedin: str
    naukri: str
    indeed: str


class MatchedJob(BaseModel):
    rank: int
    job_title: str
    company_type: str
    match_percentage: int
    matched_skills: list[str]
    missing_skills: list[str]
    reason: str
    salary_range: str
    location_type: str
    apply_links: ApplyLinks


class JobMatchResponse(BaseModel):
    matched_jobs: list[MatchedJob]