"""
AI-Powered Personal Voice Assistant & Calendar Manager
Main FastAPI Application Entry Point
"""

import os
import logging
from contextlib import asynccontextmanager
from typing import List

from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from starlette.exceptions import HTTPException as StarletteHTTPException

from app.core.config import settings
from app.core.database import init_db
from app.core.logging import setup_logging
from app.api.v1.api import api_router
from app.core.middleware import (
    RequestLoggingMiddleware,
    RateLimitMiddleware,
    SecurityHeadersMiddleware
)
from app.core.socket import socket_app

# Setup logging
setup_logging()
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan events"""
    # Startup
    logger.info("Starting AI Voice Assistant API...")
    
    # Initialize database
    await init_db()
    logger.info("Database initialized successfully")
    
    # Initialize Redis connections
    from app.core.redis import init_redis
    await init_redis()
    logger.info("Redis initialized successfully")
    
    # Initialize AI services
    from app.core.ai import init_ai_services
    await init_ai_services()
    logger.info("AI services initialized successfully")
    
    yield
    
    # Shutdown
    logger.info("Shutting down AI Voice Assistant API...")
    
    # Close database connections
    from app.core.database import close_db
    await close_db()
    
    # Close Redis connections
    from app.core.redis import close_redis
    await close_redis()


def create_application() -> FastAPI:
    """Create and configure FastAPI application"""
    
    # Create FastAPI app
    app = FastAPI(
        title=settings.APP_NAME,
        version=settings.APP_VERSION,
        description="AI-Powered Personal Voice Assistant & Calendar Manager API",
        docs_url="/docs" if settings.DEBUG else None,
        redoc_url="/redoc" if settings.DEBUG else None,
        openapi_url="/openapi.json" if settings.DEBUG else None,
        lifespan=lifespan
    )
    
    # Add CORS middleware
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.CORS_ORIGINS,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
    
    # Add trusted host middleware
    app.add_middleware(
        TrustedHostMiddleware,
        allowed_hosts=settings.ALLOWED_HOSTS
    )
    
    # Add custom middleware
    app.add_middleware(SecurityHeadersMiddleware)
    app.add_middleware(RateLimitMiddleware)
    app.add_middleware(RequestLoggingMiddleware)
    
    # Include API routes
    app.include_router(api_router, prefix="/api/v1")
    
    # Mount Socket.IO app
    app.mount("/ws", socket_app)
    
    return app


# Create application instance
app = create_application()


@app.exception_handler(StarletteHTTPException)
async def http_exception_handler(request: Request, exc: StarletteHTTPException):
    """Handle HTTP exceptions"""
    logger.error(f"HTTP Exception: {exc.status_code} - {exc.detail}")
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "error": True,
            "message": exc.detail,
            "status_code": exc.status_code
        }
    )


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    """Handle validation exceptions"""
    logger.error(f"Validation Error: {exc.errors()}")
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={
            "error": True,
            "message": "Validation error",
            "details": exc.errors(),
            "status_code": 422
        }
    )


@app.exception_handler(Exception)
async def general_exception_handler(request: Request, exc: Exception):
    """Handle general exceptions"""
    logger.error(f"Unhandled Exception: {str(exc)}", exc_info=True)
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "error": True,
            "message": "Internal server error",
            "status_code": 500
        }
    )


@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "message": "AI-Powered Personal Voice Assistant & Calendar Manager API",
        "version": settings.APP_VERSION,
        "status": "healthy"
    }


@app.get("/health")
async def health_check():
    """Health check endpoint"""
    from app.core.database import get_db_health
    from app.core.redis import get_redis_health
    
    db_health = await get_db_health()
    redis_health = await get_redis_health()
    
    return {
        "status": "healthy",
        "database": db_health,
        "redis": redis_health,
        "timestamp": "2024-01-01T00:00:00Z"
    }


if __name__ == "__main__":
    import uvicorn
    
    uvicorn.run(
        "main:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=settings.DEBUG,
        workers=settings.WORKERS if not settings.DEBUG else 1,
        log_level="info"
    )
