import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.database import connect_to_mongo, close_mongo_connection
from app.routes import (
    health,
    dashboard,
    incidents,
    messages,
    approvals,
    emergency,
    analytics,
    audit_logs,
    n8n_events,
    realtime,
)

# Configure structured logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("rescueflow")

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Initialize DB and connections
    logger.info("==================================================")
    logger.info("   RESCUEFLOW AI - BACKEND CORE STARTING UP       ")
    logger.info("   AI Disaster Message Prioritization & Response   ")
    logger.info(f"   Mode: {'DEMO SIMULATION' if settings.DEMO_MODE else 'PRODUCTION'}")
    logger.info("==================================================")
    await connect_to_mongo()
    yield
    # Shutdown
    await close_mongo_connection()
    logger.info("RescueFlow AI shutdown complete.")

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Backend API for RescueFlow AI — AI-Powered Disaster Message Prioritization & Response Automation",
    version=settings.VERSION,
    lifespan=lifespan
)

# Enable CORS for frontend Vite dev server & production
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register API routes
app.include_router(health.router)
app.include_router(dashboard.router)
app.include_router(incidents.router)
app.include_router(messages.router)
app.include_router(approvals.router)
app.include_router(emergency.router)
app.include_router(emergency.sim_router)
app.include_router(analytics.router)
app.include_router(audit_logs.router)
app.include_router(n8n_events.router)
app.include_router(realtime.router)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
