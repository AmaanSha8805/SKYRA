import uuid
from datetime import datetime
from sqlalchemy import String, Integer, ForeignKey, Text, JSON, DateTime
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base import Base


class Interview(Base):
    __tablename__ = "interviews"

    id: Mapped[uuid.UUID] = mapped_column(
        String(36), primary_key=True, default=lambda: str(uuid.uuid4())
    )
    user_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False
    )
    job_id: Mapped[str | None] = mapped_column(
        String(36), ForeignKey("jobs.id", ondelete="SET NULL"), nullable=True
    )
    resume_version_id: Mapped[str | None] = mapped_column(
        String(36), ForeignKey("resume_versions.id", ondelete="SET NULL"), nullable=True
    )
    interview_type: Mapped[str] = mapped_column(String(50), nullable=False)
    difficulty: Mapped[str] = mapped_column(String(50), nullable=False)
    status: Mapped[str] = mapped_column(String(50), nullable=False)
    score: Mapped[int | None] = mapped_column(Integer, nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        default=datetime.utcnow, nullable=False
    )
    completed_at: Mapped[datetime | None] = mapped_column(nullable=True)

    questions = relationship("InterviewQuestion", backref="interview", cascade="all, delete-orphan")

    def __repr__(self) -> str:
        return f"<Interview(id={self.id}, type={self.interview_type})>"


class InterviewQuestion(Base):
    __tablename__ = "interview_questions"

    id: Mapped[uuid.UUID] = mapped_column(
        String(36), primary_key=True, default=lambda: str(uuid.uuid4())
    )
    interview_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("interviews.id", ondelete="CASCADE"), nullable=False
    )
    question: Mapped[str] = mapped_column(Text, nullable=False)
    category: Mapped[str] = mapped_column(String(100), nullable=False)
    difficulty: Mapped[str] = mapped_column(String(50), nullable=False)
    order_index: Mapped[int] = mapped_column(Integer, nullable=False)

    answers = relationship("InterviewAnswer", backref="question", cascade="all, delete-orphan")

    def __repr__(self) -> str:
        return f"<InterviewQuestion(id={self.id}, category={self.category})>"


class InterviewAnswer(Base):
    __tablename__ = "interview_answers"

    id: Mapped[uuid.UUID] = mapped_column(
        String(36), primary_key=True, default=lambda: str(uuid.uuid4())
    )
    question_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("interview_questions.id", ondelete="CASCADE"), nullable=False
    )
    answer: Mapped[str] = mapped_column(Text, nullable=False)
    score: Mapped[int | None] = mapped_column(Integer, nullable=True)
    feedback: Mapped[str | None] = mapped_column(Text, nullable=True)
    strengths: Mapped[list | None] = mapped_column(JSON, nullable=True)
    weaknesses: Mapped[list | None] = mapped_column(JSON, nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        default=datetime.utcnow, nullable=False
    )

    def __repr__(self) -> str:
        return f"<InterviewAnswer(id={self.id}, score={self.score})>"
