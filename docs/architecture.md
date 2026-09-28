# RescueFlow AI — System Architecture

**Subtitle:** AI-Powered Disaster Message Prioritization & Response Automation  
**Core Motto:**
> **AI UNDERSTANDS + n8n AUTOMATES + MONGODB REMEMBERS + REACT VISUALIZES + HUMAN APPROVES**

---

## 1. High-Level Architecture Diagram

```
                        EMERGENCY INTAKE CHANNELS
                                   │
         ┌─────────────────────────┼─────────────────────────┐
         ▼                         ▼                         ▼
   Telegram Bot               Gmail Inbox             React Web Portal / CSV
   (/report command)     (rescueflow.demo@gmail.com)    (Public Report Form)
         │                         │                         │
         └─────────────────────────┼─────────────────────────┘
                                   │
                                   ▼
                      ┌───────────────────────────┐
                      │     n8n ORCHESTRATOR      │
                      │  01_emergency_intake.json │
                      └─────────────┬─────────────┘
                                    │
                         Message Normalization
                                    │
                                    ▼
                         Groq AI Classification
                       (llama-3.3-70b-versatile)
                                    │
                             Is Emergency?
                              /          \
                            NO            YES
                            │              │
                   Filter / Archive        ▼
                                ┌───────────────────────────┐
                                │     n8n ORCHESTRATOR      │
                                │02_incident_intelligence   │
                                └───────────┬───────────────┘
                                            │
                                   Groq AI Extraction
                             (Type, Location, Need, People)
                                            │
                                    Schema Validation
                                            │
                                            ▼
                                  Deduplication Engine
                                            │
                             ┌──────────────┴──────────────┐
                             ▼                             ▼
                    Similar Incident              New Incident
                   (Intelligent Merge)          (Generate INC-ID)
                             │                             │
                             └──────────────┬──────────────┘
                                            │
                                  Deterministic Priority
                                     (0-100 Score)
                                            │
                                            ▼
                                     MongoDB Database
                                (incidents, messages, audit)
                                            │
                                            ▼
                                 Real-Time SSE / WebSocket
                                            │
                                            ▼
                                  React Operations EOC
                                   (Command Dashboard)
                                            │
                                  Critical or High Tier?
                                            │
                                            ▼
                                 Human-in-the-Loop Center
                                            │
                                  ┌─────────┴─────────┐
                                  ▼                   ▼
                           APPROVE RESPONSE     REJECT RESPONSE
                                  │                   │
                                  │             Log Justification
                                  ▼
                      ┌───────────────────────────┐
                      │     n8n ORCHESTRATOR      │
                      │   04_automated_response   │
                      └─────────────┬─────────────┘
                                    │
                       ┌────────────┼────────────┐
                       ▼            ▼            ▼
                   Telegram       Email       Response
                  Alert Bot      Dispatch       Tasks
                       │            │            │
                       └────────────┼────────────┘
                                    │
                                    ▼
                             Audit Log Record
                                    │
                                    ▼
                      ┌───────────────────────────┐
                      │     n8n ORCHESTRATOR      │
                      │   05_incident_monitoring  │
                      │    (5-Minute Cron Liveliness)
                      └─────────────┬─────────────┘
                                    │
                             Mark Responding
                                    │
                             Mark Resolved
```

---

## 2. Component Breakdown

### 2.1 Intake Normalization Layer
All 4 ingest channels (Telegram Bot, Gmail Inbox, Web Emergency Form, CSV bulk upload) are transformed into a canonical schema before hitting any AI models:
```json
{
  "message_id": "MSG-A1B2C3D4",
  "source": "telegram | email | web | csv",
  "sender": "@user / email / Citizen Name",
  "message": "Raw incident description",
  "location_hint": "PSG College / Gandhipuram",
  "latitude": 11.0248,
  "longitude": 77.0028,
  "timestamp": "2026-09-28T10:00:00Z",
  "metadata": {}
}
```

### 2.2 Groq AI Inference Layer
Powered by Groq's low-latency OpenAI-compatible endpoint (`https://api.groq.com/openai/v1/chat/completions`) using `llama-3.3-70b-versatile` with low temperature (0.1) and strict JSON schema guarantees.
- **Classification:** Evaluates whether a message conveys distress or is casual conversation / polite spam.
- **Extraction:** Extracts disaster type, location, affected people count, vulnerable populations (elderly, infants, pregnant women), immediate needs, and required tactical resources.

### 2.3 Intelligent Deduplication & Merging Engine
Disaster events generate dozens of fragmented reports for the same incident. RescueFlow groups reports into a single consolidated operational incident based on:
1. Disaster Type Compatibility (e.g. Flood with Flood, Fire with Fire)
2. Geographic Proximity & Landmark Matching (e.g. "PSG College", "PSG area", "Near PSG")
3. Semantic Similarity
4. Report Aggregation: Increments `report_count`, appends raw source reports to `source_messages`, updates `people_affected` to the peak reported count, and awards a multi-report corroboration bonus to the priority score.

### 2.4 Deterministic Priority Engine
LLMs can hallucinate; human lives cannot depend on a single unverified model score. RescueFlow calculates a deterministic score (0-100) using configurable factor weights:
- Immediate life danger: **+30**
- People trapped: **+20**
- Vulnerable population detected: **+20**
- Medical emergency: **+20**
- 10+ people affected: **+20** (or 5-9 people: **+10**)
- Tactical rescue required: **+15**
- Multi-source corroboration (2+ reports): **+10**
- High-consequence disaster type (Flood/Fire/Collapse): **+15**

Tiers:
- **80 - 100:** CRITICAL (Immediate human authorization required)
- **60 - 79:** HIGH (Priority response queue)
- **30 - 59:** MEDIUM (Controlled dispatch)
- **0 - 29:** LOW (Monitoring queue)

### 2.5 n8n Orchestrator Layer
n8n is the central workflow coordinator. It hosts 5 dedicated workflows:
1. `01_emergency_intake.json`: Ingestion & classification
2. `02_incident_intelligence.json`: Extraction, deduplication & priority scoring
3. `03_human_approval.json`: Operator authorization callback & task trigger
4. `04_automated_response.json`: Simulated Telegram, Email & Field dispatch
5. `05_incident_monitoring.json`: Periodic 5-minute health check & staleness monitor

### 2.6 React Operations Command Center
A professional dark navy / charcoal emergency operations center interface providing:
- Live statistics cards with animated counters
- Leaflet + OpenStreetMap geo-tracking with color-coded pulsing pins
- 1-Click Hackathon Demo Simulation Controller
- Multi-channel ingestion form & CSV batch uploader
- Dedicated Human Approval Center
- Response Activity tracking & Audit Logs inspector
