from typing import Optional, Dict, Any, List
from pydantic import BaseModel, Field
from datetime import datetime

class ResponseTaskModel(BaseModel):
    task_id: str
    incident_id: str
    channel: str  # telegram, email, dispatch_unit, siren
    target: str  # e.g., "Telegram Bot Dispatch", "rescueflow.demo@gmail.com"
    content: str
    status: str = "dispatched"  # dispatched, simulated, delivered, failed
    is_simulation: bool = True
    assigned_team: Optional[str] = None
    resources: List[str] = Field(default_factory=list)
    timestamp: str = Field(default_factory=lambda: datetime.utcnow().isoformat())
    metadata: Dict[str, Any] = Field(default_factory=dict)
