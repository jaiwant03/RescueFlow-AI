# RESCUEFLOW AI — BASELINE SYSTEM SPECIFICATION & FEATURE INVENTORY
**Project**: RescueFlow AI — AI Disaster Message Prioritization & Response Automation  
**Event**: INFINEX 2K26 — Global AI Hackathon (PropCare NW)  
**Baseline Date**: November 6, 2026  
**Git Baseline Branch**: `backup-baseline-infinex`  
**Git Head Commit**: `2443fd8`  
**Status**: **FROZEN BASELINE — STRICT UI LOCK & ZERO FUNCTIONALITY REGRESSION ENFORCED**

---

## 1. Directory Structure & Component Inventory

### 1.1 Backend Architecture (`d:/Dev/Projects/RescueFlow-AI/backend/`)
- **Framework**: FastAPI 0.115, Uvicorn, Python 3.11+, Motor (Async MongoDB), Pydantic v2.
- **Entrypoint**: `app/main.py` (lifespan manager, CORS middleware, API route registration, Telegram polling worker).
- **Core Configuration**: `app/config.py` (MongoDB URI, Groq API key/model, n8n URLs, similarity threshold, Telegram tokens, scoring weights).
- **Database Engine**: `app/database.py` (Motor async connection with `certifi` SSL bundle, complete `InMemoryDatabase` fallback engine).
- **Models**:
  - `app/models/incident.py`: `Incident`, `Location`, `TimelineEvent`, `SourceMessage`
  - `app/models/message.py`: `Message`, `TriageClassification`
  - `app/models/approval.py`: `ApprovalRequest`, `ApprovalDecision`
  - `app/models/action.py`: `ResponseTask`, `ActionType`
  - `app/models/audit.py`: `AuditLog`
  - `app/models/user.py`: `User`, `UserProfile`
- **Schemas**:
  - `app/schemas/incident.py`
  - `app/schemas/message.py`
  - `app/schemas/approval.py`
  - `app/schemas/action.py`
- **Services**:
  - `app/services/groq_service.py`: Groq Llama-3.3-70B async inference with regex heuristic fallback.
  - `app/services/priority_engine.py`: Deterministic 0–100 mathematical scoring with explainable factor checklist.
  - `app/services/deduplication.py`: 3-tier windowed spatial-disaster deduplication (4-hr temporal window, Jaccard/landmark overlap, disaster compatibility).
  - `app/services/realtime.py`: Asynchronous SSE broadcaster queue and WebSocket connection management.
  - `app/services/telegram_service.py`: Telegram long-polling bot worker (`@RescueFlowAI_DemoBot`) with text ingestion and auto-triage.
  - `app/services/n8n.py`: Autonomous pipeline runner fallback and n8n webhook dispatcher.
  - `app/services/audit.py`: Append-only audit logger.
  - `app/services/mongodb.py`: MongoDB CRUD helpers.
- **Route Handlers**:
  - `app/routes/health.py`: Health check `/health`
  - `app/routes/dashboard.py`: Statistics `/api/dashboard/stats`
  - `app/routes/incidents.py`: CRUD `/api/incidents`, `/api/incidents/{id}`, `/api/incidents/{id}/status`, `/api/incidents/{id}/approve`, `/api/incidents/{id}/reject`, `/api/incidents/{id}/assign-team`, `/api/incidents/{id}/timeline`
  - `app/routes/messages.py`: `/api/messages`
  - `app/routes/approvals.py`: `/api/approvals`, `/api/approvals/{id}/decision`
  - `app/routes/emergency.py`: `/api/emergency/report`, `/api/emergency/upload-image`, `/api/emergency/csv-upload`, `/api/simulate/scenario/{key}`, `/api/simulate/reset-demo-data`
  - `app/routes/analytics.py`: `/api/analytics`
  - `app/routes/audit_logs.py`: `/api/audit-logs`
  - `app/routes/n8n_events.py`: `/api/n8n/events`, `/api/system/status`
  - `app/routes/realtime.py`: `/api/realtime/stream` (SSE), `/api/realtime/ws` (WebSocket)
  - `app/routes/user.py`: `/api/user/profile`, `/api/user/photo`

