import uuid
from datetime import date, datetime
from sqlalchemy import String, Integer, Date, DateTime, func
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database import Base

class User(Base):
    __tablename__ = "users"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    clerk_id: Mapped[str] = mapped_column(String(255), unique=True, nullable=False, index=True)
    email: Mapped[str] = mapped_column(String(255), unique=True, nullable=False)
    display_name: Mapped[str | None] = mapped_column(String(100), nullable=True)
    avatar_url: Mapped[str | None] = mapped_column(nullable=True)
    
    analyses_today: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    analyses_reset: Mapped[date] = mapped_column(Date, default=func.current_date(), nullable=False)
    
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    saved_domains: Mapped[list["SavedDomain"]] = relationship("SavedDomain", back_populates="user", cascade="all, delete-orphan")
