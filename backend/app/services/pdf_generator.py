"""
ATS-friendly PDF generation service with multiple template support.
All templates are designed for maximum ATS compatibility:
- Simple, clean layouts without complex formatting
- Standard fonts (Helvetica, Times, Courier)
- No tables, images, or icons
- Machine-readable text structure
- Multi-page safe
"""

from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, PageBreak
from reportlab.lib.enums import TA_LEFT, TA_CENTER, TA_JUSTIFY
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.lib import colors
from io import BytesIO
import os
from typing import Dict, Any


class PDFGenerator:
    """Generate ATS-friendly PDFs with multiple template options"""
    
    def __init__(self):
        self.templates = {
            "classic": self._generate_classic_template,
            "modern": self._generate_modern_template,
            "minimal": self._generate_minimal_template,
            "professional": self._generate_professional_template
        }
    
    def generate_pdf(self, resume_data: Dict[str, Any], template_id: str = "classic") -> bytes:
        """Generate PDF from resume data using specified template"""
        if template_id not in self.templates:
            template_id = "classic"
        
        buffer = BytesIO()
        doc = SimpleDocTemplate(
            buffer,
            pagesize=letter,
            rightMargin=72,
            leftMargin=72,
            topMargin=72,
            bottomMargin=72
        )
        
        generator_func = self.templates[template_id]
        story = generator_func(resume_data)
        
        doc.build(story)
        pdf_bytes = buffer.getvalue()
        buffer.close()
        
        return pdf_bytes
    
    def _generate_classic_template(self, data: Dict[str, Any]) -> list:
        """Classic ATS-friendly template with standard sections"""
        styles = getSampleStyleSheet()
        story = []
        
        # Custom styles for ATS compatibility
        title_style = ParagraphStyle(
            'CustomTitle',
            parent=styles['Heading1'],
            fontName='Helvetica-Bold',
            fontSize=16,
            spaceAfter=12,
            alignment=TA_CENTER
        )
        
        heading_style = ParagraphStyle(
            'CustomHeading',
            parent=styles['Heading2'],
            fontName='Helvetica-Bold',
            fontSize=12,
            spaceAfter=6,
            spaceBefore=12,
            textColor=colors.black
        )
        
        normal_style = ParagraphStyle(
            'CustomNormal',
            parent=styles['Normal'],
            fontName='Helvetica',
            fontSize=10,
            spaceAfter=6,
            alignment=TA_LEFT
        )
        
        # Personal Info
        personal_info = data.get("personal_info", {})
        name = personal_info.get("full_name", "")
        
        if name:
            story.append(Paragraph(name, title_style))
            story.append(Spacer(1, 12))
        
        # Contact Info
        contact_lines = self._get_contact_lines(personal_info)
        if contact_lines:
            story.append(Paragraph(" | ".join(contact_lines), normal_style))
            story.append(Spacer(1, 12))
        
        # Summary
        summary = data.get("summary", "")
        if summary:
            story.append(Paragraph("PROFESSIONAL SUMMARY", heading_style))
            story.append(Paragraph(summary, normal_style))
            story.append(Spacer(1, 12))
        
        # Experience
        experience = data.get("experience", [])
        if experience:
            story.append(Paragraph("PROFESSIONAL EXPERIENCE", heading_style))
            for exp in experience:
                self._add_experience_section(story, exp, normal_style)
            story.append(Spacer(1, 6))
        
        # Education
        education = data.get("education", [])
        if education:
            story.append(Paragraph("EDUCATION", heading_style))
            for edu in education:
                self._add_education_section(story, edu, normal_style)
            story.append(Spacer(1, 6))
        
        # Skills
        skills = data.get("skills", [])
        if skills:
            story.append(Paragraph("SKILLS", heading_style))
            story.append(Paragraph(", ".join(skills), normal_style))
            story.append(Spacer(1, 12))
        
        # Projects
        projects = data.get("projects", [])
        if projects:
            story.append(Paragraph("PROJECTS", heading_style))
            for proj in projects:
                self._add_project_section(story, proj, normal_style)
        
        return story
    
    def _generate_modern_template(self, data: Dict[str, Any]) -> list:
        """Modern ATS-friendly template with clean spacing"""
        styles = getSampleStyleSheet()
        story = []
        
        # Modern styles
        title_style = ParagraphStyle(
            'ModernTitle',
            parent=styles['Heading1'],
            fontName='Helvetica-Bold',
            fontSize=18,
            spaceAfter=18,
            alignment=TA_LEFT
        )
        
        heading_style = ParagraphStyle(
            'ModernHeading',
            parent=styles['Heading2'],
            fontName='Helvetica-Bold',
            fontSize=11,
            spaceAfter=8,
            spaceBefore=16,
            textColor=colors.HexColor('#333333')
        )
        
        normal_style = ParagraphStyle(
            'ModernNormal',
            parent=styles['Normal'],
            fontName='Helvetica',
            fontSize=10,
            spaceAfter=8,
            leading=14,
            alignment=TA_LEFT
        )
        
        # Personal Info
        personal_info = data.get("personal_info", {})
        name = personal_info.get("full_name", "")
        
        if name:
            story.append(Paragraph(name, title_style))
            story.append(Spacer(1, 8))
        
        # Contact Info
        contact_lines = self._get_contact_lines(personal_info)
        if contact_lines:
            story.append(Paragraph(" | ".join(contact_lines), normal_style))
            story.append(Spacer(1, 16))
        
        # Summary
        summary = data.get("summary", "")
        if summary:
            story.append(Paragraph("SUMMARY", heading_style))
            story.append(Paragraph(summary, normal_style))
            story.append(Spacer(1, 8))
        
        # Experience
        experience = data.get("experience", [])
        if experience:
            story.append(Paragraph("EXPERIENCE", heading_style))
            for exp in experience:
                self._add_experience_section(story, exp, normal_style)
            story.append(Spacer(1, 8))
        
        # Education
        education = data.get("education", [])
        if education:
            story.append(Paragraph("EDUCATION", heading_style))
            for edu in education:
                self._add_education_section(story, edu, normal_style)
            story.append(Spacer(1, 8))
        
        # Skills
        skills = data.get("skills", [])
        if skills:
            story.append(Paragraph("SKILLS", heading_style))
            story.append(Paragraph(", ".join(skills), normal_style))
            story.append(Spacer(1, 12))
        
        # Projects
        projects = data.get("projects", [])
        if projects:
            story.append(Paragraph("PROJECTS", heading_style))
            for proj in projects:
                self._add_project_section(story, proj, normal_style)
        
        return story
    
    def _generate_minimal_template(self, data: Dict[str, Any]) -> list:
        """Minimal ATS-friendly template with maximum readability"""
        styles = getSampleStyleSheet()
        story = []
        
        # Minimal styles - clean and simple
        title_style = ParagraphStyle(
            'MinimalTitle',
            parent=styles['Heading1'],
            fontName='Helvetica',
            fontSize=14,
            spaceAfter=10,
            alignment=TA_LEFT
        )
        
        heading_style = ParagraphStyle(
            'MinimalHeading',
            parent=styles['Heading2'],
            fontName='Helvetica-Bold',
            fontSize=10,
            spaceAfter=4,
            spaceBefore=10,
            textColor=colors.black
        )
        
        normal_style = ParagraphStyle(
            'MinimalNormal',
            parent=styles['Normal'],
            fontName='Helvetica',
            fontSize=9,
            spaceAfter=4,
            leading=12,
            alignment=TA_LEFT
        )
        
        # Personal Info
        personal_info = data.get("personal_info", {})
        name = personal_info.get("full_name", "")
        
        if name:
            story.append(Paragraph(name, title_style))
            story.append(Spacer(1, 6))
        
        # Contact Info
        contact_lines = self._get_contact_lines(personal_info)
        if contact_lines:
            story.append(Paragraph(" | ".join(contact_lines), normal_style))
            story.append(Spacer(1, 10))
        
        # Summary
        summary = data.get("summary", "")
        if summary:
            story.append(Paragraph("SUMMARY", heading_style))
            story.append(Paragraph(summary, normal_style))
            story.append(Spacer(1, 6))
        
        # Experience
        experience = data.get("experience", [])
        if experience:
            story.append(Paragraph("EXPERIENCE", heading_style))
            for exp in experience:
                self._add_experience_section(story, exp, normal_style)
            story.append(Spacer(1, 4))
        
        # Education
        education = data.get("education", [])
        if education:
            story.append(Paragraph("EDUCATION", heading_style))
            for edu in education:
                self._add_education_section(story, edu, normal_style)
            story.append(Spacer(1, 4))
        
        # Skills
        skills = data.get("skills", [])
        if skills:
            story.append(Paragraph("SKILLS", heading_style))
            story.append(Paragraph(", ".join(skills), normal_style))
            story.append(Spacer(1, 8))
        
        # Projects
        projects = data.get("projects", [])
        if projects:
            story.append(Paragraph("PROJECTS", heading_style))
            for proj in projects:
                self._add_project_section(story, proj, normal_style)
        
        return story
    
    def _generate_professional_template(self, data: Dict[str, Any]) -> list:
        """Professional ATS-friendly template with traditional formatting"""
        styles = getSampleStyleSheet()
        story = []
        
        # Professional styles
        title_style = ParagraphStyle(
            'ProfessionalTitle',
            parent=styles['Heading1'],
            fontName='Times-Bold',
            fontSize=16,
            spaceAfter=12,
            alignment=TA_CENTER
        )
        
        heading_style = ParagraphStyle(
            'ProfessionalHeading',
            parent=styles['Heading2'],
            fontName='Times-Bold',
            fontSize=12,
            spaceAfter=8,
            spaceBefore=12,
            textColor=colors.black
        )
        
        normal_style = ParagraphStyle(
            'ProfessionalNormal',
            parent=styles['Normal'],
            fontName='Times-Roman',
            fontSize=11,
            spaceAfter=6,
            leading=14,
            alignment=TA_JUSTIFY
        )
        
        # Personal Info
        personal_info = data.get("personal_info", {})
        name = personal_info.get("full_name", "")
        
        if name:
            story.append(Paragraph(name, title_style))
            story.append(Spacer(1, 12))
        
        # Contact Info
        contact_lines = self._get_contact_lines(personal_info)
        if contact_lines:
            story.append(Paragraph(" | ".join(contact_lines), normal_style))
            story.append(Spacer(1, 12))
        
        # Summary
        summary = data.get("summary", "")
        if summary:
            story.append(Paragraph("PROFESSIONAL SUMMARY", heading_style))
            story.append(Paragraph(summary, normal_style))
            story.append(Spacer(1, 12))
        
        # Experience
        experience = data.get("experience", [])
        if experience:
            story.append(Paragraph("PROFESSIONAL EXPERIENCE", heading_style))
            for exp in experience:
                self._add_experience_section(story, exp, normal_style)
            story.append(Spacer(1, 8))
        
        # Education
        education = data.get("education", [])
        if education:
            story.append(Paragraph("EDUCATION", heading_style))
            for edu in education:
                self._add_education_section(story, edu, normal_style)
            story.append(Spacer(1, 8))
        
        # Skills
        skills = data.get("skills", [])
        if skills:
            story.append(Paragraph("SKILLS", heading_style))
            story.append(Paragraph(", ".join(skills), normal_style))
            story.append(Spacer(1, 12))
        
        # Projects
        projects = data.get("projects", [])
        if projects:
            story.append(Paragraph("PROJECTS", heading_style))
            for proj in projects:
                self._add_project_section(story, proj, normal_style)
        
        return story
    
    def _get_contact_lines(self, personal_info: Dict[str, Any]) -> list:
        """Extract contact information lines"""
        contact_lines = []
        email = personal_info.get("email", "")
        phone = personal_info.get("phone", "")
        location = personal_info.get("location", "")
        linkedin = personal_info.get("linkedin", "")
        github = personal_info.get("github", "")
        website = personal_info.get("website", "")
        
        if email:
            contact_lines.append(email)
        if phone:
            contact_lines.append(phone)
        if location:
            contact_lines.append(location)
        if linkedin:
            contact_lines.append(linkedin)
        if github:
            contact_lines.append(github)
        if website:
            contact_lines.append(website)
        
        return contact_lines
    
    def _add_experience_section(self, story: list, exp: Dict[str, Any], style: ParagraphStyle):
        """Add experience section to story"""
        title = exp.get("title", "")
        company = exp.get("company", "")
        exp_location = exp.get("location", "")
        start_date = exp.get("start_date", "")
        end_date = exp.get("end_date", "Present")
        is_current = exp.get("is_current", False)
        description = exp.get("description", "")
        
        header = f"{title} - {company}"
        if exp_location:
            header += f", {exp_location}"
        
        story.append(Paragraph(header, style))
        
        date_str = f"{start_date} - {end_date}" if not is_current else f"{start_date} - Present"
        story.append(Paragraph(date_str, style))
        
        if description:
            story.append(Paragraph(description, style))
        
        story.append(Spacer(1, 4))
    
    def _add_education_section(self, story: list, edu: Dict[str, Any], style: ParagraphStyle):
        """Add education section to story"""
        institution = edu.get("institution", "")
        degree = edu.get("degree", "")
        field = edu.get("field_of_study", "")
        start_date = edu.get("start_date", "")
        end_date = edu.get("end_date", "")
        grade = edu.get("grade", "")
        
        header = institution
        if degree:
            header += f" - {degree}"
        if field:
            header += f" in {field}"
        
        story.append(Paragraph(header, style))
        
        date_str = f"{start_date} - {end_date}"
        story.append(Paragraph(date_str, style))
        
        if grade:
            story.append(Paragraph(f"Grade: {grade}", style))
        
        story.append(Spacer(1, 4))
    
    def _add_project_section(self, story: list, proj: Dict[str, Any], style: ParagraphStyle):
        """Add project section to story"""
        name = proj.get("name", "")
        description = proj.get("description", "")
        url = proj.get("url", "")
        technologies = proj.get("technologies", [])
        
        if name:
            story.append(Paragraph(name, style))
        
        if description:
            story.append(Paragraph(description, style))
        
        if url:
            story.append(Paragraph(f"URL: {url}", style))
        
        if technologies:
            story.append(Paragraph(f"Technologies: {', '.join(technologies)}", style))
        
        story.append(Spacer(1, 4))


# Global instance
pdf_generator = PDFGenerator()