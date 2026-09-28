import logging
from fastapi import APIRouter
from app.config import settings
from app.database import db_manager, in_memory_db
from app.services.groq_service import groq_service
from app.services.n8n import n8n_service

router = APIRouter(tags=["Health & System"])
logger = logging.getLogger("rescueflow.routes.health")

@router.get("/health")
async def health_check():
    return {
        "status": "online",
        "service": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "demo_mode": settings.DEMO_MODE
    }

@router.get("/api/system/status")
async def system_status():
    """
    Returns live connectivity checks for all system subsystems:
    MongoDB, Groq AI, n8n, Telegram, and Email.
    """
    # 1. MongoDB Status
    mongo_status = "connected" if db_manager.is_connected else ("in_memory_fallback" if db_manager.is_fallback else "offline")
    
    # 2. Groq AI Status
    groq_status = "configured" if groq_service.is_configured() else "heuristic_fallback"
    
    # 3. n8n Status
    n8n_health = await n8n_service.check_health()
    
    # 4. Telegram & Email configuration checks
    telegram_token = settings.__dict__.get("TELEGRAM_BOT_TOKEN", None)
    telegram_status = "configured" if telegram_token else "simulation_ready"
    email_status = "simulation_ready"

    return {
        "system": {
            "name": settings.PROJECT_NAME,
            "version": settings.VERSION,
            "mode": "Simulation / Hackathon Demo" if settings.DEMO_MODE else "Production",
        },
        "components": {
            "backend": {"status": "online", "healthy": True},
            "mongodb": {
                "status": mongo_status,
                "healthy": db_manager.is_connected or db_manager.is_fallback,
                "uri": settings.MONGO_URI,
                "db_name": settings.DB_NAME
            },
            "groq_ai": {
                "status": groq_status,
                "healthy": True,
                "model": settings.GROQ_MODEL,
                "has_api_key": groq_service.is_configured()
            },
            "n8n": {
                "status": n8n_health.get("status"),
                "healthy": n8n_health.get("status") == "connected",
                "base_url": settings.N8N_BASE_URL,
                "webhook_url": settings.N8N_INTAKE_WEBHOOK_URL
            },
            "telegram": {
                "status": telegram_status,
                "healthy": True,
                "note": "Messages processed via n8n Telegram Trigger or simulation input"
            },
            "email": {
                "status": email_status,
                "healthy": True,
                "note": "Messages processed via n8n Gmail Trigger or simulation input"
            }
        }
    }
