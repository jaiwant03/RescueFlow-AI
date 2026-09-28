from typing import Optional, Dict, Any, List
from pydantic import BaseModel, Field

class EmergencyReportInput(BaseModel):
    name: Optional[str] = "Anonymous Citizen"
    phone: Optional[str] = None
    email: Optional[str] = None
    message: str
    location: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    source: str = "web"  # web, telegram, email, csv
    image_url: Optional[str] = None

class CSVSingleItem(BaseModel):
    source: str = "csv"
    message: str
    timestamp: Optional[str] = None
    location: Optional[str] = None

class CSVBatchInput(BaseModel):
    items: List[CSVSingleItem]

class MessageResponse(BaseModel):
    message_id: str
    source: str
    sender: str
    phone: Optional[str] = None
    email: Optional[str] = None
    subject: Optional[str] = None
    message: str
    location_hint: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    timestamp: str
    metadata: Dict[str, Any] = {}
    is_emergency: Optional[bool] = None
    emergency_type: Optional[str] = None
    confidence: Optional[float] = None
    incident_id: Optional[str] = None
    status: str
