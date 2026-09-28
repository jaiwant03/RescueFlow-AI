from typing import Optional, List
from datetime import datetime
from fastapi import APIRouter, HTTPException, Query
from app.database import get_database, clean_mongo_doc
from app.schemas.incident import IncidentStatusUpdate, IncidentApproveReject, IncidentAssignTeam
from app.services.mongodb import execute_approval_decision
from app.services.realtime import broadcaster
from app.services.audit import log_audit_event

router = APIRouter(prefix="/api/incidents", tags=["Incidents"])

@router.get("")
async def get_incidents(
    status: Optional[str] = Query(None),
    priority: Optional[str] = Query(None),
    type: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    limit: int = Query(50, ge=1, le=200),
    skip: int = Query(0, ge=0)
):
    db = get_database()
    query = {}
    if status and status != "all":
        query["status"] = status
    if priority and priority != "all":
        query["priority_level"] = priority
    if type and type != "all":
        query["type"] = type

    cursor = db["incidents"].find(query).sort("created_at", -1).skip(skip).limit(limit)
    items = await cursor.to_list(limit)

    # In-memory filter for search string if provided
    if search:
        s_lower = search.lower()
        items = [
            i for i in items 
            if s_lower in i.get("incident_id", "").lower() 
            or s_lower in i.get("location", "").lower() 
            or s_lower in i.get("type", "").lower()
            or s_lower in i.get("ai_summary", "").lower()
        ]

    total = await db["incidents"].count_documents(query)
    return {
        "total": total,
        "count": len(items),
        "incidents": clean_mongo_doc(items)
    }

@router.get("/{incident_id}")
async def get_incident(incident_id: str):
    db = get_database()
    incident = await db["incidents"].find_one({"incident_id": incident_id})
    if not incident:
        raise HTTPException(status_code=404, detail=f"Incident {incident_id} not found")
    return clean_mongo_doc(incident)

@router.post("/{incident_id}/status")
async def update_incident_status(incident_id: str, payload: IncidentStatusUpdate):

    db = get_database()
    incident = await db["incidents"].find_one({"incident_id": incident_id})
    if not incident:
        raise HTTPException(status_code=404, detail=f"Incident {incident_id} not found")

    valid_statuses = ["pending", "approved", "responding", "monitoring", "resolved", "rejected", "archived"]
    if payload.status not in valid_statuses:
        raise HTTPException(status_code=400, detail=f"Invalid status '{payload.status}'. Must be one of {valid_statuses}")

    now_iso = datetime.utcnow().isoformat()
    timeline = list(incident.get("timeline", []))
    timeline.append({
        "timestamp": now_iso,
        "event_type": "STATUS_CHANGED",
        "description": f"Status updated to '{payload.status.upper()}' ({payload.reason or 'Operational state transition'})",
        "actor": payload.actor
    })

    update_fields = {
        "status": payload.status,
        "timeline": timeline,
        "updated_at": now_iso
    }
    if payload.status == "resolved":
        update_fields["resolved_at"] = now_iso

    await db["incidents"].update_one(
        {"incident_id": incident_id},
        {"$set": update_fields}
    )

    await log_audit_event(
        event_type="STATUS_CHANGED",
        incident_id=incident_id,
        source="dashboard",
        actor=payload.actor,
        details={"old_status": incident.get("status"), "new_status": payload.status, "reason": payload.reason}
    )

    updated = await db["incidents"].find_one({"incident_id": incident_id})
    cleaned_updated = clean_mongo_doc(updated)
    await broadcaster.broadcast("INCIDENT_UPDATED", cleaned_updated)
    return cleaned_updated


@router.post("/{incident_id}/approve")
async def approve_incident(incident_id: str, payload: IncidentApproveReject):
    result = await execute_approval_decision(
        incident_id=incident_id,
        decision="approve",
        reason=payload.reason,
        decided_by=payload.approved_by
    )
    if not result.get("success"):
        raise HTTPException(status_code=400, detail=result.get("error", "Approval failed"))
    return result

@router.post("/{incident_id}/reject")
async def reject_incident(incident_id: str, payload: IncidentApproveReject):
    result = await execute_approval_decision(
        incident_id=incident_id,
        decision="reject",
        reason=payload.reason or "Rejected by commander",
        decided_by=payload.approved_by
    )
    if not result.get("success"):
        raise HTTPException(status_code=400, detail=result.get("error", "Rejection failed"))
    return result

@router.post("/{incident_id}/assign-team")
async def assign_team(incident_id: str, payload: IncidentAssignTeam):
    db = get_database()
    incident = await db["incidents"].find_one({"incident_id": incident_id})
    if not incident:
        raise HTTPException(status_code=404, detail=f"Incident {incident_id} not found")

    now_iso = datetime.utcnow().isoformat()
    timeline = list(incident.get("timeline", []))
    timeline.append({
        "timestamp": now_iso,
        "event_type": "TEAM_ASSIGNED",
        "description": f"Field response team '{payload.team_name}' assigned to incident",
        "actor": payload.actor
    })

    await db["incidents"].update_one(
        {"incident_id": incident_id},
        {
            "$set": {
                "assigned_team": payload.team_name,
                "timeline": timeline,
                "updated_at": now_iso
            }
        }
    )

    await log_audit_event(
        event_type="TEAM_ASSIGNED",
        incident_id=incident_id,
        source="dispatch",
        actor=payload.actor,
        details={"assigned_team": payload.team_name}
    )

    updated = await db["incidents"].find_one({"incident_id": incident_id})
    cleaned_updated = clean_mongo_doc(updated)
    await broadcaster.broadcast("INCIDENT_UPDATED", cleaned_updated)
    return cleaned_updated


@router.get("/{incident_id}/timeline")
async def get_incident_timeline(incident_id: str):
    db = get_database()
    incident = await db["incidents"].find_one({"incident_id": incident_id})
    if not incident:
        raise HTTPException(status_code=404, detail=f"Incident {incident_id} not found")
    return {"incident_id": incident_id, "timeline": incident.get("timeline", [])}
