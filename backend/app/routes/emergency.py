import csv
import io
import logging
import uuid
from typing import List, Optional
from datetime import datetime
from fastapi import APIRouter, UploadFile, File, HTTPException
from app.schemas.message import EmergencyReportInput, CSVBatchInput
from app.services.mongodb import process_emergency_intake
from app.services.n8n import n8n_service
from app.database import get_database
from app.services.realtime import broadcaster
from app.services.audit import log_audit_event

logger = logging.getLogger("rescueflow.routes.emergency")
router = APIRouter(prefix="/api/emergency", tags=["Emergency Ingestion"])

@router.post("/report")
async def submit_emergency_report(payload: EmergencyReportInput):
    """
    Submits a public or operator emergency report.
    Normalizes input, triggers n8n intake webhook, and executes AI intelligence pipeline.
    """
    message_id = f"WEB-{uuid.uuid4().hex[:8].upper()}"
    normalized = {
        "message_id": message_id,
        "source": payload.source or "web",
        "sender": payload.name or "Web Citizen",
        "phone": payload.phone,
        "email": payload.email,
        "message": payload.message,
        "location": payload.location,
        "location_hint": payload.location,
        "latitude": payload.latitude,
        "longitude": payload.longitude,
        "timestamp": datetime.utcnow().isoformat(),
        "metadata": {"reported_via": "React Web Emergency Report Form"}
    }

    # Attempt trigger to n8n
    n8n_result = await n8n_service.forward_to_intake_webhook(normalized)

    # Process through intelligence pipeline
    pipeline_result = await process_emergency_intake(normalized)

    return {
        "success": True,
        "message": "Emergency report submitted and processed successfully.",
        "message_id": message_id,
        "n8n_dispatched": n8n_result.get("success", False),
        "result": pipeline_result
    }

@router.post("/csv-upload")
async def upload_csv_messages(file: UploadFile = File(...)):
    """
    Uploads a batch of emergency messages via CSV file.
    Expected CSV columns: source, message, timestamp, location
    """
    if not file.filename.endswith(".csv"):
        raise HTTPException(status_code=400, detail="Only CSV files are accepted.")

    content = await file.read()
    decoded = content.decode("utf-8-sig", errors="ignore")
    reader = csv.DictReader(io.StringIO(decoded))

    results = []
    for row in reader:
        msg_text = row.get("message") or row.get("Message") or ""
        if not msg_text.strip():
            continue

        source = (row.get("source") or row.get("Source") or "csv").strip().lower()
        location = (row.get("location") or row.get("Location") or "").strip()
        timestamp = (row.get("timestamp") or row.get("Timestamp") or datetime.utcnow().isoformat()).strip()

        payload = {
            "message_id": f"CSV-{uuid.uuid4().hex[:8].upper()}",
            "source": source,
            "sender": f"CSV Batch Import ({source})",
            "message": msg_text,
            "location": location,
            "timestamp": timestamp,
            "metadata": {"batch_file": file.filename}
        }

        res = await process_emergency_intake(payload)
        results.append(res)

    return {
        "success": True,
        "total_imported": len(results),
        "results": results
    }

# Simulation routes
sim_router = APIRouter(prefix="/api/simulate", tags=["Hackathon Demo Simulation"])

CANONICAL_DEMO_CASES = {
    "step1_flood_psg": {
        "source": "telegram",
        "sender": "@ramesh_kumar_cbe",
        "message": "URGENT! Flood water entered houses near PSG College. 5 people are trapped and need immediate rescue.",
        "location": "PSG College",
        "note": "Primary critical flood incident creation"
    },
    "step2_flood_psg_corroborate": {
        "source": "email",
        "sender": "citizens_watch_cbe@gmail.com",
        "message": "Water has entered several homes near PSG College. Residents need emergency assistance.",
        "location": "PSG College",
        "note": "Corroborating flood report #2 (Deduplication into PSG incident)"
    },
    "step3_flood_psg_web": {
        "source": "web",
        "sender": "Student Council PSG",
        "message": "PSG area is flooded. Please send rescue support.",
        "location": "PSG College",
        "note": "Corroborating flood report #3 (Increments report count to 3 & boosts priority)"
    },
    "step4_fire_gandhipuram": {
        "source": "telegram",
        "sender": "@traffic_watch_gandhipuram",
        "message": "Fire reported near Gandhipuram bus stand. Several people are trapped inside the building.",
        "location": "Gandhipuram",
        "note": "Distinct Critical Fire incident creation"
    },
    "step5_medical_rspuram": {
        "source": "web",
        "sender": "Dr. Ananya Sharma",
        "message": "An elderly person requires urgent medical assistance near RS Puram.",
        "location": "RS Puram",
        "note": "Distinct Medical emergency creation"
    },
    "step6_non_emergency": {
        "source": "email",
        "sender": "marketing@localdeals.com",
        "message": "Good morning everyone, have a nice day.",
        "location": "Coimbatore",
        "note": "Casual non-emergency message filtered and safely archived"
    }
}

@sim_router.post("/scenario/{scenario_key}")
async def run_demo_scenario(scenario_key: str):
    """
    Executes one of the canonical hackathon evaluation demo steps.
    """
    if scenario_key not in CANONICAL_DEMO_CASES:
        raise HTTPException(
            status_code=400,
            detail=f"Unknown scenario '{scenario_key}'. Choose from: {list(CANONICAL_DEMO_CASES.keys())}"
        )

    case = CANONICAL_DEMO_CASES[scenario_key]
    payload = {
        "message_id": f"SIM-{uuid.uuid4().hex[:8].upper()}",
        "source": case["source"],
        "sender": case["sender"],
        "message": case["message"],
        "location": case["location"],
        "timestamp": datetime.utcnow().isoformat(),
        "metadata": {"simulation_scenario": scenario_key, "demo_note": case["note"]}
    }

    # Dispatch to n8n if connected
    await n8n_service.forward_to_intake_webhook(payload)

    # Process through pipeline
    result = await process_emergency_intake(payload)

    return {
        "success": True,
        "scenario": scenario_key,
        "note": case["note"],
        "input_message": case["message"],
        "pipeline_result": result
    }

@sim_router.post("/reset-demo-data")
async def reset_demo_data():
    """
    Cleans up all database collections to reset the hackathon demo environment to a fresh state.
    """
    db = get_database()
    await db["incidents"].delete_many({})
    await db["messages"].delete_many({})
    await db["approvals"].delete_many({})
    await db["response_tasks"].delete_many({})
    await db["audit_logs"].delete_many({})

    await log_audit_event(
        event_type="SYSTEM_RESET",
        source="demo_engine",
        actor="System Administrator",
        details={"action": "Reset all demo collections"}
    )
    await broadcaster.broadcast("SYSTEM_RESET", {"message": "All demo data has been reset."})
    return {"success": True, "message": "Demo data wiped clean. Ready for demo run."}
