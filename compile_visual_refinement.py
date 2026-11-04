import os
import sys
import docx
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT, WD_ALIGN_VERTICAL
from docx.oxml import OxmlElement, parse_xml
from docx.oxml.ns import nsdecls, qn
import matplotlib.pyplot as plt
import matplotlib.patches as patches
from PIL import Image
from docx2pdf import convert

def set_cell_background(cell, hex_color):
    shading_elm = parse_xml(f'<w:shd {nsdecls("w")} w:fill="{hex_color}"/>')
    cell._tc.get_or_add_tcPr().append(shading_elm)

def set_cell_margins(cell, top=80, bottom=80, left=100, right=100):
    tcPr = cell._tc.get_or_add_tcPr()
    tcMar = parse_xml(
        f'<w:tcMar {nsdecls("w")}>'
        f'<w:top w:w="{top}" w:type="dxa"/>'
        f'<w:bottom w:w="{bottom}" w:type="dxa"/>'
        f'<w:left w:w="{left}" w:type="dxa"/>'
        f'<w:right w:w="{right}" w:type="dxa"/>'
        f'</w:tcMar>'
    )
    tcPr.append(tcMar)

def set_cell_border(cell, **kwargs):
    tcPr = cell._tc.get_or_add_tcPr()
    tcBorders = parse_xml(f'<w:tcBorders {nsdecls("w")}/>')
    for edge in ('top', 'left', 'bottom', 'right', 'insideH', 'insideV'):
        edge_data = kwargs.get(edge)
        if edge_data:
            tag = f'<w:{edge} {nsdecls("w")} w:val="{edge_data.get("val", "single")}" w:sz="{edge_data.get("sz", 4)}" w:space="0" w:color="{edge_data.get("color", "CBD5E1")}"/>'
            tcBorders.append(parse_xml(tag))
    tcPr.append(tcBorders)

def format_table(table, col_widths, headers, rows_data, header_bg="0F2738", alt_bg="F8FAFC"):
    table.alignment = WD_TABLE_ALIGNMENT.CENTER
    table.autofit = False
    
    # Header Row
    hdr_cells = table.rows[0].cells
    for i, title in enumerate(headers):
        hdr_cells[i].text = title
        set_cell_background(hdr_cells[i], header_bg)
        set_cell_margins(hdr_cells[i], top=90, bottom=90, left=100, right=100)
        set_cell_border(hdr_cells[i],
                        bottom={"sz": 8, "val": "single", "color": "0D9488"},
                        top={"sz": 4, "val": "single", "color": "0F2738"},
                        left={"sz": 4, "val": "single", "color": "0F2738"},
                        right={"sz": 4, "val": "single", "color": "0F2738"})
        p = hdr_cells[i].paragraphs[0]
        p.alignment = WD_ALIGN_PARAGRAPH.LEFT
        p.paragraph_format.space_before = Pt(0)
        p.paragraph_format.space_after = Pt(0)
        run = p.runs[0]
        run.font.name = "Calibri"
        run.font.size = Pt(9.5)
        run.font.bold = True
        run.font.color.rgb = RGBColor(255, 255, 255)
    
    # Data Rows
    for row_idx, r_data in enumerate(rows_data):
        row = table.add_row()
        bg_col = alt_bg if row_idx % 2 == 1 else "FFFFFF"
        for col_idx, cell_value in enumerate(r_data):
            cell = row.cells[col_idx]
            cell.text = str(cell_value)
            set_cell_background(cell, bg_col)
            set_cell_margins(cell, top=70, bottom=70, left=90, right=90)
            set_cell_border(cell,
                            bottom={"sz": 4, "val": "single", "color": "E2E8F0"},
                            top={"sz": 4, "val": "single", "color": "E2E8F0"},
                            left={"sz": 4, "val": "single", "color": "E2E8F0"},
                            right={"sz": 4, "val": "single", "color": "E2E8F0"})
            p = cell.paragraphs[0]
            p.alignment = WD_ALIGN_PARAGRAPH.LEFT
            p.paragraph_format.space_before = Pt(0)
            p.paragraph_format.space_after = Pt(0)
            p.paragraph_format.line_spacing = 1.15
            if p.runs:
                run = p.runs[0]
                run.font.name = "Calibri"
                run.font.size = Pt(9)
                run.font.color.rgb = RGBColor(30, 41, 59)
    
    for row in table.rows:
        for idx, width in enumerate(col_widths):
            row.cells[idx].width = Inches(width)

