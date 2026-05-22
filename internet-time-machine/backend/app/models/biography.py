import uuid
from datetime import datetime, timedelta
from sqlalchemy import String, DateTime, ForeignKey, func, JSON
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database import Base

def get_expiry_time():
    return datetime.utcnow() + timedelta(days=30)

class Biography(Base):
    __tablename__ = "biographies"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    domain_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("domains.id", ondelete="CASCADE"), unique=True, nullable=False)
    biography_md: Mapped[str] = mapped_column(nullable=False)
    
    design_eras: Mapped[list] = mapped_column(JSON, default=list, server_default='[]', nullable=False)
    key_moments: Mapped[list] = mapped_column(JSON, default=list, server_default='[]', nullable=False)
    one_liner: Mapped[str | None] = mapped_column(String(200), nullable=True)
    
    generated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    expires_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=get_expiry_time, nullable=False)

    domain_rel: Mapped["Domain"] = relationship("Domain", back_populates="biography")
