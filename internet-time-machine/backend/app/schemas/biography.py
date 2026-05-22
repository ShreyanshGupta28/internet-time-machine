from pydantic import BaseModel
from datetime import datetime
from typing import List, Optional

class DesignEraSchema(BaseModel):
    name: str
    start: str
    end: str
    description: str

class KeyMomentSchema(BaseModel):
    date: str
    title: str
    description: str

class BiographyResponse(BaseModel):
    biography_md: str
    design_eras: List[DesignEraSchema] = []
    key_moments: List[KeyMomentSchema] = []
    one_liner: Optional[str] = None
    generated_at: datetime

    class Config:
        from_attributes = True
