"""
Calendar models for event management and calendar integration
"""

import uuid
from datetime import datetime, timedelta
from typing import Optional, List
from sqlalchemy import Column, String, Boolean, DateTime, Text, JSON, Integer, ForeignKey, Enum
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum

from app.core.database import Base


class EventStatus(str, enum.Enum):
    """Event status enumeration"""
    SCHEDULED = "scheduled"
    CONFIRMED = "confirmed"
    TENTATIVE = "tentative"
    CANCELLED = "cancelled"
    COMPLETED = "completed"


class EventType(str, enum.Enum):
    """Event type enumeration"""
    MEETING = "meeting"
    APPOINTMENT = "appointment"
    TASK = "task"
    REMINDER = "reminder"
    BIRTHDAY = "birthday"
    HOLIDAY = "holiday"
    CUSTOM = "custom"


class ReminderType(str, enum.Enum):
    """Reminder type enumeration"""
    EMAIL = "email"
    PUSH = "push"
    VOICE = "voice"
    SMS = "sms"
    CALENDAR = "calendar"


class CalendarEvent(Base):
    """Calendar event model"""
    
    __tablename__ = "calendar_events"
    
    # Primary key
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False, index=True)
    
    # Event details
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    location = Column(String(500), nullable=True)
    event_type = Column(Enum(EventType), default=EventType.MEETING, nullable=False)
    status = Column(Enum(EventStatus), default=EventStatus.SCHEDULED, nullable=False)
    
    # Time information
    start_time = Column(DateTime(timezone=True), nullable=False, index=True)
    end_time = Column(DateTime(timezone=True), nullable=False, index=True)
    all_day = Column(Boolean, default=False, nullable=False)
    timezone = Column(String(50), default="UTC", nullable=False)
    
    # Recurrence
    is_recurring = Column(Boolean, default=False, nullable=False)
    recurrence_rule = Column(Text, nullable=True)  # RRULE format
    recurrence_exceptions = Column(JSON, nullable=True)  # List of exception dates
    
    # Participants
    attendees = Column(JSON, nullable=True)  # List of attendee objects
    organizer = Column(String(255), nullable=True)
    
    # Integration
    external_id = Column(String(255), nullable=True, index=True)  # Google/Microsoft calendar ID
    external_calendar_id = Column(String(255), nullable=True)  # Source calendar ID
    external_url = Column(String(500), nullable=True)  # Link to external calendar
    
    # Voice AI specific
    voice_created = Column(Boolean, default=False, nullable=False)
    voice_command = Column(Text, nullable=True)  # Original voice command
    ai_processed = Column(Boolean, default=False, nullable=False)
    ai_summary = Column(Text, nullable=True)  # AI-generated summary
    
    # Metadata
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)
    
    # Relationships
    user = relationship("User", back_populates="calendar_events")
    reminders = relationship("EventReminder", back_populates="event", cascade="all, delete-orphan")
    
    def __repr__(self):
        return f"<CalendarEvent(id={self.id}, title={self.title}, start_time={self.start_time})>"
    
    @property
    def duration_minutes(self) -> int:
        """Get event duration in minutes"""
        if self.all_day:
            return 1440  # 24 hours
        return int((self.end_time - self.start_time).total_seconds() / 60)
    
    @property
    def is_past(self) -> bool:
        """Check if event is in the past"""
        return self.end_time < datetime.utcnow()
    
    @property
    def is_upcoming(self) -> bool:
        """Check if event is upcoming (within next 24 hours)"""
        now = datetime.utcnow()
        return self.start_time > now and self.start_time <= now + timedelta(days=1)
    
    @property
    def is_today(self) -> bool:
        """Check if event is today"""
        now = datetime.utcnow()
        return (self.start_time.date() == now.date() or 
                self.end_time.date() == now.date())
    
    def to_dict(self) -> dict:
        """Convert event to dictionary"""
        return {
            "id": str(self.id),
            "user_id": str(self.user_id),
            "title": self.title,
            "description": self.description,
            "location": self.location,
            "event_type": self.event_type.value,
            "status": self.status.value,
            "start_time": self.start_time.isoformat(),
            "end_time": self.end_time.isoformat(),
            "all_day": self.all_day,
            "timezone": self.timezone,
            "is_recurring": self.is_recurring,
            "recurrence_rule": self.recurrence_rule,
            "recurrence_exceptions": self.recurrence_exceptions,
            "attendees": self.attendees,
            "organizer": self.organizer,
            "external_id": self.external_id,
            "external_calendar_id": self.external_calendar_id,
            "external_url": self.external_url,
            "voice_created": self.voice_created,
            "voice_command": self.voice_command,
            "ai_processed": self.ai_processed,
            "ai_summary": self.ai_summary,
            "duration_minutes": self.duration_minutes,
            "is_past": self.is_past,
            "is_upcoming": self.is_upcoming,
            "is_today": self.is_today,
            "created_at": self.created_at.isoformat(),
            "updated_at": self.updated_at.isoformat()
        }


