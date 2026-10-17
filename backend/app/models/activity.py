import uuid
from datetime import datetime
from sqlalchemy import String, ForeignKey, JSON, DateTime
from sqlalchemy.orm import Mapped, mapped_column
from app.db.base import Base


class Activity(Base):
    __tablename__ = "activities"

    id: Mapped[uuid.UUID] = mapped_column(
        String(36), primary_key=True, default=lambda: str(uuid.uuid4())
    )
    user_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )
    event_type: Mapped[str] = mapped_column(String(100), nullable=False)
    event_data: Mapped[dict | None] = mapped_column(JSON, nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        default=datetime.utcnow, nullable=False, index=True
    )

    def __repr__(self) -> str:
        return f"<Activity(id={self.id}, event_type={self.event_type})>"
