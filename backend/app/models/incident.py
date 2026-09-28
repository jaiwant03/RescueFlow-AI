from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field
from datetime import datetime

class TimelineEvent(BaseModel):
    timestamp: str = Field(default_factory=lambda: datetime.utcnow().isoformat())
    event_type: str
    description: str
    actor: str = "System"
    details: Optional[Dict[str, Any]] = None

class IncidentModel(BaseModel):
    incident_id: str
    type: str = "other"  # flood, fire, earthquake, medical, etc.
    location: str
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    people_affected: int = 0
    vulnerable_people: List[str] = Field(default_factory=list)
    immediate_needs: List[str] = Field(default_factory=list)
    resources_required: List[str] = Field(default_factory=list)
    severity: str = "unknown"
    priority_score: int = 0
    priority_level: str = "low"  # critical, high, medium, low
    priority_reasons: List[str] = Field(default_factory=list)
    report_count: int = 1
    status: str = "pending"  # pending, approved, responding, monitoring, resolved, rejected, archived
    approval_status: str = "pending"  # pending, approved, rejected, not_required
    approved_by: Optional[str] = None
    approved_at: Optional[str] = None
    rejection_reason: Optional[str] = None
    assigned_team: Optional[str] = None
    source_messages: List[Dict[str, Any]] = Field(default_factory=list)
    timeline: List[TimelineEvent] = Field(default_factory=list)
    ai_summary: Optional[str] = None
    created_at: str = Field(default_factory=lambda: datetime.utcnow().isoformat())
    updated_at: str = Field(default_factory=lambda: datetime.utcnow().isoformat())
