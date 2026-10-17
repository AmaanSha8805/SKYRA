from pydantic import BaseModel, Field
from typing import Optional


class InterviewStartRequest(BaseModel):
    resume_id: str
    job_title: str = Field(..., min_length=1, max_length=255)
    difficulty: str = Field(..., pattern="^(easy|medium|hard)$")


class QuestionOptions(BaseModel):
    A: str
    B: str
    C: str
    D: str


class Question(BaseModel):
    id: int
    question: str
    type: str
    category: str
    options: QuestionOptions
    correct_answer: str
    explanation: str


class InterviewStartResponse(BaseModel):
    questions: list[Question]


class InterviewAnswerRequest(BaseModel):
    question: str = Field(..., min_length=1)
    selected_option: str = Field(..., pattern="^(A|B|C|D)$")
    correct_answer: str = Field(..., pattern="^(A|B|C|D)$")
    explanation: str = Field(..., min_length=1)
    question_number: Optional[int] = Field(None, ge=1)
    total_questions: Optional[int] = Field(None, ge=1)
    total_score: Optional[int] = Field(None, ge=0)
    job_title: Optional[str] = Field(None, min_length=1)


class AnswerEvaluation(BaseModel):
    is_correct: bool
    score: int
    explanation: str
    correct_answer: str


class InterviewAnswerResponse(BaseModel):
    evaluation: AnswerEvaluation