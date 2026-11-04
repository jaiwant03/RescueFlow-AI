import os
import sys
import docx
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT, WD_ALIGN_VERTICAL
from docx.oxml import OxmlElement, parse_xml
from docx.oxml.ns import nsdecls, qn

from compile_helpers import (
    set_cell_background,
    set_cell_margins,
    set_cell_border,
    add_callout_box,
    format_table
)

def add_header_footer(doc):
    """Configures running header and footer with subtle rules and metadata."""
    section = doc.sections[0]
    section.header_distance = Inches(0.5)
    section.footer_distance = Inches(0.5)
    
    # Running Header
    hdr = section.header
    hdr_p = hdr.paragraphs[0]
    hdr_p.alignment = WD_ALIGN_PARAGRAPH.RIGHT
    hdr_run = hdr_p.add_run("INFINEX 2K26 — Global AI Hackathon  |  RescueFlow AI Project Report")
    hdr_run.font.name = "Calibri"
    hdr_run.font.size = Pt(8.5)
    hdr_run.font.color.rgb = RGBColor(100, 116, 139)
    
    # Running Footer
    ftr = section.footer
    ftr_p = ftr.paragraphs[0]
    ftr_p.alignment = WD_ALIGN_PARAGRAPH.RIGHT
    
    # Footer table for clean left/right split
    ftr_table = ftr.add_table(rows=1, cols=2, width=Inches(6.5))
    ftr_table.alignment = WD_TABLE_ALIGNMENT.CENTER
    c_left = ftr_table.cell(0, 0)
    c_right = ftr_table.cell(0, 1)
    
    p_left = c_left.paragraphs[0]
    p_left.alignment = WD_ALIGN_PARAGRAPH.LEFT
    r_left = p_left.add_run("Organized by PropCare NW  •  Evaluation Document  •  Confidential")
    r_left.font.name = "Calibri"
    r_left.font.size = Pt(8)
    r_left.font.color.rgb = RGBColor(148, 163, 184)
    
    p_right = c_right.paragraphs[0]
    p_right.alignment = WD_ALIGN_PARAGRAPH.RIGHT
    r_right = p_right.add_run("Technical Project Report — Track: Agentic AI")
    r_right.font.name = "Calibri"
    r_right.font.size = Pt(8)
    r_right.font.color.rgb = RGBColor(148, 163, 184)

def add_heading_1(doc, title, section_num=None):
    """Adds a styled Level 1 heading with peacock blue background band and white text."""
    p = doc.add_paragraph()
    p.paragraph_format.space_before = Pt(18)
    p.paragraph_format.space_after = Pt(8)
    p.paragraph_format.keep_with_next = True
    
    title_text = f"SECTION {section_num}: {title.upper()}" if section_num else title.upper()
    run = p.add_run(title_text)
    run.font.name = "Calibri"
    run.font.size = Pt(13)
    run.font.bold = True
    run.font.color.rgb = RGBColor(15, 39, 56) # Deep Peacock Blue
    
    # Add bottom border rule to heading 1
    pBdr = parse_xml(f'<w:pBdr {nsdecls("w")}><w:bottom w:val="single" w:sz="12" w:space="4" w:color="0D9488"/></w:pBdr>')
    p._p.get_or_add_pPr().append(pBdr)
    return p

def add_heading_2(doc, title):
    """Adds a styled Level 2 heading."""
    p = doc.add_paragraph()
    p.paragraph_format.space_before = Pt(12)
    p.paragraph_format.space_after = Pt(4)
    p.paragraph_format.keep_with_next = True
    run = p.add_run(title)
    run.font.name = "Calibri"
    run.font.size = Pt(11.5)
    run.font.bold = True
    run.font.color.rgb = RGBColor(13, 148, 136) # Teal / Rama Green
    return p

def add_heading_3(doc, title):
    """Adds a styled Level 3 heading."""
    p = doc.add_paragraph()
    p.paragraph_format.space_before = Pt(8)
    p.paragraph_format.space_after = Pt(2)
    p.paragraph_format.keep_with_next = True
    run = p.add_run(title)
    run.font.name = "Calibri"
    run.font.size = Pt(10.5)
    run.font.bold = True
    run.font.color.rgb = RGBColor(30, 41, 59)
    return p

def add_body_p(doc, text, bold_prefix=None, space_after=6):
    """Adds standard body paragraph with 1.15 line spacing."""
    p = doc.add_paragraph()
    p.paragraph_format.space_before = Pt(0)
    p.paragraph_format.space_after = Pt(space_after)
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

def add_bullet_p(doc, text, bold_prefix=None):
    """Adds a styled bullet item."""
    p = doc.add_paragraph(style='List Bullet')
    p.paragraph_format.space_before = Pt(1)
    p.paragraph_format.space_after = Pt(3)
    p.paragraph_format.line_spacing = 1.15
    if bold_prefix:
        r_b = p.add_run(bold_prefix)
        r_b.font.name = "Calibri"
        r_b.font.size = Pt(9.5)
        r_b.font.bold = True
        r_b.font.color.rgb = RGBColor(15, 39, 56)
    r = p.add_run(text)
    r.font.name = "Calibri"
    r.font.size = Pt(9.5)
    r.font.color.rgb = RGBColor(30, 41, 59)
    return p

print("Core typography helpers defined!")
