# 🚨 RescueFlow AI

### **AI-Powered Disaster Message Prioritization & Response Automation**

[![FastAPI](https://img.shields.io/badge/Backend-FastAPI-009688.svg?style=flat&logo=fastapi)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/Frontend-React%2019-61DAFB.svg?style=flat&logo=react)](https://react.dev)
[![n8n](https://img.shields.io/badge/Orchestrator-n8n-EA4B71.svg?style=flat&logo=n8n)](https://n8n.io)
[![Groq](https://img.shields.io/badge/AI%20Inference-Groq%20Cloud-F55036.svg?style=flat)](https://groq.com)
[![MongoDB](https://img.shields.io/badge/Database-MongoDB-47A248.svg?style=flat&logo=mongodb)](https://mongodb.com)

---

## 📌 Executive Summary

> **"RescueFlow AI transforms fragmented emergency reports into deduplicated, explainable and prioritized incidents, then uses n8n to automate the response workflow while keeping critical decisions under human control."**

During natural disasters and civil emergencies, emergency dispatch centers are flooded with hundreds of duplicate, noisy, and fragmented messages across multiple channels (Telegram, Email, Web Forms, SMS, Social Feeds). Critical distress signals are delayed while dispatchers wade through redundant reports.

**RescueFlow AI** solves this through a multi-tiered architecture:
- **AI UNDERSTANDS:** Groq Cloud LLM (`llama-3.3-70b-versatile`) classifies emergencies and extracts structured information.
- **n8n AUTOMATES:** 5 automated workflows coordinate multi-channel intake, routing, approval gating, and notification dispatches.
- **MONGODB REMEMBERS:** Corroborating reports are grouped into a single operational incident without losing source history.
- **REACT VISUALIZES:** Tactical dark-mode command center with Leaflet OpenStreetMap geo-tracking and real-time SSE updates.
- **HUMAN APPROVES:** High-stakes dispatches require explicit authorization by a duty commander.

---

## 🏗️ System Architecture

```
                    EMERGENCY SOURCES
                           |
          +----------------+----------------+
          |                |                |
          v                v                v
     Telegram           Gmail          React Web Form / CSV
       Bot              Inbox          (Direct Ingestion)
          |                |                |
          +----------------+----------------+
                           |
                           v
                    +-------------+
                    |     n8n     |
                    | ORCHESTRATOR|
                    +------+------+
                           |
                           v
                 Message Normalization
                           |
                           v
                 Groq AI Classification
                           |
                           v
                    Is Emergency?
                     /          \
                   NO            YES
                   |              |
                 Archive          v
                            Groq AI Extraction
                                  |
                                  v
                            JSON Validation
                                  |
                         Duplicate Detection
                                  |
                         +--------+--------+
                         |                 |
                    Existing          New Incident
                    Incident              |
                         |                 |
                         +--------+--------+
                                  |
                                  v
                         Priority Calculation
                                  |
                                  v
                               MongoDB
                                  |
                                  v
                         React Dashboard
                                  |
                                  v
                         Human Approval
                                  |
                         +--------+--------+
                         |                 |
                      APPROVE            REJECT
                         |                 |
                         v                 v
                  n8n Response         Log rejection
                     Workflow
                         |
            +------------+-------------+
            |            |             |
            v            v             v
        Telegram       Email      Response Task
        Notification   Alert
            |            |             |
            +------------+-------------+
                         |
                         v
                   Audit Logging
                         |
                         v
                  Incident Monitoring
                         |
                         v
                      Resolution
```

---

## 🧰 Technology Stack

- **Frontend:**
  - React 19 + Vite
  - Axios for API communication
  - React Router v7 for client-side navigation
  - Leaflet + OpenStreetMap for tactical geo-mapping
  - Lucide React for emergency iconography
  - Pure Vanilla CSS design tokens & CSS modules (**Zero Tailwind CSS**, **Zero Bootstrap**)
- **Backend:**
  - Python 3.10+ / 3.13
  - FastAPI with async ASGI architecture
  - Pydantic v2 schemas and validation
  - Motor & PyMongo for MongoDB with in-memory resilient fallback
  - Server-Sent Events (SSE) & WebSockets for zero-refresh real-time updates
- **Orchestration:**
  - n8n Workflow Automation Platform (5 production workflows)
- **AI Inference Engine:**
  - Groq Cloud API (OpenAI-compatible)
  - Configurable model: `llama-3.3-70b-versatile` (configurable via `GROQ_MODEL`)
  - Low temperature (0.1) with strict JSON output formatting and heuristic fallback

---

## 📁 Repository Structure

```
rescueflow-ai/
  ├── backend/
  │   ├── app/
  │   │   ├── config.py           # Config settings & priority weights
  │   │   ├── database.py         # MongoDB async Motor client & fallback
  │   │   ├── main.py             # FastAPI entrypoint & CORS
  │   │   ├── models/             # Pydantic database models
  │   │   │   ├── action.py
  │   │   │   ├── approval.py
  │   │   │   ├── audit.py
  │   │   │   ├── incident.py
  │   │   │   ├── message.py
  │   │   │   └── user.py
  │   │   ├── schemas/            # Request & response schemas
  │   │   │   ├── action.py
  │   │   │   ├── approval.py
  │   │   │   ├── incident.py
  │   │   │   └── message.py
  │   │   ├── routes/             # REST & Realtime API endpoints
  │   │   │   ├── analytics.py
  │   │   │   ├── approvals.py
  │   │   │   ├── audit_logs.py
  │   │   │   ├── dashboard.py
  │   │   │   ├── emergency.py
  │   │   │   ├── health.py
  │   │   │   ├── incidents.py
  │   │   │   ├── messages.py
  │   │   │   ├── n8n_events.py
  │   │   │   └── realtime.py
  │   │   └── services/           # Intelligence and persistence services
  │   │       ├── audit.py
  │   │       ├── deduplication.py
  │   │       ├── groq_service.py
  │   │       ├── mongodb.py
  │   │       ├── n8n.py
  │   │       ├── priority_engine.py
  │   │       └── realtime.py
  ├── frontend/
  │   ├── src/
  │   │   ├── components/         # Header, Sidebar, Simulator Bar, Map, Badges
  │   │   ├── context/            # AuthContext & SystemContext (Real-time telemetry)
  │   │   ├── hooks/              # useRealtime.js (SSE listener)
  │   │   ├── layouts/            # MainLayout.jsx with simulation banner
  │   │   ├── pages/              # 10 Command Center Pages
  │   │   │   ├── AnalyticsPage.jsx
  │   │   │   ├── ApprovalCenterPage.jsx
  │   │   │   ├── AuditLogsPage.jsx
  │   │   │   ├── DashboardPage.jsx
  │   │   │   ├── EmergencyReportPage.jsx
  │   │   │   ├── IncidentDetailPage.jsx
  │   │   │   ├── LiveIncidentsPage.jsx
  │   │   │   ├── LoginPage.jsx
  │   │   │   ├── ResponseActivityPage.jsx
  │   │   │   └── SystemStatusPage.jsx
  │   │   ├── services/           # api.js
  │   │   ├── styles/             # theme.css & global.css (EOC dark styling)
  │   │   ├── App.jsx
  │   │   └── main.jsx
  ├── n8n/
  │   └── workflows/
  │       ├── 01_emergency_intake.json
  │       ├── 02_incident_intelligence.json
  │       ├── 03_human_approval.json
  │       ├── 04_automated_response.json
  │       └── 05_incident_monitoring.json
  ├── docs/
  │   ├── architecture.md
  │   ├── n8n-workflows.md
  │   ├── api.md
  │   └── demo-script.md
  ├── .env.example
  └── README.md
```

---

## ⚡ Quick Start Guide

### Prerequisites
- Node.js v18+ (tested on v22)
- Python 3.10+ (tested on v3.13)
- MongoDB running locally on `localhost:27017` or MongoDB Atlas URI
- n8n installed (`npm install -g n8n`)

### Step 1: Environment Setup
Copy the template configuration:
```bash
cp .env.example .env
```
Add your Groq API Key:
```env
GROQ_API_KEY=gsk_your_key_here
GROQ_MODEL=llama-3.3-70b-versatile
MONGO_URI=mongodb://localhost:27017
DB_NAME=rescueflow
```

---

### Step 2: Start Backend
In a terminal:
```bash
# If using the included virtual environment:
.\backend_venv\Scripts\activate
# Or install dependencies:
pip install -r requirements.txt # (or pip install fastapi uvicorn pydantic motor pymongo httpx python-dotenv sse-starlette)

# Start FastAPI server
$env:PYTHONPATH="d:\Dev\Projects\RescueFlow-AI\backend"
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```
Backend will be live at `http://localhost:8000` (API docs at `http://localhost:8000/docs`).

---

### Step 3: Start Frontend
In a second terminal:
```bash
cd frontend
npm install
npm run dev
```
Open `http://localhost:5173` in your browser.

---

### Step 4: Start & Configure n8n
In a third terminal:
```bash
n8n start
```
1. Open `http://localhost:5678`.
2. Click **Workflows** &rarr; **Add Workflow** &rarr; **...** &rarr; **Import from File**.
3. Import the 5 files in `n8n/workflows/`:
   - `01_emergency_intake.json`
   - `02_incident_intelligence.json`
   - `03_human_approval.json`
   - `04_automated_response.json`
   - `05_incident_monitoring.json`
4. Toggle them to **Active**.

---

## 🧪 14-Step Hackathon Demo Sequence

RescueFlow AI comes with a built-in **Simulation Controller Bar** right on the Dashboard:

1. **Open Dashboard (`http://localhost:5173`)**: View clean zero state or click **Reset Demo Data**.
2. **Step 1: Flood @ PSG**: Click button or send Telegram: `"URGENT! Flood water entered houses near PSG College. 5 people are trapped and need immediate rescue."`
3. **Orchestration**: Animated stepper shows: *Intake &rarr; Groq Classification &rarr; Extraction &rarr; Deduplication Check &rarr; Priority Scoring*.
4. **Dashboard Updates**: Live event pops up `#INC-001024` (CRITICAL priority, score: 85+). Red marker drops on PSG College.
5. **Step 2: Corroborate #2**: Click button or send Email: `"Water has entered several homes near PSG College. Residents need emergency assistance."`
6. **Step 3: Corroborate #3**: Click button or submit Web report: `"PSG area is flooded. Please send rescue support."`
7. **Deduplication Visualized**: All 3 messages merge into **ONE INCIDENT** with `Reports: 3` and a multi-source corroboration score boost!
8. **Inspect Reasons**: Open incident to view deterministic explanation tags (`People trapped (+20)`, `Immediate life danger (+30)`, `Multi-source corroboration (+10)`).
9. **Approval Center**: Navigate to `/approvals` &mdash; card displays recommended units (Rescue Team, Boats).
10. **Human Authorization**: Click **APPROVE RESPONSE** and provide operational note.
11. **Automated Dispatch**: n8n triggers simulated Telegram emergency alert and email dispatch (visible in `/activity`).
12. **Assign Team**: Assign field team `"Rapid Flood Rescue Alpha"`.
13. **Mark Responding & Resolved**: Transition status to `responding`, then `resolved`.
14. **Audit Trail**: Check `/audit` for full JSON log history. Test **Step 6: Casual Message** to show non-emergency filtering!

---

## 🛡️ Safety & Ethical Disaster Automation Principles
- **No Hallucinated Actions:** All response actions are explicitly simulated.
- **Explainable Scoring:** Priority scores are deterministic, mathematically bounded (0-100), and accompanied by explicit human-readable reasons.
- **Human-in-the-Loop:** High-impact tactical decisions require operator confirmation.
- **Secret Isolation:** API keys and credentials are kept strictly in backend and n8n environment variables.

---

## 📄 License
MIT License. Built for AI & Automation Hackathon 2026.
