import logging
import uuid
from datetime import datetime
from typing import Dict, Any, Optional, List
from app.database import get_database, clean_mongo_doc
from app.services.realtime import broadcaster
from app.services.groq_service import groq_service
from app.services.priority_engine import calculate_priority_score
from app.services.deduplication import deduplication_engine
from app.services.audit import log_audit_event
from app.services.n8n import n8n_service

logger = logging.getLogger("rescueflow.mongo_service")

# Comprehensive Coimbatore & Tamil Nadu tactical gazetteer for realistic GIS mapping
COIMBATORE_LOCATIONS = {
    # Central Coimbatore & Landmarks
    "gandhipuram": {"lat": 11.0168, "lng": 76.9674},
    "cross cut road": {"lat": 11.0195, "lng": 76.9642},
    "100 feet road": {"lat": 11.0195, "lng": 76.9642},
    "town hall": {"lat": 10.9967, "lng": 76.9629},
    "railway station": {"lat": 10.9983, "lng": 76.9678},
    "coimbatore junction": {"lat": 10.9983, "lng": 76.9678},
    "junction": {"lat": 10.9983, "lng": 76.9678},
    "race course": {"lat": 11.0028, "lng": 76.9712},
    "rs puram": {"lat": 11.0085, "lng": 76.9489},
    "r.s. puram": {"lat": 11.0085, "lng": 76.9489},
    "gandhipark": {"lat": 11.0052, "lng": 76.9452},
    "gandhi park": {"lat": 11.0052, "lng": 76.9452},
    "tatabad": {"lat": 11.0225, "lng": 76.9625},
    "siddhapudur": {"lat": 11.0195, "lng": 76.9745},
    "ram nagar": {"lat": 11.0142, "lng": 76.9621},

    # North & West Zones
    "saibaba colony": {"lat": 11.0289, "lng": 76.9427},
    "saibaba": {"lat": 11.0289, "lng": 76.9427},
    "vadavalli": {"lat": 11.0261, "lng": 76.9038},
    "thudiyalur": {"lat": 11.0772, "lng": 76.9385},
    "koundampalayam": {"lat": 11.0456, "lng": 76.9392},
    "goundampalayam": {"lat": 11.0456, "lng": 76.9392},
    "edikarai": {"lat": 11.1025, "lng": 76.9425},
    "periyanaickenpalayam": {"lat": 11.1458, "lng": 76.9361},
    "chinnathadagam": {"lat": 11.0621, "lng": 76.8654},
    "thondamuthur": {"lat": 10.9985, "lng": 76.8432},
    "perur": {"lat": 10.9782, "lng": 76.9189},
    "marudhamalai": {"lat": 11.0465, "lng": 76.8528},

    # East & IT Corridor
    "peelamedu": {"lat": 11.0315, "lng": 77.0065},
    "hopes college": {"lat": 11.0232, "lng": 77.0116},
    "hopes": {"lat": 11.0232, "lng": 77.0116},
    "avinashi road": {"lat": 11.0275, "lng": 76.9950},
    "psg college": {"lat": 11.0248, "lng": 77.0028},
    "psg tech": {"lat": 11.0248, "lng": 77.0028},
    "psg": {"lat": 11.0248, "lng": 77.0028},
    "cit": {"lat": 11.0285, "lng": 77.0315},
    "airport": {"lat": 11.0298, "lng": 77.0434},
    "civil aerodrome": {"lat": 11.0298, "lng": 77.0434},
    "singanallur": {"lat": 10.9996, "lng": 77.0264},
    "ondipudur": {"lat": 10.9952, "lng": 77.0456},
    "irugur": {"lat": 11.0095, "lng": 77.0652},
    "neelambur": {"lat": 11.0543, "lng": 77.0854},
    "sulur": {"lat": 11.0275, "lng": 77.1265},
    "somanur": {"lat": 11.0967, "lng": 77.1942},
    "saravanampatti": {"lat": 11.0805, "lng": 76.9958},
    "kalapatti": {"lat": 11.0722, "lng": 77.0372},
    "chinnavedampatti": {"lat": 11.0642, "lng": 76.9854},
    "ganapathy": {"lat": 11.0371, "lng": 76.9749},
    "avarampalayam": {"lat": 11.0256, "lng": 76.9812},
    "pappanaickenpalayam": {"lat": 11.0142, "lng": 76.9825},
    "pn palayam": {"lat": 11.0142, "lng": 76.9825},
    "sowripalayam": {"lat": 11.0065, "lng": 77.0012},
    "ramanathapuram": {"lat": 10.9972, "lng": 76.9886},

    # South Zones
    "ukkadam": {"lat": 10.9892, "lng": 76.9589},
    "selvapuram": {"lat": 10.9852, "lng": 76.9385},
    "telungupalayam": {"lat": 10.9982, "lng": 76.9254},
    "kottaimedu": {"lat": 10.9925, "lng": 76.9598},
    "podanur": {"lat": 10.9632, "lng": 76.9912},
    "kuniyamuthur": {"lat": 10.9575, "lng": 76.9535},
    "sundarapuram": {"lat": 10.9501, "lng": 76.9754},
    "kurichi": {"lat": 10.9452, "lng": 76.9685},
    "kovaipudur": {"lat": 10.9416, "lng": 76.9367},
    "eachanari": {"lat": 10.9234, "lng": 76.9678},
    "madukkarai": {"lat": 10.9048, "lng": 76.9632},
    "kinathukadavu": {"lat": 10.8215, "lng": 77.0210},
    "pollachi": {"lat": 10.6609, "lng": 77.0048},
    "mettupalayam": {"lat": 11.3000, "lng": 76.9500},
    "karamadai": {"lat": 11.2422, "lng": 76.9578},

    # Medical & Lakes
    "kmch": {"lat": 11.0425, "lng": 77.0385},
    "gknm": {"lat": 11.0112, "lng": 76.9805},
    "cmch": {"lat": 11.0012, "lng": 76.9682},
    "coimbatore medical college": {"lat": 11.0012, "lng": 76.9682},
    "valankulam": {"lat": 10.9950, "lng": 76.9680},
    "periyakulam": {"lat": 10.9880, "lng": 76.9550},
    "singanallur lake": {"lat": 10.9912, "lng": 77.0254},
    "muthannankulam": {"lat": 11.0080, "lng": 76.9380},
    "kurichi lake": {"lat": 10.9420, "lng": 76.9650},
    "coimbatore": {"lat": 11.0168, "lng": 76.9558},
}

