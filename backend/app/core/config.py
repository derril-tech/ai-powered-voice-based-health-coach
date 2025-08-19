"""
Application configuration settings using Pydantic Settings
"""

import os
from typing import List, Optional
from pydantic import BaseSettings, validator
from pydantic_settings import BaseSettings as PydanticBaseSettings


class Settings(PydanticBaseSettings):
    """Application settings"""
    
    # Application Settings
    APP_NAME: str = "AI Voice Assistant API"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = False
    ENVIRONMENT: str = "production"
    
    # Server Configuration
    HOST: str = "0.0.0.0"
    PORT: int = 8000
    WORKERS: int = 4
    
    # Database Configuration
    DATABASE_URL: str
    DATABASE_URL_SYNC: str
    DATABASE_POOL_SIZE: int = 20
    DATABASE_MAX_OVERFLOW: int = 30
    
    # Redis Configuration
    REDIS_URL: str = "redis://localhost:6379/0"
    REDIS_PASSWORD: Optional[str] = None
    REDIS_DB: int = 0
    
    # JWT Authentication
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    
    # AI Services Configuration
    OPENAI_API_KEY: str
    ANTHROPIC_API_KEY: str
    OPENAI_MODEL: str = "gpt-4"
    ANTHROPIC_MODEL: str = "claude-3-sonnet-20240229"
    
    # Voice Processing Services
    AZURE_SPEECH_KEY: Optional[str] = None
    AZURE_SPEECH_REGION: Optional[str] = None
    GOOGLE_CLOUD_CREDENTIALS: Optional[str] = None
    
    # Calendar Integration
    GOOGLE_CLIENT_ID: Optional[str] = None
    GOOGLE_CLIENT_SECRET: Optional[str] = None
    GOOGLE_REDIRECT_URI: str = "http://localhost:3000/auth/google/callback"
    MICROSOFT_CLIENT_ID: Optional[str] = None
    MICROSOFT_CLIENT_SECRET: Optional[str] = None
    MICROSOFT_REDIRECT_URI: str = "http://localhost:3000/auth/microsoft/callback"
    
    # Email Configuration
    SENDGRID_API_KEY: Optional[str] = None
    SENDGRID_FROM_EMAIL: str = "noreply@yourdomain.com"
    SENDGRID_FROM_NAME: str = "AI Voice Assistant"
    
    # File Storage
    AWS_ACCESS_KEY_ID: Optional[str] = None
    AWS_SECRET_ACCESS_KEY: Optional[str] = None
    AWS_REGION: str = "us-east-1"
    AWS_S3_BUCKET: Optional[str] = None
    CLOUDINARY_CLOUD_NAME: Optional[str] = None
    CLOUDINARY_API_KEY: Optional[str] = None
    CLOUDINARY_API_SECRET: Optional[str] = None
    
    # Monitoring and Analytics
    SENTRY_DSN: Optional[str] = None
    POSTHOG_API_KEY: Optional[str] = None
    POSTHOG_HOST: str = "https://app.posthog.com"
    
    # Security
    CORS_ORIGINS: List[str] = ["http://localhost:3000", "https://yourdomain.com"]
    ALLOWED_HOSTS: List[str] = ["localhost", "127.0.0.1", "yourdomain.com"]
    RATE_LIMIT_PER_MINUTE: int = 60
    
    # WebSocket Configuration
    SOCKET_CORS_ORIGINS: List[str] = ["http://localhost:3000", "https://yourdomain.com"]
    
    # Background Tasks
    CELERY_BROKER_URL: str = "redis://localhost:6379/1"
    CELERY_RESULT_BACKEND: str = "redis://localhost:6379/2"
    
    # Voice Processing Settings
    MAX_AUDIO_FILE_SIZE: int = 10485760  # 10MB
    SUPPORTED_AUDIO_FORMATS: List[str] = ["wav", "mp3", "m4a", "flac"]
    VOICE_RECOGNITION_TIMEOUT: int = 30
    VOICE_SYNTHESIS_TIMEOUT: int = 30
    
    # AI Processing Settings
    MAX_TOKENS: int = 4000
    TEMPERATURE: float = 0.7
    TOP_P: float = 0.9
    FREQUENCY_PENALTY: float = 0.0
    PRESENCE_PENALTY: float = 0.0
    
    # Calendar Settings
    DEFAULT_TIMEZONE: str = "UTC"
    WORKING_HOURS_START: str = "09:00"
    WORKING_HOURS_END: str = "17:00"
    DEFAULT_MEETING_DURATION: int = 30
    BUFFER_TIME_MINUTES: int = 15
    
    @validator("CORS_ORIGINS", "ALLOWED_HOSTS", "SOCKET_CORS_ORIGINS", pre=True)
    def parse_list_fields(cls, v):
        """Parse list fields from environment variables"""
        if isinstance(v, str):
            return [item.strip() for item in v.split(",")]
        return v
    
    @validator("SUPPORTED_AUDIO_FORMATS", pre=True)
    def parse_audio_formats(cls, v):
        """Parse audio formats from environment variables"""
        if isinstance(v, str):
            return [item.strip().lower() for item in v.split(",")]
        return v
    
    class Config:
        env_file = ".env"
        case_sensitive = True


# Create settings instance
settings = Settings()
