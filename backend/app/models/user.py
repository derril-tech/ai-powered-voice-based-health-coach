"""
User model for authentication and user management
"""

import uuid
from datetime import datetime, timedelta
from typing import Optional, List
from sqlalchemy import Column, String, Boolean, DateTime, Text, JSON
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.core.database import Base


class User(Base):
    """User model for authentication and user management"""
    
    __tablename__ = "users"
    
    # Primary key
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    
    # Authentication fields
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    
    # Profile information
    full_name = Column(String(255), nullable=True)
    first_name = Column(String(100), nullable=True)
    last_name = Column(String(100), nullable=True)
    avatar_url = Column(String(500), nullable=True)
    
    # Account status
    is_active = Column(Boolean, default=True, nullable=False)
    is_verified = Column(Boolean, default=False, nullable=False)
    is_premium = Column(Boolean, default=False, nullable=False)
    
    # Preferences
    timezone = Column(String(50), default="UTC", nullable=False)
    language = Column(String(10), default="en", nullable=False)
    theme = Column(String(20), default="light", nullable=False)  # light, dark, auto
    
    # Voice settings
    voice_preferences = Column(JSON, nullable=True)  # Store voice settings
    speech_rate = Column(String(20), default="normal", nullable=False)  # slow, normal, fast
    voice_id = Column(String(100), nullable=True)  # Selected voice ID
    
    # Calendar integration
    google_calendar_token = Column(Text, nullable=True)
    microsoft_calendar_token = Column(Text, nullable=True)
    calendar_preferences = Column(JSON, nullable=True)
    
    # AI preferences
    ai_model_preference = Column(String(50), default="gpt-4", nullable=False)
    ai_temperature = Column(String(20), default="0.7", nullable=False)
    ai_context_length = Column(String(20), default="4000", nullable=False)
    
    # Notification settings
    email_notifications = Column(Boolean, default=True, nullable=False)
    push_notifications = Column(Boolean, default=True, nullable=False)
    voice_notifications = Column(Boolean, default=True, nullable=False)
    
    # Security
    last_login = Column(DateTime(timezone=True), nullable=True)
    login_attempts = Column(String(10), default="0", nullable=False)
    locked_until = Column(DateTime(timezone=True), nullable=True)
    
    # Metadata
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)
    
    # Relationships
    calendar_events = relationship("CalendarEvent", back_populates="user", cascade="all, delete-orphan")
    voice_sessions = relationship("VoiceSession", back_populates="user", cascade="all, delete-orphan")
    ai_sessions = relationship("AISession", back_populates="user", cascade="all, delete-orphan")
    
    def __repr__(self):
        return f"<User(id={self.id}, email={self.email}, full_name={self.full_name})>"
    
    @property
    def display_name(self) -> str:
        """Get display name for user"""
        if self.full_name:
            return self.full_name
        elif self.first_name and self.last_name:
            return f"{self.first_name} {self.last_name}"
        elif self.first_name:
            return self.first_name
        else:
            return self.email.split('@')[0]
    
    @property
    def is_locked(self) -> bool:
        """Check if user account is locked"""
        if self.locked_until and self.locked_until > datetime.utcnow():
            return True
        return False
    
    def increment_login_attempts(self):
        """Increment failed login attempts"""
        current_attempts = int(self.login_attempts or 0)
        self.login_attempts = str(current_attempts + 1)
        
        # Lock account after 5 failed attempts for 15 minutes
        if current_attempts >= 4:
            self.locked_until = datetime.utcnow() + timedelta(minutes=15)
    
    def reset_login_attempts(self):
        """Reset failed login attempts"""
        self.login_attempts = "0"
        self.locked_until = None
    
    def update_last_login(self):
        """Update last login timestamp"""
        self.last_login = datetime.utcnow()
        self.reset_login_attempts()
    
    def to_dict(self) -> dict:
        """Convert user to dictionary"""
        return {
            "id": str(self.id),
            "email": self.email,
            "full_name": self.full_name,
            "first_name": self.first_name,
            "last_name": self.last_name,
            "avatar_url": self.avatar_url,
            "is_active": self.is_active,
            "is_verified": self.is_verified,
            "is_premium": self.is_premium,
            "timezone": self.timezone,
            "language": self.language,
            "theme": self.theme,
            "voice_preferences": self.voice_preferences,
            "speech_rate": self.speech_rate,
            "voice_id": self.voice_id,
            "ai_model_preference": self.ai_model_preference,
            "ai_temperature": self.ai_temperature,
            "ai_context_length": self.ai_context_length,
            "email_notifications": self.email_notifications,
            "push_notifications": self.push_notifications,
            "voice_notifications": self.voice_notifications,
            "last_login": self.last_login.isoformat() if self.last_login else None,
            "created_at": self.created_at.isoformat(),
            "updated_at": self.updated_at.isoformat()
        }


class UserSession(Base):
    """User session model for tracking active sessions"""
    
    __tablename__ = "user_sessions"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    user_id = Column(UUID(as_uuid=True), nullable=False, index=True)
    session_token = Column(String(255), unique=True, nullable=False, index=True)
    refresh_token = Column(String(255), unique=True, nullable=False, index=True)
    device_info = Column(JSON, nullable=True)
    ip_address = Column(String(45), nullable=True)
    user_agent = Column(Text, nullable=True)
    is_active = Column(Boolean, default=True, nullable=False)
    expires_at = Column(DateTime(timezone=True), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    last_used_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)
    
    def __repr__(self):
        return f"<UserSession(id={self.id}, user_id={self.user_id}, is_active={self.is_active})>"
    
    @property
    def is_expired(self) -> bool:
        """Check if session is expired"""
        return datetime.utcnow() > self.expires_at
    
    def to_dict(self) -> dict:
        """Convert session to dictionary"""
        return {
            "id": str(self.id),
            "user_id": str(self.user_id),
            "session_token": self.session_token,
            "refresh_token": self.refresh_token,
            "device_info": self.device_info,
            "ip_address": self.ip_address,
            "user_agent": self.user_agent,
            "is_active": self.is_active,
            "expires_at": self.expires_at.isoformat(),
            "created_at": self.created_at.isoformat(),
            "last_used_at": self.last_used_at.isoformat()
        }
