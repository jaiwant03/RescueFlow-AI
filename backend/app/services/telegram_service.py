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

    # Alias for dispatch alert
    send_dispatch_alert = broadcast_incident_alert

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
        """Continuous background poller for Telegram citizen messages & GPS locations."""
        from app.services.mongodb import process_emergency_intake
        import uuid
        import re
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

                            from_user = msg.get("from", {})
                            chat_id = msg.get("chat", {}).get("id")
                            user_name = from_user.get("first_name", "Telegram User")
                            username = f"@{from_user.get('username')}" if from_user.get("username") else user_name

                            # Extract text, photo caption, or native GPS location
                            raw_text = msg.get("text") or msg.get("caption") or ""
                            tg_loc = msg.get("location")
                            lat = None
                            lng = None

                            if tg_loc and isinstance(tg_loc, dict):
                                try:
                                    lat = float(tg_loc.get("latitude"))
                                    lng = float(tg_loc.get("longitude"))
                                except (ValueError, TypeError):
                                    pass

                            # If text is empty but GPS location was attached, synthesize report text
                            if not raw_text.strip():
                                if lat is not None and lng is not None:
                                    raw_text = f"Emergency situation reported with live GPS coordinates: {lat:.5f}, {lng:.5f}"
                                elif msg.get("photo"):
                                    raw_text = "Emergency photo report submitted by citizen via Telegram"
                                else:
                                    # Non-emergency/service message without text or location
                                    continue

                            # Handle bot /start command
                            if raw_text.strip().lower() == "/start":
                                reply_text = (
                                    f"👋 Hello {user_name}! I am the *RescueFlow AI Emergency Bot*.\n\n"
                                    "🚨 *To report an emergency:*\n"
                                    "1. Send your message describing the disaster, location, and people affected.\n"
                                    "2. You can also tap 📎 *Location* to send your exact GPS pin or attach photos.\n\n"
                                    "_Example:_\n"
                                    "\"Flash flood in Saibaba Colony near Avinashi Road. 6 people trapped. Water rising 4 feet.\""
                                )
                                await self.send_message(chat_id, reply_text)
                                continue

                            # Also extract embedded coordinates from text if not provided by native location
                            if lat is None or lng is None:
                                coord_match = re.search(r'(-?\d{1,2}\.\d{3,7})[,\s]+(-?\d{1,3}\.\d{3,7})', raw_text)
                                if coord_match:
                                    try:
                                        lat = float(coord_match.group(1))
                                        lng = float(coord_match.group(2))
                                    except (ValueError, TypeError):
                                        pass

                            location_hint = f"GPS ({lat:.4f}, {lng:.4f})" if (lat is not None and lng is not None) else None

                            # Photo handling if attached
                            image_url = None
                            if msg.get("photo") and isinstance(msg.get("photo"), list) and len(msg.get("photo")) > 0:
                                file_id = msg.get("photo")[-1].get("file_id")
                                image_url = f"telegram://photo/{file_id}"

                            logger.info(f"Incoming Telegram emergency report from {username}: {raw_text} (GPS: {lat}, {lng})")

                            # Normalize message for RescueFlow AI Pipeline
                            message_id = f"TG-{uuid.uuid4().hex[:8].upper()}"
                            normalized = {
                                "message_id": message_id,
                                "source": "telegram",
                                "sender": username,
                                "phone": None,
                                "email": None,
                                "message": raw_text,
                                "location": location_hint,
                                "location_hint": location_hint,
                                "latitude": lat,
                                "longitude": lng,
                                "image_url": image_url,
                                "timestamp": datetime.utcnow().isoformat(),
                                "metadata": {
                                    "chat_id": chat_id,
                                    "telegram_user_id": from_user.get("id"),
                                    "reported_via": "Telegram Bot (@RescueFlowAI_DemoBot)",
                                    "has_gps": lat is not None and lng is not None
                                }
                            }

                            # Process through RescueFlow AI Intelligence Pipeline
                            result = await process_emergency_intake(normalized)

                            # Send immediate acknowledgement back to citizen on Telegram
                            inc = result.get("incident") or {}
                            inc_id = inc.get("incident_id", "PENDING")
                            priority = (inc.get("priority_level") or result.get("priority_level", "NORMAL")).upper()
                            disaster_type = (inc.get("type") or result.get("type", "Emergency Report")).title()
                            loc_display = inc.get("location") or location_hint or "Coimbatore Sector"

                            reply = (
                                f"🚨 *EMERGENCY REPORT RECEIVED BY RESCUEFLOW AI*\n\n"
                                f"✅ *Incident ID:* `{inc_id}`\n"
                                f"🔥 *Classified Disaster:* {disaster_type}\n"
                                f"📍 *Location:* {loc_display}\n"
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