### 1.2 Frontend Architecture (`d:/Dev/Projects/RescueFlow-AI/frontend/`)
- **Framework**: React 18.3.1, Vite 6.0, Tailwind CSS 3.4, React Router v7, Leaflet GIS, Axios, Lucide React.
- **Styles & Design System**:
  - `src/styles/theme.css`: Midnight Peacock Blue (`#005b82`, `#003e5c`), Rama Green (`#0d9488`, `#14b8a6`), White Canvas (`#f8fafc`, `#ffffff`).
  - `src/styles/global.css`: High-contrast typography (`Outfit`, `Plus Jakarta Sans`, `Kaushan Script`, `JetBrains Mono`).
- **Contexts**:
  - `src/context/AuthContext.jsx`: User profile, photo upload, role-based access control (`commander`, `operator`, `viewer`).
  - `src/context/SystemContext.jsx`: Global telemetry and real-time state.
- **Hooks**:
  - `src/hooks/useRealtime.js`: Native Server-Sent Events subscriber for live dashboard refresh without polling.
- **Components**:
  - `Header.jsx`, `Sidebar.jsx`, `UserProfileMenu.jsx`, `EditProfileModal.jsx`, `ApprovalModal.jsx`, `IncidentMap.jsx` (Leaflet GIS), `DisasterLineChart.jsx`, `DemoControlBar.jsx`, `PriorityBadge.jsx`, `StatusBadge.jsx`, `LiveTicker.jsx`, `NotificationPanel.jsx`, `ModeledSelect.jsx`, `CubeLogo.jsx`, `LandscapeArtwork.jsx`.
- **Pages & Routes**:
  - `/` -> `DashboardPage.jsx`
  - `/incidents` -> `LiveIncidentsPage.jsx`
  - `/incidents/:id` -> `IncidentDetailPage.jsx`
  - `/report` -> `EmergencyReportPage.jsx`
  - `/approvals` -> `ApprovalCenterPage.jsx`
  - `/activity` -> `ResponseActivityPage.jsx`
  - `/analytics` -> `AnalyticsPage.jsx`
  - `/audit` -> `AuditLogsPage.jsx`
  - `/status` -> `SystemStatusPage.jsx`
  - `/login` -> `LoginPage.jsx`
  - `/signup` -> `SignupPage.jsx`

### 1.3 Automation Architecture (`d:/Dev/Projects/RescueFlow-AI/n8n/`)
- **Master Orchestrator Workflow**: `n8n/workflows/rescueflow_master_orchestrator.json` (541 lines).
- **Triggers**: Webhook trigger (`/webhook/emergency-report`), Telegram trigger, IMAP email trigger, 5-minute liveliness cron trigger.
- **Workflow Pipeline**: Intake -> Groq LLM Triage -> Deduplication Check -> Priority Scoring -> Approval Gate -> Response Task Dispatch (Telegram Channel & Email).

---

## 2. API Contract Specification (LOCKED)

