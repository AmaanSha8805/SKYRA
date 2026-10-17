import json
from typing import Any

import google.genai as genai

from app.core.config import settings


class SkillGapService:
    """AI-powered skill gap analysis service using Google GenAI"""

    def __init__(self):
        if settings.gemini_api_key:
            self.client = genai.Client(api_key=settings.gemini_api_key)
        else:
            self.client = None

    async def analyze_skill_gap(
        self,
        parsed_data: dict[str, Any],
        target_role: str
    ) -> dict[str, Any]:
        """Analyze skill gaps between current resume skills and target role requirements"""
        if not self.client:
            raise ValueError("Gemini API key not configured")

        if not parsed_data:
            raise ValueError("Parsed resume data is required")

        system_prompt = """You are an expert career coach and skills analyst.
Analyze the skill gaps between a candidate's current skills and the requirements for a target role.
Provide actionable insights with learning resources.
Return ONLY valid JSON, no additional text or markdown formatting."""

        user_prompt = f"""Analyze the skill gaps for a candidate targeting the role of {target_role}.

Based on the candidate's resume:
{json.dumps(parsed_data, indent=2)}

Return the result in this exact JSON format (no markdown, no code blocks):
{{
  "current_skills": ["skill1", "skill2", ...],
  "required_skills": ["skill1", "skill2", ...],
  "missing_skills": [
    {{
      "skill": "skill name",
      "priority": "high|medium|low",
      "reason": "brief explanation of why this skill is important for the role",
      "learning_resources": [
        {{
          "title": "resource title",
          "url": "https://example.com (optional)",
          "description": "brief description (optional)"
        }}
      ]
    }}
  ],
  "strong_skills": ["skill1", "skill2", ...],
  "overall_readiness_percentage": number (0-100)
}}

Guidelines:
- Extract current skills from the resume (technical skills, soft skills, tools, technologies)
- Identify required skills for the target role based on industry standards
- Categorize missing skills by priority (high: critical for the role, medium: important but not critical, low: nice to have)
- Provide 2-3 learning resources for each missing skill (courses, documentation, tutorials)
- Calculate overall readiness percentage based on how many required skills the candidate already has
- Strong skills are skills the candidate has that are highly relevant to the target role
- Return exactly 5-10 missing skills
- current_skills: all skills found in the resume
- required_skills: all skills needed for the target role
- strong_skills: subset of current_skills that are particularly valuable for the target role
- overall_readiness_percentage: calculate based on (strong_skills.length / required_skills.length) * 100, but be realistic and consider skill depth"""

        try:
            combined_prompt = f"{system_prompt}\n\n{user_prompt}"
            response = self.client.models.generate_content(
                model="gemini-3.5-flash-lite",
                contents=combined_prompt
            )

            # Clean response text to handle potential markdown code blocks
            text = response.text.strip()

            # Log the raw response for debugging
            print(f"Raw Gemini response: {text[:500]}...")

            # Handle various markdown code block formats
            if text.startswith('```json'):
                text = text[7:]
            elif text.startswith('```'):
                text = text[3:]

            if text.endswith('```'):
                text = text[:-3]

            text = text.strip()

            # Try to parse JSON
            try:
                skill_gap_data = json.loads(text)
            except json.JSONDecodeError as je:
                print(f"JSON parsing error: {str(je)}")
                print(f"Failed to parse text: {text}")
                raise ValueError(f"Invalid JSON response from AI: {str(je)}. Response text: {text[:200]}")

            # Validate the structure
            required_keys = ["current_skills", "required_skills", "missing_skills", "strong_skills", "overall_readiness_percentage"]
            for key in required_keys:
                if key not in skill_gap_data:
                    raise ValueError(f"Invalid response structure: missing '{key}' key")

            return self._sanitize_skill_gap_data(skill_gap_data)

        except Exception as e:
            print(f"Exception in analyze_skill_gap: {type(e).__name__}: {str(e)}")
            raise ValueError(f"Failed to analyze skill gap with AI: {str(e)}")

    def _sanitize_skill_gap_data(self, data: dict[str, Any]) -> dict[str, Any]:
        """Sanitize and validate skill gap data structure"""
        current_skills = [str(skill).strip() for skill in data.get("current_skills", []) if skill]
        required_skills = [str(skill).strip() for skill in data.get("required_skills", []) if skill]
        strong_skills = [str(skill).strip() for skill in data.get("strong_skills", []) if skill]

        missing_skills = []
        for missing_skill in data.get("missing_skills", [])[:10]:  # Limit to 10 missing skills
            learning_resources = []
            for resource in missing_skill.get("learning_resources", [])[:3]:  # Limit to 3 resources per skill
                learning_resources.append({
                    "title": str(resource.get("title", "")).strip(),
                    "url": str(resource.get("url", "")).strip() if resource.get("url") else None,
                    "description": str(resource.get("description", "")).strip() if resource.get("description") else None
                })

            sanitized_missing_skill = {
                "skill": str(missing_skill.get("skill", "")).strip(),
                "priority": str(missing_skill.get("priority", "medium")).strip().lower(),
                "reason": str(missing_skill.get("reason", "")).strip(),
                "learning_resources": learning_resources
            }
            if sanitized_missing_skill["skill"]:  # Only add if skill is not empty
                missing_skills.append(sanitized_missing_skill)

        # Ensure readiness percentage is within valid range
        readiness = min(100, max(0, int(data.get("overall_readiness_percentage", 0))))

        return {
            "current_skills": current_skills,
            "required_skills": required_skills,
            "missing_skills": missing_skills,
            "strong_skills": strong_skills,
            "overall_readiness_percentage": readiness
        }


# Global skill gap service instance
skill_gap_service = SkillGapService()
