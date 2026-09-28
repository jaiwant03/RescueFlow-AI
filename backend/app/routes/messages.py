from typing import Optional
from fastapi import APIRouter, Query, HTTPException
from app.database import get_database

router = APIRouter(prefix="/api/messages", tags=["Messages"])

@router.get("")
async def get_messages(
    source: Optional[str] = Query(None),
    is_emergency: Optional[bool] = Query(None),
    limit: int = Query(50, ge=1, le=200),
    skip: int = Query(0, ge=0)
):
    db = get_database()
    query = {}
    if source and source != "all":
        query["source"] = source
    if is_emergency is not None:
        query["is_emergency"] = is_emergency

    cursor = db["messages"].find(query).sort("timestamp", -1).skip(skip).limit(limit)
    items = await cursor.to_list(limit)
    total = await db["messages"].count_documents(query)

    return {
        "total": total,
        "count": len(items),
        "messages": items
    }

@router.get("/{message_id}")
async def get_single_message(message_id: str):
    db = get_database()
    msg = await db["messages"].find_one({"message_id": message_id})
    if not msg:
        raise HTTPException(status_code=404, detail=f"Message {message_id} not found")
    return msg
