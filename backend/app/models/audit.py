from typing import Optional, Dict, Any
from pydantic import BaseModel, Field
from datetime import datetime

class AuditLogModel(BaseModel):
    timestamp: str = Field(default_factory=lambda: datetime.utcnow().isoformat())
    event_type: str  # MESSAGE_RECEIVED, AI_CLASSIFIED, AI_EXTRACTED, INCIDENT_CREATED, INCIDENT_UPDATED, DUPLICATE_DETECTED, PRIORITY_CALCULATED, APPROVAL_REQUESTED, APPROVED, REJECTED, NOTIFICATION_SENT, STATUS_CHANGED, RESOLVED, ARCHIVED
    incident_id: Optional[str] = None
    message_id: Optional[str] = None
    source: str = "system"
    actor: str = "RescueFlow-Core"
    details: Dict[str, Any] = Field(default_factory=dict)
