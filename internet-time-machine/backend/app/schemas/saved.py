from pydantic import BaseModel
from datetime import datetime
from typing import Optional
import uuid

class SavedDomainCreate(BaseModel):
    domain: str
    personal_note: Optional[str] = None

class SavedDomainUpdate(BaseModel):
    personal_note: Optional[str] = None

class SavedDomainResponse(BaseModel):
    id: uuid.UUID
    domain: str
    personal_note: Optional[str] = None
    saved_at: datetime
    first_captured: Optional[str] = None
    latest_snapshot_ts: Optional[str] = None

    class Config:
        from_attributes = True
