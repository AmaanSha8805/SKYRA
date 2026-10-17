import json
from typing import Any

import google.genai as genai

from app.core.config import settings


class ResumeAnalysisService:
    """AI-powered resume analysis service using Google GenAI"""

    def __init__(self):
        if settings.gemini_api_key:
            self.client = genai.Client(api_key=settings.gemini_api_key)
        else:
            self.client = None

    async def analyze_resume(self, parsed_data: dict[str, Any]) -> dict[str, Any]:
        """Analyze parsed resume data and generate ATS scores and recommendations"""
        if not self.client:
            raise ValueError("Gemini API key not configured")

        if not parsed_data:
            raise ValueError("Parsed resume data is required")

        system_prompt = """You are an expert ATS (Applicant Tracking System) analyzer and career coach.
Analyze resumes and provide detailed scoring and recommendations.
Your scores should be realistic and based on actual ATS criteria.
Return ONLY valid JSON, no additional text or markdown formatting."""

        user_prompt = f"""Analyze the following parsed resume data and provide a comprehensive ATS analysis:

{json.dumps(parsed_data, indent=2)}

Return the result in this exact JSON format (no markdown, no code blocks):
{{
  "overall_score": number (0-100),
  "ats_score": number (0-100),
  "content_score": number (0-100),
  "skills_score": number (0-100),
  "experience_score": number (0-100),
  "formatting_score": number (0-100),
  "keyword_score": number (0-100),
  "strengths": [string],
  "weaknesses": [string],
  "recommendations": [string],
  "missing_keywords": [string],
  "detected_skills": [string]
}}

Scoring guidelines:
- overall_score: Weighted average of all scores
- ats_score: How well the resume will pass ATS systems (formatting, keywords, structure)
- content_score: Quality and completeness of content
- skills_score: Relevance and quantity of skills
- experience_score: Quality and relevance of work experience
- formatting_score: Structure and organization (based on parsed data quality)
- keyword_score: Presence of important industry keywords

Provide 3-5 specific strengths, 3-5 specific weaknesses, 3-5 actionable recommendations,
5-10 missing important keywords, and all detected skills from the resume."""

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

            analysis_data = json.loads(text)
            return self._sanitize_analysis_data(analysis_data)

        except Exception as e:
            error_msg = str(e)
            if "404" in error_msg or "not found" in error_msg.lower():
                raise ValueError(f"AI model not available. Please contact support.")
            elif "401" in error_msg or "403" in error_msg or "unauthorized" in error_msg.lower():
                raise ValueError(f"AI service authentication failed. Please check API configuration.")
            elif "timeout" in error_msg.lower():
                raise ValueError(f"AI service timeout. Please try again.")
            else:
                raise ValueError(f"Failed to analyze resume with AI: {error_msg}")

    def _sanitize_analysis_data(self, data: dict[str, Any]) -> dict[str, Any]:
        """Sanitize and validate analysis data structure"""
        return {
            "overall_score": self._clamp_score(data.get("overall_score", 70)),
            "ats_score": self._clamp_score(data.get("ats_score", 70)),
            "content_score": self._clamp_score(data.get("content_score", 70)),
            "skills_score": self._clamp_score(data.get("skills_score", 70)),
            "experience_score": self._clamp_score(data.get("experience_score", 70)),
            "formatting_score": self._clamp_score(data.get("formatting_score", 70)),
            "keyword_score": self._clamp_score(data.get("keyword_score", 70)),
            "strengths": self._sanitize_array(data.get("strengths", [])),
            "weaknesses": self._sanitize_array(data.get("weaknesses", [])),
            "recommendations": self._sanitize_array(data.get("recommendations", [])),
            "missing_keywords": self._sanitize_array(data.get("missing_keywords", [])),
            "detected_skills": self._sanitize_array(data.get("detected_skills", []))
        }

    def _clamp_score(self, score: Any) -> int:
        """Ensure score is between 0 and 100"""
        try:
            score_int = int(score)
            return max(0, min(100, score_int))
        except (ValueError, TypeError):
            return 70

    def _sanitize_array(self, arr: Any) -> list:
        """Sanitize array to ensure it's a list of non-empty strings"""
        if not isinstance(arr, list):
            return []
        return [str(item).strip() for item in arr if item is not None and str(item).strip()]


# Global resume analysis service instance
resume_analysis_service = ResumeAnalysisService()
