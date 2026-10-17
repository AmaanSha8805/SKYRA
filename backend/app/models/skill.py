import uuid
from datetime import datetime
from sqlalchemy import String, Integer, ForeignKey, Boolean, DateTime
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base import Base


class Skill(Base):
    __tablename__ = "skills"

    id: Mapped[uuid.UUID] = mapped_column(
        String(36), primary_key=True, default=lambda: str(uuid.uuid4())
    )
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    normalized_name: Mapped[str] = mapped_column(String(255), unique=True, nullable=False, index=True)
    category: Mapped[str | None] = mapped_column(String(100), nullable=True)

    resume_skills = relationship("ResumeSkill", backref="skill", cascade="all, delete-orphan")
    job_skills = relationship("JobSkill", backref="skill", cascade="all, delete-orphan")

    def __repr__(self) -> str:
        return f"<Skill(id={self.id}, name={self.name})>"


class ResumeSkill(Base):
    __tablename__ = "resume_skills"

    id: Mapped[uuid.UUID] = mapped_column(
        String(36), primary_key=True, default=lambda: str(uuid.uuid4())
    )
    resume_version_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("resume_versions.id", ondelete="CASCADE"), nullable=False
    )
    skill_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("skills.id", ondelete="CASCADE"), nullable=False
    )
    proficiency: Mapped[str | None] = mapped_column(String(50), nullable=True)
    years_of_experience: Mapped[int | None] = mapped_column(Integer, nullable=True)
    source: Mapped[str | None] = mapped_column(String(100), nullable=True)

    def __repr__(self) -> str:
        return f"<ResumeSkill(id={self.id}, resume_version_id={self.resume_version_id})>"


class JobSkill(Base):
    __tablename__ = "job_skills"

    id: Mapped[uuid.UUID] = mapped_column(
        String(36), primary_key=True, default=lambda: str(uuid.uuid4())
    )
    job_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("jobs.id", ondelete="CASCADE"), nullable=False
    )
    skill_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("skills.id", ondelete="CASCADE"), nullable=False
    )
    is_required: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    importance: Mapped[int | None] = mapped_column(Integer, nullable=True)

    def __repr__(self) -> str:
        return f"<JobSkill(id={self.id}, job_id={self.job_id})>"
