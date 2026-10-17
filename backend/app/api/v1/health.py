from fastapi import APIRouter
from app.schemas.common import HealthResponse, ApiResponse

router = APIRouter()


@router.get("/health", response_model=ApiResponse[HealthResponse])
async def health_check():
    """Health check endpoint."""
    return ApiResponse[HealthResponse](
        data=HealthResponse(status="healthy", version="0.1.0"),
        errors=None,
        meta=None,
    )
