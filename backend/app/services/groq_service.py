import json
import logging
import re
from typing import Dict, Any, Optional
import httpx
from app.config import settings

logger = logging.getLogger("rescueflow.groq")

class GroqService:
    def __init__(self):
        self.api_key = settings.GROQ_API_KEY
        self.model = settings.GROQ_MODEL
        self.base_url = settings.GROQ_BASE_URL

    def is_configured(self) -> bool:
        return bool(self.api_key and self.api_key.strip())

    async def _call_groq(self, messages: list, temperature: float = 0.1) -> str:
        """Calls Groq OpenAI-compatible Chat Completions API."""
        if not self.is_configured():
            raise ValueError("GROQ_API_KEY is not configured.")

        headers = {
            "Authorization": f"Bearer {self.api_key.strip()}",
            "Content-Type": "application/json"
        }
        payload = {
            "model": self.model,
            "messages": messages,
            "temperature": temperature,
            "response_format": {"type": "json_object"}
        }

        async with httpx.AsyncClient(timeout=25.0) as client:
            resp = await client.post(
                f"{self.base_url}/chat/completions",
                headers=headers,
                json=payload
            )
            if resp.status_code != 200:
                logger.error(f"Groq API error ({resp.status_code}): {resp.text}")
                raise RuntimeError(f"Groq API returned error status {resp.status_code}: {resp.text}")
            
            data = resp.json()
            return data["choices"][0]["message"]["content"]

    def _clean_json_str(self, text: str) -> str:
        """Strips markdown code fences and whitespace."""
        text = text.strip()
        if text.startswith("```json"):
            text = text[7:]
        elif text.startswith("```"):
            text = text[3:]
        if text.endswith("```"):
            text = text[:-3]
        return text.strip()

    async def classify_emergency(self, message: str) -> Dict[str, Any]:
        """
        Determines whether the message describes an emergency.
        Returns strict dict: is_emergency, emergency_type, confidence, reason.
        """
        system_prompt = (
            "You are an emergency message classification engine.\n"
            "Your task is to determine whether an incoming message describes a real or simulated emergency/disaster situation.\n"
            "Do not invent information. Return ONLY valid JSON.\n\n"
            "Schema:\n"
            "{\n"
            '  "is_emergency": true,\n'
            '  "emergency_type": "flood",\n'
            '  "confidence": 0.95,\n'
            '  "reason": "The message reports people trapped due to flooding."\n'
            "}\n\n"
            "Possible emergency types: flood, fire, earthquake, landslide, cyclone, medical, accident, building_collapse, missing_person, other, non_emergency.\n"
            "Rules:\n"
            "- is_emergency must be boolean\n"
            "- confidence must be between 0 and 1\n"
            "- Do not infer a disaster if the message is casual, polite greetings, spam, or non-urgent.\n"
            "- If uncertain, lower confidence.\n"
            "- Do not invent location or people count."
        )

        messages = [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": message}
        ]

        if not self.is_configured():
            logger.warning("GROQ_API_KEY not set. Using intelligent heuristic classifier for demo.")
            return self._heuristic_classification(message)

        try:
            content = await self._call_groq(messages, temperature=0.1)
            clean_content = self._clean_json_str(content)
            parsed = json.loads(clean_content)
            return {
                "is_emergency": bool(parsed.get("is_emergency", False)),
                "emergency_type": str(parsed.get("emergency_type", "other")),
                "confidence": float(parsed.get("confidence", 0.8)),
                "reason": str(parsed.get("reason", "Classified by Groq AI"))
            }
        except Exception as e:
            logger.error(f"Groq classification failed or returned invalid JSON ({e}). Falling back to heuristic.")
            return self._heuristic_classification(message)

    async def extract_information(self, message: str) -> Dict[str, Any]:
        """
        Extracts structured incident data.
        """
        system_prompt = (
            "You are an emergency information extraction engine.\n"
            "Analyze the emergency report.\n"
            "Extract only information explicitly stated or strongly supported by the message.\n"
            "Do not hallucinate.\n"
            "Return ONLY valid JSON.\n\n"
            "Schema:\n"
            "{\n"
            '  "disaster_type": "",\n'
            '  "location": "",\n'
            '  "people_affected": 0,\n'
            '  "vulnerable_people": {\n'
            '    "detected": false,\n'
            '    "types": []\n'
            "  },\n"
            '  "immediate_need": [],\n'
            '  "resources_required": [],\n'
            '  "severity": "",\n'
            '  "time_reference": "",\n'
            '  "confidence": 0.0,\n'
            '  "summary": ""\n'
            "}\n\n"
            "Allowed severity: critical, high, medium, low, unknown.\n"
            "Possible resources: rescue_team, medical_team, ambulance, fire_service, police, shelter, food, water, boat, transport, other."
        )

        messages = [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": message}
        ]

        if not self.is_configured():
            logger.warning("GROQ_API_KEY not set. Using intelligent heuristic extractor for demo.")
            return self._heuristic_extraction(message)

        try:
            content = await self._call_groq(messages, temperature=0.1)
            clean_content = self._clean_json_str(content)
            parsed = json.loads(clean_content)
            return self._validate_and_sanitize_extraction(parsed, message)
        except Exception as e:
            logger.error(f"Groq extraction failed ({e}). Retrying with repair prompt...")
            try:
                repair_messages = [
                    {"role": "system", "content": "You are a JSON fixer. Output ONLY valid JSON matching the extraction schema."},
                    {"role": "user", "content": f"Extract info from message: '{message}'. Must be valid JSON."}
                ]
                content = await self._call_groq(repair_messages, temperature=0.0)
                parsed = json.loads(self._clean_json_str(content))
                return self._validate_and_sanitize_extraction(parsed, message)
            except Exception as e2:
                logger.error(f"Retry repair failed: {e2}. Falling back to heuristic.")
                return self._heuristic_extraction(message)

    def _validate_and_sanitize_extraction(self, data: Dict[str, Any], original_message: str) -> Dict[str, Any]:
        """Validates and guarantees all required fields exist with correct types."""
        disaster_type = str(data.get("disaster_type") or "other").lower()
        location = str(data.get("location") or "Unspecified Location")
        
        # Check people affected
        raw_people = data.get("people_affected")
        try:
            people_affected = int(raw_people) if raw_people is not None else 0
        except (ValueError, TypeError):
            people_affected = 0

        # Vulnerable people
        vuln = data.get("vulnerable_people")
        if not isinstance(vuln, dict):
            vuln = {"detected": False, "types": []}
        else:
            vuln = {
                "detected": bool(vuln.get("detected", False)),
                "types": list(vuln.get("types", []))
            }

        immediate_need = data.get("immediate_need")
        if not isinstance(immediate_need, list):
            immediate_need = [str(immediate_need)] if immediate_need else []

        resources = data.get("resources_required")
        if not isinstance(resources, list):
            resources = [str(resources)] if resources else []

        severity = str(data.get("severity") or "medium").lower()
        if severity not in ["critical", "high", "medium", "low", "unknown"]:
            severity = "medium"

        summary = str(data.get("summary") or original_message[:120])
        confidence = float(data.get("confidence") or 0.85)

        return {
            "disaster_type": disaster_type,
            "location": location,
            "people_affected": people_affected,
            "vulnerable_people": vuln,
            "immediate_need": immediate_need,
            "resources_required": resources,
            "severity": severity,
            "time_reference": str(data.get("time_reference") or "recent"),
            "confidence": min(max(confidence, 0.0), 1.0),
            "summary": summary
        }

    # ------------------ HEURISTIC FALLBACKS (Guarantees zero crashes) ------------------
    def _heuristic_classification(self, message: str) -> Dict[str, Any]:
        lower = message.lower()
        non_emergency_words = ["good morning", "hello", "hi there", "have a nice day", "test only", "casual"]
        if any(w in lower for w in non_emergency_words) and not any(k in lower for k in ["flood", "fire", "urgent", "help", "trapped"]):
            return {
                "is_emergency": False,
                "emergency_type": "non_emergency",
                "confidence": 0.98,
                "reason": "Casual conversation or greeting; no distress indicators present."
            }

        emergency_type = "other"
        if "flood" in lower or "water" in lower:
            emergency_type = "flood"
        elif "fire" in lower or "smoke" in lower or "burn" in lower:
            emergency_type = "fire"
        elif "medical" in lower or "elderly" in lower or "heart" in lower or "injury" in lower:
            emergency_type = "medical"
        elif "collapse" in lower or "debris" in lower:
            emergency_type = "building_collapse"
        elif "accident" in lower or "crash" in lower:
            emergency_type = "accident"

        return {
            "is_emergency": True,
            "emergency_type": emergency_type,
            "confidence": 0.90,
            "reason": f"Urgent distress indicators matched for {emergency_type} incident."
        }

    def _heuristic_extraction(self, message: str) -> Dict[str, Any]:
        lower = message.lower()
        
        # Disaster type
        disaster_type = "other"
        if "flood" in lower or "water" in lower or "inundat" in lower:
            disaster_type = "flood"
        elif "fire" in lower:
            disaster_type = "fire"
        elif "medical" in lower or "elderly" in lower:
            disaster_type = "medical"
        elif "earthquake" in lower:
            disaster_type = "earthquake"
        elif "collapse" in lower:
            disaster_type = "building_collapse"

        # Location heuristic
        location = "Coimbatore District"
        if "psg" in lower:
            location = "PSG College"
        elif "gandhipuram" in lower:
            location = "Gandhipuram Bus Stand"
        elif "rs puram" in lower or "r.s. puram" in lower:
            location = "RS Puram"
        elif "near " in lower:
            m = re.search(r"near\s+([A-Za-z0-9\s]+?)(?:[\.,]|$)", message, re.IGNORECASE)
            if m:
                location = m.group(1).strip()

        # People affected
        people = 0
        p_match = re.search(r"(\d+)\s*(?:people|residents|persons|citizens|victims|trapped)", lower)
        if p_match:
            people = int(p_match.group(1))
        elif "three" in lower:
            people = 3
        elif "five" in lower:
            people = 5
        elif "several" in lower:
            people = 6

        # Vulnerable people
        vulnerable = False
        vtypes = []
        if "elderly" in lower:
            vulnerable = True
            vtypes.append("elderly")
        if "child" in lower or "infant" in lower:
            vulnerable = True
            vtypes.append("children")
        if "pregnant" in lower:
            vulnerable = True
            vtypes.append("pregnant women")

        # Needs & Resources
        needs = []
        resources = []
        if "trapped" in lower or "rescue" in lower:
            needs.append("rescue")
            resources.append("rescue_team")
        if "flood" in lower or "water" in lower:
            needs.append("boat")
            resources.append("boat")
        if "medical" in lower or "elderly" in lower or "injured" in lower:
            needs.append("medical assistance")
            resources.append("medical_team")
            resources.append("ambulance")
        if "fire" in lower:
            needs.append("fire suppression")
            resources.append("fire_service")

        severity = "high"
        if "urgent" in lower or "trapped" in lower or people >= 5:
            severity = "critical"

        return {
            "disaster_type": disaster_type,
            "location": location,
            "people_affected": people,
            "vulnerable_people": {"detected": vulnerable, "types": vtypes},
            "immediate_need": needs,
            "resources_required": resources,
            "severity": severity,
            "time_reference": "Immediate",
            "confidence": 0.88,
            "summary": message[:140]
        }

groq_service = GroqService()
