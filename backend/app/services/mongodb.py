import logging
import uuid
from datetime import datetime
from typing import Dict, Any, Optional, List
from app.database import get_database, clean_mongo_doc

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

    # 4. Check for similar/duplicate active incident
    cursor = db["incidents"].find({"status": {"$in": ["pending", "approved", "responding", "monitoring"]}})
    active_incidents = await cursor.to_list(100)

    match_result = deduplication_engine.find_matching_incident(extraction, active_incidents)
    
    lat_in = message_payload.get("latitude")
    lng_in = message_payload.get("longitude")
    resolved_lat, resolved_lng = resolve_coords(extraction.get("location", ""), lat_in, lng_in)

    source_msg_entry = {
        "message_id": message_id,
        "source": source,
        "sender": sender,
        "phone": message_payload.get("phone"),
        "message": raw_message,
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
        
        # 2. Automated dispatch tasks (simulated Telegram & Email dispatches)
        resources_list = incident.get("resources_required", ["Rescue Team"])
        if not resources_list:
            resources_list = ["First Response Unit"]

        telegram_task = {
            "task_id": f"TSK-TG-{uuid.uuid4().hex[:6].upper()}",
            "incident_id": incident_id,
            "channel": "telegram",
            "target": "RescueFlow Emergency Bot Channel",
            "content": f"🚨 [SIMULATED] CRITICAL ALERT: {incident.get('type').upper()} at {incident.get('location')}. {incident.get('people_affected')} affected. Deploying: {', '.join(resources_list)}",
            "status": "dispatched",
            "is_simulation": True,
            "assigned_team": f"{incident.get('type').title()} Unit Alpha",
            "resources": resources_list,
            "timestamp": now_iso
        }
        await db["response_tasks"].insert_one(telegram_task)

        email_task = {
            "task_id": f"TSK-EM-{uuid.uuid4().hex[:6].upper()}",
            "incident_id": incident_id,
            "channel": "email",
            "target": "rescueflow.demo@gmail.com",
            "content": f"[SIMULATED EMERGENCY DISPATCH] Incident #{incident_id} approved for immediate response. Location: {incident.get('location')}.",
            "status": "dispatched",
            "is_simulation": True,
            "assigned_team": f"{incident.get('type').title()} Unit Alpha",
            "resources": resources_list,
            "timestamp": now_iso
        }
        await db["response_tasks"].insert_one(email_task)

        timeline.append({
            "timestamp": now_iso,
            "event_type": "NOTIFICATIONS_SENT",
            "description": f"Automated response dispatches sent via Telegram and Email to response units",
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
                    "assigned_team": f"{incident.get('type').title()} Unit Alpha",
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
            details={"channels": ["telegram", "email"], "simulated": True}
        )

        # Notify n8n workflow webhook
        await n8n_service.notify_approval_decision(incident_id, "approve", None, decided_by)

        updated_inc = await db["incidents"].find_one({"incident_id": incident_id})
        await broadcaster.broadcast("INCIDENT_UPDATED", updated_inc)
        return {"success": True, "incident": updated_inc, "tasks": [telegram_task, email_task]}

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
        await broadcaster.broadcast("INCIDENT_UPDATED", updated_inc)
        return {"success": True, "incident": updated_inc}
