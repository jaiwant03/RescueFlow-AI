from typing import Optional, List
from pydantic import BaseModel, Field
from datetime import datetime

class ApprovalModel(BaseModel):
    approval_id: str
    incident_id: str
    disaster_type: str
    location: str
    people_affected: int = 0
    priority_score: int
    priority_level: str
    recommended_resources: List[str] = Field(default_factory=list)
    status: str = "pending"  # pending, approved, rejected
    decision: Optional[str] = None
    decided_by: Optional[str] = None
    decided_at: Optional[str] = None
    rejection_reason: Optional[str] = None
    created_at: str = Field(default_factory=lambda: datetime.utcnow().isoformat())
