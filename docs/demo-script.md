# RescueFlow AI — Official Hackathon Demo Script

Follow this step-by-step presentation script to demonstrate the complete AI + n8n automation pipeline to judges and evaluators.

---

## Pre-Demo Quick Checklist
- [x] Backend running on `http://localhost:8000`
- [x] Frontend running on `http://localhost:5173`
- [x] MongoDB running locally or connected via Atlas
- [x] n8n workflows imported and active (or simulation fallback active)

---

## 14-Step Live Hackathon Presentation Flow

### STEP 1: Command Center Overview
1. Open browser at `http://localhost:5173`.
2. Notice the **Simulation Mode** ribbon, live telemetry pills (`n8n: ACTIVE`, `Groq: LLAMA-3.3`, `MongoDB: CONNECTED`), and live clock.
3. If existing records are present, click **Reset Demo Data** in the top simulation controller bar to start with 0 incidents.

### STEP 2: Send First Emergency Report via Telegram
1. In the **Hackathon Demo Simulation Controller** bar at the top, click **Step 1: Flood @ PSG** (or send via configured Telegram Bot: `"URGENT! Flood near PSG College. 5 people trapped."`).
2. An animated AI Orchestration Stepper appears:
   - *Receiving report...*
   - *Groq AI classifying emergency...*
   - *Extracting incident information...*
   - *Checking similar incidents...*
   - *Calculating priority...*

### STEP 3 & 4: Live Incident Created (Critical Priority)
1. Notice the dashboard updates immediately via SSE without refreshing!
2. A new incident `#INC-001024` appears:
   - **Type:** FLOOD
   - **Location:** PSG College
   - **Priority Score:** 85+ (CRITICAL)
   - **People Affected:** 5
   - **Pin on Leaflet Map:** Glowing Red Marker on PSG College
3. The Pending Authorizations counter ticks to **1 REQUIRED**.

### STEP 5: Ingest Second Corroborating Report via Email
1. Click **Step 2: Corroborate #2** (or send email with `"Water has entered several homes near PSG College. Residents need emergency assistance."`).
2. Explain to the judges:
   > *"Notice that instead of spamming emergency dispatchers with a duplicate ticket, RescueFlow's deduplication engine recognizes this describes the existing flood near PSG College."*

### STEP 6 & 7: Ingest Third Report via Web Form & Show Intelligent Merging
1. Click **Step 3: Corroborate #3** (`"PSG area is flooded. Please send rescue support."`).
2. Point out that **3 separate reports across Telegram, Email, and Web have merged into 1 incident**!
3. Notice that:
   - Incident `#INC-001024` now displays **Reports: 3**.
   - The priority score received a **Multi-source Corroboration Bonus (+10)**.

### STEP 8: Inspect Incident Details & Deterministic Reasoning
1. Click **Inspect** on `#INC-001024`.
2. Review the **Deterministic Priority Engine** card:
   - `✓ Immediate life danger detected (+30)`
   - `✓ People reported trapped in distress zone (+20)`
   - `✓ Multi-source corroboration (3 independent reports) (+10)`
   - `✓ High-consequence disaster type: Flood (+15)`
3. Expand the **Corroborating Source Reports** section to show the 3 raw reports preserved with timestamps and channels.

### STEP 9 & 10: Human-in-the-Loop Approval Center
1. Navigate to the **Approval Center** in the sidebar.
2. Show the critical authorization card for `#INC-001024`.
3. Explain the core philosophy:
   > *"AI Recommends. Human Decides. n8n Executes."*
4. Click **APPROVE RESPONSE**. In the modal, enter an authorization note: *"Confirmed via drone reconnaissance"* and click **Approve & Dispatch**.

### STEP 11: Automated Response Execution via n8n
1. Navigate to **Response Activity** in the sidebar.
2. Show the 2 automated dispatch tasks created instantly by n8n:
   - **Telegram Dispatch:** `🚨 [SIMULATED EMERGENCY DISPATCH] Incident INC-001024 FLOOD at PSG College...`
   - **Email Dispatch:** `[SIMULATED DISPATCH] Authorized Response: INC-001024 - PSG College...`

### STEP 12 & 13: Operational Status Transition & Resolution
1. Open the incident and click **Assign Team** &rarr; select/type `"Rapid Flood Rescue Unit Alpha"`.
2. Click **Mark Responding**.
3. Once operations are complete, click **Mark Resolved**.
4. The dashboard statistics update: **Resolved: 1**, and the incident status turns emerald green.

### STEP 14: Review Complete Audit & Timeline Trail
1. Scroll down to the **Incident Timeline**:
   - `10:02:10` &mdash; Initial report received via TELEGRAM
   - `10:02:12` &mdash; AI classified situation as FLOOD
   - `10:02:14` &mdash; AI info extracted: Location PSG College | 5 people
   - `10:02:16` &mdash; Corroborating report #2 merged from EMAIL
   - `10:02:18` &mdash; Corroborating report #3 merged from WEB
   - `10:02:20` &mdash; Approval requested for Critical Priority
   - `10:02:35` &mdash; Human operator authorized emergency deployment
   - `10:02:37` &mdash; Automated response notifications sent
   - `10:05:00` &mdash; Incident marked responding
   - `10:15:00` &mdash; Incident marked resolved
2. Navigate to **Audit Logs** to show the immutable JSON audit trail.
3. Test **Step 6: Casual Message** ("Good morning everyone, have a nice day.") to prove non-emergencies are safely filtered and archived without triggering alerts.

---

## Pitch Conclusion:
> *"RescueFlow AI transforms fragmented, noisy disaster reports into deduplicated, explainable incidents, and uses n8n to automate the response workflow while keeping critical life-or-death decisions firmly in human hands."*
