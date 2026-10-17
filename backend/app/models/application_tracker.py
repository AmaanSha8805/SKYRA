import uuid
from datetime import datetime
from enum import Enum
from sqlalchemy import String, Text, ForeignKey, DateTime, Date
from sqlalchemy.orm import Mapped, mapped_column
from app.db.base import Base


class ApplicationStatus(str, Enum):
    SAVED = "SAVED"
    APPLIED = "APPLIED"
    INTERVIEW = "INTERVIEW"
    OFFER = "OFFER"
    REJECTED = "REJECTED"


class Application(Base):
    __tablename__ = "applications"

    id: Mapped[str] = mapped_column(
        String(36), primary_key=True, default=lambda: str(uuid.uuid4())
    )
    user_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )
    company_name: Mapped[str] = mapped_column(String(255), nullable=False)
    job_title: Mapped[str] = mapped_column(String(255), nullable=False)
    job_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    status: Mapped[ApplicationStatus] = mapped_column(String(50), nullable=False, default=ApplicationStatus.SAVED)
    applied_date: Mapped[datetime | None] = mapped_column(Date, nullable=True)
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow, nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False
    )

    def __repr__(self) -> str:
        return f"<Application(id={self.id}, company={self.company_name}, status={self.status})>"
