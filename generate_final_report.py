import os
import sys
import docx
from docx.shared import Inches, Pt, RGBColor
from compile_sections_base import add_header_footer

# Import all section modules
from doc_sections_1_to_8 import (
    build_section_1_cover,
    build_section_2_executive_summary,
    build_section_3_problem_statement,
    build_section_4_target_users,
    build_section_5_proposed_solution,
    build_section_6_project_objectives,
    build_section_7_domain_justification,
    build_section_8_existing_vs_proposed
)

from doc_sections_9_to_15 import (
    build_section_9_architecture,
    build_section_10_product_workflow,
    build_section_11_key_features,
    build_section_12_ai_automation_implementation,
    build_section_13_tech_stack,
    build_section_14_database_design,
    build_section_15_api_documentation
)

from doc_sections_16_to_22 import (
    build_section_16_ui_ux_design,
    build_section_17_innovation,
    build_section_18_real_world_impact,
    build_section_19_scalability_deployment,
    build_section_20_security_ethics,
    build_section_21_testing_validation,
    build_section_22_implementation_status
)

from doc_sections_23_to_30 import (
    build_section_23_limitations,
    build_section_24_future_roadmap,
    build_section_25_judging_criteria,
    build_section_26_project_links,
    build_section_27_participant_details,
    build_section_28_conclusion,
    build_section_29_references,
    build_section_30_appendix
)

def build_complete_report():
    print("==========================================================")
    print("  COMPILING RESCUEFLOW AI INFINEX 2K26 PROJECT REPORT     ")
    print("==========================================================")
    
    doc = docx.Document()
    
    # Configure A4 page dimensions and 1-inch margins
    for sec in doc.sections:
        sec.page_width = Inches(8.27)   # A4 Width
        sec.page_height = Inches(11.69) # A4 Height
        sec.top_margin = Inches(1.0)
        sec.bottom_margin = Inches(1.0)
        sec.left_margin = Inches(1.0)
        sec.right_margin = Inches(1.0)
    
    # Configure default style
    normal_style = doc.styles['Normal']
    normal_style.font.name = 'Calibri'
    normal_style.font.size = Pt(10)
    normal_style.font.color.rgb = RGBColor(30, 41, 59)
    normal_style.paragraph_format.line_spacing = 1.15
    normal_style.paragraph_format.space_after = Pt(6)
    
    # Add running header and footer
    add_header_footer(doc)
    
    # Output directory and image paths
    out_dir = r"D:\Dev\Projects\RescueFlow-AI\INFINEX_2K26_SUBMISSION"
    os.makedirs(out_dir, exist_ok=True)
    out_path = os.path.join(out_dir, "RescueFlow_AI_INFINEX_2K26_Project_Report.docx")
    
    arch_img_path = os.path.join(out_dir, "RescueFlow_AI_Architecture.png")
    workflow_img_path = os.path.join(out_dir, "RescueFlow_AI_Workflow.png")
    screenshots_dir = r"C:\Users\JAIWANT KARRUN.S.A\.gemini\antigravity\brain\44cff8d0-f707-437b-b020-e34b7a9e1216\.user_uploaded"
    
    # ------------------ SECTIONS 1 TO 8 ------------------
    print("Building Section 1: Cover Page...")
    build_section_1_cover(doc)
    
    print("Building Section 2: Executive Summary...")
    build_section_2_executive_summary(doc)
    
    print("Building Section 3: Problem Statement...")
    build_section_3_problem_statement(doc)
    
    print("Building Section 4: Target Users...")
    build_section_4_target_users(doc)
    
    print("Building Section 5: Proposed Solution...")
    build_section_5_proposed_solution(doc)
    
    print("Building Section 6: Project Objectives...")
    build_section_6_project_objectives(doc)
    
    print("Building Section 7: Domain Justification...")
    build_section_7_domain_justification(doc)
    
    print("Building Section 8: Existing vs Proposed System...")
    build_section_8_existing_vs_proposed(doc)
    
    # ------------------ SECTIONS 9 TO 15 ------------------
    print("Building Section 9: System Architecture...")
    build_section_9_architecture(doc, arch_img_path)
    
    print("Building Section 10: Complete Product Workflow...")
    build_section_10_product_workflow(doc, workflow_img_path)
    
    print("Building Section 11: Key Features...")
    build_section_11_key_features(doc)
    
    print("Building Section 12: AI & Automation Implementation...")
    build_section_12_ai_automation_implementation(doc)
    
    print("Building Section 13: Technology Stack...")
    build_section_13_tech_stack(doc)
    
    print("Building Section 14: Database Design...")
    build_section_14_database_design(doc)
    
    print("Building Section 15: API Documentation...")
    build_section_15_api_documentation(doc)
    
    # ------------------ SECTIONS 16 TO 22 ------------------
    print("Building Section 16: UI/UX Design...")
    build_section_16_ui_ux_design(doc, screenshots_dir)
    
    print("Building Section 17: Innovation & Uniqueness...")
    build_section_17_innovation(doc)
    
    print("Building Section 18: Real-World Impact...")
    build_section_18_real_world_impact(doc)
    
    print("Building Section 19: Scalability & Deployment...")
    build_section_19_scalability_deployment(doc)
    
    print("Building Section 20: Security, Privacy & Ethics...")
    build_section_20_security_ethics(doc)
    
    print("Building Section 21: Testing & Validation...")
    build_section_21_testing_validation(doc)
    
    print("Building Section 22: Implementation Status...")
    build_section_22_implementation_status(doc)
    
    # ------------------ SECTIONS 23 TO 30 ------------------
    print("Building Section 23: Limitations...")
    build_section_23_limitations(doc)
    
    print("Building Section 24: Future Scope...")
    build_section_24_future_roadmap(doc)
    
    print("Building Section 25: Judging Criteria Alignment...")
    build_section_25_judging_criteria(doc)
    
    print("Building Section 26: Project Links & Submission Requirements...")
    build_section_26_project_links(doc)
    
    print("Building Section 27: Participant Details...")
    build_section_27_participant_details(doc)
    
    print("Building Section 28: Conclusion...")
    build_section_28_conclusion(doc)
    
    print("Building Section 29: References & Citations...")
    build_section_29_references(doc)
    
    print("Building Section 30: Appendix...")
    build_section_30_appendix(doc)
    
    # Save final document
    print(f"Saving compiled document to: {out_path}")
    doc.save(out_path)
    print("Document successfully compiled and saved!")
    
    file_size = os.path.getsize(out_path)
    print(f"File size: {file_size / (1024*1024):.2f} MB ({file_size} bytes)")

if __name__ == "__main__":
    build_complete_report()
