import logging
from datetime import datetime
from typing import Optional, Dict, Any
from app.database import get_database
from app.services.realtime import broadcaster

logger = logging.getLogger("rescueflow.audit")

async def log_audit_event(
    event_type: str,
    incident_id: Optional[str] = None,
    message_id: Optional[str] = None,
    source: str = "System",
    actor: str = "RescueFlow-Core",
    details: Optional[Dict[str, Any]] = None
):
    """
    Logs an audit event to the database and broadcasts it in real time to the dashboard.
    """
    db = get_database()
    timestamp = datetime.utcnow().isoformat()
    
    audit_entry = {
        "timestamp": timestamp,
        "event_type": event_type,
        "incident_id": incident_id,
        "message_id": message_id,
        "source": source,
        "actor": actor,
        "details": details or {}
    }

    try:
        insert_res = await db["audit_logs"].insert_one(audit_entry)
        audit_entry["_id"] = str(insert_res.inserted_id)
        # Broadcast audit event
        await broadcaster.broadcast("AUDIT_LOG_CREATED", audit_entry)
        logger.info(f"[AUDIT] {event_type} - Incident: {incident_id} | Actor: {actor}")
    except Exception as e:
        logger.error(f"Failed to record audit log: {e}")
