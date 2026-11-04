import os
import docx
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT, WD_ALIGN_VERTICAL
from docx.oxml import OxmlElement, parse_xml
from docx.oxml.ns import nsdecls, qn

def set_cell_background(cell, hex_color):
    """Sets background color of a table cell."""
    shading_elm = parse_xml(f'<w:shd {nsdecls("w")} w:fill="{hex_color}"/>')
    cell._tc.get_or_add_tcPr().append(shading_elm)

def set_cell_margins(cell, top=120, bottom=120, left=150, right=150):
    """Sets internal padding for a table cell in dxa (1 pt = 20 dxa)."""
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
    """
    Sets cell borders: top, bottom, left, right.
    kwargs format: top={"sz": 4, "val": "single", "color": "HEX"}
    """
    tcPr = cell._tc.get_or_add_tcPr()
    tcBorders = parse_xml(f'<w:tcBorders {nsdecls("w")}/>')
    for edge in ('top', 'left', 'bottom', 'right', 'insideH', 'insideV'):
        edge_data = kwargs.get(edge)
        if edge_data:
            tag = f'<w:{edge} {nsdecls("w")} w:val="{edge_data.get("val", "single")}" w:sz="{edge_data.get("sz", 4)}" w:space="0" w:color="{edge_data.get("color", "CBD5E1")}"/>'
            tcBorders.append(parse_xml(tag))
    tcPr.append(tcBorders)

def add_callout_box(doc, text_p_list, title="KEY ARCHITECTURAL HIGHLIGHT", border_color="0D9488", bg_color="F0FDFA"):
    """Creates a stylized single-cell table acting as a callout box."""
    table = doc.add_table(rows=1, cols=1)
    table.alignment = WD_TABLE_ALIGNMENT.CENTER
    table.autofit = False
    table.columns[0].width = Inches(6.5)
    
    cell = table.cell(0, 0)
    set_cell_background(cell, bg_color)
    set_cell_margins(cell, top=140, bottom=140, left=200, right=180)
    
    # Left thick border, no top/bottom/right
    set_cell_border(cell,
                    left={"val": "single", "sz": 24, "color": border_color},
                    top={"val": "none"}, bottom={"val": "none"}, right={"val": "none"})
    
    # Header inside callout
    p_header = cell.paragraphs[0]
    p_header.paragraph_format.space_before = Pt(0)
    p_header.paragraph_format.space_after = Pt(4)
    run_h = p_header.add_run(f"📌 {title.upper()}")
    run_h.font.name = "Calibri"
    run_h.font.size = Pt(10)
    run_h.font.bold = True
    run_h.font.color.rgb = RGBColor(15, 118, 110)
    
    # Content paragraphs
    for p_text in text_p_list:
        p = cell.add_paragraph()
        p.paragraph_format.space_before = Pt(2)
        p.paragraph_format.space_after = Pt(4)
        p.paragraph_format.line_spacing = 1.15
        run = p.add_run(p_text)
        run.font.name = "Calibri"
        run.font.size = Pt(9.5)
        run.font.color.rgb = RGBColor(30, 41, 59)
    
    doc.add_paragraph().paragraph_format.space_after = Pt(4)

def format_table(table, col_widths, headers, rows_data, header_bg="0F2738", alt_bg="F8FAFC"):
    """Utility to render high-styled data tables with custom widths, headers and zebra rows."""
    table.alignment = WD_TABLE_ALIGNMENT.CENTER
    table.autofit = False
    
    # Header row
    hdr_cells = table.rows[0].cells
    for i, title in enumerate(headers):
        hdr_cells[i].text = title
        set_cell_background(hdr_cells[i], header_bg)
        set_cell_margins(hdr_cells[i], top=120, bottom=120, left=140, right=140)
        set_cell_border(hdr_cells[i],
                        bottom={"sz": 12, "val": "single", "color": "0D9488"},
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
    
    # Data rows
    for row_idx, r_data in enumerate(rows_data):
        row = table.add_row()
        bg_col = alt_bg if row_idx % 2 == 1 else "FFFFFF"
        for col_idx, cell_value in enumerate(r_data):
            cell = row.cells[col_idx]
            cell.text = str(cell_value)
            set_cell_background(cell, bg_col)
            set_cell_margins(cell, top=100, bottom=100, left=130, right=130)
            set_cell_border(cell,
                            bottom={"sz": 4, "val": "single", "color": "E2E8F0"},
                            top={"sz": 4, "val": "single", "color": "E2E8F0"},
                            left={"sz": 4, "val": "single", "color": "E2E8F0"},
                            right={"sz": 4, "val": "single", "color": "E2E8F0"})
            p = cell.paragraphs[0]
            p.alignment = WD_ALIGN_PARAGRAPH.LEFT
            p.paragraph_format.space_before = Pt(0)
            p.paragraph_format.space_after = Pt(0)
            p.paragraph_format.line_spacing = 1.12
            if p.runs:
                run = p.runs[0]
                run.font.name = "Calibri"
                run.font.size = Pt(9)
                run.font.color.rgb = RGBColor(30, 41, 59)
    
    # Set explicit column widths
    for row in table.rows:
        for idx, width in enumerate(col_widths):
            row.cells[idx].width = Inches(width)

print("Formatting helpers verified successfully!")
