from fastapi import Request
from fastapi.responses import JSONResponse
from app.core.exceptions import AppException
from app.core.logging import logger


async def app_exception_handler(request: Request, exc: AppException):
    logger.error(f"AppException: {exc.message}", extra={"details": exc.details})
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "data": None,
            "errors": [exc.message],
            "meta": None,
        },
    )


async def generic_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled exception: {str(exc)}", exc_info=True)
    logger.error(f"Request URL: {request.url}")
    logger.error(f"Request method: {request.method}")
    logger.error(f"Exception type: {type(exc).__name__}")
    return JSONResponse(
        status_code=500,
        content={
            "data": None,
            "errors": ["Internal server error"],
            "meta": None,
        },
    )
