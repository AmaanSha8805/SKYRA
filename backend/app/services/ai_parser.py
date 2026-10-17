import json
from typing import Any

import google.genai as genai

from app.core.config import settings


class ResumeParserService:
    """AI-powered resume parsing service using Google GenAI"""

    def __init__(self):
        if settings.gemini_api_key:
            self.client = genai.Client(api_key=settings.gemini_api_key)
        else:
            self.client = None

    async def parse_resume(self, resume_text: str) -> dict[str, Any]:
        """Parse resume text into structured data using AI"""
        if not self.client:
            raise ValueError("Gemini API key not configured")

        if not resume_text or len(resume_text.strip()) < 50:
            raise ValueError("Resume text is too short or empty")

        system_prompt = """You are an expert resume parser. Extract structured information from resumes and return it as JSON.
Follow these guidelines:
- Extract all available information accurately
- If a section is missing, return empty array or null
- Format dates consistently
- Extract skills as a flat array
- Structure experience and education as arrays with consistent fields
- Return ONLY valid JSON, no additional text
- Do not include any markdown formatting or code blocks"""

        user_prompt = f"""Parse the following resume text and extract structured information:

{resume_text}

Return the result in this exact JSON format (no markdown, no code blocks):
{{
  "personal_info": {{
    "name": string | null,
    "email": string | null,
    "phone": string | null,
    "location": string | null,
    "linkedin": string | null,
    "github": string | null,
    "website": string | null
  }},
  "summary": string | null,
  "skills": [string],
  "experience": [{{
    "company": string,
    "title": string,
    "location": string | null,
    "start_date": string | null,
    "end_date": string | null,
    "is_current": boolean,
    "description": string | null,
    "achievements": [string]
  }}],
  "education": [{{
    "institution": string,
    "degree": string,
    "field_of_study": string | null,
    "start_date": string | null,
    "end_date": string | null,
    "grade": string | null
  }}],
  "projects": [{{
    "name": string,
    "description": string | null,
    "url": string | null,
    "technologies": [string]
  }}],
  "certifications": [{{
    "name": string,
    "issuer": string,
    "issue_date": string | null,
    "expiry_date": string | null,
    "credential_url": string | null
  }}]
}}"""

        try:
            combined_prompt = f"{system_prompt}\n\n{user_prompt}"
            response = self.client.models.generate_content(
                model="gemini-3.5-flash-lite",
                contents=combined_prompt
            )

            # Clean response text to handle potential markdown code blocks
            text = response.text.strip()
            if text.startswith('```json'):
                text = text[7:]
            if text.startswith('```'):
                text = text[3:]
            if text.endswith('```'):
                text = text[:-3]
            text = text.strip()

            parsed_data = json.loads(text)
            return self._sanitize_parsed_data(parsed_data)

        except Exception as e:
            raise ValueError(f"Failed to parse resume with AI: {str(e)}")

    def _sanitize_parsed_data(self, data: dict[str, Any]) -> dict[str, Any]:
        """Sanitize and validate parsed data structure"""
        sanitized = {
            "personal_info": self._sanitize_personal_info(data.get("personal_info", {})),
            "summary": data.get("summary"),
            "skills": self._sanitize_array(data.get("skills", [])),
            "experience": [self._sanitize_experience(exp) for exp in data.get("experience", [])],
            "education": [self._sanitize_education(edu) for edu in data.get("education", [])],
            "projects": [self._sanitize_project(proj) for proj in data.get("projects", [])],
            "certifications": [self._sanitize_certification(cert) for cert in data.get("certifications", [])]
        }
        return sanitized

    def _sanitize_personal_info(self, info: dict[str, Any]) -> dict[str, Any]:
        return {
            "name": info.get("name"),
            "email": info.get("email"),
            "phone": info.get("phone"),
            "location": info.get("location"),
            "linkedin": info.get("linkedin"),
            "github": info.get("github"),
            "website": info.get("website")
        }

    def _sanitize_experience(self, exp: dict[str, Any]) -> dict[str, Any]:
        return {
            "company": exp.get("company", ""),
            "title": exp.get("title", ""),
            "location": exp.get("location"),
            "start_date": exp.get("start_date"),
            "end_date": exp.get("end_date"),
            "is_current": exp.get("is_current", False),
            "description": exp.get("description"),
            "achievements": self._sanitize_array(exp.get("achievements", []))
        }

    def _sanitize_education(self, edu: dict[str, Any]) -> dict[str, Any]:
        return {
            "institution": edu.get("institution", ""),
            "degree": edu.get("degree", ""),
            "field_of_study": edu.get("field_of_study"),
            "start_date": edu.get("start_date"),
            "end_date": edu.get("end_date"),
            "grade": edu.get("grade")
        }

    def _sanitize_project(self, proj: dict[str, Any]) -> dict[str, Any]:
        return {
            "name": proj.get("name", ""),
            "description": proj.get("description"),
            "url": proj.get("url"),
            "technologies": self._sanitize_array(proj.get("technologies", []))
        }

    def _sanitize_certification(self, cert: dict[str, Any]) -> dict[str, Any]:
        return {
            "name": cert.get("name", ""),
            "issuer": cert.get("issuer", ""),
            "issue_date": cert.get("issue_date"),
            "expiry_date": cert.get("expiry_date"),
            "credential_url": cert.get("credential_url")
        }

    def _sanitize_array(self, arr: Any) -> list:
        if not isinstance(arr, list):
            return []
        return [item for item in arr if item is not None and str(item).strip()]


# Global resume parser service instance
resume_parser_service = ResumeParserService()