def add_header_footer(doc):
    section = doc.sections[0]
    section.header_distance = Inches(0.4)
    section.footer_distance = Inches(0.4)
    
    # Running Header
    hdr = section.header
    hdr_p = hdr.paragraphs[0]
    hdr_p.alignment = WD_ALIGN_PARAGRAPH.RIGHT
    hdr_run = hdr_p.add_run("INFINEX 2K26 — Global AI Hackathon | RescueFlow AI Official Submission")
    hdr_run.font.name = "Calibri"
    hdr_run.font.size = Pt(8.5)
    hdr_run.font.color.rgb = RGBColor(100, 116, 139)
    
    # Running Footer
    ftr = section.footer
    ftr_p = ftr.paragraphs[0]
    ftr_p.alignment = WD_ALIGN_PARAGRAPH.RIGHT
    
    ftr_table = ftr.add_table(rows=1, cols=2, width=Inches(6.2))
    ftr_table.alignment = WD_TABLE_ALIGNMENT.CENTER
    c_left = ftr_table.cell(0, 0)
    c_right = ftr_table.cell(0, 1)
    c_left.width = Inches(3.8)
    c_right.width = Inches(2.4)
    
    p_left = c_left.paragraphs[0]
    p_left.alignment = WD_ALIGN_PARAGRAPH.LEFT
    r_left = p_left.add_run("PropCare NW • Individual Participation • RescueFlow AI")
    r_left.font.name = "Calibri"
    r_left.font.size = Pt(8)
    r_left.font.color.rgb = RGBColor(148, 163, 184)
    
    p_right = c_right.paragraphs[0]
    p_right.alignment = WD_ALIGN_PARAGRAPH.RIGHT
    r_right = p_right.add_run("Technical Project Report")
    r_right.font.name = "Calibri"
    r_right.font.size = Pt(8)
    r_right.font.color.rgb = RGBColor(148, 163, 184)

def add_heading_1(doc, title):
    p = doc.add_paragraph()
    p.paragraph_format.space_before = Pt(14)
    p.paragraph_format.space_after = Pt(6)
    p.paragraph_format.keep_with_next = True
    run = p.add_run(title)
    run.font.name = "Calibri"
    run.font.size = Pt(16)
    run.font.bold = True
    run.font.color.rgb = RGBColor(15, 39, 56) # Deep Peacock Blue
    return p

def add_heading_2(doc, title):
    p = doc.add_paragraph()
    p.paragraph_format.space_before = Pt(10)
    p.paragraph_format.space_after = Pt(3)
    p.paragraph_format.keep_with_next = True
    run = p.add_run(title)
    run.font.name = "Calibri"
    run.font.size = Pt(13)
    run.font.bold = True
    run.font.color.rgb = RGBColor(13, 148, 136) # Rama Green / Teal
    return p

def add_heading_3(doc, title):
    p = doc.add_paragraph()
    p.paragraph_format.space_before = Pt(8)
    p.paragraph_format.space_after = Pt(2)
    p.paragraph_format.keep_with_next = True
    run = p.add_run(title)
    run.font.name = "Calibri"
    run.font.size = Pt(11)
    run.font.bold = True
    run.font.color.rgb = RGBColor(15, 39, 56)
    return p

def add_body_p(doc, text, bold_prefix=None, space_after=6):
    p = doc.add_paragraph()
    p.paragraph_format.space_before = Pt(0)
    p.paragraph_format.space_after = Pt(space_after)
    p.paragraph_format.line_spacing = 1.15
    if bold_prefix:
        r_b = p.add_run(bold_prefix)
        r_b.font.name = "Calibri"
        r_b.font.size = Pt(10.5)
        r_b.font.bold = True
        r_b.font.color.rgb = RGBColor(15, 39, 56)
    r = p.add_run(text)
    r.font.name = "Calibri"
    r.font.size = Pt(10.5)
    r.font.color.rgb = RGBColor(30, 41, 59)
    return p

