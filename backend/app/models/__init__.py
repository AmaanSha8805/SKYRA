# Models package
# Direct imports to ensure proper SQLAlchemy mapper initialization
# Import order matters for relationships

from app.models.user import User
from app.models.profile import Profile
from app.models.skill import Skill, ResumeSkill, JobSkill
from app.models.resume import Resume, ResumeVersion, Experience, Education, Project, Certification
from app.models.company import Company, Job
from app.models.application import JobApplication
from app.models.application_tracker import Application
from app.models.analysis import ResumeAnalysis, JobMatch, SkillGap
from app.models.career import CareerRoadmap, CoverLetter
from app.models.interview import Interview, InterviewQuestion, InterviewAnswer
from app.models.notification import Notification
from app.models.activity import Activity

__all__ = [
    "User",
    "Profile",
    "Resume",
    "ResumeVersion",
    "Experience",
    "Education",
    "Project",
    "Certification",
    "Skill",
    "ResumeSkill",
    "JobSkill",
    "Company",
    "Job",
    "JobApplication",
    "Application",
    "ResumeAnalysis",
    "JobMatch",
    "SkillGap",
    "CareerRoadmap",
    "CoverLetter",
    "Interview",
    "InterviewQuestion",
    "InterviewAnswer",
    "Notification",
    "Activity",
]

# Function for Alembic metadata discovery
def _import_models():
    """Return all models for Alembic metadata discovery."""
    return {
        "User": User,
        "Profile": Profile,
        "Resume": Resume,
        "ResumeVersion": ResumeVersion,
        "Experience": Experience,
        "Education": Education,
        "Project": Project,
        "Certification": Certification,
        "Skill": Skill,
        "ResumeSkill": ResumeSkill,
        "JobSkill": JobSkill,
        "Company": Company,
        "Job": Job,
        "JobApplication": JobApplication,
        "Application": Application,
        "ResumeAnalysis": ResumeAnalysis,
        "JobMatch": JobMatch,
        "SkillGap": SkillGap,
        "CareerRoadmap": CareerRoadmap,
        "CoverLetter": CoverLetter,
        "Interview": Interview,
        "InterviewQuestion": InterviewQuestion,
        "InterviewAnswer": InterviewAnswer,
        "Notification": Notification,
        "Activity": Activity,
    }

