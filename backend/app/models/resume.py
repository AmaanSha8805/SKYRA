import uuid
from datetime import datetime
from sqlalchemy import String, Integer, Boolean, ForeignKey, Text, JSON, DateTime
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base import Base


class Resume(Base):
    __tablename__ = "resumes"

    id: Mapped[uuid.UUID] = mapped_column(
        String(36), primary_key=True, default=lambda: str(uuid.uuid4())
    )
    user_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    original_filename: Mapped[str] = mapped_column(String(500), nullable=False)
    file_url: Mapped[str] = mapped_column(String(1000), nullable=False)
    file_type: Mapped[str] = mapped_column(String(50), nullable=False)
    file_size: Mapped[int] = mapped_column(Integer, nullable=False)
    template_id: Mapped[str] = mapped_column(String(50), nullable=True, default="classic")
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        default=datetime.utcnow, nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False
    )

    user = relationship("User", backref="resumes")
    versions = relationship("ResumeVersion", backref="resume", cascade="all, delete-orphan")

    def __repr__(self) -> str:
        return f"<Resume(id={self.id}, title={self.title})>"


class ResumeVersion(Base):
    __tablename__ = "resume_versions"

    id: Mapped[uuid.UUID] = mapped_column(
        String(36), primary_key=True, default=lambda: str(uuid.uuid4())
    )
    resume_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("resumes.id", ondelete="CASCADE"), nullable=False, index=True
    )
    version_number: Mapped[int] = mapped_column(Integer, nullable=False)
    source: Mapped[str] = mapped_column(String(50), nullable=False)
    raw_text: Mapped[str | None] = mapped_column(Text, nullable=True)
    parsed_data: Mapped[dict | None] = mapped_column(JSON, nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        default=datetime.utcnow, nullable=False
    )

    experiences = relationship("Experience", backref="resume_version", cascade="all, delete-orphan")
    educations = relationship("Education", backref="resume_version", cascade="all, delete-orphan")
    projects = relationship("Project", backref="resume_version", cascade="all, delete-orphan")
    certifications = relationship("Certification", backref="resume_version", cascade="all, delete-orphan")
    # resume_skills relationship removed to avoid circular import issues
    # Can be added back when needed with proper import ordering

    def __repr__(self) -> str:
        return f"<ResumeVersion(id={self.id}, version_number={self.version_number})>"


class Experience(Base):
    __tablename__ = "experiences"

    id: Mapped[uuid.UUID] = mapped_column(
        String(36), primary_key=True, default=lambda: str(uuid.uuid4())
    )
    resume_version_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("resume_versions.id", ondelete="CASCADE"), nullable=False
    )
    company_name: Mapped[str] = mapped_column(String(255), nullable=False)
    job_title: Mapped[str] = mapped_column(String(255), nullable=False)
    location: Mapped[str | None] = mapped_column(String(255), nullable=True)
    start_date: Mapped[datetime | None] = mapped_column(nullable=True)
    end_date: Mapped[datetime | None] = mapped_column(nullable=True)
    is_current: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    achievements: Mapped[list | None] = mapped_column(JSON, nullable=True)

    def __repr__(self) -> str:
        return f"<Experience(id={self.id}, company={self.company_name})>"


class Education(Base):
    __tablename__ = "educations"

    id: Mapped[uuid.UUID] = mapped_column(
        String(36), primary_key=True, default=lambda: str(uuid.uuid4())
    )
    resume_version_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("resume_versions.id", ondelete="CASCADE"), nullable=False
    )
    institution: Mapped[str] = mapped_column(String(255), nullable=False)
    degree: Mapped[str] = mapped_column(String(255), nullable=False)
    field_of_study: Mapped[str | None] = mapped_column(String(255), nullable=True)
    start_date: Mapped[datetime | None] = mapped_column(nullable=True)
    end_date: Mapped[datetime | None] = mapped_column(nullable=True)
    grade: Mapped[str | None] = mapped_column(String(50), nullable=True)

    def __repr__(self) -> str:
        return f"<Education(id={self.id}, institution={self.institution})>"


class Project(Base):
    __tablename__ = "projects"

    id: Mapped[uuid.UUID] = mapped_column(
        String(36), primary_key=True, default=lambda: str(uuid.uuid4())
    )
    resume_version_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("resume_versions.id", ondelete="CASCADE"), nullable=False
    )
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    url: Mapped[str | None] = mapped_column(String(1000), nullable=True)
    technologies: Mapped[list | None] = mapped_column(JSON, nullable=True)

    def __repr__(self) -> str:
        return f"<Project(id={self.id}, name={self.name})>"


class Certification(Base):
    __tablename__ = "certifications"

    id: Mapped[uuid.UUID] = mapped_column(
        String(36), primary_key=True, default=lambda: str(uuid.uuid4())
    )
    resume_version_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("resume_versions.id", ondelete="CASCADE"), nullable=False
    )
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    issuer: Mapped[str] = mapped_column(String(255), nullable=False)
    issue_date: Mapped[datetime | None] = mapped_column(nullable=True)
    expiry_date: Mapped[datetime | None] = mapped_column(nullable=True)
    credential_url: Mapped[str | None] = mapped_column(String(1000), nullable=True)

    def __repr__(self) -> str:
        return f"<Certification(id={self.id}, name={self.name})>"
