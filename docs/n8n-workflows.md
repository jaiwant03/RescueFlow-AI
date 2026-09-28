# n8n Orchestration Architecture & Workflow Guide

RescueFlow AI relies on **n8n** as its central orchestration backbone. This document details how each workflow functions, how to configure credentials, and how to import them.

---

## 1. Workflow Catalog

| File | Name | Trigger Type | Primary Function |
| :--- | :--- | :--- | :--- |
| `01_emergency_intake.json` | 01_Emergency_Intake | Webhook / Telegram / Gmail | Ingestion, normalization, and Groq AI classification |
| `02_incident_intelligence.json` | 02_Incident_Intelligence | Sub-Workflow Webhook | Groq AI extraction, deduplication, priority calculation & MongoDB persistence |
| `03_human_approval.json` | 03_Human_Approval | Webhook | Authorization trigger for Critical/High incidents & decision callback |
| `04_automated_response.json` | 04_Automated_Response | Webhook | Automated dispatch (Telegram Alert, Email Alert, Task creation) |
| `05_incident_monitoring.json` | 05_Incident_Monitoring | Schedule Trigger (5 Min Cron) | Active incident liveliness polling & staleness escalation |

---

## 2. How to Import Workflows into n8n

### Option A: Using the n8n Web UI
1. Start your local n8n instance:
   ```bash
   n8n start
   ```
2. Open your browser at `http://localhost:5678`.
3. In the left navigation, click **Workflows** &rarr; **Add Workflow** &rarr; **...** (three dots at top right) &rarr; **Import from File**.
4. Navigate to `rescueflow-ai/n8n/workflows/` and select each JSON file:
   - `01_emergency_intake.json`
   - `02_incident_intelligence.json`
   - `03_human_approval.json`
   - `04_automated_response.json`
   - `05_incident_monitoring.json`
5. Click **Save** and toggle the workflow switch to **Active**.

### Option B: Using n8n CLI
```bash
n8n import:workflow --input=./n8n/workflows/01_emergency_intake.json
n8n import:workflow --input=./n8n/workflows/02_incident_intelligence.json
n8n import:workflow --input=./n8n/workflows/03_human_approval.json
n8n import:workflow --input=./n8n/workflows/04_automated_response.json
n8n import:workflow --input=./n8n/workflows/05_incident_monitoring.json
```

---

## 3. Configuring n8n Environment Variables & Credentials

### Environment Variables
Set these variables in your n8n environment or `.env`:
```env
GROQ_API_KEY=your_groq_api_key_here
GROQ_MODEL=llama-3.3-70b-versatile
```

### Groq API HTTP Request Node Configuration
In workflows `01_emergency_intake` and `02_incident_intelligence`, the Groq nodes make calls to:
```
POST https://api.groq.com/openai/v1/chat/completions
Headers:
  Authorization: Bearer {{$env.GROQ_API_KEY}}
  Content-Type: application/json
```

### Configuring Telegram Trigger (Optional)
1. Message `@BotFather` on Telegram and create a new bot (e.g., `RescueFlowDemoBot`).
2. Copy the API Token.
3. In n8n, open the `Telegram Bot Trigger` node in `01_emergency_intake`.
4. Click **Create New Credential** &rarr; **Telegram API**, paste the Token, and save.
5. Users can now send messages such as:
   ```
   /report Flood near PSG College. 5 people trapped.
   ```

### Configuring Gmail Trigger (Optional)
1. In n8n, open the `Gmail / Email Inbox Trigger` node in `01_emergency_intake`.
2. Connect OAuth2 credentials for your demo email inbox (e.g. `rescueflow.demo@gmail.com`).
3. Set filter to unread messages with subject containing `EMERGENCY` or all incoming emails.

---

## 4. End-to-End Workflow Execution Walkthrough

```
[Citizen sends Telegram / Email / Web Report]
                      │
                      ▼
        [01_Emergency_Intake Workflow]
   - Webhook receives raw payload
   - Code node normalizes to standard schema
   - HTTP node calls Groq AI to classify
   - IF Emergency: routes to 02_Incident_Intelligence
   - IF Non-Emergency: routes to Archive & Audit Log
                      │
                      ▼
    [02_Incident_Intelligence Workflow]
   - HTTP node calls Groq AI to extract location, needs, count
   - HTTP node queries backend for active incidents
   - Code node runs similarity comparison
   - IF similar: merges into existing incident
   - IF new: calculates deterministic score (0-100)
   - IF Critical/High: triggers 03_Human_Approval
                      │
                      ▼
        [03_Human_Approval Workflow]
   - Creates approval card on Dashboard
   - Waits for operator decision callback
   - Operator clicks "Approve Response"
                      │
                      ▼
       [04_Automated_Response Workflow]
   - Generates simulated Telegram alert
   - Generates simulated Email dispatch
   - Creates response task in database
   - Transitions incident to "responding"
                      │
                      ▼
      [05_Incident_Monitoring Workflow]
   - Scheduled cron checks active incidents every 5 minutes
   - Escalates overdue dispatches
```
