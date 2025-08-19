"""
Voice models for voice sessions, speech recognition, and voice processing
"""

import uuid
from datetime import datetime
from typing import Optional, List
from sqlalchemy import Column, String, Boolean, DateTime, Text, JSON, Integer, ForeignKey, Enum, Float
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum

from app.core.database import Base


class VoiceSessionStatus(str, enum.Enum):
    """Voice session status enumeration"""
    INITIATED = "initiated"
    LISTENING = "listening"
    PROCESSING = "processing"
    RESPONDING = "responding"
    COMPLETED = "completed"
    FAILED = "failed"
    CANCELLED = "cancelled"


class SpeechRecognitionStatus(str, enum.Enum):
    """Speech recognition status enumeration"""
    PENDING = "pending"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"
    PARTIAL = "partial"


class VoiceSession(Base):
    """Voice session model for tracking voice interactions"""
    
    __tablename__ = "voice_sessions"
    
    # Primary key
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False, index=True)
    
    # Session details
    session_id = Column(String(255), unique=True, nullable=False, index=True)
    status = Column(Enum(VoiceSessionStatus), default=VoiceSessionStatus.INITIATED, nullable=False)
    
    # Voice input
    audio_file_path = Column(String(500), nullable=True)
    audio_duration = Column(Float, nullable=True)  # Duration in seconds
    audio_format = Column(String(20), nullable=True)  # mp3, wav, m4a, etc.
    audio_quality = Column(String(20), nullable=True)  # low, medium, high
    
    # Speech recognition
    original_transcript = Column(Text, nullable=True)
    processed_transcript = Column(Text, nullable=True)
    confidence_score = Column(Float, nullable=True)  # 0.0 to 1.0
    language_detected = Column(String(10), nullable=True)  # en, es, fr, etc.
    
    # AI processing
    ai_model_used = Column(String(50), nullable=True)
    ai_response = Column(Text, nullable=True)
    ai_processing_time = Column(Float, nullable=True)  # Time in seconds
    ai_tokens_used = Column(Integer, nullable=True)
    
    # Voice output
    response_audio_path = Column(String(500), nullable=True)
    response_duration = Column(Float, nullable=True)
    voice_id_used = Column(String(100), nullable=True)
    speech_rate_used = Column(String(20), nullable=True)
    
    # Context and metadata
    context_data = Column(JSON, nullable=True)  # Session context
    device_info = Column(JSON, nullable=True)  # Device information
    location_data = Column(JSON, nullable=True)  # Location if available
    
    # Error handling
    error_message = Column(Text, nullable=True)
    error_code = Column(String(50), nullable=True)
    retry_count = Column(Integer, default=0, nullable=False)
    
    # Performance metrics
    total_processing_time = Column(Float, nullable=True)
    network_latency = Column(Float, nullable=True)
    memory_usage = Column(Float, nullable=True)
    
    # Metadata
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)
    completed_at = Column(DateTime(timezone=True), nullable=True)
    
    # Relationships
    user = relationship("User", back_populates="voice_sessions")
    speech_recognitions = relationship("SpeechRecognition", back_populates="voice_session", cascade="all, delete-orphan")
    voice_commands = relationship("VoiceCommand", back_populates="voice_session", cascade="all, delete-orphan")
    
    def __repr__(self):
        return f"<VoiceSession(id={self.id}, session_id={self.session_id}, status={self.status})>"
    
    @property
    def duration_seconds(self) -> Optional[float]:
        """Get total session duration in seconds"""
        if self.completed_at and self.created_at:
            return (self.completed_at - self.created_at).total_seconds()
        return None
    
    @property
    def is_active(self) -> bool:
        """Check if session is currently active"""
        return self.status in [
            VoiceSessionStatus.INITIATED,
            VoiceSessionStatus.LISTENING,
            VoiceSessionStatus.PROCESSING,
            VoiceSessionStatus.RESPONDING
        ]
    
    @property
    def is_completed(self) -> bool:
        """Check if session is completed"""
        return self.status == VoiceSessionStatus.COMPLETED
    
    @property
    def is_failed(self) -> bool:
        """Check if session failed"""
        return self.status == VoiceSessionStatus.FAILED
    
    def mark_completed(self):
        """Mark session as completed"""
        self.status = VoiceSessionStatus.COMPLETED
        self.completed_at = datetime.utcnow()
    
    def mark_failed(self, error_message: str, error_code: str = None):
        """Mark session as failed"""
        self.status = VoiceSessionStatus.FAILED
        self.error_message = error_message
        self.error_code = error_code
        self.completed_at = datetime.utcnow()
    
    def to_dict(self) -> dict:
        """Convert session to dictionary"""
        return {
            "id": str(self.id),
            "user_id": str(self.user_id),
            "session_id": self.session_id,
            "status": self.status.value,
            "audio_file_path": self.audio_file_path,
            "audio_duration": self.audio_duration,
            "audio_format": self.audio_format,
            "audio_quality": self.audio_quality,
            "original_transcript": self.original_transcript,
            "processed_transcript": self.processed_transcript,
            "confidence_score": self.confidence_score,
            "language_detected": self.language_detected,
            "ai_model_used": self.ai_model_used,
            "ai_response": self.ai_response,
            "ai_processing_time": self.ai_processing_time,
            "ai_tokens_used": self.ai_tokens_used,
            "response_audio_path": self.response_audio_path,
            "response_duration": self.response_duration,
            "voice_id_used": self.voice_id_used,
            "speech_rate_used": self.speech_rate_used,
            "context_data": self.context_data,
            "device_info": self.device_info,
            "location_data": self.location_data,
            "error_message": self.error_message,
            "error_code": self.error_code,
            "retry_count": self.retry_count,
            "total_processing_time": self.total_processing_time,
            "network_latency": self.network_latency,
            "memory_usage": self.memory_usage,
            "duration_seconds": self.duration_seconds,
            "is_active": self.is_active,
            "is_completed": self.is_completed,
            "is_failed": self.is_failed,
            "created_at": self.created_at.isoformat(),
            "updated_at": self.updated_at.isoformat(),
            "completed_at": self.completed_at.isoformat() if self.completed_at else None
        }


