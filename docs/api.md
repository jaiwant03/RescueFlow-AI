# RescueFlow AI — REST & Realtime API Specification

Base URL: `http://localhost:8000`

---

## 1. System & Health

### `GET /health`
Returns backend health status.

### `GET /api/system/status`
Returns live connectivity telemetry for Backend, MongoDB, Groq AI, n8n, Telegram, and Email.
```json
{
  "system": { "name": "RescueFlow AI", "version": "1.0.0", "mode": "Simulation" },
  "components": {
    "backend": { "status": "online", "healthy": true },
    "mongodb": { "status": "connected", "healthy": true, "uri": "mongodb://localhost:27017" },
    "groq_ai": { "status": "configured", "model": "llama-3.3-70b-versatile" },
    "n8n": { "status": "connected", "webhook_url": "http://localhost:5678/webhook/emergency-intake" }
  }
}
```

---

## 2. Dashboard & Statistics

### `GET /api/dashboard/stats`
Returns aggregated counts for total incidents, critical, high, medium, low, resolved, pending approvals, and deduplication savings.

---

## 3. Incidents Management

### `GET /api/incidents`
Query params: `status`, `priority`, `type`, `search`, `limit`, `skip`.

### `GET /api/incidents/{incident_id}`
Returns complete incident details including source messages and timeline.

### `POST /api/incidents/{incident_id}/status`
Body:
```json
{
  "status": "responding | monitoring | resolved | archived",
  "reason": "Field units deployed",
  "actor": "Operator"
}
```

### `POST /api/incidents/{incident_id}/approve`
Authorizes emergency response and initiates automated dispatch tasks.
```json
{
  "approved_by": "Operations Commander",
  "reason": "Corroborated via multiple reports and CCTV"
}
```

### `POST /api/incidents/{incident_id}/reject`
Rejects response request.
```json
{
  "approved_by": "Operations Commander",
  "reason": "Duplicate report / false alarm"
}
```

### `POST /api/incidents/{incident_id}/assign-team`
Assigns a tactical field response team.
```json
{
  "team_name": "Rapid Flood Rescue Unit Alpha",
  "actor": "Dispatch Coordinator"
}
```

### `GET /api/incidents/{incident_id}/timeline`
Returns the chronological timeline of events for an incident.

---

## 4. Emergency Ingestion & Simulation

### `POST /api/emergency/report`
Web public / operator reporting endpoint. Normalizes payload, triggers n8n intake, and processes through intelligence pipeline.
```json
{
  "name": "Ramesh Kumar",
  "phone": "+91 98765 43210",
  "email": "ramesh@example.com",
  "message": "URGENT! Flood water entered houses near PSG College. 5 people trapped.",
  "location": "PSG College",
  "latitude": 11.0248,
  "longitude": 77.0028,
  "source": "web | telegram | email"
}
```

### `POST /api/emergency/csv-upload`
Accepts `multipart/form-data` with CSV file.
Columns: `source, message, timestamp, location`.

### `POST /api/simulate/scenario/{scenario_key}`
1-Click trigger for the canonical hackathon evaluation steps:
- `step1_flood_psg`
- `step2_flood_psg_corroborate`
- `step3_flood_psg_web`
- `step4_fire_gandhipuram`
- `step5_medical_rspuram`
- `step6_non_emergency`

### `POST /api/simulate/reset-demo-data`
Wipes test collections to reset the demo environment to zero.

---

## 5. Approvals & Response Tasks

### `GET /api/approvals`
Query params: `status=pending`.

### `POST /api/approvals/{approval_id}/decision`
Body:
```json
{
  "decision": "approve | reject",
  "decided_by": "Commander Sarah Connor",
  "reason": "Authorized for field deployment"
}
```

### `GET /api/response-tasks`
Lists automated dispatch tasks (simulated Telegram alerts and emails).

---

## 6. Audit & Analytics

### `GET /api/audit-logs`
Query params: `event_type`, `incident_id`, `limit`, `skip`.

### `GET /api/analytics`
Returns breakdown by disaster type, priority tiers, channels, and deduplication reduction percentages.

---

## 7. Realtime Streaming

### `GET /api/realtime/events`
Server-Sent Events (SSE) stream broadcasting:
- `INCIDENT_CREATED`
- `INCIDENT_UPDATED`
- `MESSAGE_RECEIVED`
- `AUDIT_LOG_CREATED`
- `SYSTEM_RESET`

### `WebSocket /ws`
Bidirectional WebSocket stream.
