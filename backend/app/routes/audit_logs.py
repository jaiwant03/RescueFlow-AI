from typing import Optional
from fastapi import APIRouter, Query
from app.database import get_database, clean_mongo_doc

router = APIRouter(prefix="/api/audit-logs", tags=["Audit Logs"])

@router.get("")
async def get_audit_logs(
    event_type: Optional[str] = Query(None),
    incident_id: Optional[str] = Query(None),
    limit: int = Query(50, ge=1, le=200),
    skip: int = Query(0, ge=0)
):
    db = get_database()
    query = {}
    if event_type and event_type != "all":
        query["event_type"] = event_type
    if incident_id:
        query["incident_id"] = incident_id

    cursor = db["audit_logs"].find(query).sort("timestamp", -1).skip(skip).limit(limit)
    items = await cursor.to_list(limit)
    total = await db["audit_logs"].count_documents(query)

    return {
        "total": total,
        "count": len(items),
        "audit_logs": clean_mongo_doc(items)
    }

@router.delete("")
async def clear_audit_logs():
    db = get_database()
    result = await db["audit_logs"].delete_many({})
    deleted = getattr(result, "deleted_count", 0)
    return {
        "status": "success",
        "message": "All audit logs cleared successfully",
        "deleted_count": deleted
    }
