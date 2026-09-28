import logging
from typing import Dict, Any, Optional, List, Tuple
from app.config import settings

logger = logging.getLogger("rescueflow.deduplication")

class DeduplicationEngine:
    def __init__(self, threshold: float = 0.75):
        self.threshold = threshold

    def _normalize_string(self, text: str) -> str:
        return "".join(c.lower() for c in text if c.isalnum() or c.isspace()).strip()

    def _calculate_token_similarity(self, s1: str, s2: str) -> float:
        """Computes Jaccard token overlap similarity."""
        tokens1 = set(self._normalize_string(s1).split())
        tokens2 = set(self._normalize_string(s2).split())
        if not tokens1 or not tokens2:
            return 0.0
        intersection = tokens1.intersection(tokens2)
        union = tokens1.union(tokens2)
        return len(intersection) / len(union)

    def _locations_match(self, loc1: str, loc2: str) -> bool:
        """Determines if two location strings refer to the same geographic area."""
        l1 = self._normalize_string(loc1)
        l2 = self._normalize_string(loc2)
        
        # Exact or substring match
        if l1 in l2 or l2 in l1:
            return True

        # Key landmark extraction (e.g., "psg", "gandhipuram", "rs puram")
        tokens1 = set(l1.split())
        tokens2 = set(l2.split())
        significant_overlap = tokens1.intersection(tokens2) - {"near", "the", "in", "at", "area", "street", "road", "bus", "stand", "college"}
        return len(significant_overlap) > 0

    def find_matching_incident(
        self,
        new_extraction: Dict[str, Any],
        active_incidents: List[Dict[str, Any]]
    ) -> Optional[Tuple[Dict[str, Any], float, str]]:
        """
        Scans active incidents for semantic & geographical similarity.
        Returns (matched_incident, similarity_score, reason) or None.
        """
        new_type = str(new_extraction.get("disaster_type", "")).lower()
        new_loc = str(new_extraction.get("location", ""))
        new_summary = str(new_extraction.get("summary", ""))

        best_match = None
        best_score = 0.0
        best_reason = ""

        for inc in active_incidents:
            # Skip resolved or rejected or archived incidents
            if inc.get("status") in ["resolved", "rejected", "archived"]:
                continue

            inc_type = str(inc.get("type", "")).lower()
            inc_loc = str(inc.get("location", ""))
            inc_summary = str(inc.get("ai_summary", ""))

            # Disaster types must be compatible
            if inc_type != new_type and inc_type != "other" and new_type != "other":
                continue

            # Check location alignment
            loc_matched = self._locations_match(new_loc, inc_loc)
            if not loc_matched:
                continue

            # Compute similarity on summaries and locations
            loc_sim = self._calculate_token_similarity(new_loc, inc_loc)
            summary_sim = self._calculate_token_similarity(new_summary, inc_summary)
            
            # Weighted combined similarity
            combined_score = (loc_sim * 0.5) + (summary_sim * 0.5)
            
            # Strong boost for matching specific landmark + same disaster
            if loc_matched and inc_type == new_type:
                combined_score = max(combined_score, 0.85)

            if combined_score > best_score:
                best_score = combined_score
                best_match = inc
                best_reason = f"Location '{inc_loc}' aligns with '{new_loc}' for disaster type '{inc_type}'"

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
        """
        updated = dict(existing)

        # 1. Increment report count
        current_count = int(existing.get("report_count", 1))
        updated["report_count"] = current_count + 1

        # 2. Append source message
        source_msgs = list(existing.get("source_messages", []))
        source_msgs.append(source_message)
        updated["source_messages"] = source_msgs

        # 3. People affected: Take max reported count to reflect peak severity
        new_people = int(new_extraction.get("people_affected") or 0)
        existing_people = int(existing.get("people_affected") or 0)
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

deduplication_engine = DeduplicationEngine(threshold=settings.SIMILARITY_THRESHOLD)
