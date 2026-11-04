import os
import docx
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT
from compile_structured_base import (
    add_heading_1, add_heading_2, add_heading_3,
    add_body_p, add_bullet_p, format_table,
    set_cell_background, set_cell_margins, set_cell_border
)

def build_cover_and_toc(doc):
    # 1. Clean Cover Page
    p_top = doc.add_paragraph()
    p_top.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_top.paragraph_format.space_before = Pt(28)
    p_top.paragraph_format.space_after = Pt(8)
    
    r_evt = p_top.add_run("INFINEX 2K26 — GLOBAL AI HACKATHON\n")
    r_evt.font.name = "Calibri"
    r_evt.font.size = Pt(12)
    r_evt.font.bold = True
    r_evt.font.color.rgb = RGBColor(13, 148, 136) # Rama Green / Teal
    
    r_org = p_top.add_run("Organized by PropCare NW  •  Track: Agentic AI & Automation")
    r_org.font.name = "Calibri"
    r_org.font.size = Pt(9.5)
    r_org.font.color.rgb = RGBColor(100, 116, 139)
    
    # Title
    p_t = doc.add_paragraph()
    p_t.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_t.paragraph_format.space_before = Pt(24)
    p_t.paragraph_format.space_after = Pt(6)
    r_title = p_t.add_run("RescueFlow AI")
    r_title.font.name = "Calibri"
    r_title.font.size = Pt(28)
    r_title.font.bold = True
    r_title.font.color.rgb = RGBColor(15, 39, 56) # Deep Peacock Blue
    
    # Subtitle
    p_sub = doc.add_paragraph()
    p_sub.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_sub.paragraph_format.space_before = Pt(0)
    p_sub.paragraph_format.space_after = Pt(20)
    r_s = p_sub.add_run("AI-Powered Disaster Message Prioritization & Response Automation\n"
                         "Official Project Documentation and Technical Submission Report")
    r_s.font.name = "Calibri"
    r_s.font.size = Pt(11)
    r_s.font.color.rgb = RGBColor(15, 118, 110)
    
    # Metadata Table
    meta_table = doc.add_table(rows=6, cols=2)
    meta_table.alignment = WD_TABLE_ALIGNMENT.CENTER
    meta_table.autofit = False
    meta_table.columns[0].width = Inches(2.2)
    meta_table.columns[1].width = Inches(4.0)
    
    meta_items = [
        ("Project Name", "RescueFlow AI"),
        ("Participant Name", "[ENTER NAME]"),
        ("College / Organization", "[ENTER DETAILS]"),
        ("Participation Mode", "Individual Participation"),
        ("Submission Date", "[ENTER DATE]"),
        ("Core Domains", "Primary: Agentic AI  |  Secondary: Automation")
    ]
    for r_idx, (label, val) in enumerate(meta_items):
        c0 = meta_table.cell(r_idx, 0)
        c1 = meta_table.cell(r_idx, 1)
        c0.text = label
        c1.text = val
        bg = "F8FAFC" if r_idx % 2 == 1 else "FFFFFF"
        set_cell_background(c0, bg)
        set_cell_background(c1, bg)
        set_cell_margins(c0, top=60, bottom=60, left=90, right=90)
        set_cell_margins(c1, top=60, bottom=60, left=90, right=90)
        set_cell_border(c0, bottom={"sz": 4, "val": "single", "color": "E2E8F0"},
                            top={"sz": 4, "val": "single", "color": "E2E8F0"},
                            left={"sz": 4, "val": "single", "color": "E2E8F0"},
                            right={"sz": 4, "val": "single", "color": "E2E8F0"})
        set_cell_border(c1, bottom={"sz": 4, "val": "single", "color": "E2E8F0"},
                            top={"sz": 4, "val": "single", "color": "E2E8F0"},
                            left={"sz": 4, "val": "single", "color": "E2E8F0"},
                            right={"sz": 4, "val": "single", "color": "E2E8F0"})
        p0 = c0.paragraphs[0]; r0 = p0.runs[0]
        r0.font.name = "Calibri"; r0.font.size = Pt(9); r0.font.bold = True
        r0.font.color.rgb = RGBColor(15, 39, 56)
        
        p1 = c1.paragraphs[0]; r1 = p1.runs[0]
        r1.font.name = "Calibri"; r1.font.size = Pt(9)
        r1.font.color.rgb = RGBColor(30, 41, 59)
        if "[" in val:
            r1.font.bold = True
            r1.font.color.rgb = RGBColor(13, 148, 136)
            
    doc.add_page_break()

    # 2. Table of Contents
    add_heading_1(doc, "Table of Contents")
    add_body_p(doc, "This document is structured into two primary parts: the six mandatory hackathon submission requirements presented first in Part A, followed by the complete technical documentation in Part B.")
    
    toc_data = [
        ("PART A", "OFFICIAL HACKATHON REQUIREMENTS", "PAGE"),
        ("Section 1", "Project Title and Problem Statement", "2"),
        ("Section 2", "Solution Description and Key Features", "2"),
        ("Section 3", "Technology Stack and Implementation Details", "3"),
        ("Section 4", "GitHub / Source Code Link", "4"),
        ("Section 5", "Working Demo / Deployment Link", "4"),
        ("Section 6", "Demo Video or Project Presentation Link", "4"),
        ("PART B", "ADDITIONAL TECHNICAL DOCUMENTATION", "PAGE"),
        ("Section 1", "Executive Summary", "5"),
        ("Section 2", "Target Users and Project Objectives", "5"),
        ("Section 3", "Existing System vs. Proposed System Comparison", "6"),
        ("Section 4", "System Architecture & Decoupled Services", "7"),
        ("Section 5", "Detailed Product Workflow (9 Verified Steps)", "8"),
        ("Section 6", "AI and Automation Implementation", "9"),
        ("Section 7", "Database Design and API Documentation", "10"),
        ("Section 8", "UI Screenshots and Operations Walkthrough", "11"),
        ("Section 9", "Innovation and Uniqueness", "12"),
        ("Section 10", "Real-World Impact and Humanitarian Benefits", "12"),
        ("Section 11", "Security, Privacy and Human-in-the-Loop Safety", "13"),
        ("Section 12", "Testing and Empirical Validation (10 Verified Test Cases)", "13"),
        ("Section 13", "Completed Features, Pending Work and Limitations", "14"),
        ("Section 14", "Deployment and Scalability Architecture", "14"),
        ("Section 15", "Future Scope and Technology Roadmap", "15"),
        ("Section 16", "Hackathon Judging Criteria Alignment", "15"),
        ("Section 17", "Participant Details and Declaration", "16"),
        ("Section 18", "Conclusion", "16"),
        ("Section 19", "References and Citations", "16")
    ]
    
    headers = ["Section", "Title / Technical Content", "Page"]
    widths = [1.2, 4.3, 0.7]
    t_toc = doc.add_table(rows=1, cols=3)
    format_table(t_toc, widths, headers, toc_data)
    doc.add_page_break()

