import json
from typing import Any

import google.genai as genai

from app.core.config import settings


class CareerRoadmapService:
    """AI-powered career roadmap generation service using Google GenAI"""

    def __init__(self):
        if settings.gemini_api_key:
            self.client = genai.Client(api_key=settings.gemini_api_key)
        else:
            self.client = None

    async def generate_career_roadmap(
        self,
        parsed_data: dict[str, Any],
        target_role: str,
        timeline_months: int
    ) -> dict[str, Any]:
        """Generate a personalized career roadmap based on current skills and target role"""
        if not self.client:
            raise ValueError("Gemini API key not configured")

        if not parsed_data:
            raise ValueError("Parsed resume data is required")

        system_prompt = """You are an expert career coach and professional development strategist.
Create a personalized career roadmap that helps a candidate progress from their current position to a target role.
Provide actionable, realistic, and structured guidance.
Return ONLY valid JSON, no additional text or markdown formatting."""

        user_prompt = f"""Create a career roadmap for a candidate targeting the role of {target_role} within {timeline_months} months.

Based on the candidate's resume:
{json.dumps(parsed_data, indent=2)}

Return the result in this exact JSON format (no markdown, no code blocks):
{{
  "target_role": "{target_role}",
  "timeline_months": {timeline_months},
  "phases": [
    {{
      "phase_number": 1,
      "title": "Phase title (e.g., Foundation Building)",
      "duration": "X months",
      "goals": ["goal1", "goal2", ...],
      "skills_to_learn": ["skill1", "skill2", ...],
      "milestones": ["milestone1", "milestone2", ...]
    }}
  ],
  "overall_strategy": "Comprehensive strategy describing the overall approach to achieving the target role"
}}

Guidelines:
- Create 3-5 phases that logically progress toward the target role
- Each phase should have a realistic duration based on the total timeline
- Goals should be specific, measurable, and achievable
- Skills to learn should be prioritized based on importance for the target role
- Milestones should be concrete achievements that demonstrate progress
- The overall strategy should provide high-level guidance and motivation
- Consider the candidate's current background when designing the roadmap
- Make the roadmap challenging but achievable within the given timeline
- Skills should build upon each other across phases
- Each phase should logically lead to the next"""

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
                roadmap_data = json.loads(text)
            except json.JSONDecodeError as je:
                print(f"JSON parsing error: {str(je)}")
                print(f"Failed to parse text: {text}")
                raise ValueError(f"Invalid JSON response from AI: {str(je)}. Response text: {text[:200]}")

            # Validate the structure
            required_keys = ["target_role", "timeline_months", "phases", "overall_strategy"]
            for key in required_keys:
                if key not in roadmap_data:
                    raise ValueError(f"Invalid response structure: missing '{key}' key")

            return self._sanitize_career_roadmap_data(roadmap_data)

        except Exception as e:
            print(f"Exception in generate_career_roadmap: {type(e).__name__}: {str(e)}")
            raise ValueError(f"Failed to generate career roadmap with AI: {str(e)}")

    def _sanitize_career_roadmap_data(self, data: dict[str, Any]) -> dict[str, Any]:
        """Sanitize and validate career roadmap data structure"""
        phases = []
        for phase in data.get("phases", [])[:5]:  # Limit to 5 phases
            sanitized_phase = {
                "phase_number": int(phase.get("phase_number", len(phases) + 1)),
                "title": str(phase.get("title", "")).strip(),
                "duration": str(phase.get("duration", "")).strip(),
                "goals": [str(goal).strip() for goal in phase.get("goals", []) if goal][:5],  # Limit to 5 goals
                "skills_to_learn": [str(skill).strip() for skill in phase.get("skills_to_learn", []) if skill][:5],  # Limit to 5 skills
                "milestones": [str(milestone).strip() for milestone in phase.get("milestones", []) if milestone][:5]  # Limit to 5 milestones
            }
            if sanitized_phase["title"]:  # Only add if title is not empty
                phases.append(sanitized_phase)

        return {
            "target_role": str(data.get("target_role", "")).strip(),
            "timeline_months": int(data.get("timeline_months", 12)),
            "phases": phases,
            "overall_strategy": str(data.get("overall_strategy", "")).strip()
        }


# Global career roadmap service instance
career_roadmap_service = CareerRoadmapService()
