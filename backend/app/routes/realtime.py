import asyncio
import logging
from typing import Optional
from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Query
from sse_starlette.sse import EventSourceResponse
from app.services.realtime import broadcaster
from app.database import get_database, clean_mongo_doc

logger = logging.getLogger("rescueflow.routes.realtime")
router = APIRouter(tags=["Realtime & Response Tasks"])


@router.get("/api/realtime/events")
async def sse_event_stream():
    """
    Server-Sent Events endpoint streaming real-time incident, approval, and audit updates.
    """
    queue = broadcaster.register_sse_client()

    async def event_generator():
        try:
            # Send initial keepalive / connection notice
            yield {"event": "connected", "data": '{"status": "connected"}'}
            while True:
                msg = await queue.get()
                yield {"event": "message", "data": msg}
        except asyncio.CancelledError:
            broadcaster.unregister_sse_client(queue)
            logger.info("SSE client stream cancelled.")
        except Exception as e:
            broadcaster.unregister_sse_client(queue)
            logger.warning(f"SSE stream error: {e}")

    return EventSourceResponse(event_generator())

@router.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    """
    WebSocket endpoint for bidirectional real-time communications.
    """
    await broadcaster.connect_websocket(websocket)
    try:
        while True:
            # Keep connection alive; client can send pings
            data = await websocket.receive_text()
            if data == "ping":
                await websocket.send_text('{"type": "pong"}')
    except WebSocketDisconnect:
        broadcaster.disconnect_websocket(websocket)
    except Exception as e:
        logger.warning(f"WebSocket exception: {e}")
        broadcaster.disconnect_websocket(websocket)

@router.get("/api/response-tasks")
async def get_response_tasks(
    limit: int = Query(50, ge=1, le=100)
):
    """
    Lists automated dispatch response tasks.
    """
    db = get_database()
    cursor = db["response_tasks"].find({}).sort("timestamp", -1).limit(limit)
    items = await cursor.to_list(limit)
    return {
        "total": len(items),
        "tasks": clean_mongo_doc(items)
    }