class SpeechRecognition(Base):
    """Speech recognition model for tracking recognition attempts"""
    
    __tablename__ = "speech_recognitions"
    
    # Primary key
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    voice_session_id = Column(UUID(as_uuid=True), ForeignKey("voice_sessions.id"), nullable=False, index=True)
    
    # Recognition details
    status = Column(Enum(SpeechRecognitionStatus), default=SpeechRecognitionStatus.PENDING, nullable=False)
    transcript = Column(Text, nullable=True)
    confidence_score = Column(Float, nullable=True)
    language_detected = Column(String(10), nullable=True)
    
    # Audio information
    audio_segment_path = Column(String(500), nullable=True)
    segment_start = Column(Float, nullable=True)  # Start time in seconds
    segment_end = Column(Float, nullable=True)    # End time in seconds
    segment_duration = Column(Float, nullable=True)
    
    # Processing details
    recognition_service = Column(String(50), nullable=True)  # google, azure, openai, etc.
    processing_time = Column(Float, nullable=True)
    model_version = Column(String(50), nullable=True)
    
    # Alternative results
    alternative_transcripts = Column(JSON, nullable=True)  # List of alternative transcriptions
    word_timings = Column(JSON, nullable=True)  # Word-level timing information
    
    # Error handling
    error_message = Column(Text, nullable=True)
    error_code = Column(String(50), nullable=True)
    
    # Metadata
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)
    
    # Relationships
    voice_session = relationship("VoiceSession", back_populates="speech_recognitions")
    
    def __repr__(self):
        return f"<SpeechRecognition(id={self.id}, status={self.status}, confidence={self.confidence_score})>"
    
    @property
    def is_successful(self) -> bool:
        """Check if recognition was successful"""
        return self.status == SpeechRecognitionStatus.COMPLETED and self.confidence_score and self.confidence_score > 0.5
    
    @property
    def is_high_confidence(self) -> bool:
        """Check if recognition has high confidence"""
        return self.confidence_score and self.confidence_score > 0.8
    
    def to_dict(self) -> dict:
        """Convert recognition to dictionary"""
        return {
            "id": str(self.id),
            "voice_session_id": str(self.voice_session_id),
            "status": self.status.value,
            "transcript": self.transcript,
            "confidence_score": self.confidence_score,
            "language_detected": self.language_detected,
            "audio_segment_path": self.audio_segment_path,
            "segment_start": self.segment_start,
            "segment_end": self.segment_end,
            "segment_duration": self.segment_duration,
            "recognition_service": self.recognition_service,
            "processing_time": self.processing_time,
            "model_version": self.model_version,
            "alternative_transcripts": self.alternative_transcripts,
            "word_timings": self.word_timings,
            "error_message": self.error_message,
            "error_code": self.error_code,
            "is_successful": self.is_successful,
            "is_high_confidence": self.is_high_confidence,
            "created_at": self.created_at.isoformat(),
            "updated_at": self.updated_at.isoformat()
        }


