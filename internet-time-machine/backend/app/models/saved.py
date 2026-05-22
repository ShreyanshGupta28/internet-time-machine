import uuid
from datetime import datetime
from sqlalchemy import ForeignKey, DateTime, Index, UniqueConstraint, func
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database import Base

class SavedDomain(Base):
    __tablename__ = "saved_domains"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    domain_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("domains.id", ondelete="CASCADE"), nullable=False)
    personal_note: Mapped[str | None] = mapped_column(nullable=True)
    saved_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    user: Mapped["User"] = relationship("User", back_populates="saved_domains")
    domain_rel: Mapped["Domain"] = relationship("Domain", back_populates="saved_records")

    __table_args__ = (
        Index("idx_saved_domains_user_id", "user_id"),
        UniqueConstraint("user_id", "domain_id", name="saved_domains_user_domain_uc"),
    )
