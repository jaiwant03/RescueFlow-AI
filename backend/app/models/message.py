from typing import Optional, Dict, Any
from pydantic import BaseModel, Field
from datetime import datetime

class MessageModel(BaseModel):
    message_id: str
    source: str  # telegram, email, web, csv
    sender: str = "Anonymous"
    phone: Optional[str] = None
    email: Optional[str] = None
    subject: Optional[str] = None
    message: str
    location_hint: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    timestamp: str = Field(default_factory=lambda: datetime.utcnow().isoformat())
    metadata: Dict[str, Any] = Field(default_factory=dict)
    is_emergency: Optional[bool] = None
    emergency_type: Optional[str] = None
    confidence: Optional[float] = None
    classification_reason: Optional[str] = None
    incident_id: Optional[str] = None
    status: str = "received"  # received, processed, non_emergency, processing_failed
