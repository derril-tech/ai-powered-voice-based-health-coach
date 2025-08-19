"""
Custom middleware for request processing, rate limiting, and security
"""

import time
import uuid
from typing import Callable
from fastapi import Request, Response
from fastapi.middleware.base import BaseHTTPMiddleware
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import JSONResponse

from app.core.config import settings
from app.core.redis import get_redis, increment_rate_limit
from app.core.logging import RequestLogger, SecurityLogger


class RequestLoggingMiddleware(BaseHTTPMiddleware):
    """Middleware for logging all requests"""
    
    def __init__(self, app):
        super().__init__(app)
        self.request_logger = RequestLogger()
    
    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        # Generate request ID
        request_id = str(uuid.uuid4())
        request.state.request_id = request_id
        
        # Start timing
        start_time = time.time()
        
        # Get user ID if authenticated
        user_id = None
        if hasattr(request.state, "user"):
            user_id = request.state.user.id
        
        try:
            # Process request
            response = await call_next(request)
            
            # Calculate duration
            duration = time.time() - start_time
            
            # Log request
            self.request_logger.log_request(
                request_id=request_id,
                method=request.method,
                url=str(request.url),
                status_code=response.status_code,
                duration=duration,
                user_id=user_id,
                user_agent=request.headers.get("user-agent"),
                ip_address=request.client.host if request.client else None
            )
            
            return response
            
        except Exception as e:
            # Calculate duration
            duration = time.time() - start_time
            
            # Log error
            self.request_logger.log_error(
                request_id=request_id,
                error=e,
                method=request.method,
                url=str(request.url),
                duration=duration,
                user_id=user_id
            )
            raise


class RateLimitMiddleware(BaseHTTPMiddleware):
    """Middleware for rate limiting"""
    
    def __init__(self, app):
        super().__init__(app)
        self.security_logger = SecurityLogger()
    
    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        # Get client IP
        client_ip = request.client.host if request.client else "unknown"
        
        # Create rate limit key
        rate_limit_key = f"rate_limit:{client_ip}:{request.url.path}"
        
        try:
            # Get Redis client
            redis = await get_redis()
            
            # Check rate limit
            current_count = await increment_rate_limit(rate_limit_key, 60)
            
            if current_count > settings.RATE_LIMIT_PER_MINUTE:
                # Log rate limit violation
                self.security_logger.log_rate_limit_exceeded(
                    ip_address=client_ip,
                    endpoint=request.url.path
                )
                
                return JSONResponse(
                    status_code=429,
                    content={
                        "error": True,
                        "message": "Rate limit exceeded",
                        "retry_after": 60
                    }
                )
            
            # Add rate limit headers
            response = await call_next(request)
            response.headers["X-RateLimit-Limit"] = str(settings.RATE_LIMIT_PER_MINUTE)
            response.headers["X-RateLimit-Remaining"] = str(settings.RATE_LIMIT_PER_MINUTE - current_count)
            response.headers["X-RateLimit-Reset"] = str(int(time.time()) + 60)
            
            return response
            
        except Exception as e:
            # If Redis is unavailable, allow request but log error
            self.security_logger.logger.error(f"Rate limiting error: {e}")
            return await call_next(request)


class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    """Middleware for adding security headers"""
    
    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        response = await call_next(request)
        
        # Add security headers
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["X-XSS-Protection"] = "1; mode=block"
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
        response.headers["Content-Security-Policy"] = "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline';"
        response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
        response.headers["Permissions-Policy"] = "geolocation=(), microphone=(), camera=()"
        
        return response


class CORSMiddleware(BaseHTTPMiddleware):
    """Custom CORS middleware"""
    
    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        response = await call_next(request)
        
        # Add CORS headers
        origin = request.headers.get("origin")
        if origin in settings.CORS_ORIGINS:
            response.headers["Access-Control-Allow-Origin"] = origin
            response.headers["Access-Control-Allow-Credentials"] = "true"
            response.headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, DELETE, OPTIONS"
            response.headers["Access-Control-Allow-Headers"] = "Content-Type, Authorization, X-Requested-With"
        
        return response
