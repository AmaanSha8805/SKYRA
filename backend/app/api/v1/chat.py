from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, field_validator
from typing import List, Optional, Literal
from app.api.dependencies import get_current_user
from app.models.user import User
import google.genai as genai
from app.core.config import settings
import asyncio

router = APIRouter(prefix="/chat", tags=["chat"])

# Configuration limits
MAX_MESSAGE_LENGTH = 2000
MAX_HISTORY_LENGTH = 20
MAX_TOTAL_HISTORY_CHARS = 10000
API_TIMEOUT_SECONDS = 30


class ChatMessage(BaseModel):
    role: Literal["user", "model"]
    content: str

    @field_validator('content')
    @classmethod
    def validate_content_length(cls, v: str) -> str:
        if len(v) > MAX_MESSAGE_LENGTH:
            raise ValueError(f"Message content exceeds maximum length of {MAX_MESSAGE_LENGTH} characters")
        if not v.strip():
            raise ValueError("Message content cannot be empty")
        return v


class ChatRequest(BaseModel):
    message: str
    conversation_history: Optional[List[ChatMessage]] = []

    @field_validator('message')
    @classmethod
    def validate_message(cls, v: str) -> str:
        if not v or not v.strip():
            raise ValueError("Message cannot be empty")
        if len(v) > MAX_MESSAGE_LENGTH:
            raise ValueError(f"Message exceeds maximum length of {MAX_MESSAGE_LENGTH} characters")
        return v.strip()

    @field_validator('conversation_history')
    @classmethod
    def validate_history(cls, v: List[ChatMessage]) -> List[ChatMessage]:
        if len(v) > MAX_HISTORY_LENGTH:
            raise ValueError(f"Conversation history exceeds maximum of {MAX_HISTORY_LENGTH} messages")
        
        total_chars = sum(len(msg.content) for msg in v)
        if total_chars > MAX_TOTAL_HISTORY_CHARS:
            raise ValueError(f"Conversation history exceeds maximum of {MAX_TOTAL_HISTORY_CHARS} characters")
        
        return v


class ChatResponse(BaseModel):
    response: str


@router.post("", response_model=ChatResponse, status_code=status.HTTP_200_OK)
async def chat(
    request: ChatRequest,
    current_user: User = Depends(get_current_user)
):
    """Chat with SKYRA AI Assistant using Gemini AI"""
    if not settings.gemini_api_key:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="AI service not configured"
        )

    try:
        client = genai.Client(api_key=settings.gemini_api_key)

        system_prompt = """You are SKYRA AI Assistant, a helpful career intelligence assistant. SKYRA is an AI-powered career platform with features: Resume Upload & Analysis, ATS Score checker, Resume Builder, AI Job Matcher, Interview Coach (MCQ), Cover Letter Generator, Skill Gap Analyzer, Career Roadmap Generator. SKYRA was built by Amaan Shaikh, Full Stack Developer from Maharashtra, India, founder of SKYRA and Astraa.

Answer questions about SKYRA features and provide general career advice. Keep answers concise and helpful.

IMPORTANT: 
- Do NOT fabricate or assume user-specific resume data, job listings, or personal information
- When asked about resume analysis or job matching, explain the feature and how to use it
- If asked about specific resume details or job listings, clarify that you need the user to upload their resume or use the platform features
- Provide general career guidance and feature explanations based on the information provided"""

        # Build conversation history for Gemini API
        # Format: [{"role": "user", "parts": [{"text": "..."}]}, {"role": "model", "parts": [{"text": "..."}]}]
        conversation = []
        if request.conversation_history:
            for msg in request.conversation_history:
                conversation.append({"role": msg.role, "parts": [{"text": msg.content}]})

        # Add current message
        conversation.append({"role": "user", "parts": [{"text": request.message}]})

        # Generate response with timeout
        # Using gemini-3.5-flash-lite (same as existing cover letter service)
        # Combine system prompt with conversation for the model
        full_contents = system_prompt + "\n\nConversation:\n"
        for msg in conversation:
            full_contents += f"\n{msg['role']}: {msg['parts'][0]['text']}"
        
        response = await asyncio.wait_for(
            asyncio.to_thread(
                client.models.generate_content,
                model="gemini-3.5-flash-lite",
                contents=full_contents
            ),
            timeout=API_TIMEOUT_SECONDS
        )

        return ChatResponse(response=response.text.strip())

    except asyncio.TimeoutError:
        raise HTTPException(
            status_code=status.HTTP_504_GATEWAY_TIMEOUT,
            detail="AI service request timed out. Please try again."
        )
    except ValueError as e:
        # Pydantic validation errors
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        # Log error for debugging but don't expose details to client
        print(f"Exception in chat endpoint: {type(e).__name__}: {str(e)}")
        error_msg = str(e).lower()
        
        if "404" in error_msg or "not found" in error_msg:
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="AI service temporarily unavailable. Please try again later."
            )
        elif "401" in error_msg or "403" in error_msg or "unauthorized" in error_msg:
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="AI service authentication failed. Please contact support."
            )
        elif "quota" in error_msg or "limit" in error_msg:
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail="AI service rate limit exceeded. Please try again later."
            )
        else:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to generate AI response. Please try again later."
            )
