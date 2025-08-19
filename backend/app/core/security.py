"""
Security and authentication utilities
"""

import logging
from datetime import datetime, timedelta
from typing import Optional, Union
from jose import JWTError, jwt
from passlib.context import CryptContext
from fastapi import HTTPException, status, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

from app.core.config import settings
from app.core.logging import SecurityLogger

logger = logging.getLogger(__name__)
security_logger = SecurityLogger()

# Password hashing context
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# JWT token scheme
security = HTTPBearer()


class SecurityService:
    """Security service for authentication and authorization"""
    
    @staticmethod
    def verify_password(plain_password: str, hashed_password: str) -> bool:
        """Verify a password against its hash"""
        return pwd_context.verify(plain_password, hashed_password)
    
    @staticmethod
    def get_password_hash(password: str) -> str:
        """Generate password hash"""
        return pwd_context.hash(password)
    
    @staticmethod
    def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
        """Create JWT access token"""
        to_encode = data.copy()
        if expires_delta:
            expire = datetime.utcnow() + expires_delta
        else:
            expire = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
        
        to_encode.update({"exp": expire})
        encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
        return encoded_jwt
    
    @staticmethod
    def create_refresh_token(data: dict) -> str:
        """Create JWT refresh token"""
        to_encode = data.copy()
        expire = datetime.utcnow() + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
        to_encode.update({"exp": expire, "type": "refresh"})
        encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
        return encoded_jwt
    
    @staticmethod
    def verify_token(token: str) -> dict:
        """Verify and decode JWT token"""
        try:
            payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
            return payload
        except JWTError as e:
            logger.error(f"JWT verification failed: {e}")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Could not validate credentials",
                headers={"WWW-Authenticate": "Bearer"},
            )
    
    @staticmethod
    def get_current_user_id(credentials: HTTPAuthorizationCredentials = Depends(security)) -> str:
        """Get current user ID from JWT token"""
        try:
            payload = SecurityService.verify_token(credentials.credentials)
            user_id: str = payload.get("sub")
            if user_id is None:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Could not validate credentials",
                    headers={"WWW-Authenticate": "Bearer"},
                )
            return user_id
        except Exception as e:
            security_logger.log_authorization_failure(
                user_id="unknown",
                resource="token_verification",
                error=str(e)
            )
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Could not validate credentials",
                headers={"WWW-Authenticate": "Bearer"},
            )
    
    @staticmethod
    def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
        """Get current user from JWT token"""
        # This would typically fetch the user from database
        # For now, return the user ID
        user_id = SecurityService.get_current_user_id(credentials)
        return {"id": user_id}
    
    @staticmethod
    def check_permissions(user_id: str, resource: str, action: str) -> bool:
        """Check if user has permission for specific resource and action"""
        # Implement role-based access control (RBAC) here
        # For now, return True for all authenticated users
        return True
    
    @staticmethod
    def require_permission(resource: str, action: str):
        """Decorator to require specific permission"""
        def permission_checker(current_user = Depends(SecurityService.get_current_user)):
            user_id = current_user.get("id")
            if not SecurityService.check_permissions(user_id, resource, action):
                security_logger.log_authorization_failure(
                    user_id=user_id,
                    resource=f"{resource}:{action}"
                )
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Insufficient permissions"
                )
            return current_user
        return permission_checker


# Rate limiting utilities
class RateLimiter:
    """Rate limiting utilities"""
    
    @staticmethod
    async def check_rate_limit(user_id: str, endpoint: str, limit: int = 60) -> bool:
        """Check if user has exceeded rate limit"""
        from app.core.redis import get_redis, increment_rate_limit
        
        try:
            redis = await get_redis()
            key = f"rate_limit:{user_id}:{endpoint}"
            current_count = await increment_rate_limit(key, limit)
            
            if current_count > limit:
                security_logger.log_rate_limit_exceeded(
                    ip_address=user_id,
                    endpoint=endpoint
                )
                return False
            return True
        except Exception as e:
            logger.error(f"Rate limiting error: {e}")
            return True  # Allow request if rate limiting fails
    
    @staticmethod
    def rate_limit(limit: int = 60):
        """Decorator for rate limiting"""
        async def rate_limit_checker(current_user = Depends(SecurityService.get_current_user)):
            user_id = current_user.get("id")
            if not await RateLimiter.check_rate_limit(user_id, "api", limit):
                raise HTTPException(
                    status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                    detail="Rate limit exceeded"
                )
            return current_user
        return rate_limit_checker


# Input validation utilities
class InputValidator:
    """Input validation utilities"""
    
    @staticmethod
    def sanitize_string(input_string: str) -> str:
        """Sanitize string input"""
        if not input_string:
            return ""
        
        # Remove potentially dangerous characters
        dangerous_chars = ['<', '>', '"', "'", '&', 'script', 'javascript']
        sanitized = input_string
        for char in dangerous_chars:
            sanitized = sanitized.replace(char, '')
        
        return sanitized.strip()
    
    @staticmethod
    def validate_email(email: str) -> bool:
        """Validate email format"""
        import re
        pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
        return re.match(pattern, email) is not None
    
    @staticmethod
    def validate_password_strength(password: str) -> dict:
        """Validate password strength"""
        errors = []
        
        if len(password) < 8:
            errors.append("Password must be at least 8 characters long")
        
        if not any(c.isupper() for c in password):
            errors.append("Password must contain at least one uppercase letter")
        
        if not any(c.islower() for c in password):
            errors.append("Password must contain at least one lowercase letter")
        
        if not any(c.isdigit() for c in password):
            errors.append("Password must contain at least one number")
        
        if not any(c in "!@#$%^&*()_+-=[]{}|;:,.<>?" for c in password):
            errors.append("Password must contain at least one special character")
        
        return {
            "valid": len(errors) == 0,
            "errors": errors
        }


# Security middleware
class SecurityMiddleware:
    """Security middleware for additional protection"""
    
    @staticmethod
    def add_security_headers(response):
        """Add security headers to response"""
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["X-XSS-Protection"] = "1; mode=block"
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
        response.headers["Content-Security-Policy"] = "default-src 'self'"
        response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
        return response
    
    @staticmethod
    def validate_request_origin(request):
        """Validate request origin"""
        origin = request.headers.get("origin")
        if origin and origin not in settings.CORS_ORIGINS:
            security_logger.log_suspicious_activity(
                activity_type="invalid_origin",
                details={"origin": origin, "allowed_origins": settings.CORS_ORIGINS}
            )
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Invalid origin"
            )
