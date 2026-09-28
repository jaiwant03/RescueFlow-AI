import logging
from datetime import datetime
from fastapi import APIRouter
from app.schemas.action import N8nEventPayload
from app.database import get_database
from app.services.realtime import broadcaster
from app.services.audit import log_audit_event

logger = logging.getLogger("rescueflow.routes.n8n_events")
router = APIRouter(prefix="/api/n8n", tags=["n8n Orchestrator Webhook Callbacks"])

@router.post("/events")
async def handle_n8n_event(event: N8nEventPayload):
    """
    Receives lifecycle and execution notifications from n8n workflows:
    - Intake workflow completions
    - AI classification / extraction results
    - Notification dispatches
    - Incident status transitions
    """
    db = get_database()
    timestamp = event.timestamp or datetime.utcnow().isoformat()

    logger.info(f"Received n8n event '{event.event_type}' for incident '{event.incident_id}'")

    # If this is a notification dispatched event from n8n workflow 04
    if event.event_type == "NOTIFICATION_DISPATCHED":
        payload = event.payload
        task_doc = {
            "task_id": payload.get("task_id", f"TSK-N8N-{timestamp[-6:]}"),
            "incident_id": event.incident_id,
            "channel": payload.get("channel", "telegram"),
            "target": payload.get("target", "Emergency Channel"),
            "content": payload.get("content", ""),
            "status": "delivered",
            "is_simulation": True,
            "assigned_team": payload.get("assigned_team"),
            "resources": payload.get("resources", []),
            "timestamp": timestamp
        }
        await db["response_tasks"].insert_one(task_doc)

    # Log to audit trail
    await log_audit_event(
        event_type=f"N8N_{event.event_type}",
        incident_id=event.incident_id,
        message_id=event.message_id,
        source="n8n_orchestrator",
        actor="n8n Node",
        details=event.payload
    )

    # Broadcast event to frontend
    await broadcaster.broadcast(f"N8N_{event.event_type}", {
        "incident_id": event.incident_id,
        "message_id": event.message_id,
        "payload": event.payload,
        "timestamp": timestamp
    })

    return {"received": True, "event_type": event.event_type}
