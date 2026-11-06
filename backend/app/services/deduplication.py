import logging
import math
from typing import Dict, Any, Optional, List, Tuple
from app.config import settings

logger = logging.getLogger("rescueflow.deduplication")

# Disaster compatibility matrix: which types can reasonably refer to the same physical incident
DISASTER_COMPATIBILITY = {
    "flood": {"flood", "waterlogging", "heavy_rain", "inundation", "dam_breach"},
    "fire": {"fire", "gas_leak", "explosion", "chemical_hazard", "smoke"},
    "building_collapse": {"building_collapse", "structural_damage", "debris_collapse", "landslide"},
    "earthquake": {"earthquake", "building_collapse", "structural_damage"},
    "landslide": {"landslide", "mudslide", "debris_collapse"},
    "medical": {"medical", "casualty", "injury", "mass_casualty"},
    "hazard": {"hazard", "gas_leak", "electrical", "chemical_hazard", "power_line"},
    "accident": {"accident", "road_accident", "train_accident", "collision"},
    "cyclone": {"cyclone", "storm", "hurricane", "flood", "wind_damage"},
    "other": {"other"}
}

def are_disasters_compatible(type1: str, type2: str) -> bool:
    """Verifies that two reports describe compatible disaster categories."""
    t1 = str(type1 or "other").lower().strip()
    t2 = str(type2 or "other").lower().strip()
    if t1 == t2:
        return True
    if t1 == "other" or t2 == "other":
        return True
    compat1 = DISASTER_COMPATIBILITY.get(t1, {t1})
    compat2 = DISASTER_COMPATIBILITY.get(t2, {t2})
    return bool(compat1.intersection({t2}) or compat2.intersection({t1}))

