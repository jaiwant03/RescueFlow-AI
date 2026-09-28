from typing import Optional, List
from pydantic import BaseModel

class ApprovalDecisionRequest(BaseModel):
    decision: str  # approve, reject
    decided_by: str = "Chief Operator"
    reason: Optional[str] = None

class ApprovalResponse(BaseModel):
    approval_id: str
    incident_id: str
    disaster_type: str
    location: str
    people_affected: int
    priority_score: int
    priority_level: str
    recommended_resources: List[str]
    status: str
    decision: Optional[str] = None
    decided_by: Optional[str] = None
    decided_at: Optional[str] = None
    rejection_reason: Optional[str] = None
    created_at: str
