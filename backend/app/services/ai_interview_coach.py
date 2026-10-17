import json
from typing import Any

import google.genai as genai

from app.core.config import settings


class InterviewCoachService:
    """AI-powered interview coaching service using Google GenAI"""

    def __init__(self):
        if settings.gemini_api_key:
            self.client = genai.Client(api_key=settings.gemini_api_key)
        else:
            self.client = None

    async def generate_questions(
        self,
        parsed_data: dict[str, Any],
        job_title: str,
        difficulty: str
    ) -> dict[str, Any]:
        """Generate interview questions based on resume and job title"""
        if not self.client:
            raise ValueError("Gemini API key not configured")

        if not parsed_data:
            raise ValueError("Parsed resume data is required")

        system_prompt = """You are an expert interview coach and hiring manager.
Generate relevant interview questions based on a candidate's resume and the target job role.
Create a mix of technical, behavioral, and situational questions.
Return ONLY valid JSON, no additional text or markdown formatting."""

        user_prompt = f"""Generate 10 multiple-choice interview questions for a candidate applying for the position of {job_title} with {difficulty} difficulty level.

Based on the candidate's resume:
{json.dumps(parsed_data, indent=2)}

Return the result in this exact JSON format (no markdown, no code blocks):
{{
  "questions": [
    {{
      "id": number (1-10),
      "question": string (the interview question),
      "type": string ("technical", "behavioral", or "situational"),
      "category": string (e.g., "Technical Skills", "Problem Solving", "Leadership", etc.),
      "options": {{
        "A": string (option A),
        "B": string (option B),
        "C": string (option C),
        "D": string (option D)
      }},
      "correct_answer": string ("A", "B", "C", or "D"),
      "explanation": string (brief explanation of why this is the correct answer)
    }}
  ]
}}

Guidelines:
- Generate exactly 10 questions
- Mix of question types: 3-4 technical, 3-4 behavioral, 2-3 situational
- Technical questions should relate to the candidate's skills and the job requirements
- Behavioral questions should assess soft skills and past experiences
- Situational questions should present realistic work scenarios
- Each question must have exactly 4 options (A, B, C, D)
- Only one option should be correct
- Options should be plausible but clearly distinguishable
- Difficulty level:
  * Easy: Basic concepts and straightforward scenarios
  * Medium: Intermediate concepts and complex scenarios
  * Hard: Advanced concepts and challenging scenarios
- Questions should be specific and relevant to the job title
- Provide clear explanations for the correct answers"""

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
                questions_data = json.loads(text)
            except json.JSONDecodeError as je:
                print(f"JSON parsing error: {str(je)}")
                print(f"Failed to parse text: {text}")
                raise ValueError(f"Invalid JSON response from AI: {str(je)}. Response text: {text[:200]}")

            # Validate the structure
            if not isinstance(questions_data, dict) or "questions" not in questions_data:
                raise ValueError(f"Invalid response structure: missing 'questions' key. Got: {list(questions_data.keys()) if isinstance(questions_data, dict) else type(questions_data)}")

            return self._sanitize_questions_data(questions_data)

        except Exception as e:
            print(f"Exception in generate_questions: {type(e).__name__}: {str(e)}")
            raise ValueError(f"Failed to generate interview questions with AI: {str(e)}")

    async def evaluate_answer(
        self,
        question: str,
        selected_option: str,
        correct_answer: str,
        explanation: str
    ) -> dict[str, Any]:
        """Evaluate user's selected answer and provide feedback"""
        if not question or not selected_option:
            raise ValueError("Question and selected option are required")

        is_correct = selected_option.upper() == correct_answer.upper()
        score = 10 if is_correct else 0

        return {
            "is_correct": is_correct,
            "score": score,
            "explanation": explanation,
            "correct_answer": correct_answer
        }

    def _sanitize_questions_data(self, data: dict[str, Any]) -> dict[str, Any]:
        """Sanitize and validate questions data structure"""
        questions = data.get("questions", [])

        sanitized_questions = []
        for i, question in enumerate(questions[:10]):  # Limit to 10 questions
            options = question.get("options", {})
            sanitized_question = {
                "id": i + 1,
                "question": str(question.get("question", "")).strip(),
                "type": str(question.get("type", "behavioral")).strip(),
                "category": str(question.get("category", "General")).strip(),
                "options": {
                    "A": str(options.get("A", "")).strip(),
                    "B": str(options.get("B", "")).strip(),
                    "C": str(options.get("C", "")).strip(),
                    "D": str(options.get("D", "")).strip()
                },
                "correct_answer": str(question.get("correct_answer", "A")).strip().upper(),
                "explanation": str(question.get("explanation", "")).strip()
            }
            if sanitized_question["question"]:  # Only add if question is not empty
                sanitized_questions.append(sanitized_question)

        return {"questions": sanitized_questions}

    def _sanitize_evaluation_data(self, data: dict[str, Any]) -> dict[str, Any]:
        """Sanitize and validate evaluation data structure"""
        return {
            "is_correct": bool(data.get("is_correct", False)),
            "score": int(data.get("score", 0)),
            "explanation": str(data.get("explanation", "")).strip(),
            "correct_answer": str(data.get("correct_answer", "")).strip().upper()
        }


# Global interview coach service instance
interview_coach_service = InterviewCoachService()