class EventReminder(Base):
    """Event reminder model"""
    
    __tablename__ = "event_reminders"
    
    # Primary key
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    event_id = Column(UUID(as_uuid=True), ForeignKey("calendar_events.id"), nullable=False, index=True)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False, index=True)
    
    # Reminder details
    reminder_type = Column(Enum(ReminderType), nullable=False)
    reminder_time = Column(DateTime(timezone=True), nullable=False, index=True)
    message = Column(Text, nullable=True)
    
    # Status
    is_sent = Column(Boolean, default=False, nullable=False)
    sent_at = Column(DateTime(timezone=True), nullable=True)
    is_dismissed = Column(Boolean, default=False, nullable=False)
    dismissed_at = Column(DateTime(timezone=True), nullable=True)
    
    # Voice AI specific
    voice_reminder = Column(Boolean, default=False, nullable=False)
    voice_message = Column(Text, nullable=True)
    
    # Metadata
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)
    
    # Relationships
    event = relationship("CalendarEvent", back_populates="reminders")
    
    def __repr__(self):
        return f"<EventReminder(id={self.id}, event_id={self.event_id}, reminder_time={self.reminder_time})>"
    
    @property
    def is_overdue(self) -> bool:
        """Check if reminder is overdue"""
        return self.reminder_time < datetime.utcnow() and not self.is_sent
    
    @property
    def is_upcoming(self) -> bool:
        """Check if reminder is upcoming (within next hour)"""
        now = datetime.utcnow()
        return (self.reminder_time > now and 
                self.reminder_time <= now + timedelta(hours=1) and 
                not self.is_sent)
    
    def mark_sent(self):
        """Mark reminder as sent"""
        self.is_sent = True
        self.sent_at = datetime.utcnow()
    
    def dismiss(self):
        """Dismiss reminder"""
        self.is_dismissed = True
        self.dismissed_at = datetime.utcnow()
    
    def to_dict(self) -> dict:
        """Convert reminder to dictionary"""
        return {
            "id": str(self.id),
            "event_id": str(self.event_id),
            "user_id": str(self.user_id),
            "reminder_type": self.reminder_type.value,
            "reminder_time": self.reminder_time.isoformat(),
            "message": self.message,
            "is_sent": self.is_sent,
            "sent_at": self.sent_at.isoformat() if self.sent_at else None,
            "is_dismissed": self.is_dismissed,
            "dismissed_at": self.dismissed_at.isoformat() if self.dismissed_at else None,
            "voice_reminder": self.voice_reminder,
            "voice_message": self.voice_message,
            "is_overdue": self.is_overdue,
            "is_upcoming": self.is_upcoming,
            "created_at": self.created_at.isoformat(),
            "updated_at": self.updated_at.isoformat()
        }


class CalendarIntegration(Base):
    """Calendar integration model for external calendar connections"""
    
    __tablename__ = "calendar_integrations"
    
    # Primary key
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False, index=True)
    
    # Integration details
    provider = Column(String(50), nullable=False)  # google, microsoft, apple
    calendar_id = Column(String(255), nullable=False)
    calendar_name = Column(String(255), nullable=False)
    calendar_color = Column(String(7), nullable=True)  # Hex color code
    
    # Authentication
    access_token = Column(Text, nullable=False)
    refresh_token = Column(Text, nullable=True)
    token_expires_at = Column(DateTime(timezone=True), nullable=True)
    
    # Settings
    is_active = Column(Boolean, default=True, nullable=False)
    sync_enabled = Column(Boolean, default=True, nullable=False)
    sync_direction = Column(String(20), default="bidirectional", nullable=False)  # inbound, outbound, bidirectional
    
    # Last sync
    last_sync_at = Column(DateTime(timezone=True), nullable=True)
    sync_status = Column(String(20), default="pending", nullable=False)  # pending, success, failed
    
    # Metadata
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)
    
    def __repr__(self):
        return f"<CalendarIntegration(id={self.id}, provider={self.provider}, calendar_name={self.calendar_name})>"
    
    @property
    def is_token_expired(self) -> bool:
        """Check if access token is expired"""
        if not self.token_expires_at:
            return False
        return self.token_expires_at < datetime.utcnow()
    
    def to_dict(self) -> dict:
        """Convert integration to dictionary"""
        return {
            "id": str(self.id),
            "user_id": str(self.user_id),
            "provider": self.provider,
            "calendar_id": self.calendar_id,
            "calendar_name": self.calendar_name,
            "calendar_color": self.calendar_color,
            "is_active": self.is_active,
            "sync_enabled": self.sync_enabled,
            "sync_direction": self.sync_direction,
            "last_sync_at": self.last_sync_at.isoformat() if self.last_sync_at else None,
            "sync_status": self.sync_status,
            "is_token_expired": self.is_token_expired,
            "created_at": self.created_at.isoformat(),
            "updated_at": self.updated_at.isoformat()
        }
