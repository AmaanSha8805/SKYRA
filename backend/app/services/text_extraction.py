from pathlib import Path
from typing import Optional
from fastapi import HTTPException
import PyPDF2
from docx import Document


class TextExtractionService:
    """Service for extracting text from resume files"""
    
    ALLOWED_EXTENSIONS = {'.pdf', '.docx'}
    MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB
    
    @staticmethod
    def validate_file(filename: str, file_size: int) -> None:
        """Validate file type and size"""
        file_ext = Path(filename).suffix.lower()
        
        if file_ext not in TextExtractionService.ALLOWED_EXTENSIONS:
            raise HTTPException(
                status_code=400,
                detail=f"Invalid file type. Allowed types: {', '.join(TextExtractionService.ALLOWED_EXTENSIONS)}"
            )
        
        if file_size > TextExtractionService.MAX_FILE_SIZE:
            raise HTTPException(
                status_code=400,
                detail=f"File size exceeds maximum limit of {TextExtractionService.MAX_FILE_SIZE / (1024*1024)}MB"
            )
    
    @staticmethod
    async def extract_text_from_pdf(file_path: str) -> str:
        """Extract text from PDF file"""
        try:
            text = ""
            with open(file_path, 'rb') as file:
                pdf_reader = PyPDF2.PdfReader(file)
                for page in pdf_reader.pages:
                    extracted = page.extract_text()
                    if extracted:
                        text += extracted + "\n"
            return text.strip() if text.strip() else "No text extracted from PDF"
        except Exception as e:
            raise HTTPException(
                status_code=500,
                detail=f"Failed to extract text from PDF: {str(e)}"
            )
    
    @staticmethod
    async def extract_text_from_docx(file_path: str) -> str:
        """Extract text from DOCX file"""
        try:
            doc = Document(file_path)
            text = ""
            for paragraph in doc.paragraphs:
                if paragraph.text:
                    text += paragraph.text + "\n"
            return text.strip() if text.strip() else "No text extracted from DOCX"
        except Exception as e:
            raise HTTPException(
                status_code=500,
                detail=f"Failed to extract text from DOCX: {str(e)}"
            )
    
    @staticmethod
    async def extract_text(file_path: str, filename: str) -> str:
        """Extract text from file based on its type"""
        file_ext = Path(filename).suffix.lower()
        
        if file_ext == '.pdf':
            return await TextExtractionService.extract_text_from_pdf(file_path)
        elif file_ext == '.docx':
            return await TextExtractionService.extract_text_from_docx(file_path)
        else:
            raise HTTPException(
                status_code=400,
                detail=f"Unsupported file type for text extraction: {file_ext}"
            )


# Global text extraction service instance
text_extraction_service = TextExtractionService()
