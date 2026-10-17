from pydantic import BaseModel
from typing import Generic, TypeVar, Optional, List

T = TypeVar("T")


class ApiResponse(BaseModel, Generic[T]):
    data: Optional[T] = None
    errors: Optional[List[str]] = None
    meta: Optional[dict] = None


class HealthResponse(BaseModel):
    status: str
    version: str
