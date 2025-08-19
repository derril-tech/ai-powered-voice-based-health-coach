"""
Logging configuration and setup
"""

import logging
import sys
from typing import Any, Dict
import structlog
from structlog.stdlib import LoggerFactory

from app.core.config import settings


def setup_logging():
    """Setup structured logging configuration"""
    
    # Configure structlog
    structlog.configure(
        processors=[
            structlog.stdlib.filter_by_level,
            structlog.stdlib.add_logger_name,
            structlog.stdlib.add_log_level,
            structlog.stdlib.PositionalArgumentsFormatter(),
            structlog.processors.TimeStamper(fmt="iso"),
            structlog.processors.StackInfoRenderer(),
            structlog.processors.format_exc_info,
            structlog.processors.UnicodeDecoder(),
            structlog.processors.JSONRenderer()
        ],
        context_class=dict,
        logger_factory=LoggerFactory(),
        wrapper_class=structlog.stdlib.BoundLogger,
        cache_logger_on_first_use=True,
    )
    
    # Configure standard library logging
    logging.basicConfig(
        format="%(message)s",
        stream=sys.stdout,
        level=logging.INFO if not settings.DEBUG else logging.DEBUG,
    )
    
    # Set specific logger levels
    logging.getLogger("uvicorn").setLevel(logging.INFO)
    logging.getLogger("uvicorn.access").setLevel(logging.INFO)
    logging.getLogger("sqlalchemy.engine").setLevel(
        logging.DEBUG if settings.DEBUG else logging.WARNING
    )
    logging.getLogger("redis").setLevel(logging.WARNING)
    logging.getLogger("httpx").setLevel(logging.WARNING)
    logging.getLogger("openai").setLevel(logging.WARNING)
    logging.getLogger("anthropic").setLevel(logging.WARNING)


def get_logger(name: str) -> structlog.stdlib.BoundLogger:
    """Get structured logger instance"""
    return structlog.get_logger(name)


class LoggerMixin:
    """Mixin to add logging capabilities to classes"""
    
    @property
    def logger(self) -> structlog.stdlib.BoundLogger:
        """Get logger for this class"""
        return get_logger(self.__class__.__name__)


# Request logging middleware
class RequestLogger:
    """Request logging utility"""
    
    def __init__(self):
        self.logger = get_logger("request")
    
    def log_request(self, request_id: str, method: str, url: str, status_code: int, 
                   duration: float, user_id: str = None, **kwargs):
        """Log HTTP request"""
        self.logger.info(
            "HTTP Request",
            request_id=request_id,
            method=method,
            url=url,
            status_code=status_code,
            duration=duration,
            user_id=user_id,
            **kwargs
        )
    
    def log_error(self, request_id: str, error: Exception, **kwargs):
        """Log request error"""
        self.logger.error(
            "Request Error",
            request_id=request_id,
            error_type=type(error).__name__,
            error_message=str(error),
            **kwargs
        )


# Performance logging
class PerformanceLogger:
    """Performance logging utility"""
    
    def __init__(self):
        self.logger = get_logger("performance")
    
    def log_database_query(self, query: str, duration: float, **kwargs):
        """Log database query performance"""
        self.logger.info(
            "Database Query",
            query=query,
            duration=duration,
            **kwargs
        )
    
    def log_ai_request(self, model: str, duration: float, tokens_used: int = None, **kwargs):
        """Log AI request performance"""
        self.logger.info(
            "AI Request",
            model=model,
            duration=duration,
            tokens_used=tokens_used,
            **kwargs
        )
    
    def log_voice_processing(self, operation: str, duration: float, file_size: int = None, **kwargs):
        """Log voice processing performance"""
        self.logger.info(
            "Voice Processing",
            operation=operation,
            duration=duration,
            file_size=file_size,
            **kwargs
        )


# Security logging
class SecurityLogger:
    """Security logging utility"""
    
    def __init__(self):
        self.logger = get_logger("security")
    
    def log_authentication(self, user_id: str, success: bool, method: str, **kwargs):
        """Log authentication attempts"""
        self.logger.info(
            "Authentication",
            user_id=user_id,
            success=success,
            method=method,
            **kwargs
        )
    
    def log_authorization_failure(self, user_id: str, resource: str, **kwargs):
        """Log authorization failures"""
        self.logger.warning(
            "Authorization Failure",
            user_id=user_id,
            resource=resource,
            **kwargs
        )
    
    def log_rate_limit_exceeded(self, ip_address: str, endpoint: str, **kwargs):
        """Log rate limit violations"""
        self.logger.warning(
            "Rate Limit Exceeded",
            ip_address=ip_address,
            endpoint=endpoint,
            **kwargs
        )
    
    def log_suspicious_activity(self, activity_type: str, details: Dict[str, Any], **kwargs):
        """Log suspicious activities"""
        self.logger.warning(
            "Suspicious Activity",
            activity_type=activity_type,
            details=details,
            **kwargs
        )