| Method | Endpoint | Request Payload | Response Schema | Purpose |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/health` | None | `{"status": "ok", "app": str, "version": str}` | Liveliness check |
| `GET` | `/api/system/status` | None | `{"status": str, "database": str, "groq_ai": str, "telegram": str}` | System telemetry |
| `GET` | `/api/dashboard/stats` | None | `{"total_incidents": int, "critical_count": int, "high_count": int, "medium_count": int, "low_count": int, "dedup_savings": int, "resolved_count": int, "pending_approvals": int}` | KPI metric counters |
| `GET` | `/api/incidents` | `status`, `severity`, `limit`, `skip` | `[Incident]` | Filtered incident list |
| `GET` | `/api/incidents/{id}` | Path: `id` | `Incident` | Single incident details |
| `POST`| `/api/incidents/{id}/status` | `{"status": str, "reason": str, "actor": str}` | `Incident` | State transition |
| `POST`| `/api/incidents/{id}/approve` | `{"reason": str, "approved_by": str}` | `Incident` | Commander authorization |
| `POST`| `/api/incidents/{id}/reject` | `{"reason": str, "approved_by": str}` | `Incident` | Incident rejection |
| `POST`| `/api/incidents/{id}/assign-team` | `{"team_name": str, "actor": str}` | `Incident` | Team assignment |
| `GET` | `/api/incidents/{id}/timeline` | Path: `id` | `[TimelineEvent]` | Chronological audit trail |
| `GET` | `/api/messages` | `is_emergency`, `limit`, `skip` | `[Message]` | Raw inbound message log |
| `GET` | `/api/approvals` | `status` | `[ApprovalRequest]` | Human approval queue |
| `POST`| `/api/approvals/{id}/decision` | `{"decision": str, "reason": str, "decided_by": str}` | `ApprovalDecision` | Execute approval/rejection |
| `POST`| `/api/emergency/report` | `{"text": str, "source": str, "reporter_name": str, "phone": str, "location_hint": str, "image_url": str}` | `{"status": str, "incident_id": str, "action": str}` | Citizen report submission |
| `POST`| `/api/emergency/upload-image` | Multipart `file` | `{"url": str, "filename": str}` | Emergency photo upload |
| `POST`| `/api/emergency/csv-upload` | Multipart `file` | `{"processed": int, "created": int, "merged": int}` | Batch disaster CSV intake |
| `GET` | `/api/response-tasks` | None | `[ResponseTask]` | First-responder dispatch tasks |
| `GET` | `/api/analytics` | None | `{"by_type": dict, "by_severity": dict, "hourly_trends": list}` | Analytics charts |
| `GET` | `/api/audit-logs` | `action`, `limit`, `skip` | `[AuditLog]` | Immutable audit log |
| `DELETE`| `/api/audit-logs` | None | `{"status": "cleared"}` | Audit log maintenance |
| `POST`| `/api/simulate/scenario/{key}` | Path: `key` | `{"status": "simulated", "scenario": str}` | Demo scenario trigger |
| `POST`| `/api/simulate/reset-demo-data` | None | `{"status": "reset"}` | Clean state reset |
| `GET` | `/api/user/profile` | `email` | `User` | User profile retrieve |
| `POST`| `/api/user/profile` | `{"email": str, "name": str, "role": str, "bio": str}` | `User` | Profile update in Atlas |
| `POST`| `/api/user/photo` | `{"email": str, "photo_base64": str}` | `{"status": "ok", "photo_url": str}` | Persistent avatar update |
| `GET` | `/api/realtime/stream` | None | `text/event-stream` (SSE) | Real-time push stream |
| `WS`  | `/api/realtime/ws` | None | WebSocket stream | Bi-directional streaming |

---

## 3. MongoDB Atlas Schema & Collections

- **Database**: `rescueflow` on cluster `cluster0.86qnngi.mongodb.net`
- **Collections**:
  1. `incidents`: Unique `incident_id`. Stores title, disaster_type, severity, priority_score (0-100), priority_level, status, location (name, coordinates), people_affected, immediate_needs, required_response_units, source_messages, timeline, report_count, created_at, updated_at.
  2. `messages`: Stores raw inbound text, channel (`TELEGRAM`, `WEB`, `EMAIL`), sender details, triage result (`is_emergency`, `confidence`, `reasoning`), associated `incident_id`.
  3. `approvals`: Stores approval ticket, associated `incident_id`, priority, status (`pending`, `approved`, `rejected`), decision justification, decided_by, decided_at.
  4. `response_tasks`: Stores tactical tasks dispatched for field units, team assigned, dispatch channel, execution status (`dispatched`, `completed`), simulation flag.
  5. `audit_logs`: Append-only log of every mutation (`INCIDENT_CREATED`, `INCIDENT_MERGED`, `PRIORITY_RECALCULATED`, `APPROVAL_DECISION`, `TASK_DISPATCHED`).
  6. `users`: Stores user identity, email, hashed credentials, role (`commander`, `operator`, `viewer`), profile details, and persistent Base64 avatar.

---

## 4. Baseline 15-Point Verification Results

| Test ID | Test Capability | Baseline Status | Evidence |
| :---: | :--- | :---: | :--- |
| **TEST-01** | Emergency Report Submission | **PASS** | Successfully ingested report, generated `INC-001024` with status `created`. |
| **TEST-02** | AI Emergency Classification | **PASS** | Groq Llama-3.3 classified gas fire: `is_emergency=True`, type `fire`, conf 0.97. |
| **TEST-03** | Casual Non-Emergency Filtering | **PASS** | Casual greeting filtered out (`is_emergency=False`), no incident created. |
| **TEST-04** | Duplicate Incident Deduplication | **PASS** | Second Peelamedu report merged into `INC-001024`, report count incremented to 2. |
| **TEST-05** | Deterministic Priority Scoring | **PASS** | Trapped fire scored `100/100 (CRITICAL)` with line-item factor checklist. |
| **TEST-06** | MongoDB Atlas Persistence | **PASS** | Complete document stored and retrieved with timeline, messages, and audits. |
| **TEST-07** | Real-time SSE Event Streaming | **PASS** | Broadcast events pushed to SSE client queues within < 20ms. |
| **TEST-08** | Human Operator Approval | **PASS** | Incident transitioned to `approved`, response tasks generated. |
| **TEST-09** | Human Operator Rejection | **PASS** | Incident transitioned to `rejected` with recorded commander rationale. |
| **TEST-10** | Telegram Bot Integration | **PASS** | `@RescueFlowAI_DemoBot` verified active and polling via `getMe`. |
| **TEST-11** | Email Notification Dispatch | **PARTIAL** | Simulated response tasks recorded; live SMTP unconfigured. |
| **TEST-12** | Scheduled Staleness Monitoring | **PARTIAL** | Defined in n8n workflow; no in-process backend cron loop. |
| **TEST-13** | Database Resilience Fallback | **PASS** | `InMemoryDatabase` provides complete zero-downtime query degradation. |
| **TEST-14** | AI API Resilience Fallback | **PASS** | Heuristic fallback successfully extracts entities without Groq API key. |
| **TEST-15** | Input Schema Validation | **PASS** | Pydantic validation handles malformed and empty inputs safely. |

---

## 5. UI Lock & Baseline Visual Invariants

The frontend UI is strictly frozen. All improvements in this cycle are architectural, internal, algorithmic, and non-visual.

- **Canvas & Theme**: Pure White Surface (`#ffffff`), Light Main Canvas (`#f8fafc`).
- **Accent Identity**: Midnight Peacock Blue (`#005b82`) paired with Radiant Rama Green (`#0d9488`).
- **Typography**: Primary UI in `Outfit` / `Plus Jakarta Sans`, Script Headings in `Kaushan Script` / `Satisfy`.
- **Card Hierarchy**: 6-column KPI cards, Tactical Leaflet GIS Map, Dual-action Authorization Buttons, Stepper Timeline.
- **Baseline Screenshot References**:
  - Dashboard KPI arrangement: `media_1793810175944_51d8585b.png`
  - Situation Room & Deterministic Gauge: `media_1793887648997_7397bc4c.jpg`
  - Real-time Telegram Ingestion Bar: `media_1793886635815_0a504398.png`
  - Atlas DB Schema: `media_1793809677802_d2b4e34c.png`
  - Operations Profile Header: `media_1793877537065_ab0ca165.png`

---

## 6. Safe Modification Protocol
1. Every new or enhanced module must be backward-compatible with the locked API contracts in Section 2.
2. No existing frontend component layout, CSS rule, or HTML tag may be altered unless approved for non-visual bug fixes.
3. Every enhancement must be validated against the 15 regression tests before proceeding.
