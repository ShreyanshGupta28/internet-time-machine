from pydantic import BaseModel
from datetime import date, datetime
from typing import List, Optional

class SnapshotSchema(BaseModel):
    wayback_ts: str
    captured_at: datetime
    wayback_url: str
    page_title: Optional[str] = None

    class Config:
        from_attributes = True

class DomainResponse(BaseModel):
    domain: str
    first_captured: Optional[date] = None
    last_captured: Optional[date] = None
    total_snapshots: int = 0
    has_biography: bool = False
    snapshots: List[SnapshotSchema] = []

    class Config:
        from_attributes = True
