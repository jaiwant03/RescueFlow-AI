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
    # 1st Position: HIGHEST SEVERITY (P1 Critical - Commercial Fire & Trapped)
    "step1_fire_gandhipuram": {
        "source": "telegram",
        "sender": "@cbe_firewatch",
        "message": "EMERGENCY: Massive 3-alarm fire at commercial plaza near Gandhipuram Central Bus Stand! Toxic smoke blocking exit stairs, 8 civilians trapped on 3rd floor. Send fire tenders, hydraulic ladder and EMT immediately!",
        "location": "Gandhipuram",
        "note": "P1 Critical: Structural Commercial Fire with 8 trapped civilians (Telegram)"
    },
    # 2nd Position: HIGH SEVERITY (P1 Critical - Flash Flood Surge & Rooftop Trapped)
    "step2_flood_peelamedu": {
        "source": "telegram",
        "sender": "@peelamedu_flood_alert",
        "message": "URGENT! Flood barrier breached near PSG College Peelamedu. Rapid water surge exceeding 5 feet inside residential ground floors. 5 people stranded on terrace. Immediate NDRF boat rescue required!",
        "location": "PSG College",
        "note": "P1 Critical: Severe Flash Flood with 5 stranded on rooftop (Telegram)"
    },
    # 3rd Position: HIGH SEVERITY (P2 High - Urgent Medical Trauma & Wall Collapse)
    "step3_medical_rspuram": {
        "source": "telegram",
        "sender": "@rspuram_resident",
        "message": "URGENT MEDICAL: Compound wall collapsed due to torrential rains near RS Puram DB Road. 72-year-old resident suffered severe head trauma and fractures. Bleeding profusely, urgent ambulance and paramedic dispatch needed!",
        "location": "RS Puram",
        "note": "P2 High: Critical Medical Trauma & Structural Collapse (Telegram)"
    },
    # 4th Position: MEDIUM SEVERITY (P3 Medium - Live Wire Hazard & Roadblock)
    "step4_hazard_townhall": {
        "source": "telegram",
        "sender": "@townhall_patrol",
        "message": "HAZARD ALERT: Large banyan tree collapsed across Town Hall main road. Snapped 440V overhead electrical cable sparking on wet asphalt. Road completely blocked, TNEB power cutoff and clearance crew needed.",
        "location": "Town Hall",
        "note": "P3 Medium: Electrical Cable Snapped & Major Roadblock (Telegram)"
    },
    # 5th Position: LOW SEVERITY (P4 Low - Street Waterlogging & Traffic Slow)
    "step5_waterlogging_ukkadam": {
        "source": "telegram",
        "sender": "@cbe_traffic_desk",
        "message": "ADVISORY: Rainwater accumulation of approximately 1.5 feet at Ukkadam railway underpass. Slow moving vehicle traffic. No casualties or stranded persons. Municipal suction pumps requested for clearance.",
        "location": "Ukkadam",
        "note": "P4 Low: Minor Street Waterlogging & Traffic Advisory (Telegram)"
    },
    # 6th Position: LOWEST SEVERITY / FILTERED (Non-Emergency Citizen Query)
    "step6_casual_query": {
        "source": "telegram",
        "sender": "@coimbatore_student",
        "message": "Hello team, is there a red alert holiday declared for colleges tomorrow in Coimbatore? Thank you.",
        "location": "Coimbatore",
        "note": "P5 Filtered: Non-Emergency Citizen Query safely filtered by Groq AI (Telegram)"
    },
    # Aliases for backward compatibility
    "step1_flood_psg": {
        "source": "telegram",
        "sender": "@peelamedu_flood_alert",
        "message": "URGENT! Flood barrier breached near PSG College Peelamedu. Rapid water surge exceeding 5 feet inside residential ground floors. 5 people stranded on terrace. Immediate NDRF boat rescue required!",
        "location": "PSG College",
        "note": "P1 Critical: Severe Flash Flood with 5 stranded on rooftop (Telegram)"
    },
    "step2_flood_psg_corroborate": {
        "source": "telegram",
        "sender": "@citizens_watch_cbe",
        "message": "Water has entered several homes near PSG College. Residents need emergency assistance.",
        "location": "PSG College",
        "note": "P1 Critical: Corroborating flood report (Telegram)"
    },
    "step3_flood_psg_web": {
        "source": "telegram",
        "sender": "@student_council_psg",
        "message": "PSG area is flooded. Please send rescue support.",
        "location": "PSG College",
        "note": "P1 Critical: Corroborating flood report #3 (Telegram)"
    },
    "step4_fire_gandhipuram": {
        "source": "telegram",
        "sender": "@cbe_firewatch",
        "message": "EMERGENCY: Massive 3-alarm fire at commercial plaza near Gandhipuram Central Bus Stand! Toxic smoke blocking exit stairs, 8 civilians trapped on 3rd floor. Send fire tenders, hydraulic ladder and EMT immediately!",
        "location": "Gandhipuram",
        "note": "P1 Critical: Structural Commercial Fire with 8 trapped civilians (Telegram)"
    },
    "step5_medical_rspuram": {
        "source": "telegram",
        "sender": "@rspuram_resident",
        "message": "URGENT MEDICAL: Compound wall collapsed due to torrential rains near RS Puram DB Road. 72-year-old resident suffered severe head trauma and fractures. Bleeding profusely, urgent ambulance and paramedic dispatch needed!",
        "location": "RS Puram",
        "note": "P2 High: Critical Medical Trauma & Structural Collapse (Telegram)"
    },
    "step6_non_emergency": {
        "source": "telegram",
        "sender": "@coimbatore_student",
        "message": "Hello team, is there a red alert holiday declared for colleges tomorrow in Coimbatore? Thank you.",
        "location": "Coimbatore",
        "note": "P5 Filtered: Non-Emergency Citizen Query safely filtered by Groq AI (Telegram)"
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
