# n8n Orchestration Architecture & Workflow Guide

RescueFlow AI relies on **n8n** as its central orchestration backbone. The entire disaster message processing pipeline is consolidated into a **single, unified root master workflow**:

**`RescueFlow AI - Master Orchestrator`** (`n8n/workflows/rescueflow_master_orchestrator.json`)

---

## 1. Single Unified Architecture Canvas

All pipeline stages live seamlessly inside this single workflow:

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
                  v              v
               Archive     Groq AI Extraction
               Casual     (Type, Location, Needs)
                                 |
                                 v
                        Duplicate Detection
                        & Incident Merging
                                 |
                                 v
                         Priority Engine
                        (0-100 Score & SLA)
                                 |
                                 v
                       MongoDB Persistence
                                 |
                                 v
                           Score >= 60?
                            /        \
                          YES         NO
                          |            |
                          v            v
                       HUMAN       AUTOMATED
                      APPROVAL     DISPATCH
                      WORKFLOW         |
                          |            |
                      Approved?        |
                      /       \        |
                    YES        NO      |
                    |           |      |
                    +-----------+------+
                          |
                          v
                Multi-Agency Dispatch
              (Telegram, Email, Webhook)
                          |
                          v
                 Real-Time SSE Alert
                  to React Dashboard
```

---

## 2. Integrated Modules in the Master Workflow

| Canvas Module | Nodes Included | Function |
| :--- | :--- | :--- |
| **1. Emergency Intake** | `React Web / CSV Webhook`, `Telegram Bot Trigger`, `Gmail Inbox Trigger` | Captures reports across channels into normalized schema |
| **2. AI Classification** | `Groq AI Classification`, `Parse Classification`, `Is Emergency?`, `Archive Casual Message` | Filters casual chatter; routes real emergencies to extraction |
| **3. AI Extraction** | `Groq AI Extraction`, `JSON Validation` | Extracts disaster type, location, affected count, and resource requirements |
| **4. Deduplication** | `Get Active Incidents`, `Duplicate Detection`, `Existing Incident?`, `Merge with Existing Incident` | Queries active database incidents to merge matching duplicates |
| **5. Priority Engine** | `Priority Calculation`, `Persist to MongoDB & Dashboard Event` | Computes deterministic priority score (0-100) and writes to MongoDB |
| **6. Human-in-the-Loop Gating** | `Critical or High?`, `Human Approval Decision Webhook`, `Is Approved?`, `Log Rejection` | Gating for Critical/High incidents (>=60 score) |
| **7. Multi-Channel Dispatch** | `Telegram Alert Notification`, `Email Alert Notification`, `Update Status Responding` | Dispatches alerts to first responders and updates status to responding |
| **8. Periodic Monitoring** | `Schedule Trigger - Every 5 Min`, `Poll Responding Incidents`, `Analyze Response Liveliness`, `Report Monitoring Cycle` | Automated 5-minute cron checking response staleness and escalations |

---

## 3. How to View and Manage in n8n

1. Open your n8n UI at `http://localhost:5678`.
2. In the **Workflows** list, click on **`RescueFlow AI - Master Orchestrator`**.
3. You will see the complete node graph arranged with visual Sticky Note sections.
4. Toggle the switch in the top-right corner to **Active** to begin receiving live webhooks and scheduled monitoring runs.