def build_part_a_requirements(doc):
    # Top banner for Part A
    p_banner = doc.add_paragraph()
    p_banner.paragraph_format.space_before = Pt(6)
    p_banner.paragraph_format.space_after = Pt(4)
    p_banner.paragraph_format.keep_with_next = True
    r_b = p_banner.add_run("PART A — OFFICIAL HACKATHON REQUIREMENTS")
    r_b.font.name = "Calibri"
    r_b.font.size = Pt(14)
    r_b.font.bold = True
    r_b.font.color.rgb = RGBColor(13, 148, 136)

    # Section 1
    add_heading_1(doc, "Section 1: Project Title and Problem Statement")
    add_body_p(doc, "RescueFlow AI — AI-Powered Disaster Message Prioritization & Response Automation", bold_prefix="Project Title: ")
    add_body_p(doc,
        "RescueFlow AI is an emergency management and triage platform designed to process, prioritize, and coordinate disaster communications in real time. It captures distress reports from multiple digital channels, uses artificial intelligence to extract critical situational data, merges duplicate incident reports, and assists operations commanders in dispatching rescue teams.",
        bold_prefix="Project Overview: "
    )
    add_body_p(doc,
        "During major natural disasters—such as flash floods, commercial fires, and cyclones—emergency control rooms face communication paralysis. Thousands of citizens simultaneously transmit panicked, unstructured distress messages across messaging apps, web forms, emails, and phone lines. Under manual triage, dispatchers cannot process messages fast enough: life-critical situations are delayed behind minor inquiries, identical emergencies are redundantly logged dozens of times wasting scarce rescue personnel, and coordinators lack real-time visibility into victim vulnerability and equipment requirements.",
        bold_prefix="The Real-World Problem: "
    )
    add_body_p(doc,
        "Emergency response survival rates depend on the 'Golden Hour'. When emergency triage is delayed by 30 to 45 minutes due to manual data entry and ticket duplication, preventable loss of life occurs. An automated, hallucination-free triage and deduplication system is urgently required to compress response latency to seconds.",
        bold_prefix="Why This Needs a Solution: "
    )

    # Section 2
    add_heading_1(doc, "Section 2: Solution Description and Key Features")
    add_body_p(doc,
        "RescueFlow AI solves emergency communication overload through a disciplined, five-part operational architecture: AI UNDERSTANDS + n8n AUTOMATES + MONGODB REMEMBERS + REACT VISUALIZES + HUMAN APPROVES. Incoming messages from citizens are normalized into a standard format. Groq Cloud API running Llama 3.3-70B Versatile classifies whether messages represent active emergencies and extracts structured disaster parameters. A semantic deduplication engine compares new reports with active incidents using Jaccard token overlap and landmark matching to prevent duplicate tickets. Priority scores (0–100) are deterministically calculated using 8 transparent safety criteria. For all Critical (P1) and High (P2) incidents, an authorized coordinator must review and approve deployment before automated field dispatches occur.",
        bold_prefix="Proposed Solution: "
    )
    add_body_p(doc, "Main Implemented Features:", bold_prefix=None)
    add_bullet_p(doc, "Direct web submission, live Telegram bot polling, CSV batch imports, and configured n8n email triggers.", bold_prefix="Multi-Channel Intake: ")
    add_bullet_p(doc, "Low-latency (~1.1s) classification and structured parameter extraction with zero-crash regex fallback.", bold_prefix="Groq Llama 3.3-70B AI: ")
    add_bullet_p(doc, "Consolidates reports with >= 0.75 similarity, merges victim headcounts, and tracks multiple reports.", bold_prefix="Semantic Deduplication: ")
    add_bullet_p(doc, "0–100 explainable scoring based on life danger, trapped victims, vulnerable groups, scale, and corroboration.", bold_prefix="Deterministic Priority: ")
    add_bullet_p(doc, "Dedicated review interface where coordinators authorize or reject P1/P2 dispatches with recorded reasons.", bold_prefix="Human Approval Gate: ")
    add_bullet_p(doc, "Interactive Leaflet OpenStreetMap with pulsing severity markers and sub-second Server-Sent Events updates.", bold_prefix="Real-Time GIS Dashboard: ")
    add_bullet_p(doc, "Visual n8n workflows trigger formatted markdown alert messages directly to first responder units.", bold_prefix="Telegram Dispatch: ")

    # Section 3
    add_heading_1(doc, "Section 3: Technology Stack and Implementation Details")
    add_body_p(doc, "The platform is implemented across five decoupled architectural layers:")
    
    t_tech = [
        ["Layer", "Technologies", "Verified Implementation Details"],
        ["Frontend", "React 18, Vite, React Router, Leaflet, Axios, CSS Tokens", "Single-page EOC console with live GIS mapping, audio alerts, and simulation controller."],
        ["Backend", "Python 3.13, FastAPI, Uvicorn, Pydantic v2, HTTPX", "Asynchronous REST API, Server-Sent Events (SSE) broadcaster, and CORS middleware."],
        ["AI Inference", "Groq Cloud API, Meta Llama 3.3-70B Versatile", "JSON mode inference at temp 0.1 with self-repair retry and regex heuristic fallback."],
        ["Database", "MongoDB 6.0+, Motor (Async Driver), PyMongo", "5 collections: incidents, messages, approvals, response_tasks, audit_logs."],
        ["Automation", "n8n Workflow Automation Platform (v1.58+)", "Master workflow graph executing webhook triggers, AI routing, and Telegram alerts."],
        ["Alerting", "Telegram Bot API (v7.0+), python-telegram-bot", "Continuous async long-polling for intake and automated formatted markdown dispatch alerts."]
    ]
    t_table = doc.add_table(rows=1, cols=3)
    format_table(t_table, [1.1, 2.2, 2.9], t_tech[0], t_tech[1:])
    doc.add_paragraph().paragraph_format.space_after = Pt(2)

    # Section 4, 5, 6 (Official Submission Links)
    add_heading_1(doc, "Section 4: GitHub / Source Code Link")
    add_body_p(doc, "https://github.com/jaiwant03/RescueFlow-AI.git", bold_prefix="Public Repository URL: ")
    add_body_p(doc, "The repository contains the complete working source code for the React frontend, FastAPI backend services, n8n master orchestrator workflow JSON, and project documentation.", bold_prefix="Access Information: ")

    add_heading_1(doc, "Section 5: Working Demo / Deployment Link")
    add_body_p(doc, "[TO BE PROVIDED BY EVALUATOR / HOSTED URL]", bold_prefix="Live Deployed URL: ")
    add_body_p(doc, "Frontend runs at http://localhost:5173 and Backend runs at http://localhost:8000. Evaluators can trigger the 1-click disaster simulation controller to test the entire pipeline in seconds.", bold_prefix="Local Verified Environment: ")

    add_heading_1(doc, "Section 6: Demo Video or Project Presentation")
    add_body_p(doc, "[YOUTUBE / GOOGLE DRIVE DEMO LINK TO BE INSERTED]", bold_prefix="Demonstration Video Link: ")
    add_body_p(doc, "The recorded video demonstrates multi-channel intake, Groq Llama 3.3-70B extraction, duplicate incident merging, Leaflet map pin animation, and the Human-in-the-Loop approval workflow.", bold_prefix="Video Coverage: ")

    doc.add_page_break()

print("Part A requirements module ready.")