def add_bullet_p(doc, text, bold_prefix=None):
    p = doc.add_paragraph(style='List Bullet')
    p.paragraph_format.space_before = Pt(0)
    p.paragraph_format.space_after = Pt(3)
    p.paragraph_format.line_spacing = 1.15
    if bold_prefix:
        r_b = p.add_run(bold_prefix)
        r_b.font.name = "Calibri"
        r_b.font.size = Pt(10)
        r_b.font.bold = True
        r_b.font.color.rgb = RGBColor(15, 39, 56)
    r = p.add_run(text)
    r.font.name = "Calibri"
    r.font.size = Pt(10)
    r.font.color.rgb = RGBColor(30, 41, 59)
    return p

def add_image_box(doc, img_path, caption, width_in=5.4):
    """Embeds an image properly centered with aspect ratio preserved and caption glued."""
    if os.path.exists(img_path):
        p = doc.add_paragraph()
        p.alignment = WD_ALIGN_PARAGRAPH.CENTER
        p.paragraph_format.space_before = Pt(8)
        p.paragraph_format.space_after = Pt(2)
        p.paragraph_format.keep_with_next = True
        r = p.add_run()
        r.add_picture(img_path, width=Inches(width_in))
        
        p_cap = doc.add_paragraph()
        p_cap.alignment = WD_ALIGN_PARAGRAPH.CENTER
        p_cap.paragraph_format.space_before = Pt(0)
        p_cap.paragraph_format.space_after = Pt(8)
        r_c = p_cap.add_run(caption)
        r_c.font.name = "Calibri"
        r_c.font.size = Pt(8.5)
        r_c.font.italic = True
        r_c.font.color.rgb = RGBColor(100, 116, 139)

