from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import Response
from pydantic import BaseModel
from typing import Optional
from app.api.dependencies import get_current_user
from app.models.user import User
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.lib.units import inch
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from reportlab.lib import colors
from reportlab.platypus import Image
from reportlab.lib.enums import TA_CENTER
from io import BytesIO
import os

router = APIRouter(prefix="/pdf", tags=["pdf"])


class PDFDownloadRequest(BaseModel):
    content: str
    filename: str
    type: str


@router.post("/download")
async def download_pdf(
    request: PDFDownloadRequest,
    current_user: User = Depends(get_current_user)
):
    """Generate and download PDF from content"""
    try:
        # Create PDF in memory
        buffer = BytesIO()
        doc = SimpleDocTemplate(buffer, pagesize=letter, rightMargin=72, leftMargin=72, topMargin=72, bottomMargin=18)
        styles = getSampleStyleSheet()
        story = []

        # Add title based on type
        title_map = {
            "cover_letter": "Cover Letter",
            "roadmap": "Career Roadmap",
            "interview": "Interview Results",
            "resume": "Resume"
        }

        title = title_map.get(request.type, "Document")
        story.append(Paragraph(title, styles['Title']))
        story.append(Spacer(1, 12))

        # Split content by newlines and create paragraphs
        lines = request.content.split('\n')
        for line in lines:
            if line.strip():
                story.append(Paragraph(line, styles['Normal']))
                story.append(Spacer(1, 6))

        # Build PDF with watermark
        def on_page(canvas, doc):
            """Add SKYRA text watermark diagonally across entire page"""
            try:
                canvas.saveState()
                canvas.setFillColorRGB(0.5, 0.5, 0.5)  # Gray color
                canvas.setFont('Helvetica', 40)
                
                # Set opacity
                canvas.setFillAlpha(0.06)
                
                # Calculate page dimensions
                page_width = canvas._pagesize[0]
                page_height = canvas._pagesize[1]
                
                # Add SKYRA text repeated diagonally across the page
                text = "SKYRA"
                text_width = canvas.stringWidth(text, 'Helvetica', 40)
                
                # Create a diagonal pattern
                canvas.translate(page_width / 2, page_height / 2)
                canvas.rotate(45)
                
                # Repeat text across the page
                for i in range(-5, 6):
                    for j in range(-5, 6):
                        x = i * (text_width + 100)
                        y = j * 80
                        canvas.drawCentredString(x, y, text)
                
                canvas.restoreState()
            except Exception as e:
                # If watermark fails, continue without it
                pass

        doc.build(story, onFirstPage=on_page, onLaterPages=on_page)

        # Get PDF bytes
        pdf_bytes = buffer.getvalue()
        buffer.close()

        # Return PDF as downloadable response
        return Response(
            content=pdf_bytes,
            media_type="application/pdf",
            headers={
                "Content-Disposition": f"attachment; filename={request.filename}.pdf"
            }
        )

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate PDF: {str(e)}"
        )
