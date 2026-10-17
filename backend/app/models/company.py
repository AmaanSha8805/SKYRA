import uuid
from datetime import datetime
from sqlalchemy import String, Text, Integer, ForeignKey, Boolean
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base import Base


class Company(Base):
    __tablename__ = "companies"

    id: Mapped[uuid.UUID] = mapped_column(
        String(36), primary_key=True, default=lambda: str(uuid.uuid4())
    )
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    normalized_name: Mapped[str] = mapped_column(String(255), unique=True, nullable=False, index=True)
    website: Mapped[str | None] = mapped_column(String(500), nullable=True)
    logo_url: Mapped[str | None] = mapped_column(String(1000), nullable=True)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    industry: Mapped[str | None] = mapped_column(String(100), nullable=True)
    location: Mapped[str | None] = mapped_column(String(255), nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        default=datetime.utcnow, nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False
    )

    jobs = relationship("Job", backref="company", cascade="all, delete-orphan")

    def __repr__(self) -> str:
        return f"<Company(id={self.id}, name={self.name})>"


class Job(Base):
    __tablename__ = "jobs"

    id: Mapped[uuid.UUID] = mapped_column(
        String(36), primary_key=True, default=lambda: str(uuid.uuid4())
    )
    company_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("companies.id", ondelete="CASCADE"), nullable=False, index=True
    )
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    normalized_title: Mapped[str] = mapped_column(String(255), nullable=False, index=True)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    location: Mapped[str] = mapped_column(String(255), nullable=False)
    employment_type: Mapped[str] = mapped_column(String(50), nullable=False)
    experience_level: Mapped[str] = mapped_column(String(50), nullable=False)
    salary_min: Mapped[int | None] = mapped_column(nullable=True)
    salary_max: Mapped[int | None] = mapped_column(nullable=True)
    salary_currency: Mapped[str | None] = mapped_column(String(10), nullable=True)
    remote_type: Mapped[str] = mapped_column(String(50), nullable=False)
    source: Mapped[str] = mapped_column(String(50), nullable=False)
    external_url: Mapped[str | None] = mapped_column(String(1000), nullable=True)
    posted_at: Mapped[datetime] = mapped_column(nullable=False, index=True)
    expires_at: Mapped[datetime | None] = mapped_column(nullable=True)
    is_active: Mapped[bool] = mapped_column(default=True, nullable=False, index=True)
    created_at: Mapped[datetime] = mapped_column(
        default=datetime.utcnow, nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False
    )

    job_skills = relationship("JobSkill", backref="job", cascade="all, delete-orphan")
    applications = relationship("JobApplication", backref="job", cascade="all, delete-orphan")

    def __repr__(self) -> str:
        return f"<Job(id={self.id}, title={self.title})>"
