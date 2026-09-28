import os
from typing import Dict, Any
from dotenv import load_dotenv

# Load from .env file if present in workspace root or backend dir
load_dotenv()
load_dotenv(os.path.join(os.path.dirname(__file__), "..", "..", ".env"))

class Settings:
    PROJECT_NAME: str = "RescueFlow AI"
    VERSION: str = "1.0.0"
    SUBTITLE: str = "AI-Powered Disaster Message Prioritization & Response Automation"
    
    # Database
    MONGO_URI: str = os.getenv("MONGO_URI", "mongodb://localhost:27017")
    DB_NAME: str = os.getenv("DB_NAME", "rescueflow")
    
    # AI Engine (Groq OpenAI-compatible)
    GROQ_API_KEY: str = os.getenv("GROQ_API_KEY", "")
    GROQ_MODEL: str = os.getenv("GROQ_MODEL", "llama-3.3-70b-versatile")
    GROQ_BASE_URL: str = "https://api.groq.com/openai/v1"
    
    # n8n Orchestrator
    N8N_BASE_URL: str = os.getenv("N8N_BASE_URL", "http://localhost:5678")
    N8N_INTAKE_WEBHOOK_URL: str = os.getenv("N8N_INTAKE_WEBHOOK_URL", "http://localhost:5678/webhook/emergency-intake")
    N8N_APPROVAL_WEBHOOK_URL: str = os.getenv("N8N_APPROVAL_WEBHOOK_URL", "http://localhost:5678/webhook/approval-decision")
    
    # Deduplication & Similarity Threshold
    SIMILARITY_THRESHOLD: float = float(os.getenv("SIMILARITY_THRESHOLD", "0.75"))
    
    # Demo & Simulation Mode
    DEMO_MODE: bool = os.getenv("DEMO_MODE", "true").lower() in ("true", "1", "yes")
    
    # Priority Scoring Weights
    PRIORITY_WEIGHTS: Dict[str, int] = {
        "immediate_life_danger": 30,
        "people_trapped": 20,
        "vulnerable_people": 20,
        "medical_emergency": 20,
        "people_affected_10_plus": 20,
        "people_affected_5_to_9": 10,
        "rescue_required": 15,
        "multiple_reports": 10,
        "critical_disaster_type": 15,  # flood, building_collapse, fire
    }

settings = Settings()
