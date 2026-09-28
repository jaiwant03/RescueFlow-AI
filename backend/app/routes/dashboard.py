from fastapi import APIRouter
from app.database import get_database

router = APIRouter(prefix="/api/dashboard", tags=["Dashboard"])

@router.get("/stats")
async def get_dashboard_stats():
    db = get_database()

    total_incidents = await db["incidents"].count_documents({})
    critical_count = await db["incidents"].count_documents({"priority_level": "critical"})
    high_count = await db["incidents"].count_documents({"priority_level": "high"})
    medium_count = await db["incidents"].count_documents({"priority_level": "medium"})
    low_count = await db["incidents"].count_documents({"priority_level": "low"})
    resolved_count = await db["incidents"].count_documents({"status": "resolved"})
    pending_approvals = await db["approvals"].count_documents({"status": "pending"})
    
    total_messages = await db["messages"].count_documents({})
    emergency_messages = await db["messages"].count_documents({"is_emergency": True})
    non_emergency_messages = await db["messages"].count_documents({"is_emergency": False})

    # Deduplication ratio: (total emergency messages - total incidents)
    dedup_saved = max(0, emergency_messages - total_incidents)

    # Recent 5 incidents
    cursor = db["incidents"].find({}).sort("created_at", -1).limit(5)
    recent_incidents = await cursor.to_list(5)

    return {
        "summary": {
            "total_incidents": total_incidents,
            "critical": critical_count,
            "high": high_count,
            "medium": medium_count,
            "low": low_count,
            "resolved": resolved_count,
            "pending_approvals": pending_approvals,
            "total_messages": total_messages,
            "emergency_reports": emergency_messages,
            "non_emergency_filtered": non_emergency_messages,
            "deduplication_saved": dedup_saved
        },
        "recent_incidents": recent_incidents
    }
