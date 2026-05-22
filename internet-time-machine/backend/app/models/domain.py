import uuid
from datetime import date, datetime
from sqlalchemy import String, Integer, Date, DateTime, func
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database import Base

class Domain(Base):
    __tablename__ = "domains"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    domain: Mapped[str] = mapped_column(String(255), unique=True, nullable=False, index=True)
    first_captured: Mapped[date | None] = mapped_column(Date, nullable=True)
    last_captured: Mapped[date | None] = mapped_column(Date, nullable=True)
    total_snapshots: Mapped[int] = mapped_column(Integer, default=0, nullable=True)
    view_count: Mapped[int] = mapped_column(Integer, default=0, nullable=False, index=True)
    
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    snapshots: Mapped[list["Snapshot"]] = relationship("Snapshot", back_populates="domain_rel", cascade="all, delete-orphan")
    biography: Mapped["Biography | None"] = relationship("Biography", back_populates="domain_rel", cascade="all, delete-orphan", uselist=False)
    saved_records: Mapped[list["SavedDomain"]] = relationship("SavedDomain", back_populates="domain_rel", cascade="all, delete-orphan")