def generate_clean_diagrams(out_dir):
    os.makedirs(out_dir, exist_ok=True)
    
    # 1. Clean Architecture Diagram (Proportional & Legible)
    arch_path = os.path.join(out_dir, "RescueFlow_AI_Architecture.png")
    fig, ax = plt.subplots(figsize=(9, 5.5), dpi=300)
    fig.patch.set_facecolor('#ffffff')
    ax.set_facecolor('#ffffff')
    ax.set_xlim(0, 100)
    ax.set_ylim(0, 100)
    ax.axis('off')

    c_peacock = '#0f2738'
    c_blue = '#0284c7'
    c_teal = '#0d9488'
    c_border = '#cbd5e1'

    ax.text(50, 96, "RescueFlow AI — System Architecture Specification",
            color=c_peacock, fontsize=13, fontweight='bold', ha='center', va='center')
    ax.text(50, 91.5, "Decoupled Architecture: Ingestion, AI Triage, Deterministic Priority, and Human-in-the-Loop Operations",
            color='#64748b', fontsize=8, ha='center', va='center')

    # Ingestion Channels
    channels = [("Web Portal", "React Form / GPS"), ("Telegram Bot", "Async Polling API"),
                ("CSV Bulk Import", "Batch Ingestion"), ("Email Ingestion", "n8n IMAP Trigger")]
    for i, (name, desc) in enumerate(channels):
        x = 5 + i * 23.5
        rect = patches.FancyBboxPatch((x, 76), 20, 10, boxstyle="round,pad=0.3,rounding_size=0.6",
                                     facecolor='#f0f9ff', edgecolor=c_blue, linewidth=1.1)
        ax.add_patch(rect)
        ax.text(x + 10, 82.5, name, color=c_peacock, fontsize=8.5, fontweight='bold', ha='center', va='center')
        ax.text(x + 10, 78.5, desc, color='#475569', fontsize=7, ha='center', va='center')
        ax.annotate("", xy=(x + 10, 68), xytext=(x + 10, 76), arrowprops=dict(arrowstyle="->", color=c_blue, lw=1.1))

    # Orchestration Layer
    mid_rect = patches.FancyBboxPatch((5, 57), 90, 11, boxstyle="round,pad=0.4,rounding_size=0.8",
                                     facecolor='#f8fafc', edgecolor=c_border, linewidth=1.1)
    ax.add_patch(mid_rect)
    ax.text(7, 65.5, "INGESTION & ORCHESTRATION LAYER", color=c_peacock, fontsize=8.5, fontweight='bold', va='center')
    ax.text(50, 63.5, "FastAPI Async Core (Python 3.13)  •  Data Normalization  •  n8n Master Orchestrator Webhooks",
            color='#0369a1', fontsize=8, fontweight='bold', ha='center', va='center')
    ax.text(50, 59.5, "Canonical Payload Format: message_id, source, sender, location, timestamp, metadata",
            color='#475569', fontsize=7.2, ha='center', va='center')

    ax.annotate("", xy=(50, 48), xytext=(50, 57), arrowprops=dict(arrowstyle="->", color=c_teal, lw=1.3))

    # AI & Triage Core
    triage_rect = patches.FancyBboxPatch((5, 29), 90, 19, boxstyle="round,pad=0.4,rounding_size=0.8",
                                        facecolor='#f0fdfa', edgecolor=c_teal, linewidth=1.2)
    ax.add_patch(triage_rect)
    ax.text(7, 45.5, "AI INTELLIGENCE & DETERMINISTIC TRIAGE ENGINE", color=c_peacock, fontsize=8.5, fontweight='bold', va='center')

    modules = [
        ("Groq Llama 3.3-70B Pipeline", "Classification & Entity Extraction\nZero-Crash Regex Fallback", 8, 31, 26),
        ("Semantic Deduplication", "Jaccard Token & Landmark Match\nThreshold >= 0.75 | Merges Reports", 37, 31, 26),
        ("Deterministic Priority Engine", "0–100 Weighted Urgency Score\nP1 Critical, P2 High, P3 Med, P4 Low", 66, 31, 26)
    ]
    for m_name, m_desc, mx, my, mw in modules:
        box = patches.FancyBboxPatch((mx, my), mw, 11, boxstyle="round,pad=0.3,rounding_size=0.5",
                                    facecolor='#ffffff', edgecolor=c_border, linewidth=1)
        ax.add_patch(box)
        ax.text(mx + mw/2, my + 8.5, m_name, color=c_peacock, fontsize=8, fontweight='bold', ha='center', va='center')
        ax.text(mx + mw/2, my + 4, m_desc, color='#475569', fontsize=6.8, ha='center', va='center')

    # Bottom Connectors
    ax.annotate("", xy=(27, 21), xytext=(27, 29), arrowprops=dict(arrowstyle="->", color=c_peacock, lw=1.2))
    ax.annotate("", xy=(73, 21), xytext=(73, 29), arrowprops=dict(arrowstyle="->", color=c_peacock, lw=1.2))

    db_box = patches.FancyBboxPatch((5, 5), 43, 16, boxstyle="round,pad=0.4,rounding_size=0.8",
                                    facecolor='#f8fafc', edgecolor=c_border, linewidth=1.1)
    ax.add_patch(db_box)
    ax.text(26.5, 17.5, "MongoDB & Real-Time Telemetry", color=c_peacock, fontsize=8.5, fontweight='bold', ha='center', va='center')
    ax.text(26.5, 13, "Async Motor Driver  •  5 Collections (incidents, messages, audit)", color='#0284c7', fontsize=7.2, ha='center', va='center')
    ax.text(26.5, 8.5, "Server-Sent Events (SSE) sub-second live state streaming", color='#475569', fontsize=7, ha='center', va='center')

    eoc_box = patches.FancyBboxPatch((52, 5), 43, 16, boxstyle="round,pad=0.4,rounding_size=0.8",
                                     facecolor='#f8fafc', edgecolor=c_border, linewidth=1.1)
    ax.add_patch(eoc_box)
    ax.text(73.5, 17.5, "React 18 EOC & Human Approval", color=c_peacock, fontsize=8.5, fontweight='bold', ha='center', va='center')
    ax.text(73.5, 13, "Leaflet OpenStreetMap GIS  •  Audible Telemetry Alerts", color=c_teal, fontsize=7.2, ha='center', va='center')
    ax.text(73.5, 8.5, "Human Gatekeeper: Coordinator Authorizes P1/P2 Field Dispatches", color='#475569', fontsize=7, ha='center', va='center')

    plt.tight_layout()
    plt.savefig(arch_path, dpi=300, facecolor='#ffffff', edgecolor='none', bbox_inches='tight')
    plt.close()

    # 2. Clean Workflow Diagram (Exact 9 Steps)
    wf_path = os.path.join(out_dir, "RescueFlow_AI_Workflow.png")
    fig, ax = plt.subplots(figsize=(8, 9), dpi=300)
    fig.patch.set_facecolor('#ffffff')
    ax.set_facecolor('#ffffff')
    ax.set_xlim(0, 100)
    ax.set_ylim(0, 100)
    ax.axis('off')

    ax.text(50, 97.5, "RescueFlow AI — End-to-End Operational Workflow",
            color=c_peacock, fontsize=12.5, fontweight='bold', ha='center', va='center')
    ax.text(50, 94.5, "Verified 9-Step Sequence from Emergency Ingestion to Tactical Dispatch",
            color='#64748b', fontsize=8, ha='center', va='center')

    steps = [
        ("Step 1: Emergency Report Submission", "Citizen or sensor submits report via Web Portal, Telegram Bot, CSV batch, or Email.", '#f0f9ff', c_blue),
        ("Step 2: Report Intake & Normalization", "FastAPI/n8n assigns unique message ID, extracts location hints, and formats canonical JSON.", '#f8fafc', c_border),
        ("Step 3: AI Incident Classification & Extraction", "Groq Llama 3.3-70B filters non-emergencies and extracts hazard type, location, and headcounts.", '#f0fdfa', c_teal),
        ("Step 4: Duplicate Incident Detection", "Deduplication Engine calculates Jaccard token overlap & landmark matching (threshold >= 0.75).", '#f8fafc', c_border),
        ("Step 5: Priority Assessment (Deterministic 0–100)", "Hybrid mathematical engine scores urgency based on life danger, trapped victims, and scale.", '#f0fdfa', c_teal),
        ("Step 6: MongoDB Storage & Persistence", "Consolidated incident, raw message trace, and operational timeline saved to database.", '#f8fafc', c_border),
        ("Step 7: Operations Dashboard Update", "Server-Sent Events (SSE) push live state in < 500ms; updates Leaflet GIS map with pulsing pins.", '#f0f9ff', c_blue),
        ("Step 8: Human Review and Approval", "Critical (P1) and High (P2) incidents halt for coordinator review; authorized with recorded reason.", '#f0fdfa', c_teal),
        ("Step 9: Configured Dispatch & Audit Workflow", "Approved incident triggers n8n workflow: broadcasts Telegram alert and logs immutable audit entry.", '#f0fdfa', c_teal)
    ]

    box_w = 78
    box_h = 6.8
    start_y = 86
    spacing = 9.2

    for i, (title, desc, bg_color, border_color) in enumerate(steps):
        y = start_y - i * spacing
        rect = patches.FancyBboxPatch((11, y), box_w, box_h, boxstyle="round,pad=0.3,rounding_size=0.5",
                                     facecolor=bg_color, edgecolor=border_color, linewidth=1.1)
        ax.add_patch(rect)
        ax.text(13.5, y + 4.5, title, color=c_peacock, fontsize=8.5, fontweight='bold', va='center')
        ax.text(13.5, y + 2, desc, color='#334155', fontsize=7.2, va='center')
        if i < len(steps) - 1:
            ax.annotate("", xy=(50, y - 2.4), xytext=(50, y), arrowprops=dict(arrowstyle="->", color=c_peacock, lw=1.2))

    plt.tight_layout()
    plt.savefig(wf_path, dpi=300, facecolor='#ffffff', edgecolor='none', bbox_inches='tight')
    plt.close()

def normalize_screenshots(raw_sc_dir, dst_dir):
    os.makedirs(dst_dir, exist_ok=True)
    images_to_process = [
        "media_1793717785374_1bb8169a.jpg",
        "media_1793777496882_c12cee13.jpg",
        "media_1793777522083_279cd0a1.png",
        "media_1793704015910_396d3935.jpg",
        "media_1793723610922_84cad690.jpg"
    ]
    for img_name in images_to_process:
        src = os.path.join(raw_sc_dir, img_name)
        dst = os.path.join(dst_dir, os.path.splitext(img_name)[0] + ".png")
        if os.path.exists(src):
            im = Image.open(src).convert("RGB")
            im.save(dst, "PNG")

print("Visual refinement base initialized.")
