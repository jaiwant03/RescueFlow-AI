import logging
from typing import Dict, Any, Optional
import httpx
from app.config import settings
from app.services.audit import log_audit_event

logger = logging.getLogger("rescueflow.n8n")

class N8nService:
    def __init__(self):
        self.base_url = settings.N8N_BASE_URL
        self.intake_webhook_url = settings.N8N_INTAKE_WEBHOOK_URL
        self.approval_webhook_url = settings.N8N_APPROVAL_WEBHOOK_URL

    async def check_health(self) -> Dict[str, Any]:
        """Checks if n8n instance is reachable."""
        try:
            async with httpx.AsyncClient(timeout=3.0) as client:
                resp = await client.get(f"{self.base_url}/healthz")
                is_ok = resp.status_code in [200, 401, 403]
                return {
                    "status": "connected" if is_ok else "unreachable",
                    "url": self.base_url,
                    "code": resp.status_code
                }
        except Exception as e:
            return {
                "status": "offline",
                "url": self.base_url,
                "error": str(e)
            }

    async def forward_to_intake_webhook(self, normalized_message: Dict[str, Any]) -> Dict[str, Any]:
        """
        Sends the normalized emergency message payload to the n8n Intake Workflow webhook.
        """
        logger.info(f"Forwarding message {normalized_message.get('message_id')} to n8n Intake Webhook: {self.intake_webhook_url}")
        try:
            async with httpx.AsyncClient(timeout=8.0) as client:
                resp = await client.post(
                    self.intake_webhook_url,
                    json=normalized_message
                )
                if resp.status_code in [200, 201]:
                    logger.info("Successfully triggered n8n intake workflow.")
                    await log_audit_event(
                        event_type="N8N_WORKFLOW_TRIGGERED",
                        message_id=normalized_message.get("message_id"),
                        source="n8n_service",
                        actor="n8n Orchestrator",
                        details={"webhook": self.intake_webhook_url, "status": resp.status_code}
                    )
                    return {"success": True, "n8n_response": resp.json() if resp.headers.get("content-type") == "application/json" else resp.text}
                else:
                    logger.warning(f"n8n webhook returned HTTP {resp.status_code}")
                    return {"success": False, "status_code": resp.status_code, "note": "n8n workflow not active or returned error"}
        except Exception as e:
            logger.warning(f"Could not reach n8n intake webhook ({e}). Fallback to backend processing engine.")
            return {"success": False, "error": str(e)}

    async def notify_approval_decision(
        self,
        incident_id: str,
        decision: str,
        reason: Optional[str] = None,
        decided_by: str = "Operator"
    ) -> Dict[str, Any]:
        """
        Signals n8n Human Approval workflow of an operator's decision.
        """
        payload = {
            "incident_id": incident_id,
            "decision": decision,  # approve or reject
            "reason": reason,
            "decided_by": decided_by
        }
        logger.info(f"Sending approval decision for {incident_id} to n8n: {decision}")
        try:
            async with httpx.AsyncClient(timeout=8.0) as client:
                resp = await client.post(
                    self.approval_webhook_url,
                    json=payload
                )
                return {"success": resp.status_code in [200, 201], "status_code": resp.status_code}
        except Exception as e:
            logger.warning(f"n8n approval webhook dispatch notice: {e}")
            return {"success": False, "error": str(e)}

n8n_service = N8nService()
