import asyncio
import logging
from typing import Dict, Any, Optional
import httpx
from app.config import settings

logger = logging.getLogger("rescueflow.telegram")

class TelegramService:
    def __init__(self):
        self.token = settings.TELEGRAM_BOT_TOKEN
        self.alert_chat_id = settings.TELEGRAM_ALERT_CHAT_ID
        self.bot_info: Optional[Dict[str, Any]] = None
        self._polling_task: Optional[asyncio.Task] = None
        self._last_update_id: int = 0
        self._is_running: bool = False

    @property
    def is_configured(self) -> bool:
        return bool(self.token and len(self.token.strip()) > 10)

    @property
    def api_base(self) -> str:
        return f"https://api.telegram.org/bot{self.token}"

    async def get_bot_info(self) -> Dict[str, Any]:
        """Queries Telegram API getMe to verify bot token and get identity."""
        if not self.is_configured:
            return {"configured": False, "status": "unconfigured"}

        try:
            async with httpx.AsyncClient(timeout=6.0) as client:
                resp = await client.get(f"{self.api_base}/getMe")
                if resp.status_code == 200:
                    data = resp.json()
                    if data.get("ok"):
                        self.bot_info = data.get("result", {})
                        return {
                            "configured": True,
                            "status": "connected",
                            "bot_id": self.bot_info.get("id"),
                            "username": f"@{self.bot_info.get('username')}",
                            "first_name": self.bot_info.get("first_name"),
                        }
                return {"configured": True, "status": "invalid_token", "code": resp.status_code}
        except Exception as e:
            logger.warning(f"Telegram getMe check error: {e}")
            return {"configured": True, "status": "network_error", "error": str(e)}

    async def send_message(self, chat_id: Any, text: str, parse_mode: str = "Markdown") -> Dict[str, Any]:
        """Sends a message to a specific Telegram chat_id."""
        if not self.is_configured:
            return {"success": False, "error": "Telegram bot token not configured."}

        target_chat = chat_id or self.alert_chat_id
        if not target_chat:
            return {"success": False, "error": "No chat_id provided and TELEGRAM_ALERT_CHAT_ID not set."}

        try:
            async with httpx.AsyncClient(timeout=8.0) as client:
                payload = {
                    "chat_id": target_chat,
                    "text": text,
                    "parse_mode": parse_mode
                }
                resp = await client.post(f"{self.api_base}/sendMessage", json=payload)
                result = resp.json()
                if resp.status_code == 200 and result.get("ok"):
                    logger.info(f"Telegram message sent to {target_chat}")
                    return {"success": True, "result": result.get("result")}
                else:
                    logger.warning(f"Telegram sendMessage failed: {result}")
                    return {"success": False, "error": result.get("description", "Unknown Telegram error")}
        except Exception as e:
            logger.error(f"Telegram sendMessage exception: {e}")
            return {"success": False, "error": str(e)}

    async def broadcast_incident_alert(self, incident: Dict[str, Any], chat_id: Optional[Any] = None) -> Dict[str, Any]:
        """Formats and sends an emergency dispatch alert to Telegram."""
        if not self.is_configured:
            return {"success": False, "note": "Telegram bot token not set"}

        inc_id = incident.get("incident_id", "INC-UNKNOWN")
        priority = str(incident.get("priority_level", "HIGH")).upper()
        disaster_type = str(incident.get("type", "Disaster")).upper()
        location = incident.get("location", "Unspecified Location")
        summary = incident.get("summary") or incident.get("title") or "No detailed summary available."
        score = incident.get("priority_score", "N/A")

        text = (
            f"🚨 *RESCUEFLOW AI — EMERGENCY DISPATCH ALERT*\n\n"
            f"*Incident ID:* `{inc_id}`\n"
            f"*Priority:* *{priority}* (Score: {score})\n"
            f"*Classification:* `{disaster_type}`\n"
            f"*Location:* 📍 {location}\n\n"
            f"*Situation Summary:*\n{summary}\n\n"
            f"⚡ _Status: Operations Command Alert Dispatched via n8n & FastAPI Orchestrator_"
        )

        return await self.send_message(chat_id or self.alert_chat_id, text)

    async def start_polling(self):
        """Starts background long polling to intake citizen messages sent directly to the bot."""
        if not self.is_configured or self._is_running:
            return

        self._is_running = True
        self._polling_task = asyncio.create_task(self._poll_loop())
        logger.info("Telegram background citizen message ingestion poller started.")

    async def stop_polling(self):
        self._is_running = False
        if self._polling_task:
            self._polling_task.cancel()
            try:
                await self._polling_task
            except asyncio.CancelledError:
                pass
        logger.info("Telegram poller stopped.")

    async def _poll_loop(self):
        """Continuous background poller for Telegram messages."""
        from app.services.mongodb import process_emergency_intake
        import uuid
        from datetime import datetime

        while self._is_running:
            try:
                async with httpx.AsyncClient(timeout=15.0) as client:
                    params = {"offset": self._last_update_id + 1, "timeout": 10}
                    resp = await client.get(f"{self.api_base}/getUpdates", params=params)

                    if resp.status_code == 200:
                        data = resp.json()
                        updates = data.get("result", [])

                        for update in updates:
                            self._last_update_id = update["update_id"]
                            msg = update.get("message")
                            if not msg:
                                continue

                            text = msg.get("text", "")
                            if not text:
                                continue

                            from_user = msg.get("from", {})
                            chat_id = msg.get("chat", {}).get("id")
                            user_name = from_user.get("first_name", "Telegram User")
                            username = f"@{from_user.get('username')}" if from_user.get("username") else user_name

                            # Ignore bot's own /start command or handle it
                            if text.strip().lower() == "/start":
                                reply_text = (
                                    f"👋 Hello {user_name}! I am the *RescueFlow AI Emergency Bot*.\n\n"
                                    "🚨 *To report an emergency:*\n"
                                    "Simply reply with the disaster type, your location, and the current situation.\n\n"
                                    "_Example:_\n"
                                    "\"Flash flood in Ward 7 near Green Park. 6 people trapped on the first floor. Water level 4 feet.\""
                                )
                                await self.send_message(chat_id, reply_text)
                                continue

                            logger.info(f"Incoming Telegram emergency report from {username}: {text}")

                            # Normalize message for RescueFlow AI Pipeline
                            message_id = f"TG-{uuid.uuid4().hex[:8].upper()}"
                            normalized = {
                                "message_id": message_id,
                                "source": "telegram",
                                "sender": username,
                                "phone": None,
                                "email": None,
                                "message": text,
                                "location": None,
                                "location_hint": None,
                                "latitude": None,
                                "longitude": None,
                                "timestamp": datetime.utcnow().isoformat(),
                                "metadata": {
                                    "chat_id": chat_id,
                                    "telegram_user_id": from_user.get("id"),
                                    "reported_via": "Telegram Bot (@RescueFlowAI_DemoBot)"
                                }
                            }

                            # Process through RescueFlow AI Intelligence Pipeline
                            result = await process_emergency_intake(normalized)

                            # Send immediate acknowledgement back to citizen on Telegram
                            inc_id = result.get("incident", {}).get("incident_id", "PENDING")
                            priority = result.get("priority_level", "NORMAL").upper()
                            disaster_type = result.get("type", "Disaster Report").title()

                            reply = (
                                f"🚨 *EMERGENCY REPORT RECEIVED BY RESCUEFLOW AI*\n\n"
                                f"✅ *Incident ID:* `{inc_id}`\n"
                                f"🔥 *Classified Disaster:* {disaster_type}\n"
                                f"⚡ *Assigned Priority:* *{priority}*\n\n"
                                f"Your report has been triaged by AI and dispatched to the Operations Commander on duty."
                            )
                            await self.send_message(chat_id, reply)

            except asyncio.CancelledError:
                break
            except Exception as e:
                # Suppress flood of logs if network timeout
                await asyncio.sleep(4)

            await asyncio.sleep(2)

telegram_service = TelegramService()
