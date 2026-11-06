import asyncio
import logging
from datetime import datetime, timedelta
from typing import Dict, Any, List
from app.database import get_database, clean_mongo_doc
from app.services.realtime import broadcaster
from app.services.audit import log_audit_event

logger = logging.getLogger("rescueflow.staleness_monitor")

class StalenessMonitor:
    """
    Automated background liveliness and staleness watcher.
    Monitors active emergency incidents to ensure none are stalled or neglected.
    """
    def __init__(self, check_interval_seconds: int = 60, stale_threshold_minutes: int = 30):
        self.check_interval_seconds = check_interval_seconds
        self.stale_threshold_minutes = stale_threshold_minutes
        self._running = False
        self._task: asyncio.Task = None
        self.stats = {
            "checks_run": 0,
            "stale_incidents_flagged": 0,
            "last_check_timestamp": None
        }

    async def start(self):
        """Starts periodic staleness monitoring loop."""
        if self._running:
            return
        self._running = True
        self._task = asyncio.create_task(self._monitor_loop())
        logger.info(f"StalenessMonitor started (check interval: {self.check_interval_seconds}s, threshold: {self.stale_threshold_minutes}m).")

    async def stop(self):
        """Stops staleness monitoring loop."""
        self._running = False
        if self._task:
            self._task.cancel()
            try:
                await self._task
            except asyncio.CancelledError:
                pass
        logger.info("StalenessMonitor stopped.")

    async def check_stale_incidents(self) -> List[Dict[str, Any]]:
        """
        Inspects active incidents ('responding', 'pending') that haven't received updates
        within the staleness threshold.
        """
        db = get_database()
        now = datetime.utcnow()
        threshold_dt = now - timedelta(minutes=self.stale_threshold_minutes)
        threshold_iso = threshold_dt.isoformat()

        # Query responding or pending incidents updated before threshold
        cursor = db["incidents"].find({
            "status": {"$in": ["responding", "pending", "approved"]},
            "$or": [
                {"updated_at": {"$lt": threshold_iso}},
                {"updated_at": {"$exists": False}},
                {"updated_at": None}
            ],
            "is_stale_alerted": {"$ne": True}
        })
        stale_incidents = await cursor.to_list(100)
        flagged = []

        for inc in stale_incidents:
            inc_id = inc.get("incident_id")
            now_iso = now.isoformat()
            
            # Append timeline warning
            timeline = list(inc.get("timeline", []))
            timeline.append({
                "timestamp": now_iso,
                "event_type": "STALENESS_WARNING",
                "description": f"Incident has received no operational updates for >{self.stale_threshold_minutes} minutes.",
                "actor": "Autonomous Staleness Monitor",
                "details": {"last_update": inc.get("updated_at"), "threshold_minutes": self.stale_threshold_minutes}
            })

            # Update incident with warning flag
            await db["incidents"].update_one(
                {"incident_id": inc_id},
                {
                    "$set": {
                        "is_stale": True,
                        "is_stale_alerted": True,
                        "stale_flagged_at": now_iso,
                        "timeline": timeline
                    }
                }
            )

            # Audit record
            await log_audit_event(
                event_type="INCIDENT_STALE_WARNING",
                incident_id=inc_id,
                source="staleness_monitor",
                actor="Staleness Monitor",
                details={
                    "incident_id": inc_id,
                    "status": inc.get("status"),
                    "priority_level": inc.get("priority_level"),
                    "minutes_stale": self.stale_threshold_minutes
                }
            )

            # Broadcast warning to dispatch consoles
            await broadcaster.broadcast("INCIDENT_STALE_ALERT", {
                "incident_id": inc_id,
                "status": inc.get("status"),
                "priority_level": inc.get("priority_level"),
                "location": inc.get("location"),
                "alert_message": f"Incident {inc_id} has had no updates for over {self.stale_threshold_minutes} minutes."
            })

            self.stats["stale_incidents_flagged"] += 1
            flagged.append(inc_id)

        self.stats["checks_run"] += 1
        self.stats["last_check_timestamp"] = now.isoformat()
        return flagged

    async def _monitor_loop(self):
        while self._running:
            try:
                await asyncio.sleep(self.check_interval_seconds)
                flagged = await self.check_stale_incidents()
                if flagged:
                    logger.warning(f"StalenessMonitor flagged {len(flagged)} stale incidents: {flagged}")
            except asyncio.CancelledError:
                break
            except Exception as e:
                logger.error(f"Error in StalenessMonitor loop: {e}")
                await asyncio.sleep(10)

staleness_monitor = StalenessMonitor()
