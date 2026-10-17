from fastapi import HTTPException, status
from typing import Any, Optional


class AppException(Exception):
    def __init__(
        self,
        message: str,
        status_code: int = status.HTTP_500_INTERNAL_SERVER_ERROR,
        details: Optional[Any] = None,
    ):
        self.message = message
        self.status_code = status_code
        self.details = details
        super().__init__(message)


class NotFoundException(AppException):
    def __init__(self, message: str = "Resource not found", details: Optional[Any] = None):
        super().__init__(message, status.HTTP_404_NOT_FOUND, details)


class BadRequestException(AppException):
    def __init__(self, message: str = "Bad request", details: Optional[Any] = None):
        super().__init__(message, status.HTTP_400_BAD_REQUEST, details)


class UnauthorizedException(AppException):
    def __init__(self, message: str = "Unauthorized", details: Optional[Any] = None):
        super().__init__(message, status.HTTP_401_UNAUTHORIZED, details)


class ForbiddenException(AppException):
    def __init__(self, message: str = "Forbidden", details: Optional[Any] = None):
        super().__init__(message, status.HTTP_403_FORBIDDEN, details)


class ConflictException(AppException):
    def __init__(self, message: str = "Conflict", details: Optional[Any] = None):
        super().__init__(message, status.HTTP_409_CONFLICT, details)
