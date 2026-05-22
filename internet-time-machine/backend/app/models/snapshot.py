import uuid
from datetime import datetime
from sqlalchemy import String, Integer, DateTime, ForeignKey, Index, UniqueConstraint, func
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database import Base

class Snapshot(Base):
    __tablename__ = "snapshots"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    domain_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("domains.id", ondelete="CASCADE"), nullable=False)
    wayback_ts: Mapped[str] = mapped_column(String(14), nullable=False)
    captured_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    status_code: Mapped[int | None] = mapped_column(Integer, nullable=True)
    page_title: Mapped[str | None] = mapped_column(String(500), nullable=True)
    wayback_url: Mapped[str] = mapped_column(nullable=False)
    
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    domain_rel: Mapped["Domain"] = relationship("Domain", back_populates="snapshots")

    __table_args__ = (
        Index("idx_snapshots_domain_id_ts", "domain_id", "captured_at"),
        UniqueConstraint("domain_id", "wayback_ts", name="idx_snapshots_domain_ts"),
    )
