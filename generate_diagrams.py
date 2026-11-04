import os
import matplotlib.pyplot as plt
import matplotlib.patches as patches

def create_architecture_diagram(output_path):
    fig, ax = plt.subplots(figsize=(18, 11), dpi=300)
    fig.patch.set_facecolor('#ffffff')
    ax.set_facecolor('#f8fafc')
    ax.set_xlim(0, 100)
    ax.set_ylim(0, 100)
    ax.axis('off')

    # Color definitions
    c_navy = '#0f172a'
    c_peacock = '#0f2738'
    c_blue = '#0284c7'
    c_teal = '#0d9488'
    c_dark_teal = '#0f766e'
    c_light_bg = '#f1f5f9'
    c_card_bg = '#ffffff'
    c_border = '#cbd5e1'
    c_accent_red = '#e11d48'
    c_accent_amber = '#d97706'
    c_accent_green = '#16a34a'

    # Title Banner
    title_box = patches.FancyBboxPatch((2, 91), 96, 7.5, boxstyle="round,pad=0.5,rounding_size=1.2",
                                       edgecolor=c_peacock, facecolor=c_peacock, zorder=2)
    ax.add_patch(title_box)
    ax.text(50, 95.8, "RESCUEFLOW AI — SYSTEM ARCHITECTURE SPECIFICATION",
            color='#ffffff', fontsize=18, fontweight='bold', ha='center', va='center', fontfamily='sans-serif')
    ax.text(50, 92.6, "AI UNDERSTANDS + n8n AUTOMATES + MONGODB REMEMBERS + REACT VISUALIZES + HUMAN APPROVES",
            color='#5eead4', fontsize=10.5, fontweight='bold', ha='center', va='center', fontfamily='sans-serif', style='italic')

    # 1. Intake Channels Box (Left Column, Top)
    # x: 3 to 22, y: 55 to 88
    intake_box = patches.FancyBboxPatch((3, 53), 20, 36, boxstyle="round,pad=0.5,rounding_size=1",
                                        edgecolor=c_blue, facecolor='#f0f9ff', linewidth=1.8, zorder=2)
    ax.add_patch(intake_box)
    ax.text(13, 86.5, "1. INTAKE CHANNELS", color=c_navy, fontsize=12, fontweight='bold', ha='center', va='center')
    ax.text(13, 84, "Multi-Source Public & IoT Ingestion", color='#0369a1', fontsize=8.5, ha='center', va='center', style='italic')

    channels = [
        ("Telegram Bot API", "Long-polling & Webhook\nLive Citizen Distress Feeds", "#e0f2fe", c_blue),
        ("Gmail / IMAP Ingestion", "rescueflow.demo@gmail.com\nAuto-polling unread mail", "#e0f2fe", c_blue),
        ("React Emergency Gateway", "Direct Citizen Web Portal\nGPS & Landmark Hint Tagging", "#e0f2fe", c_blue),
        ("CSV Bulk Batch Upload", "High-Volume Historical / Field\nBatch Ingestion Service", "#e0f2fe", c_blue)
    ]
    for i, (name, desc, bg, ec) in enumerate(channels):
        y_pos = 76 - (i * 7)
        ch_card = patches.FancyBboxPatch((4.5, y_pos - 2.5), 17, 5.5, boxstyle="round,pad=0.3,rounding_size=0.6",
                                         edgecolor=ec, facecolor='#ffffff', linewidth=1.2, zorder=3)
        ax.add_patch(ch_card)
        ax.text(13, y_pos + 1.2, name, color=c_navy, fontsize=9.5, fontweight='bold', ha='center', va='center')
        ax.text(13, y_pos - 1.0, desc, color='#475569', fontsize=7.2, ha='center', va='center')

    # 2. n8n Automation Backbone (Middle-Left)
    # x: 26 to 47, y: 53 to 89
    n8n_box = patches.FancyBboxPatch((26, 53), 21, 36, boxstyle="round,pad=0.5,rounding_size=1",
                                     edgecolor=c_teal, facecolor='#f0fdfa', linewidth=1.8, zorder=2)
    ax.add_patch(n8n_box)
    ax.text(36.5, 86.5, "2. n8n ORCHESTRATOR", color=c_navy, fontsize=12, fontweight='bold', ha='center', va='center')
    ax.text(36.5, 84, "Master Workflow Automation Engine", color=c_dark_teal, fontsize=8.5, ha='center', va='center', style='italic')

    n8n_nodes = [
        ("Webhook Receiver & Router", "Normalizes Telegram, Web, Email\ninto Unified Canonical Schema", c_teal),
        ("Groq AI Inference Dispatcher", "Coordinates JSON Payload to\nLlama 3.3-70B API endpoints", c_teal),
        ("Triage & Merge Dispatcher", "Passes Extraction to Backend\nfor Semantic Deduplication", c_teal),
        ("Response & Alert Dispatcher", "Dispatches Telegram Alerts,\nField Tasks & Team Assignment", c_teal)
    ]
    for i, (name, desc, ec) in enumerate(n8n_nodes):
        y_pos = 76 - (i * 7)
        card = patches.FancyBboxPatch((27.5, y_pos - 2.5), 18, 5.5, boxstyle="round,pad=0.3,rounding_size=0.6",
                                      edgecolor=ec, facecolor='#ffffff', linewidth=1.2, zorder=3)
        ax.add_patch(card)
        ax.text(36.5, y_pos + 1.2, name, color=c_navy, fontsize=9.5, fontweight='bold', ha='center', va='center')
        ax.text(36.5, y_pos - 1.0, desc, color='#475569', fontsize=7.2, ha='center', va='center')

    # 3. AI & Triage Core (FastAPI Backend Core) (Middle-Right)
    # x: 50 to 73, y: 53 to 89
    core_box = patches.FancyBboxPatch((50, 53), 23, 36, boxstyle="round,pad=0.5,rounding_size=1",
                                      edgecolor=c_peacock, facecolor='#f8fafc', linewidth=1.8, zorder=2)
    ax.add_patch(core_box)
    ax.text(61.5, 86.5, "3. FASTAPI BACKEND CORE", color=c_navy, fontsize=12, fontweight='bold', ha='center', va='center')
    ax.text(61.5, 84, "Intelligence, Triage & Safety Engine", color=c_peacock, fontsize=8.5, ha='center', va='center', style='italic')

    backend_modules = [
        ("Groq Llama 3.3-70B Pipeline", "Classification & Entity Extraction\nwith Heuristic Zero-Crash Fallback", '#0284c7'),
        ("Semantic Deduplication Engine", "Jaccard Token + Landmark Match\nIncremental Merge & Corroboration", c_teal),
        ("Deterministic Priority Engine", "Explainable 0-100 Weighted Score\nLife Danger, Trapped, Medical, Scale", c_accent_amber),
        ("Human-in-the-Loop Safety Gate", "Strict Authorization Intercept\nfor Critical (P1) & High (P2) Tiers", c_accent_red)
    ]
    for i, (name, desc, ec) in enumerate(backend_modules):
        y_pos = 76 - (i * 7)
        card = patches.FancyBboxPatch((51.5, y_pos - 2.5), 20, 5.5, boxstyle="round,pad=0.3,rounding_size=0.6",
                                      edgecolor=ec, facecolor='#ffffff', linewidth=1.2, zorder=3)
        ax.add_patch(card)
        ax.text(61.5, y_pos + 1.2, name, color=c_navy, fontsize=9.5, fontweight='bold', ha='center', va='center')
        ax.text(61.5, y_pos - 1.0, desc, color='#475569', fontsize=7.2, ha='center', va='center')

    # 4. Storage & Persistence (Right Column, Top)
    # x: 76 to 97, y: 53 to 89
    db_box = patches.FancyBboxPatch((76, 53), 21, 36, boxstyle="round,pad=0.5,rounding_size=1",
                                    edgecolor='#10b981', facecolor='#f0fdf4', linewidth=1.8, zorder=2)
    ax.add_patch(db_box)
    ax.text(86.5, 86.5, "4. DATA & TELEMETRY", color=c_navy, fontsize=12, fontweight='bold', ha='center', va='center')
    ax.text(86.5, 84, "MongoDB Persistence & SSE Streaming", color='#059669', fontsize=8.5, ha='center', va='center', style='italic')

    db_items = [
        ("MongoDB Collection: incidents", "Consolidated Incidents, Location,\nMerged Reports, Dynamic Timeline", '#10b981'),
        ("MongoDB Collection: messages", "Raw Ingested Records, AI Label,\nAudit Traces & Channel Metadata", '#10b981'),
        ("MongoDB: approvals & tasks", "Pending Commander Authorizations\n& Dispatched Tactical Tasks", '#10b981'),
        ("Real-Time Broadcaster (SSE)", "Server-Sent Events & WebSockets\nSub-Second Live Dashboard Sync", '#0284c7')
    ]
    for i, (name, desc, ec) in enumerate(db_items):
        y_pos = 76 - (i * 7)
        card = patches.FancyBboxPatch((77.5, y_pos - 2.5), 18, 5.5, boxstyle="round,pad=0.3,rounding_size=0.6",
                                      edgecolor=ec, facecolor='#ffffff', linewidth=1.2, zorder=3)
        ax.add_patch(card)
        ax.text(86.5, y_pos + 1.2, name, color=c_navy, fontsize=9.5, fontweight='bold', ha='center', va='center')
        ax.text(86.5, y_pos - 1.0, desc, color='#475569', fontsize=7.2, ha='center', va='center')

    # 5. Bottom Section: Frontend Operations Command Center & Field Response
    # Frontend Command Center: x: 3 to 65, y: 7 to 46
    fe_box = patches.FancyBboxPatch((3, 7), 63, 40, boxstyle="round,pad=0.5,rounding_size=1.2",
                                    edgecolor=c_peacock, facecolor='#f8fafc', linewidth=2, zorder=2)
    ax.add_patch(fe_box)
    ax.text(34.5, 44, "5. REACT 18 OPERATIONS COMMAND CENTER (EOC WEB APPLICATION)",
            color=c_navy, fontsize=13, fontweight='bold', ha='center', va='center')
    ax.text(34.5, 41.5, "Real-Time Emergency Visualization, GIS Mapping, Triage & Human Decision Workflow",
            color=c_teal, fontsize=9.5, fontweight='bold', ha='center', va='center', style='italic')

    fe_cards = [
        ("Operations Dashboard", "Real-time KPI metrics, active incident counters, live audio telemetry feed, trendline graphs", 5, 30, 28, 9),
        ("Interactive Leaflet GIS Map", "Real-time OpenStreetMap rendering, severity-pulsing GPS markers, zone cluster coordinates", 35, 30, 29, 9),
        ("Human Approval Center", "Commander gatekeeper interface, priority justification review, one-click authorize / reject", 5, 18, 28, 9),
        ("Live Triage Queue", "Severity-ranked incident backlog (P1-P4), detailed incident modals, dynamic timeline audit", 35, 18, 29, 9),
        ("Emergency Report Gateway", "Interactive manual dispatch form, 1-click test scenario presets, CSV batch file import", 5, 9, 28, 7.5),
        ("Analytics & Audit Explorer", "Disaster distribution charts, channel throughput, tamper-evident immutable audit log", 35, 9, 29, 7.5)
    ]
    for title, desc, cx, cy, cw, ch in fe_cards:
        card = patches.FancyBboxPatch((cx, cy), cw, ch, boxstyle="round,pad=0.3,rounding_size=0.6",
                                      edgecolor=c_border, facecolor='#ffffff', linewidth=1.2, zorder=3)
        ax.add_patch(card)
        ax.text(cx + cw/2, cy + ch - 2.5, title, color=c_peacock, fontsize=9.5, fontweight='bold', ha='center', va='center')
        ax.text(cx + cw/2, cy + (ch - 2.5)/2, desc, color='#475569', fontsize=7.5, ha='center', va='center', wrap=True)

    # 6. Bottom Right: Tactical Field Response & Notification Dispatch
    # x: 69 to 97, y: 7 to 46
    field_box = patches.FancyBboxPatch((69, 7), 28, 40, boxstyle="round,pad=0.5,rounding_size=1.2",
                                       edgecolor=c_accent_green, facecolor='#f0fdf4', linewidth=2, zorder=2)
    ax.add_patch(field_box)
    ax.text(83, 44, "6. TACTICAL RESPONSE & DISPATCH", color=c_navy, fontsize=12, fontweight='bold', ha='center', va='center')
    ax.text(83, 41.5, "Multi-Channel Automated Field Notification", color=c_accent_green, fontsize=8.5, ha='center', va='center', style='italic')

    field_cards = [
        ("Telegram Operations Channel", "Instant markdown alerts with Incident ID,\nGPS coords, resource needs & priorities", 71, 31, 24, 7.5),
        ("First Responder Dispatch", "Direct deployment notice to NDRF,\nFire Services, Ambulance & EMTs", 71, 21.5, 24, 7.5),
        ("Citizen Feedback & Confirmation", "Corroboration confirmation & SMS/Telegram\nfeedback to citizen reporting distress", 71, 12, 24, 7.5)
    ]
    for title, desc, cx, cy, cw, ch in field_cards:
        card = patches.FancyBboxPatch((cx, cy), cw, ch, boxstyle="round,pad=0.3,rounding_size=0.6",
                                      edgecolor='#86efac', facecolor='#ffffff', linewidth=1.2, zorder=3)
        ax.add_patch(card)
        ax.text(cx + cw/2, cy + ch - 2.2, title, color=c_navy, fontsize=9.5, fontweight='bold', ha='center', va='center')
        ax.text(cx + cw/2, cy + (ch - 2.2)/2, desc, color='#334155', fontsize=7.3, ha='center', va='center')

    # Draw Inter-Module Flow Arrows
    arrow_props = dict(arrowstyle="->", color=c_peacock, lw=2, mutation_scale=15)
    arrow_props_teal = dict(arrowstyle="->", color=c_teal, lw=2, mutation_scale=15)
    arrow_props_red = dict(arrowstyle="->", color=c_accent_red, lw=2, mutation_scale=15)
    arrow_props_green = dict(arrowstyle="->", color=c_accent_green, lw=2, mutation_scale=15)

    # 1 -> 2: Intake to n8n
    ax.annotate("", xy=(26, 71), xytext=(23, 71), arrowprops=arrow_props)
    # 2 -> 3: n8n to FastAPI Core
    ax.annotate("", xy=(50, 71), xytext=(47, 71), arrowprops=arrow_props_teal)
    # 3 -> 4: Core to MongoDB & SSE
    ax.annotate("", xy=(76, 71), xytext=(73, 71), arrowprops=arrow_props)

    # 4 -> 5: SSE to React EOC
    ax.annotate("", xy=(55, 47), xytext=(78, 53),
                arrowprops=dict(arrowstyle="->", color=c_blue, lw=2.2, linestyle="--",
                                connectionstyle="arc3,rad=-0.15", mutation_scale=15))
    ax.text(68, 49, "SSE Stream (Sub-second)", color=c_blue, fontsize=8, fontweight='bold', rotation=-22)

    # 5 -> 3: Human Approval Decision (React EOC to FastAPI)
    ax.annotate("", xy=(61.5, 53), xytext=(34.5, 47),
                arrowprops=dict(arrowstyle="->", color=c_accent_red, lw=2.2,
                                connectionstyle="arc3,rad=-0.12", mutation_scale=15))
    ax.text(42, 51, "Commander Approval / Rejection", color=c_accent_red, fontsize=8, fontweight='bold', rotation=22)

    # 3 -> 6: FastAPI / n8n to Field Dispatch
    ax.annotate("", xy=(76, 47), xytext=(68, 53),
                arrowprops=dict(arrowstyle="->", color=c_accent_green, lw=2.2,
                                connectionstyle="arc3,rad=0.1", mutation_scale=15))
    ax.text(71, 51.5, "Authorized Dispatch Task", color=c_accent_green, fontsize=8, fontweight='bold', rotation=-30)

    # Footer note
    ax.text(50, 3, "RescueFlow AI Technical Specification Architecture Diagram — INFINEX 2K26 Global AI Hackathon Submission",
            color='#64748b', fontsize=8.5, ha='center', va='center')

    plt.tight_layout()
    plt.savefig(output_path, dpi=300, facecolor=fig.get_facecolor(), edgecolor='none', bbox_inches='tight')
    plt.close()
    print(f"Architecture diagram created successfully at {output_path}")

