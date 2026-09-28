from typing import Optional, Dict, Any, List
from pydantic import BaseModel

class ResponseTaskResponse(BaseModel):
    task_id: str
    incident_id: str
    channel: str
    target: str
    content: str
    status: str
    is_simulation: bool
    assigned_team: Optional[str] = None
    resources: List[str]
    timestamp: str

class N8nEventPayload(BaseModel):
    event_type: str  # e.g., "incident_created", "ai_extracted", "response_dispatched"
    incident_id: Optional[str] = None
    message_id: Optional[str] = None
    payload: Dict[str, Any] = {}
    timestamp: Optional[str] = None
