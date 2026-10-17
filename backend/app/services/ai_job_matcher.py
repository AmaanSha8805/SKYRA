import json
from typing import Any

import google.genai as genai

from app.core.config import settings


class JobMatcherService:
    """AI-powered job matching service using Google GenAI"""

    def __init__(self):
        if settings.gemini_api_key:
            self.client = genai.Client(api_key=settings.gemini_api_key)
        else:
            self.client = None

    async def match_jobs(self, parsed_data: dict[str, Any]) -> dict[str, Any]:
        """Match resume with top 10 job roles using AI"""
        if not self.client:
            raise ValueError("Gemini API key not configured")

        if not parsed_data:
            raise ValueError("Parsed resume data is required")

        system_prompt = """You are an expert career counselor and job matching specialist.
Analyze resume data and suggest the top 10 most suitable job roles based on skills, experience, and qualifications.
Return ONLY valid JSON, no additional text or markdown formatting."""

        user_prompt = f"""Analyze the following parsed resume data and suggest the top 10 most suitable job roles:

{json.dumps(parsed_data, indent=2)}

Return the result in this exact JSON format (no markdown, no code blocks):
{{
  "matched_jobs": [
    {{
      "rank": number (1-10),
      "job_title": string,
      "company_type": string (e.g., "Tech Startup", "Enterprise", "Agency", "Freelance"),
      "match_percentage": number (0-100),
      "matched_skills": [string],
      "missing_skills": [string],
      "reason": string (brief explanation of why this role matches),
      "salary_range": string (e.g., "$80,000 - $120,000"),
      "location_type": string (e.g., "Remote", "On-site", "Hybrid"),
      "apply_links": {{
        "linkedin": string (search URL),
        "naukri": string (search URL),
        "indeed": string (search URL)
      }}
    }}
  ]
}}

Guidelines:
- Rank jobs by match percentage (highest first)
- Match percentage should be realistic based on skills alignment
- Include 3-5 matched skills that the candidate has
- Include 2-4 missing skills that would be beneficial
- Provide a concise reason for the match (1-2 sentences)
- Salary range should be realistic for the role and experience level
- Generate search URLs for each platform based on the job title
- Ensure diverse job types (not all the same role with slight variations)"""

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

            match_data = json.loads(text)
            return self._sanitize_match_data(match_data)

        except Exception as e:
            raise ValueError(f"Failed to match jobs with AI: {str(e)}")

    def _sanitize_match_data(self, data: dict[str, Any]) -> dict[str, Any]:
        """Sanitize and validate match data structure"""
        matched_jobs = data.get("matched_jobs", [])

        sanitized_jobs = []
        for job in matched_jobs[:10]:  # Limit to top 10
            sanitized_job = {
                "rank": self._sanitize_rank(job.get("rank", len(sanitized_jobs) + 1)),
                "job_title": str(job.get("job_title", "")).strip(),
                "company_type": str(job.get("company_type", "")).strip(),
                "match_percentage": self._clamp_percentage(job.get("match_percentage", 70)),
                "matched_skills": self._sanitize_array(job.get("matched_skills", [])),
                "missing_skills": self._sanitize_array(job.get("missing_skills", [])),
                "reason": str(job.get("reason", "")).strip(),
                "salary_range": str(job.get("salary_range", "")).strip(),
                "location_type": str(job.get("location_type", "")).strip(),
                "apply_links": self._sanitize_apply_links(job.get("apply_links", {}))
            }
            sanitized_jobs.append(sanitized_job)

        return {"matched_jobs": sanitized_jobs}

    def _sanitize_rank(self, rank: Any) -> int:
        """Ensure rank is a positive integer"""
        try:
            rank_int = int(rank)
            return max(1, rank_int)
        except (ValueError, TypeError):
            return 1

    def _clamp_percentage(self, percentage: Any) -> int:
        """Ensure percentage is between 0 and 100"""
        try:
            percentage_int = int(percentage)
            return max(0, min(100, percentage_int))
        except (ValueError, TypeError):
            return 70

    def _sanitize_array(self, arr: Any) -> list:
        """Sanitize array to ensure it's a list of non-empty strings"""
        if not isinstance(arr, list):
            return []
        return [str(item).strip() for item in arr if item is not None and str(item).strip()]

    def _sanitize_apply_links(self, links: dict[str, Any]) -> dict[str, str]:
        """Sanitize apply links"""
        return {
            "linkedin": str(links.get("linkedin", "")).strip(),
            "naukri": str(links.get("naukri", "")).strip(),
            "indeed": str(links.get("indeed", "")).strip()
        }


# Global job matcher service instance
job_matcher_service = JobMatcherService()
