from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field

class IncidentStatusUpdate(BaseModel):
    status: str
    reason: Optional[str] = None
    actor: str = "Operator"

class IncidentApproveReject(BaseModel):
    approved_by: str = "Command Chief"
    reason: Optional[str] = None

class IncidentAssignTeam(BaseModel):
    team_name: str
    actor: str = "Dispatch Coordinator"

class IncidentResponse(BaseModel):
    incident_id: str
    type: str
    location: str
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    people_affected: int = 0
    vulnerable_people: List[str] = []
    immediate_needs: List[str] = []
    resources_required: List[str] = []
    severity: str = "unknown"
    priority_score: int = 0
    priority_level: str = "low"
    priority_reasons: List[str] = []
    report_count: int = 1
    status: str = "pending"
    approval_status: str = "pending"
    approved_by: Optional[str] = None
    approved_at: Optional[str] = None
    rejection_reason: Optional[str] = None
    assigned_team: Optional[str] = None
    source_messages: List[Dict[str, Any]] = []
    timeline: List[Dict[str, Any]] = []
    ai_summary: Optional[str] = None
    created_at: str
    updated_at: str