Tuple_coords = tuple[Optional[float], Optional[float]]

def resolve_coords(location_str: str, lat: Optional[float], lng: Optional[float]) -> Tuple_coords:
    """
    Resolves geographic latitude and longitude with 4-tier tactical accuracy:
    1. Direct GPS coordinates (e.g. native Telegram location share or mobile GPS)
    2. Embedded coordinate regex in location text
    3. Comprehensive Coimbatore tactical gazetteer match
    4. Deterministic sector geocoding fallback (ensuring the map marker is ALWAYS displayed)
    """
    import re
    import hashlib

    # 1. Direct coordinates
    if lat is not None and lng is not None:
        try:
            return round(float(lat), 5), round(float(lng), 5)
        except (ValueError, TypeError):
            pass

    loc_str = str(location_str or "").strip()

    # 2. Coordinate regex in text (e.g. "11.0168, 76.9674" or "11.0248 N 77.0028 E")
    coord_match = re.search(r'(-?\d{1,2}\.\d{3,7})[,\s]+(-?\d{1,3}\.\d{3,7})', loc_str)
    if coord_match:
        try:
            return round(float(coord_match.group(1)), 5), round(float(coord_match.group(2)), 5)
        except (ValueError, TypeError):
            pass

    # 3. Tactical gazetteer keyword search
    loc_lower = loc_str.lower()
    for key, coords in COIMBATORE_LOCATIONS.items():
        if key in loc_lower:
            return coords["lat"], coords["lng"]

    # 4. Deterministic sector geocoding fallback
    # If the user reported an unlisted ward, street, or building, deterministically map it
    # to a fixed, realistic coordinate in the Coimbatore operations sector so the map ALWAYS has a pin.
    if loc_lower and loc_lower not in ["unspecified location", "unknown", "none", ""]:
        loc_hash = int(hashlib.md5(loc_lower.encode("utf-8")).hexdigest()[:8], 16)
        lat_jitter = ((loc_hash % 400) - 200) / 10000.0  # +/- 0.020 deg (~2km)
        lng_jitter = (((loc_hash // 400) % 400) - 200) / 10000.0
        return round(11.0168 + lat_jitter, 5), round(76.9558 + lng_jitter, 5)

    # Operations Center Default
    return 11.0168, 76.9558

def sanitize_doc(doc: Optional[Dict[str, Any]]) -> Optional[Dict[str, Any]]:
    return clean_mongo_doc(doc)



async def get_next_incident_id(db) -> str:
    count = await db["incidents"].count_documents({})
    return f"INC-{str(count + 1024).zfill(6)}"

async def process_emergency_intake(message_payload: Dict[str, Any]) -> Dict[str, Any]:
    """
    Core intake processing pipeline:
    1. Idempotency check
    2. Message ingestion
    3. AI emergency classification (Groq)
    4. AI info extraction (Groq)
    5. Deduplication & incident grouping
    6. Priority calculation
    7. MongoDB persistence
    8. Real-time dashboard broadcast
    """
    db = get_database()
    message_id = message_payload.get("message_id") or f"MSG-{uuid.uuid4().hex[:8].upper()}"
    raw_message = message_payload.get("message", "").strip()

    # 1. Idempotency check
    existing_msg = await db["messages"].find_one({"message_id": message_id})
    if existing_msg and existing_msg.get("status") == "processed":
        logger.info(f"Message {message_id} has already been processed (idempotency triggered).")
        return {"status": "already_processed", "message_id": message_id, "incident_id": existing_msg.get("incident_id")}

    now_iso = datetime.utcnow().isoformat()
    source = message_payload.get("source", "web")
    sender = message_payload.get("name") or message_payload.get("sender") or "Anonymous Citizen"
    location_hint = message_payload.get("location") or message_payload.get("location_hint")

    # Record initial audit event
    await log_audit_event(
        event_type="MESSAGE_RECEIVED",
        message_id=message_id,
        source=source,
        actor=sender,
        details={"message_preview": raw_message[:100], "location_hint": location_hint}
    )

    # 2. Groq AI Classification
    classification = await groq_service.classify_emergency(raw_message)
    is_emergency = classification.get("is_emergency", False)
    emergency_type = classification.get("emergency_type", "other")
    confidence = classification.get("confidence", 0.0)

    await log_audit_event(
        event_type="AI_CLASSIFIED",
        message_id=message_id,
        source="groq_ai",
        actor="Groq Engine",
        details=classification
    )

    # If casual / non-emergency:
    if not is_emergency:
        msg_record = {
            "message_id": message_id,
            "source": source,
            "sender": sender,
            "message": raw_message,
            "location_hint": location_hint,
            "timestamp": now_iso,
            "is_emergency": False,
            "emergency_type": emergency_type,
            "confidence": confidence,
            "classification_reason": classification.get("reason"),
            "status": "non_emergency",
            "incident_id": None
        }
        await db["messages"].insert_one(msg_record)
        msg_record = sanitize_doc(msg_record)
        await broadcaster.broadcast("MESSAGE_NON_EMERGENCY", msg_record)
        return {
            "status": "non_emergency",
            "message_id": message_id,
            "reason": classification.get("reason")
        }

    # 3. Groq AI Information Extraction
    extraction = await groq_service.extract_information(raw_message)
    if location_hint and (extraction.get("location") == "Unspecified Location" or not extraction.get("location")):
        extraction["location"] = location_hint

    await log_audit_event(
        event_type="AI_EXTRACTED",
        message_id=message_id,
        source="groq_ai",
        actor="Groq Engine",
        details=extraction
    )

    # 4. Check for similar/duplicate active incident & resolve GIS coordinates
    lat_in = message_payload.get("latitude")
    lng_in = message_payload.get("longitude")
    loc_name = extraction.get("location", "")
    
    # If AI extraction missed location name, scan raw message with gazetteer
    if not loc_name or loc_name.lower() in ["unspecified location", "unknown", "none"]:
        for key in COIMBATORE_LOCATIONS:
            if key in raw_message.lower():
                loc_name = key.title()
                extraction["location"] = loc_name
                break

    resolved_lat, resolved_lng = resolve_coords(loc_name or raw_message, lat_in, lng_in)

    cursor = db["incidents"].find({"status": {"$in": ["pending", "approved", "responding", "monitoring"]}})
    active_incidents = await cursor.to_list(100)

    match_result = deduplication_engine.find_matching_incident(
        extraction,
        active_incidents,
        new_lat=resolved_lat,
        new_lng=resolved_lng
    )

    source_msg_entry = {
        "message_id": message_id,
        "source": source,
        "sender": sender,
        "phone": message_payload.get("phone"),
        "message": raw_message,
        "image_url": message_payload.get("image_url"),
        "timestamp": now_iso
    }

    if match_result:
        # ----------------- MERGE WITH EXISTING INCIDENT -----------------
        matched_incident, sim_score, match_reason = match_result
        inc_id = matched_incident["incident_id"]

        merged_data = deduplication_engine.merge_incident_data(
            existing=matched_incident,
            new_extraction=extraction,
            source_message=source_msg_entry
        )

        if message_payload.get("image_url") and not merged_data.get("image_url"):
            merged_data["image_url"] = message_payload.get("image_url")
            merged_data.setdefault("images", []).append(message_payload.get("image_url"))

        # Recalculate priority with new corroboration count
        new_score, new_priority_level, new_reasons = calculate_priority_score(
            extraction_data={
                "disaster_type": merged_data.get("type"),
                "people_affected": merged_data.get("people_affected"),
                "severity": extraction.get("severity"),
                "immediate_need": merged_data.get("immediate_needs"),
                "resources_required": merged_data.get("resources_required"),
                "vulnerable_people": merged_data.get("vulnerable_people"),
                "summary": extraction.get("summary")
            },
            report_count=merged_data["report_count"]
        )

        merged_data["priority_score"] = new_score
        merged_data["priority_level"] = new_priority_level
        merged_data["priority_reasons"] = new_reasons
        merged_data["updated_at"] = now_iso

        # Append timeline event
        timeline = list(merged_data.get("timeline", []))
        timeline.append({
            "timestamp": now_iso,
            "event_type": "REPORT_MERGED",
            "description": f"Corroborating report #{merged_data['report_count']} merged from {source.upper()} ({sender})",
            "actor": "Deduplication Engine",
            "details": {"similarity_score": round(sim_score, 2), "reason": match_reason}
        })
        merged_data["timeline"] = timeline

        # Persist updated incident
        await db["incidents"].update_one({"incident_id": inc_id}, {"$set": merged_data})

        # Save message record
        msg_record = {
            "message_id": message_id,
            "source": source,
            "sender": sender,
            "phone": message_payload.get("phone"),
            "message": raw_message,
            "location_hint": extraction.get("location"),
            "latitude": resolved_lat,
            "longitude": resolved_lng,
            "image_url": message_payload.get("image_url"),
            "timestamp": now_iso,
            "is_emergency": True,
            "emergency_type": merged_data["type"],
            "confidence": confidence,
            "status": "processed",
            "incident_id": inc_id
        }
        await db["messages"].insert_one(msg_record)

        await log_audit_event(
            event_type="DUPLICATE_DETECTED",
            incident_id=inc_id,
            message_id=message_id,
            source="deduplication",
            actor="Deduplication Engine",
            details={"merged_into": inc_id, "similarity_score": round(sim_score, 2), "total_reports": merged_data["report_count"]}
        )
        await log_audit_event(
            event_type="INCIDENT_UPDATED",
            incident_id=inc_id,
            message_id=message_id,
            source="system",
            actor="RescueFlow Intelligence",
            details={"priority_score": new_score, "report_count": merged_data["report_count"]}
        )

        merged_data = sanitize_doc(merged_data)
        await broadcaster.broadcast("INCIDENT_UPDATED", merged_data)
        return {"status": "merged", "incident_id": inc_id, "report_count": merged_data["report_count"], "incident": merged_data}

    else:
        # ----------------- CREATE NEW INCIDENT -----------------
        inc_id = await get_next_incident_id(db)

        score, priority_level, reasons = calculate_priority_score(
            extraction_data=extraction,
            report_count=1
        )

        needs_approval = priority_level in ["critical", "high"]
        approval_status = "pending" if needs_approval else "not_required"

        timeline = [
            {"timestamp": now_iso, "event_type": "MESSAGE_RECEIVED", "description": f"Initial report received via {source.upper()}", "actor": sender},
            {"timestamp": now_iso, "event_type": "EMERGENCY_DETECTED", "description": f"AI classified situation as {extraction.get('disaster_type', 'emergency').upper()}", "actor": "Groq AI"},
            {"timestamp": now_iso, "event_type": "INFO_EXTRACTED", "description": f"Location: {extraction.get('location')} | Impact: {extraction.get('people_affected')} people", "actor": "Groq AI"},
            {"timestamp": now_iso, "event_type": "PRIORITY_CALCULATED", "description": f"Calculated priority score {score} ({priority_level.upper()})", "actor": "Priority Engine"}
        ]

        if needs_approval:
            timeline.append({
                "timestamp": now_iso,
                "event_type": "APPROVAL_REQUESTED",
                "description": "Requires Human Operator Authorization before automated dispatch",
                "actor": "System"
            })

        new_incident = {
            "incident_id": inc_id,
            "type": extraction.get("disaster_type", "other"),
            "location": extraction.get("location", "Unspecified Location"),
            "latitude": resolved_lat,
            "longitude": resolved_lng,
            "people_affected": extraction.get("people_affected", 0),
            "vulnerable_people": extraction.get("vulnerable_people", {}).get("types", []),
            "immediate_needs": extraction.get("immediate_need", []),
            "resources_required": extraction.get("resources_required", []),
            "severity": extraction.get("severity", "medium"),
            "priority_score": score,
            "priority_level": priority_level,
            "priority_reasons": reasons,
            "report_count": 1,
            "status": "pending",
            "approval_status": approval_status,
            "approved_by": None,
            "approved_at": None,
            "rejection_reason": None,
            "assigned_team": None,
            "source_messages": [source_msg_entry],
            "timeline": timeline,
            "ai_summary": extraction.get("summary"),
            "image_url": message_payload.get("image_url"),
            "images": [message_payload.get("image_url")] if message_payload.get("image_url") else [],
            "created_at": now_iso,
            "updated_at": now_iso
        }

        await db["incidents"].insert_one(new_incident)

        # Create approval record if required
        if needs_approval:
            approval_doc = {
                "approval_id": f"APP-{uuid.uuid4().hex[:6].upper()}",
                "incident_id": inc_id,
                "disaster_type": new_incident["type"],
                "location": new_incident["location"],
                "people_affected": new_incident["people_affected"],
                "priority_score": score,
                "priority_level": priority_level,
                "recommended_resources": new_incident["resources_required"],
                "status": "pending",
                "decision": None,
                "decided_by": None,
                "decided_at": None,
                "rejection_reason": None,
                "created_at": now_iso
            }
            await db["approvals"].insert_one(approval_doc)
            await log_audit_event(
                event_type="APPROVAL_REQUESTED",
                incident_id=inc_id,
                message_id=message_id,
                source="approval_service",
                actor="System",
                details={"priority_level": priority_level, "score": score}
            )

        # Save message record
        msg_record = {
            "message_id": message_id,
            "source": source,
            "sender": sender,
            "phone": message_payload.get("phone"),
            "message": raw_message,
            "location_hint": extraction.get("location"),
            "latitude": resolved_lat,
            "longitude": resolved_lng,
            "image_url": message_payload.get("image_url"),
            "timestamp": now_iso,
            "is_emergency": True,
            "emergency_type": new_incident["type"],
            "confidence": confidence,
            "status": "processed",
            "incident_id": inc_id
        }
        await db["messages"].insert_one(msg_record)

        await log_audit_event(
            event_type="INCIDENT_CREATED",
            incident_id=inc_id,
            message_id=message_id,
            source="system",
            actor="RescueFlow Core",
            details={"location": new_incident["location"], "type": new_incident["type"], "priority": priority_level}
        )

        new_incident = sanitize_doc(new_incident)
        await broadcaster.broadcast("INCIDENT_CREATED", new_incident)
        return {"status": "created", "incident_id": inc_id, "incident": new_incident}

async def execute_approval_decision(
    incident_id: str,
    decision: str,
    reason: Optional[str] = None,
    decided_by: str = "Command Chief"
) -> Dict[str, Any]:
    """
    Executes operator decision (approve or reject) and generates automated response tasks if approved.
    """
    db = get_database()
    incident = await db["incidents"].find_one({"incident_id": incident_id})
    if not incident:
        return {"success": False, "error": f"Incident {incident_id} not found"}

    now_iso = datetime.utcnow().isoformat()
    timeline = list(incident.get("timeline", []))

    if decision.lower() == "approve":
        # 1. Update incident
        timeline.append({
            "timestamp": now_iso,
            "event_type": "RESPONSE_APPROVED",
            "description": f"Human operator authorized emergency deployment (Authorized by {decided_by})",
            "actor": decided_by
        })
        
        # 2. Automated dispatch tasks (routed by incident reporting channel)
        resources_list = incident.get("resources_required", ["Rescue Team"])
        if not resources_list:
            resources_list = ["First Response Unit"]

        # Determine reporting channel(s) from incident source messages
        source_messages = incident.get("source_messages", [])
        reporting_sources = set()
        has_explicit_email = False
        email_targets = []

        # Helper to validate email addresses (strictly distinguishing from Telegram @handles)
        def _is_real_email(s: str) -> bool:
            if not s or not isinstance(s, str):
                return False
            s = s.strip()
            if s.startswith("@"):
                return False
            import re
            return bool(re.match(r"^[^@\s]+@[^@\s]+\.[^@\s]+$", s))

        for msg in source_messages:
            if isinstance(msg, dict):
                src = str(msg.get("source", "")).lower().strip()
                if src:
                    reporting_sources.add(src)
                sender = str(msg.get("sender", "")).strip()
                email_val = str(msg.get("email", "")).strip()
                if _is_real_email(email_val):
                    has_explicit_email = True
                    if email_val not in email_targets:
                        email_targets.append(email_val)
                elif _is_real_email(sender):
                    has_explicit_email = True
                    if sender not in email_targets:
                        email_targets.append(sender)

        # Fallback to incident-level source if source_messages is empty
        if not reporting_sources and incident.get("source"):
            reporting_sources.add(str(incident.get("source", "")).lower().strip())

        is_telegram_source = "telegram" in reporting_sources
        is_email_source = "email" in reporting_sources or has_explicit_email

        # Channel dispatch routing:
        # If reported strictly via Telegram, dispatch ONLY via Telegram (do not generate or show Email)
        if is_telegram_source and not is_email_source:
            send_telegram = True
            send_email = False
        # If reported strictly via Email, dispatch ONLY via Email
        elif is_email_source and not is_telegram_source:
            send_telegram = False
            send_email = True
        # If multi-channel reports (merged Telegram + Email)
        elif is_telegram_source and is_email_source:
            send_telegram = True
            send_email = True
        # Default fallback (e.g. portal/manual): default to Telegram response channel
        else:
            send_telegram = True
            send_email = False

        dispatched_tasks = []
        dispatched_channel_names = []
        incident_type = str(incident.get("type") or "emergency")
        incident_loc = incident.get("location") or "Unspecified Location"
        affected_count = incident.get("people_affected") or 0

        if send_telegram:
            telegram_task = {
                "task_id": f"TSK-TG-{uuid.uuid4().hex[:6].upper()}",
                "incident_id": incident_id,
                "channel": "telegram",
                "target": "RescueFlow Emergency Bot Channel",
                "content": f"🚨 [SIMULATED] CRITICAL ALERT: {incident_type.upper()} at {incident_loc}. {affected_count} affected. Deploying: {', '.join(resources_list)}",
                "status": "dispatched",
                "is_simulation": True,
                "assigned_team": f"{incident_type.title()} Unit Alpha",
                "resources": resources_list,
                "timestamp": now_iso
            }
            await db["response_tasks"].insert_one(telegram_task)
            dispatched_tasks.append(telegram_task)
            dispatched_channel_names.append("Telegram")

            # Also trigger Telegram bot alert if live token configured
            try:
                from app.services.telegram_service import telegram_service
                if telegram_service.is_configured:
                    await telegram_service.broadcast_incident_alert(incident)
            except Exception as e:
                logger.warning(f"Telegram dispatch alert notification failed: {e}")

        if send_email:
            target_email = email_targets[0] if email_targets else "rescueflow.demo@gmail.com"
            email_task = {
                "task_id": f"TSK-EM-{uuid.uuid4().hex[:6].upper()}",
                "incident_id": incident_id,
                "channel": "email",
                "target": target_email,
                "content": f"[SIMULATED EMERGENCY DISPATCH] Incident #{incident_id} approved for immediate response. Location: {incident_loc}.",
                "status": "dispatched",
                "is_simulation": True,
                "assigned_team": f"{incident_type.title()} Unit Alpha",
                "resources": resources_list,
                "timestamp": now_iso
            }
            await db["response_tasks"].insert_one(email_task)
            dispatched_tasks.append(email_task)
            dispatched_channel_names.append("Email")

        channels_description = " and ".join(dispatched_channel_names) if dispatched_channel_names else "Field Units"
        timeline.append({
            "timestamp": now_iso,
            "event_type": "NOTIFICATIONS_SENT",
            "description": f"Automated response dispatch sent via {channels_description} to response units",
            "actor": "n8n Automated Response"
        })

        await db["incidents"].update_one(
            {"incident_id": incident_id},
            {
                "$set": {
                    "status": "approved",
                    "approval_status": "approved",
                    "approved_by": decided_by,
                    "approved_at": now_iso,
                    "assigned_team": f"{incident_type.title()} Unit Alpha",
                    "timeline": timeline,
                    "updated_at": now_iso
                }
            }
        )

        # Update approval collection
        await db["approvals"].update_one(
            {"incident_id": incident_id},
            {
                "$set": {
                    "status": "approved",
                    "decision": "approved",
                    "decided_by": decided_by,
                    "decided_at": now_iso
                }
            }
        )

        await log_audit_event(
            event_type="APPROVED",
            incident_id=incident_id,
            source="approval_center",
            actor=decided_by,
            details={"resources": resources_list}
        )
        await log_audit_event(
            event_type="NOTIFICATION_SENT",
            incident_id=incident_id,
            source="n8n_response",
            actor="Automated Dispatch",
            details={"channels": [t.get("channel") for t in dispatched_tasks], "simulated": True}
        )

        # Notify n8n workflow webhook
        await n8n_service.notify_approval_decision(incident_id, "approve", None, decided_by)

        updated_inc = await db["incidents"].find_one({"incident_id": incident_id})
        updated_inc = sanitize_doc(updated_inc)
        await broadcaster.broadcast("INCIDENT_UPDATED", updated_inc)
        return {"success": True, "incident": updated_inc, "tasks": sanitize_doc(dispatched_tasks)}


    else:
        # REJECT
        timeline.append({
            "timestamp": now_iso,
            "event_type": "RESPONSE_REJECTED",
            "description": f"Operator rejected automated dispatch: {reason or 'No reason provided'}",
            "actor": decided_by
        })

        await db["incidents"].update_one(
            {"incident_id": incident_id},
            {
                "$set": {
                    "status": "rejected",
                    "approval_status": "rejected",
                    "rejection_reason": reason or "Operator rejection",
                    "timeline": timeline,
                    "updated_at": now_iso
                }
            }
        )

        await db["approvals"].update_one(
            {"incident_id": incident_id},
            {
                "$set": {
                    "status": "rejected",
                    "decision": "rejected",
                    "decided_by": decided_by,
                    "decided_at": now_iso,
                    "rejection_reason": reason
                }
            }
        )

        await log_audit_event(
            event_type="REJECTED",
            incident_id=incident_id,
            source="approval_center",
            actor=decided_by,
            details={"reason": reason}
        )

        await n8n_service.notify_approval_decision(incident_id, "reject", reason, decided_by)

        updated_inc = await db["incidents"].find_one({"incident_id": incident_id})
        updated_inc = sanitize_doc(updated_inc)
        await broadcaster.broadcast("INCIDENT_UPDATED", updated_inc)
        return {"success": True, "incident": updated_inc}

