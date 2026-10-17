from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.core.logging import logger
from app.core.error_handlers import app_exception_handler, generic_exception_handler
from app.core.exceptions import AppException
from app.api.v1.router import api_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("SKYRA API starting up...")
    yield
    logger.info("SKYRA API shutting down...")


app = FastAPI(
    title="SKYRA API",
    description="AI-Powered Career Intelligence Platform",
    version="0.1.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.add_exception_handler(AppException, app_exception_handler)
app.add_exception_handler(Exception, generic_exception_handler)

app.include_router(api_router)
