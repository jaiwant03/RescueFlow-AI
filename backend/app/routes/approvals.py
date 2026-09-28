from typing import Optional
from fastapi import APIRouter, Query, HTTPException
from app.database import get_database, clean_mongo_doc
from app.schemas.approval import ApprovalDecisionRequest
from app.services.mongodb import execute_approval_decision

router = APIRouter(prefix="/api/approvals", tags=["Approvals"])

@router.get("")
async def get_approvals(
    status: Optional[str] = Query(None),
    limit: int = Query(50, ge=1, le=100)
):
    db = get_database()
    query = {}
    if status and status != "all":
        query["status"] = status

    cursor = db["approvals"].find(query).sort("created_at", -1).limit(limit)
    items = await cursor.to_list(limit)
    total = await db["approvals"].count_documents(query)
    pending_count = await db["approvals"].count_documents({"status": "pending"})

    return {
        "total": total,
        "pending_count": pending_count,
        "approvals": clean_mongo_doc(items)
    }


@router.post("/{approval_id}/decision")
async def submit_approval_decision(approval_id: str, payload: ApprovalDecisionRequest):
    db = get_database()
    approval = await db["approvals"].find_one({"approval_id": approval_id})
    if not approval:
        raise HTTPException(status_code=404, detail=f"Approval request {approval_id} not found")

    res = await execute_approval_decision(
        incident_id=approval["incident_id"],
        decision=payload.decision,
        reason=payload.reason,
        decided_by=payload.decided_by
    )
    if not res.get("success"):
        raise HTTPException(status_code=400, detail=res.get("error", "Failed to process approval"))

    return res
