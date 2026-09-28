import asyncio
import json
import logging
from typing import List, Dict, Any, Set
from fastapi import WebSocket

logger = logging.getLogger("rescueflow.realtime")

class RealtimeBroadcaster:
    def __init__(self):
        self.active_websockets: Set[WebSocket] = set()
        self.sse_queues: List[asyncio.Queue] = []

    async def connect_websocket(self, websocket: WebSocket):
        await websocket.accept()
        self.active_websockets.add(websocket)
        logger.info(f"WebSocket client connected. Total clients: {len(self.active_websockets)}")

    def disconnect_websocket(self, websocket: WebSocket):
        self.active_websockets.discard(websocket)
        logger.info(f"WebSocket client disconnected. Total clients: {len(self.active_websockets)}")

    def register_sse_client(self) -> asyncio.Queue:
        q = asyncio.Queue()
        self.sse_queues.append(q)
        logger.info(f"SSE client registered. Total SSE: {len(self.sse_queues)}")
        return q

    def unregister_sse_client(self, q: asyncio.Queue):
        if q in self.sse_queues:
            self.sse_queues.remove(q)
            logger.info(f"SSE client unregistered. Total SSE: {len(self.sse_queues)}")

    async def broadcast(self, event_type: str, data: Dict[str, Any]):
        message = {
            "type": event_type,
            "data": data,
        }
        msg_json = json.dumps(message)

        # Broadcast to active WebSockets
        dead_ws = []
        for ws in self.active_websockets:
            try:
                await ws.send_text(msg_json)
            except Exception as e:
                logger.warning(f"Error sending to WebSocket client: {e}")
                dead_ws.append(ws)
        for ws in dead_ws:
            self.active_websockets.discard(ws)

        # Broadcast to SSE queues
        dead_sse = []
        for q in self.sse_queues:
            try:
                await q.put(msg_json)
            except Exception as e:
                dead_sse.append(q)
        for q in dead_sse:
            if q in self.sse_queues:
                self.sse_queues.remove(q)

broadcaster = RealtimeBroadcaster()