def haversine_distance_km(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Computes great-circle distance between two GPS coordinates in kilometers."""
    R = 6371.0  # Earth radius in kilometers
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = (math.sin(dlat / 2) ** 2 +
         math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) *
         math.sin(dlon / 2) ** 2)
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return R * c

class DeduplicationEngine:
    def __init__(self, threshold: float = 0.75):
        self.threshold = threshold

    def _normalize_string(self, text: str) -> str:
        return "".join(c.lower() for c in str(text or "") if c.isalnum() or c.isspace()).strip()

    def _calculate_token_similarity(self, s1: str, s2: str) -> float:
        """Computes Jaccard token overlap similarity."""
        tokens1 = set(self._normalize_string(s1).split())
        tokens2 = set(self._normalize_string(s2).split())
        if not tokens1 or not tokens2:
            return 0.0
        intersection = tokens1.intersection(tokens2)
        union = tokens1.union(tokens2)
        return len(intersection) / len(union)

    def _locations_match(
        self,
        loc1: str,
        loc2: str,
        lat1: Optional[float] = None,
        lon1: Optional[float] = None,
        lat2: Optional[float] = None,
        lon2: Optional[float] = None
    ) -> Tuple[bool, float]:
        """
        Determines if two locations refer to the same geographic area.
        Combines GPS Haversine distance with landmark token matching.
        Returns (is_match, spatial_confidence).
        """
        # 1. High-precision GPS Haversine check if coordinates exist
        if lat1 is not None and lon1 is not None and lat2 is not None and lon2 is not None:
            try:
                dist = haversine_distance_km(float(lat1), float(lon1), float(lat2), float(lon2))
                if dist <= 0.8:  # Within 800 meters: strong spatial match
                    return True, 0.95
                elif dist > 5.0:  # Farther than 5km: cannot be same localized incident
                    return False, 0.0
            except (ValueError, TypeError):
                pass

        # 2. Textual landmark matching
        l1 = self._normalize_string(loc1)
        l2 = self._normalize_string(loc2)
        if not l1 or not l2:
            return False, 0.0
        
        # Exact or substring match
        if l1 in l2 or l2 in l1:
            return True, 0.90

        # Key landmark extraction (e.g., "psg", "gandhipuram", "rs puram", "peelamedu")
        stop_words = {"near", "the", "in", "at", "area", "street", "road", "bus", "stand", "college", "nagar", "ward", "junction"}
        tokens1 = set(l1.split()) - stop_words
        tokens2 = set(l2.split()) - stop_words
        significant_overlap = tokens1.intersection(tokens2)
        if len(significant_overlap) > 0:
            return True, 0.85

        # Fallback to Jaccard token similarity
        jaccard = self._calculate_token_similarity(loc1, loc2)
        if jaccard >= 0.50:
            return True, jaccard

        return False, 0.0

    def find_matching_incident(
        self,
        new_extraction: Dict[str, Any],
        active_incidents: List[Dict[str, Any]],
        new_lat: Optional[float] = None,
        new_lng: Optional[float] = None
    ) -> Optional[Tuple[Dict[str, Any], float, str]]:
        """
        Scans active incidents for semantic, geographic, and disaster compatibility.
        Returns (matched_incident, similarity_score, reason) or None.
        """
        new_type = str(new_extraction.get("disaster_type", "")).lower()
        new_loc = str(new_extraction.get("location", ""))
        new_summary = str(new_extraction.get("summary", ""))

        best_match = None
        best_score = 0.0
        best_reason = ""

        for inc in active_incidents:
            # Skip resolved, rejected, or archived incidents
            if inc.get("status") in ["resolved", "rejected", "archived"]:
                continue

            inc_type = str(inc.get("type", "")).lower()
            inc_loc = str(inc.get("location", ""))
            inc_summary = str(inc.get("ai_summary", ""))
            inc_lat = inc.get("latitude")
            inc_lng = inc.get("longitude")

            # 1. Disaster types must be compatible
            if not are_disasters_compatible(inc_type, new_type):
                continue

            # 2. Check location alignment with Haversine distance
            loc_matched, spatial_conf = self._locations_match(
                new_loc, inc_loc,
                lat1=new_lat, lon1=new_lng,
                lat2=inc_lat, lon2=inc_lng
            )
            if not loc_matched:
                continue

            # 3. Compute text similarity on summaries and locations
            loc_sim = max(spatial_conf, self._calculate_token_similarity(new_loc, inc_loc))
            summary_sim = self._calculate_token_similarity(new_summary, inc_summary)
            
            # Weighted combined similarity
            combined_score = (loc_sim * 0.55) + (summary_sim * 0.45)
            
            # Strong boost for matching specific landmark + same disaster
            if loc_matched and inc_type == new_type:
                combined_score = max(combined_score, 0.88)

            if combined_score > best_score:
                best_score = combined_score
                best_match = inc
                best_reason = f"Location '{inc_loc}' aligns with '{new_loc}' (confidence: {loc_sim:.2f}) for disaster type '{inc_type}'"

        if best_match and best_score >= self.threshold:
            logger.info(f"Duplicate/Similar incident match found: {best_match.get('incident_id')} (score: {best_score:.2f})")
            return best_match, best_score, best_reason

        return None

    def merge_incident_data(
        self,
        existing: Dict[str, Any],
        new_extraction: Dict[str, Any],
        source_message: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Intelligently merges new emergency report data into an existing incident without losing history.
        Preserves history, takes peak reported affected count, unions resources, and prevents victim count inflation.
        """
        updated = dict(existing)

        # 1. Increment report count
        current_count = int(existing.get("report_count", 1))
        updated["report_count"] = current_count + 1

        # 2. Append source message
        source_msgs = list(existing.get("source_messages", []))
        source_msgs.append(source_message)
        updated["source_messages"] = source_msgs

        # 3. People affected: Take max reported count to reflect peak severity (avoids double counting)
        new_people = int(new_extraction.get("people_affected") or 0)
        existing_people = int(existing.get("people_affected") or 0)
        # Cap realistic jump to prevent absurd outliers (e.g. 50,000 from single message)
        if new_people > 0 and new_people < 10000:
            updated["people_affected"] = max(existing_people, new_people)

        # 4. Merge vulnerable people
        existing_vuln = list(existing.get("vulnerable_people", []))
        new_vuln_info = new_extraction.get("vulnerable_people", {})
        new_vuln_types = []
        if isinstance(new_vuln_info, dict):
            new_vuln_types = new_vuln_info.get("types", [])
        elif isinstance(new_vuln_info, list):
            new_vuln_types = new_vuln_info
        for v in new_vuln_types:
            if v and v not in existing_vuln:
                existing_vuln.append(v)
        updated["vulnerable_people"] = existing_vuln

        # 5. Merge immediate needs
        existing_needs = list(existing.get("immediate_needs", []))
        for n in new_extraction.get("immediate_need", []):
            if n and n not in existing_needs:
                existing_needs.append(n)
        updated["immediate_needs"] = existing_needs

        # 6. Merge resources required
        existing_res = list(existing.get("resources_required", []))
        for r in new_extraction.get("resources_required", []):
            if r and r not in existing_res:
                existing_res.append(r)
        updated["resources_required"] = existing_res

        # 7. Coordinates update if existing was null
        if not existing.get("latitude") and source_message.get("latitude"):
            updated["latitude"] = source_message.get("latitude")
            updated["longitude"] = source_message.get("longitude")

        return updated

    def correlate_regional_events(
        self,
        incidents: List[Dict[str, Any]],
        radius_km: float = 2.0
    ) -> List[Dict[str, Any]]:
        """
        Correlates active distinct incidents within a geographic radius into regional event clusters.
        Does not merge records; provides macro-level situational intelligence.
        """
        clusters = []
        visited = set()

        for i, inc in enumerate(incidents):
            inc_id = inc.get("incident_id")
            if inc_id in visited:
                continue

            lat1 = inc.get("latitude")
            lng1 = inc.get("longitude")
            cluster = [inc]
            visited.add(inc_id)

            if lat1 is not None and lng1 is not None:
                for j, other in enumerate(incidents):
                    other_id = other.get("incident_id")
                    if other_id in visited:
                        continue
                    lat2 = other.get("latitude")
                    lng2 = other.get("longitude")
                    if lat2 is not None and lng2 is not None:
                        dist = haversine_distance_km(float(lat1), float(lng1), float(lat2), float(lng2))
                        if dist <= radius_km:
                            cluster.append(other)
                            visited.add(other_id)

            if len(cluster) > 1:
                clusters.append({
                    "cluster_id": f"CLUSTER-{inc_id}",
                    "center_incident": inc_id,
                    "incident_count": len(cluster),
                    "incidents": [c.get("incident_id") for c in cluster],
                    "disaster_types": list({c.get("type") for c in cluster if c.get("type")}),
                    "total_affected": sum(int(c.get("people_affected") or 0) for c in cluster)
                })

        return clusters

deduplication_engine = DeduplicationEngine(threshold=settings.SIMILARITY_THRESHOLD)

