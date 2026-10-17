import json
from typing import Any

import google.genai as genai

from app.core.config import settings


class CoverLetterService:
    """AI-powered cover letter generation service using Google GenAI"""

    def __init__(self):
        if settings.gemini_api_key:
            self.client = genai.Client(api_key=settings.gemini_api_key)
        else:
            self.client = None

    async def generate_cover_letter(
        self,
        parsed_data: dict[str, Any],
        job_title: str,
        company_name: str,
        job_description: str | None = None
    ) -> dict[str, Any]:
        """Generate a professional cover letter based on resume and job details"""
        if not self.client:
            raise ValueError("Gemini API key not configured")

        if not parsed_data:
            raise ValueError("Parsed resume data is required")

        system_prompt = """You are an expert career coach and professional writer.
Generate a compelling, professional cover letter based on a candidate's resume and job details.
The cover letter should be well-structured, persuasive, and tailored to the specific position.
Return ONLY the cover letter text, no additional formatting or markdown."""

        user_prompt = f"""Write a professional cover letter for a candidate applying for the position of {job_title} at {company_name}.

Based on the candidate's resume:
{json.dumps(parsed_data, indent=2)}

Additional job details:
- Job Title: {job_title}
- Company: {company_name}
{f'- Job Description: {job_description}' if job_description else ''}

Guidelines:
- Write a compelling, professional cover letter (300-500 words)
- Start with a strong opening that expresses enthusiasm for the role
- Highlight relevant skills, experience, and achievements from the resume
- Connect the candidate's background to the job requirements
- Include specific examples when possible
- End with a strong closing statement and call to action
- Use professional, conversational tone
- Format as a proper business letter with appropriate salutation and sign-off
- Do not include markdown formatting or code blocks
- Return ONLY the cover letter text"""

        try:
            combined_prompt = f"{system_prompt}\n\n{user_prompt}"
            response = self.client.models.generate_content(
                model="gemini-3.5-flash-lite",
                contents=combined_prompt
            )

            # Clean response text
            text = response.text.strip()

            # Handle potential markdown code blocks
            if text.startswith('```'):
                # Find the end of the first line
                first_newline = text.find('\n')
                if first_newline != -1:
                    text = text[first_newline + 1:]

            if text.endswith('```'):
                text = text[:-3]

            text = text.strip()

            # Calculate word count
            word_count = len(text.split())

            return {
                "cover_letter": text,
                "word_count": word_count
            }

        except Exception as e:
            print(f"Exception in generate_cover_letter: {type(e).__name__}: {str(e)}")
            error_msg = str(e)
            if "404" in error_msg or "not found" in error_msg.lower():
                raise ValueError(f"AI model not available. Please contact support.")
            elif "401" in error_msg or "403" in error_msg or "unauthorized" in error_msg.lower():
                raise ValueError(f"AI service authentication failed. Please check API configuration.")
            elif "timeout" in error_msg.lower():
                raise ValueError(f"AI service timeout. Please try again.")
            else:
                raise ValueError(f"Failed to generate cover letter with AI: {error_msg}")


# Global cover letter service instance
cover_letter_service = CoverLetterService()
