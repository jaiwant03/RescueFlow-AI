from typing import Dict, Any, List, Tuple
from app.config import settings

def calculate_priority_score(
    extraction_data: Dict[str, Any],
    report_count: int = 1
) -> Tuple[int, str, List[str]]:
    """
    Deterministic hybrid priority engine for RescueFlow AI.
    Calculates a score (0-100), maps it to a level (critical, high, medium, low),
    and generates explainable deterministic reasons.
    """
    score = 0
    reasons: List[str] = []
    weights = settings.PRIORITY_WEIGHTS

    disaster_type = str(extraction_data.get("disaster_type", "")).lower()
    people_affected = int(extraction_data.get("people_affected") or 0)
    severity = str(extraction_data.get("severity", "")).lower()
    immediate_needs = [str(n).lower() for n in extraction_data.get("immediate_need", [])]
    resources_req = [str(r).lower() for r in extraction_data.get("resources_required", [])]
    summary = str(extraction_data.get("summary", "")).lower()
    
    # Vulnerable people check
    vulnerable_info = extraction_data.get("vulnerable_people", {})
    vulnerable_detected = False
    if isinstance(vulnerable_info, dict):
        vulnerable_detected = bool(vulnerable_info.get("detected", False))
        types = vulnerable_info.get("types", [])
    elif isinstance(vulnerable_info, list) and len(vulnerable_info) > 0:
        vulnerable_detected = True
        types = vulnerable_info
    else:
        types = []

    # 1. Immediate life danger check
    is_life_danger = (
        severity == "critical" or
        "trapped" in summary or
        "urgent" in summary or
        any("urgent" in n or "rescue" in n or "evacuation" in n for n in immediate_needs)
    )
    if is_life_danger:
        score += weights.get("immediate_life_danger", 30)
        reasons.append("Immediate life danger detected")

    # 2. People trapped
    is_trapped = (
        "trapped" in summary or
        any("trapped" in n for n in immediate_needs) or
        any("boat" in r or "evacuation" in r for r in resources_req)
    )
    if is_trapped:
        score += weights.get("people_trapped", 20)
        reasons.append("People reported trapped in distress zone")

    # 3. Vulnerable population
    if vulnerable_detected:
        score += weights.get("vulnerable_people", 20)
        types_str = f" ({', '.join(types)})" if types else ""
        reasons.append(f"Vulnerable people present{types_str}")

    # 4. Medical emergency
    is_medical = (
        disaster_type == "medical" or
        "medical" in immediate_needs or
        "ambulance" in resources_req or
        "injured" in summary or
        "hospital" in summary or
        "bleeding" in summary
    )
    if is_medical:
        score += weights.get("medical_emergency", 20)
        reasons.append("Urgent medical attention required")

    # 5. Scale of people affected
    if people_affected >= 10:
        score += weights.get("people_affected_10_plus", 20)
        reasons.append(f"Mass casualty/impact scale: {people_affected}+ people affected")
    elif people_affected >= 5:
        score += weights.get("people_affected_5_to_9", 10)
        reasons.append(f"High impact scale: {people_affected} people affected")

    # 6. Rescue team / boat / air transport required
    is_rescue_req = any(r in resources_req for r in ["rescue_team", "boat", "fire_service", "helicopter"])
    if is_rescue_req:
        score += weights.get("rescue_required", 15)
        reasons.append("Tactical rescue resources requested")

    # 7. Multiple independent reports received (corroboration)
    if report_count > 1:
        score += weights.get("multiple_reports", 10)
        reasons.append(f"Multi-source corroboration ({report_count} independent reports)")

    # 8. High-severity disaster category
    if disaster_type in ["flood", "fire", "building_collapse", "earthquake", "landslide"]:
        score += weights.get("critical_disaster_type", 15)
        reasons.append(f"High-consequence disaster type: {disaster_type.replace('_', ' ').title()}")

    # Cap score at 100 max, 5 min for valid emergencies
    final_score = min(max(score, 10), 100)

    # Determine priority tier
    if final_score >= 80:
        priority_level = "critical"
    elif final_score >= 60:
        priority_level = "high"
    elif final_score >= 30:
        priority_level = "medium"
    else:
        priority_level = "low"

    if not reasons:
        reasons.append("Standard triage baseline applied")

    return final_score, priority_level, reasons