def create_workflow_diagram(output_path):
    fig, ax = plt.subplots(figsize=(18, 12), dpi=300)
    fig.patch.set_facecolor('#ffffff')
    ax.set_facecolor('#f8fafc')
    ax.set_xlim(0, 100)
    ax.set_ylim(0, 100)
    ax.axis('off')

    c_navy = '#0f172a'
    c_peacock = '#0f2738'
    c_blue = '#0284c7'
    c_teal = '#0d9488'
    c_card_bg = '#ffffff'
    c_border = '#cbd5e1'
    c_red = '#e11d48'
    c_amber = '#d97706'
    c_green = '#16a34a'

    # Title Banner
    title_box = patches.FancyBboxPatch((2, 92), 96, 6.5, boxstyle="round,pad=0.5,rounding_size=1",
                                       edgecolor=c_peacock, facecolor=c_peacock, zorder=2)
    ax.add_patch(title_box)
    ax.text(50, 95.8, "RESCUEFLOW AI — COMPLETE 11-STEP END-TO-END WORKFLOW PIPELINE",
            color='#ffffff', fontsize=17, fontweight='bold', ha='center', va='center', fontfamily='sans-serif')
    ax.text(50, 93.3, "From Unstructured Multi-Channel Distress Signals to Tactical Field Responder Deployment",
            color='#5eead4', fontsize=10, fontweight='bold', ha='center', va='center', fontfamily='sans-serif', style='italic')

    # 11 Steps Layout (4 steps row 1, 3 steps row 2, 4 steps row 3)
    # Row 1 (Left to Right): Steps 1, 2, 3, 4
    # Row 2 (Right to Left): Steps 5, 6, 7
    # Row 3 (Left to Right): Steps 8, 9, 10, 11
    
    steps = [
        # Step 1
        {"num": "STEP 01", "title": "Distress Signal Ingestion", "cat": "INTAKE LAYER",
         "desc": "Citizen reports emergency via Telegram bot (/report), Gmail email, Web Emergency Form, or CSV bulk batch upload.",
         "tech": "Telegram Bot API, IMAP, React Form, CSV DictReader",
         "x": 4, "y": 66, "w": 20, "h": 22, "c": c_blue},
        
        # Step 2
        {"num": "STEP 02", "title": "Payload Normalization", "cat": "ORCHESTRATION",
         "desc": "n8n or FastAPI transforms heterogenous channel payloads into canonical schema (message_id, source, sender, message, location_hint).",
         "tech": "n8n Code Node / Pydantic MessageModel",
         "x": 28, "y": 66, "w": 20, "h": 22, "c": c_blue},
        
        # Step 3
        {"num": "STEP 03", "title": "AI Emergency Classification", "cat": "AI INFERENCE",
         "desc": "Groq Llama 3.3-70B analyzes text distress indicators. Casual greetings/spam are filtered out with zero false emergency alerts.",
         "tech": "Groq Cloud API (Llama 3.3-70B Versatile, temp=0.1)",
         "x": 52, "y": 66, "w": 20, "h": 22, "c": c_teal},
        
        # Step 4
        {"num": "STEP 04", "title": "Structured Entity Extraction", "cat": "AI INFERENCE",
         "desc": "Extracts disaster type (flood, fire), location hints, affected headcount, trapped citizens, vulnerable groups & tactical resources.",
         "tech": "Strict JSON Schema Validation + Self-Repair Prompt",
         "x": 76, "y": 66, "w": 20, "h": 22, "c": c_teal},
        
        # Step 5
        {"num": "STEP 05", "title": "Semantic Deduplication", "cat": "CORE TRIAGE",
         "desc": "Compares new extraction against active incidents using Jaccard token overlap & landmark matching (threshold >= 0.75).",
         "tech": "DeduplicationEngine / Spatial Landmark Resolution",
         "x": 76, "y": 37, "w": 20, "h": 22, "c": c_amber},
        
        # Step 6
        {"num": "STEP 06", "title": "Incident Merge or Creation", "cat": "DATA INTEGRATION",
         "desc": "If match: aggregates report count, updates max affected, merges needs, appends source message. If new: assigns INC-XXXXXX.",
         "tech": "Dynamic Report Merging / Corroboration Engine",
         "x": 52, "y": 37, "w": 20, "h": 22, "c": c_amber},
        
        # Step 7
        {"num": "STEP 07", "title": "Deterministic Priority Scoring", "cat": "SAFETY & TRIAGE",
         "desc": "Calculates explainable 0-100 score based on 8 weighted factors (trapped, life danger, vulnerable, scale, corroboration).",
         "tech": "Deterministic Priority Weights (Critical >=80, High >=60)",
         "x": 28, "y": 37, "w": 20, "h": 22, "c": c_red},
        
        # Step 8
        {"num": "STEP 08", "title": "Persistence & Real-Time Sync", "cat": "PERSISTENCE",
         "desc": "Persists to MongoDB (incidents, messages, audit_logs) and pushes sub-second event payloads via Server-Sent Events (SSE).",
         "tech": "MongoDB Atlas / Local Motor + EventSource SSE",
         "x": 4, "y": 37, "w": 20, "h": 22, "c": c_blue},
        
        # Step 9
        {"num": "STEP 09", "title": "EOC Operations Visualization", "cat": "FRONTEND EOC",
         "desc": "Dashboard updates in real time: pulsing Leaflet GIS map pins, KPI counters, active audio chimes, and live incident backlog.",
         "tech": "React 18 + Leaflet OpenStreetMap + Lucide Icons",
         "x": 4, "y": 8, "w": 20, "h": 22, "c": c_peacock},
        
        # Step 10
        {"num": "STEP 10", "title": "Human-in-the-Loop Authorization", "cat": "GOVERNANCE",
         "desc": "Critical (P1) and High (P2) incidents halt automated dispatch until human commander approves response with logged justification.",
         "tech": "ApprovalCenterPage / Role-Based Operations Gatekeeper",
         "x": 28, "y": 8, "w": 20, "h": 22, "c": c_red},
        
        # Step 11
        {"num": "STEP 11", "title": "Field Dispatch & Audit Logging", "cat": "DEPLOYMENT",
         "desc": "Approved incident triggers n8n workflow: broadcasts Telegram alert, dispatches EMT/NDRF teams, logs immutable audit entry.",
         "tech": "Telegram Alert Bot, n8n Dispatcher, Audit Trail",
         "x": 52, "y": 8, "w": 44, "h": 22, "c": c_green}
    ]

    for s in steps:
        bx = patches.FancyBboxPatch((s["x"], s["y"]), s["w"], s["h"], boxstyle="round,pad=0.4,rounding_size=0.8",
                                    edgecolor=s["c"], facecolor='#ffffff', linewidth=1.8, zorder=2)
        ax.add_patch(bx)
        
        # Header bar in card
        header_bar = patches.FancyBboxPatch((s["x"], s["y"] + s["h"] - 4.5), s["w"], 4.5,
                                            boxstyle="round,pad=0.2,rounding_size=0.5",
                                            edgecolor='none', facecolor=s["c"], zorder=3)
        ax.add_patch(header_bar)
        ax.text(s["x"] + s["w"]/2, s["y"] + s["h"] - 2.2, f"{s['num']} • {s['cat']}",
                color='#ffffff', fontsize=8.5, fontweight='bold', ha='center', va='center')
        
        ax.text(s["x"] + s["w"]/2, s["y"] + s["h"] - 6.5, s["title"],
                color=c_navy, fontsize=10, fontweight='bold', ha='center', va='center')
        
        ax.text(s["x"] + s["w"]/2, s["y"] + s["h"] - 12.5, s["desc"],
                color='#334155', fontsize=7.8, ha='center', va='center', wrap=True)
        
        # Tech badge
        badge = patches.FancyBboxPatch((s["x"] + 1, s["y"] + 1.2), s["w"] - 2, 3.8,
                                       boxstyle="round,pad=0.2,rounding_size=0.4",
                                       edgecolor=c_border, facecolor='#f8fafc', linewidth=1, zorder=3)
        ax.add_patch(badge)
        ax.text(s["x"] + s["w"]/2, s["y"] + 3.1, f"Tech: {s['tech']}",
                color='#64748b', fontsize=7, ha='center', va='center', style='italic')

    # Draw workflow connection arrows
    # Row 1: 1 -> 2 -> 3 -> 4
    ax.annotate("", xy=(28, 77), xytext=(24, 77), arrowprops=dict(arrowstyle="->", color=c_blue, lw=2.2, mutation_scale=15))
    ax.annotate("", xy=(52, 77), xytext=(48, 77), arrowprops=dict(arrowstyle="->", color=c_teal, lw=2.2, mutation_scale=15))
    ax.annotate("", xy=(76, 77), xytext=(72, 77), arrowprops=dict(arrowstyle="->", color=c_teal, lw=2.2, mutation_scale=15))

    # Row 1 to Row 2: 4 down to 5
    ax.annotate("", xy=(86, 59), xytext=(86, 66), arrowprops=dict(arrowstyle="->", color=c_amber, lw=2.2, mutation_scale=15))

    # Row 2 (Right to Left): 5 -> 6 -> 7 -> 8
    ax.annotate("", xy=(72, 48), xytext=(76, 48), arrowprops=dict(arrowstyle="->", color=c_amber, lw=2.2, mutation_scale=15))
    ax.annotate("", xy=(48, 48), xytext=(52, 48), arrowprops=dict(arrowstyle="->", color=c_red, lw=2.2, mutation_scale=15))
    ax.annotate("", xy=(24, 48), xytext=(28, 48), arrowprops=dict(arrowstyle="->", color=c_blue, lw=2.2, mutation_scale=15))

    # Row 2 to Row 3: 8 down to 9
    ax.annotate("", xy=(14, 30), xytext=(14, 37), arrowprops=dict(arrowstyle="->", color=c_peacock, lw=2.2, mutation_scale=15))

    # Row 3 (Left to Right): 9 -> 10 -> 11
    ax.annotate("", xy=(28, 19), xytext=(24, 19), arrowprops=dict(arrowstyle="->", color=c_red, lw=2.2, mutation_scale=15))
    ax.annotate("", xy=(52, 19), xytext=(48, 19), arrowprops=dict(arrowstyle="->", color=c_green, lw=2.2, mutation_scale=15))

    # Footer note
    ax.text(50, 2.5, "RescueFlow AI Operational Lifecycle — Verified Implementation Workflow — INFINEX 2K26 Global AI Hackathon",
            color='#64748b', fontsize=8.5, ha='center', va='center')

    plt.tight_layout()
    plt.savefig(output_path, dpi=300, facecolor=fig.get_facecolor(), edgecolor='none', bbox_inches='tight')
    plt.close()
    print(f"Workflow diagram created successfully at {output_path}")

if __name__ == "__main__":
    out_dir = r"D:\Dev\Projects\RescueFlow-AI\INFINEX_2K26_SUBMISSION"
    os.makedirs(out_dir, exist_ok=True)
    create_architecture_diagram(os.path.join(out_dir, "RescueFlow_AI_Architecture.png"))
    create_workflow_diagram(os.path.join(out_dir, "RescueFlow_AI_Workflow.png"))