class VoiceCommand(Base):
    """Voice command model for tracking parsed commands"""
    
    __tablename__ = "voice_commands"
    
    # Primary key
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    voice_session_id = Column(UUID(as_uuid=True), ForeignKey("voice_sessions.id"), nullable=False, index=True)
    
    # Command details
    command_type = Column(String(100), nullable=False)  # calendar, reminder, query, etc.
    command_action = Column(String(100), nullable=False)  # create, update, delete, get, etc.
    original_text = Column(Text, nullable=False)
    parsed_command = Column(JSON, nullable=True)  # Structured command data
    
    # Intent recognition
    intent_confidence = Column(Float, nullable=True)
    entities_extracted = Column(JSON, nullable=True)  # Named entities
    slots_filled = Column(JSON, nullable=True)  # Filled slots
    
    # Processing
    processing_status = Column(String(20), default="pending", nullable=False)  # pending, processing, completed, failed
    processing_result = Column(JSON, nullable=True)
    processing_time = Column(Float, nullable=True)
    
    # Context
    context_data = Column(JSON, nullable=True)
    user_preferences = Column(JSON, nullable=True)
    
    # Error handling
    error_message = Column(Text, nullable=True)
    error_code = Column(String(50), nullable=True)
    
    # Metadata
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)
    
    # Relationships
    voice_session = relationship("VoiceSession", back_populates="voice_commands")
    
    def __repr__(self):
        return f"<VoiceCommand(id={self.id}, command_type={self.command_type}, action={self.command_action})>"
    
    @property
    def is_processed(self) -> bool:
        """Check if command has been processed"""
        return self.processing_status in ["completed", "failed"]
    
    @property
    def is_successful(self) -> bool:
        """Check if command processing was successful"""
        return self.processing_status == "completed" and not self.error_message
    
    def to_dict(self) -> dict:
        """Convert command to dictionary"""
        return {
            "id": str(self.id),
            "voice_session_id": str(self.voice_session_id),
            "command_type": self.command_type,
            "command_action": self.command_action,
            "original_text": self.original_text,
            "parsed_command": self.parsed_command,
            "intent_confidence": self.intent_confidence,
            "entities_extracted": self.entities_extracted,
            "slots_filled": self.slots_filled,
            "processing_status": self.processing_status,
            "processing_result": self.processing_result,
            "processing_time": self.processing_time,
            "context_data": self.context_data,
            "user_preferences": self.user_preferences,
            "error_message": self.error_message,
            "error_code": self.error_code,
            "is_processed": self.is_processed,
            "is_successful": self.is_successful,
            "created_at": self.created_at.isoformat(),
            "updated_at": self.updated_at.isoformat()
        }
