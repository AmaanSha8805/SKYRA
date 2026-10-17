from fastapi import APIRouter
from app.api.v1 import health, auth, resume, jobs, interview, cover_letter, skill_gap, career_roadmap, pdf, applications, chat

api_router = APIRouter(prefix="/api/v1")

api_router.include_router(health.router, tags=["health"])
api_router.include_router(auth.router, tags=["auth"])
api_router.include_router(resume.router, tags=["resumes"])
api_router.include_router(jobs.router, tags=["jobs"])
api_router.include_router(interview.router, tags=["interview"])
api_router.include_router(cover_letter.router, tags=["cover-letter"])
api_router.include_router(skill_gap.router, tags=["skill-gap"])
api_router.include_router(career_roadmap.router, tags=["career-roadmap"])
api_router.include_router(pdf.router, tags=["pdf"])
api_router.include_router(applications.router, tags=["applications"])
api_router.include_router(chat.router, tags=["chat"])
