import uuid
from datetime import datetime
from sqlalchemy import String, Integer, ForeignKey, Text, JSON, CheckConstraint, DateTime
from sqlalchemy.orm import Mapped, mapped_column
from app.db.base import Base


class ResumeAnalysis(Base):
    __tablename__ = "resume_analyses"

    id: Mapped[uuid.UUID] = mapped_column(
        String(36), primary_key=True, default=lambda: str(uuid.uuid4())
    )
    resume_version_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("resume_versions.id", ondelete="CASCADE"), nullable=False
    )
    overall_score: Mapped[int] = mapped_column(Integer, nullable=False)
    ats_score: Mapped[int] = mapped_column(Integer, nullable=False)
    content_score: Mapped[int] = mapped_column(Integer, nullable=False)
    skills_score: Mapped[int] = mapped_column(Integer, nullable=False)
    experience_score: Mapped[int] = mapped_column(Integer, nullable=False)
    formatting_score: Mapped[int] = mapped_column(Integer, nullable=False)
    keyword_score: Mapped[int] = mapped_column(Integer, nullable=False)
    strengths: Mapped[list | None] = mapped_column(JSON, nullable=True)
    weaknesses: Mapped[list | None] = mapped_column(JSON, nullable=True)
    recommendations: Mapped[list | None] = mapped_column(JSON, nullable=True)
    missing_keywords: Mapped[list | None] = mapped_column(JSON, nullable=True)
    detected_skills: Mapped[list | None] = mapped_column(JSON, nullable=True)
    raw_result: Mapped[dict | None] = mapped_column(JSON, nullable=True)
    model_name: Mapped[str] = mapped_column(String(100), nullable=False)
    model_version: Mapped[str] = mapped_column(String(50), nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        default=datetime.utcnow, nullable=False
    )

    __table_args__ = (
        CheckConstraint('overall_score >= 0 AND overall_score <= 100', name='check_overall_score_range'),
        CheckConstraint('ats_score >= 0 AND ats_score <= 100', name='check_ats_score_range'),
        CheckConstraint('content_score >= 0 AND content_score <= 100', name='check_content_score_range'),
        CheckConstraint('skills_score >= 0 AND skills_score <= 100', name='check_skills_score_range'),
        CheckConstraint('experience_score >= 0 AND experience_score <= 100', name='check_experience_score_range'),
        CheckConstraint('formatting_score >= 0 AND formatting_score <= 100', name='check_formatting_score_range'),
        CheckConstraint('keyword_score >= 0 AND keyword_score <= 100', name='check_keyword_score_range'),
    )

    def __repr__(self) -> str:
        return f"<ResumeAnalysis(id={self.id}, overall_score={self.overall_score})>"


class JobMatch(Base):
    __tablename__ = "job_matches"

    id: Mapped[uuid.UUID] = mapped_column(
        String(36), primary_key=True, default=lambda: str(uuid.uuid4())
    )
    user_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )
    resume_version_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("resume_versions.id", ondelete="CASCADE"), nullable=False
    )
    job_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("jobs.id", ondelete="CASCADE"), nullable=False, index=True
    )
    overall_score: Mapped[int] = mapped_column(Integer, nullable=False)
    skills_score: Mapped[int] = mapped_column(Integer, nullable=False)
    experience_score: Mapped[int] = mapped_column(Integer, nullable=False)
    education_score: Mapped[int] = mapped_column(Integer, nullable=False)
    keyword_score: Mapped[int] = mapped_column(Integer, nullable=False)
    matched_skills: Mapped[list | None] = mapped_column(JSON, nullable=True)
    missing_skills: Mapped[list | None] = mapped_column(JSON, nullable=True)
    recommendations: Mapped[list | None] = mapped_column(JSON, nullable=True)
    model_name: Mapped[str] = mapped_column(String(100), nullable=False)
    model_version: Mapped[str] = mapped_column(String(50), nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        default=datetime.utcnow, nullable=False
    )

    __table_args__ = (
        CheckConstraint('overall_score >= 0 AND overall_score <= 100', name='check_job_match_overall_score'),
        CheckConstraint('skills_score >= 0 AND skills_score <= 100', name='check_job_match_skills_score'),
        CheckConstraint('experience_score >= 0 AND experience_score <= 100', name='check_job_match_experience_score'),
        CheckConstraint('education_score >= 0 AND education_score <= 100', name='check_job_match_education_score'),
        CheckConstraint('keyword_score >= 0 AND keyword_score <= 100', name='check_job_match_keyword_score'),
    )

    def __repr__(self) -> str:
        return f"<JobMatch(id={self.id}, overall_score={self.overall_score})>"


class SkillGap(Base):
    __tablename__ = "skill_gaps"

    id: Mapped[uuid.UUID] = mapped_column(
        String(36), primary_key=True, default=lambda: str(uuid.uuid4())
    )
    user_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False
    )
    skill_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("skills.id", ondelete="CASCADE"), nullable=False
    )
    current_level: Mapped[int] = mapped_column(Integer, nullable=False)
    target_level: Mapped[int] = mapped_column(Integer, nullable=False)
    priority: Mapped[str] = mapped_column(String(50), nullable=False)
    reason: Mapped[str | None] = mapped_column(Text, nullable=True)
    status: Mapped[str] = mapped_column(String(50), nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        default=datetime.utcnow, nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False
    )

    def __repr__(self) -> str:
        return f"<SkillGap(id={self.id}, user_id={self.user_id})>"
