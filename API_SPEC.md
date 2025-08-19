# 🔌 API SPECIFICATION
## AI-Powered Voice Assistant Backend API

---

## 📋 **API OVERVIEW**

**Base URL**: `https://api.voiceassistant.com/v1`  
**Protocol**: HTTPS  
**Content-Type**: `application/json`  
**Authentication**: JWT Bearer Token  
**Rate Limiting**: 100 requests per minute per user

---

## 🔐 **AUTHENTICATION**

### **JWT Token Structure**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "expires_in": 3600
}
```

### **Authentication Headers**
```http
Authorization: Bearer <access_token>
Content-Type: application/json
```

---

## 👤 **AUTHENTICATION ENDPOINTS**

### **POST /auth/register**
Register a new user account.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securepassword123",
  "full_name": "John Doe",
  "first_name": "John",
  "last_name": "Doe"
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "email": "user@example.com",
      "full_name": "John Doe",
      "is_active": true,
      "is_verified": false,
      "created_at": "2024-01-15T10:30:00Z"
    },
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### **POST /auth/login**
Authenticate user and receive access tokens.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securepassword123"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "email": "user@example.com",
      "full_name": "John Doe",
      "is_active": true,
      "is_verified": true,
      "created_at": "2024-01-15T10:30:00Z"
    },
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### **POST /auth/refresh**
Refresh access token using refresh token.

**Request Body:**
```json
{
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expires_in": 3600
  }
}
```

### **POST /auth/logout**
Invalidate current session.

**Response (200):**
```json
{
  "success": true,
  "message": "Successfully logged out"
}
```

### **POST /auth/verify-email**
Verify email address with verification token.

**Request Body:**
```json
{
  "token": "verification_token_here"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Email verified successfully"
}
```

---

## 👤 **USER MANAGEMENT ENDPOINTS**

### **GET /users/me**
Get current user profile.

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "user@example.com",
    "full_name": "John Doe",
    "first_name": "John",
    "last_name": "Doe",
    "timezone": "America/New_York",
    "language": "en-US",
    "theme": "dark",
    "is_active": true,
    "is_verified": true,
    "created_at": "2024-01-15T10:30:00Z",
    "updated_at": "2024-01-15T10:30:00Z"
  }
}
```

### **PUT /users/me**
Update current user profile.

**Request Body:**
```json
{
  "full_name": "John Smith",
  "timezone": "Europe/London",
  "language": "en-GB",
  "theme": "light"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "user@example.com",
    "full_name": "John Smith",
    "timezone": "Europe/London",
    "language": "en-GB",
    "theme": "light",
    "updated_at": "2024-01-15T11:00:00Z"
  }
}
```

### **DELETE /users/me**
Delete current user account.

**Response (200):**
```json
{
  "success": true,
  "message": "Account deleted successfully"
}
```

---

## 🎤 **VOICE PROCESSING ENDPOINTS**

### **POST /voice/session/start**
Start a new voice session.

**Request Body:**
```json
{
  "device_info": {
    "browser": "Chrome",
    "version": "120.0.0.0",
    "platform": "Windows",
    "user_agent": "Mozilla/5.0..."
  },
  "preferences": {
    "language": "en-US",
    "voice_model": "gpt-4",
    "response_type": "text_and_speech"
  }
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "session_id": "voice_session_123",
    "status": "active",
    "created_at": "2024-01-15T10:30:00Z",
    "websocket_url": "wss://api.voiceassistant.com/ws/voice_session_123"
  }
}
```

### **POST /voice/command/process**
Process a voice command.

**Request Body:**
```json
{
  "session_id": "voice_session_123",
  "transcript": "Schedule a meeting with John tomorrow at 2 PM",
  "audio_data": "base64_encoded_audio_data",
  "confidence": 0.95,
  "context": {
    "previous_commands": ["Show my calendar"],
    "current_view": "calendar"
  }
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "command_id": "cmd_456",
    "intent": "schedule_meeting",
    "entities": {
      "person": "John",
      "date": "2024-01-16",
      "time": "14:00:00",
      "duration": "60"
    },
    "response": {
      "text": "I've scheduled a meeting with John tomorrow at 2 PM for 1 hour.",
      "speech": "base64_encoded_speech_audio",
      "actions": [
        {
          "type": "create_calendar_event",
          "data": {
            "title": "Meeting with John",
            "start_time": "2024-01-16T14:00:00Z",
            "end_time": "2024-01-16T15:00:00Z",
            "attendees": ["john@example.com"]
          }
        }
      ]
    },
    "processing_time": 1.2
  }
}
```

### **GET /voice/session/{session_id}**
Get voice session details.

**Response (200):**
```json
{
  "success": true,
  "data": {
    "session_id": "voice_session_123",
    "user_id": "550e8400-e29b-41d4-a716-446655440000",
    "status": "active",
    "start_time": "2024-01-15T10:30:00Z",
    "last_activity": "2024-01-15T10:35:00Z",
    "commands_processed": 5,
    "total_duration": 300,
    "preferences": {
      "language": "en-US",
      "voice_model": "gpt-4"
    }
  }
}
```

### **POST /voice/session/{session_id}/end**
End a voice session.

**Response (200):**
```json
{
  "success": true,
  "data": {
    "session_id": "voice_session_123",
    "end_time": "2024-01-15T10:40:00Z",
    "total_duration": 600,
    "commands_processed": 8,
    "summary": {
      "meetings_scheduled": 3,
      "reminders_set": 2,
      "calendar_queries": 3
    }
  }
}
```

### **GET /voice/history**
Get user's voice command history.

**Query Parameters:**
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 20)
- `start_date`: Filter from date (ISO format)
- `end_date`: Filter to date (ISO format)

**Response (200):**
```json
{
  "success": true,
  "data": {
    "commands": [
      {
        "id": "cmd_456",
        "session_id": "voice_session_123",
        "transcript": "Schedule a meeting with John tomorrow at 2 PM",
        "intent": "schedule_meeting",
        "confidence": 0.95,
        "processing_time": 1.2,
        "created_at": "2024-01-15T10:35:00Z",
        "response": {
          "text": "I've scheduled a meeting with John tomorrow at 2 PM for 1 hour.",
          "actions": ["create_calendar_event"]
        }
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 150,
      "pages": 8
    }
  }
}
```

---

## 📅 **CALENDAR ENDPOINTS**

### **GET /calendar/events**
Get user's calendar events.

**Query Parameters:**
- `start_date`: Start date (ISO format)
- `end_date`: End date (ISO format)
- `calendar_id`: Specific calendar ID
- `status`: Event status (confirmed, tentative, cancelled)

**Response (200):**
```json
{
  "success": true,
  "data": {
    "events": [
      {
        "id": "event_789",
        "title": "Meeting with John",
        "description": "Weekly team sync",
        "start_time": "2024-01-16T14:00:00Z",
        "end_time": "2024-01-16T15:00:00Z",
        "location": "Conference Room A",
        "attendees": [
          {
            "email": "john@example.com",
            "name": "John Doe",
            "response": "accepted"
          }
        ],
        "reminders": [
          {
            "type": "email",
            "minutes_before": 15
          }
        ],
        "calendar_id": "primary",
        "status": "confirmed",
        "created_at": "2024-01-15T10:35:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 50,
      "total": 25,
      "pages": 1
    }
  }
}
```

### **POST /calendar/events**
Create a new calendar event.

**Request Body:**
```json
{
  "title": "Team Meeting",
  "description": "Weekly team sync meeting",
  "start_time": "2024-01-16T14:00:00Z",
  "end_time": "2024-01-16T15:00:00Z",
  "location": "Conference Room A",
  "attendees": [
    {
      "email": "john@example.com",
      "name": "John Doe"
    }
  ],
  "reminders": [
    {
      "type": "email",
      "minutes_before": 15
    },
    {
      "type": "push",
      "minutes_before": 5
    }
  ],
  "calendar_id": "primary"
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "id": "event_789",
    "title": "Team Meeting",
    "description": "Weekly team sync meeting",
    "start_time": "2024-01-16T14:00:00Z",
    "end_time": "2024-01-16T15:00:00Z",
    "location": "Conference Room A",
    "attendees": [
      {
        "email": "john@example.com",
        "name": "John Doe",
        "response": "pending"
      }
    ],
    "reminders": [
      {
        "id": "reminder_123",
        "type": "email",
        "minutes_before": 15
      }
    ],
    "calendar_id": "primary",
    "status": "confirmed",
    "created_at": "2024-01-15T10:35:00Z"
  }
}
```

### **PUT /calendar/events/{event_id}**
Update an existing calendar event.

**Request Body:**
```json
{
  "title": "Updated Team Meeting",
  "description": "Updated description",
  "start_time": "2024-01-16T15:00:00Z",
  "end_time": "2024-01-16T16:00:00Z"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "event_789",
    "title": "Updated Team Meeting",
    "description": "Updated description",
    "start_time": "2024-01-16T15:00:00Z",
    "end_time": "2024-01-16T16:00:00Z",
    "updated_at": "2024-01-15T11:00:00Z"
  }
}
```

### **DELETE /calendar/events/{event_id}**
Delete a calendar event.

**Response (200):**
```json
{
  "success": true,
  "message": "Event deleted successfully"
}
```

### **GET /calendar/integrations**
Get user's calendar integrations.

**Response (200):**
```json
{
  "success": true,
  "data": {
    "integrations": [
      {
        "id": "google_calendar_123",
        "provider": "google",
        "calendar_id": "primary",
        "name": "Primary Calendar",
        "is_primary": true,
        "is_active": true,
        "last_sync": "2024-01-15T10:30:00Z",
        "created_at": "2024-01-15T09:00:00Z"
      },
      {
        "id": "outlook_calendar_456",
        "provider": "microsoft",
        "calendar_id": "work_calendar",
        "name": "Work Calendar",
        "is_primary": false,
        "is_active": true,
        "last_sync": "2024-01-15T10:25:00Z",
        "created_at": "2024-01-15T09:30:00Z"
      }
    ]
  }
}
```

### **POST /calendar/integrations/google**
Connect Google Calendar.

**Request Body:**
```json
{
  "authorization_code": "google_auth_code_here"
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "integration_id": "google_calendar_123",
    "provider": "google",
    "calendar_id": "primary",
    "name": "Primary Calendar",
    "is_primary": true,
    "is_active": true,
    "created_at": "2024-01-15T10:30:00Z"
  }
}
```

---

## 🔔 **NOTIFICATION ENDPOINTS**

### **GET /notifications**
Get user's notifications.

**Query Parameters:**
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 20)
- `type`: Notification type (calendar, voice, system)
- `read`: Filter by read status (true/false)

**Response (200):**
```json
{
  "success": true,
  "data": {
    "notifications": [
      {
        "id": "notif_123",
        "type": "calendar",
        "title": "Meeting Reminder",
        "message": "You have a meeting with John in 15 minutes",
        "data": {
          "event_id": "event_789",
          "event_title": "Meeting with John"
        },
        "is_read": false,
        "created_at": "2024-01-15T10:45:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 45,
      "pages": 3
    }
  }
}
```

### **PUT /notifications/{notification_id}/read**
Mark notification as read.

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "notif_123",
    "is_read": true,
    "read_at": "2024-01-15T10:50:00Z"
  }
}
```

### **PUT /notifications/read-all**
Mark all notifications as read.

**Response (200):**
```json
{
  "success": true,
  "message": "All notifications marked as read"
}
```

### **DELETE /notifications/{notification_id}**
Delete a notification.

**Response (200):**
```json
{
  "success": true,
  "message": "Notification deleted successfully"
}
```

---

## 🔧 **SETTINGS ENDPOINTS**

### **GET /settings/voice**
Get voice settings.

**Response (200):**
```json
{
  "success": true,
  "data": {
    "language": "en-US",
    "voice_model": "gpt-4",
    "response_type": "text_and_speech",
    "speech_rate": 1.0,
    "speech_volume": 0.8,
    "auto_listen": false,
    "wake_word": "Hey Assistant",
    "noise_reduction": true,
    "echo_cancellation": true
  }
}
```

### **PUT /settings/voice**
Update voice settings.

**Request Body:**
```json
{
  "language": "en-GB",
  "voice_model": "claude-3",
  "response_type": "text_only",
  "speech_rate": 1.2,
  "auto_listen": true
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "language": "en-GB",
    "voice_model": "claude-3",
    "response_type": "text_only",
    "speech_rate": 1.2,
    "auto_listen": true,
    "updated_at": "2024-01-15T11:00:00Z"
  }
}
```

### **GET /settings/calendar**
Get calendar settings.

**Response (200):**
```json
{
  "success": true,
  "data": {
    "default_calendar": "primary",
    "working_hours": {
      "start": "09:00",
      "end": "17:00"
    },
    "working_days": [1, 2, 3, 4, 5],
    "timezone": "America/New_York",
    "default_reminders": [
      {
        "type": "email",
        "minutes_before": 15
      }
    ],
    "auto_sync": true,
    "sync_interval": 300
  }
}
```

---

## 📊 **ANALYTICS ENDPOINTS**

### **GET /analytics/voice-usage**
Get voice usage analytics.

**Query Parameters:**
- `start_date`: Start date (ISO format)
- `end_date`: End date (ISO format)
- `group_by`: Grouping (day, week, month)

**Response (200):**
```json
{
  "success": true,
  "data": {
    "total_sessions": 45,
    "total_commands": 234,
    "average_session_duration": 420,
    "most_used_commands": [
      {
        "intent": "schedule_meeting",
        "count": 67,
        "percentage": 28.6
      },
      {
        "intent": "check_calendar",
        "count": 45,
        "percentage": 19.2
      }
    ],
    "accuracy_rate": 0.94,
    "daily_usage": [
      {
        "date": "2024-01-15",
        "sessions": 5,
        "commands": 23
      }
    ]
  }
}
```

### **GET /analytics/calendar-usage**
Get calendar usage analytics.

**Response (200):**
```json
{
  "success": true,
  "data": {
    "total_events": 156,
    "events_this_month": 23,
    "upcoming_events": 8,
    "most_common_attendees": [
      {
        "email": "john@example.com",
        "name": "John Doe",
        "meetings_count": 15
      }
    ],
    "busiest_day": "Wednesday",
    "average_meeting_duration": 45
  }
}
```

---

## 🚨 **ERROR RESPONSES**

### **400 Bad Request**
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid request data",
    "details": {
      "email": ["Invalid email format"],
      "password": ["Password must be at least 8 characters"]
    }
  }
}
```

### **401 Unauthorized**
```json
{
  "success": false,
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Invalid or expired token"
  }
}
```

### **403 Forbidden**
```json
{
  "success": false,
  "error": {
    "code": "FORBIDDEN",
    "message": "Insufficient permissions"
  }
}
```

### **404 Not Found**
```json
{
  "success": false,
  "error": {
    "code": "NOT_FOUND",
    "message": "Resource not found"
  }
}
```

### **429 Too Many Requests**
```json
{
  "success": false,
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Rate limit exceeded",
    "retry_after": 60
  }
}
```

### **500 Internal Server Error**
```json
{
  "success": false,
  "error": {
    "code": "INTERNAL_ERROR",
    "message": "An unexpected error occurred"
  }
}
```

---

## 🔌 **WEBSOCKET API**

### **Connection URL**
```
wss://api.voiceassistant.com/ws/{session_id}
```

### **Authentication**
```json
{
  "type": "auth",
  "token": "jwt_access_token_here"
}
```

### **Voice Streaming**
```json
{
  "type": "voice_audio",
  "data": "base64_encoded_audio_chunk",
  "timestamp": "2024-01-15T10:30:00.123Z"
}
```

### **Real-time Responses**
```json
{
  "type": "voice_response",
  "data": {
    "text": "I've scheduled your meeting",
    "speech": "base64_encoded_speech",
    "actions": ["create_calendar_event"]
  },
  "timestamp": "2024-01-15T10:30:01.456Z"
}
```

### **Calendar Updates**
```json
{
  "type": "calendar_update",
  "data": {
    "event_id": "event_789",
    "action": "created",
    "event": {
      "title": "New Meeting",
      "start_time": "2024-01-16T14:00:00Z"
    }
  },
  "timestamp": "2024-01-15T10:30:02.789Z"
}
```

---

## 📚 **DATA MODELS**

### **User Model**
```typescript
interface User {
  id: string;
  email: string;
  full_name?: string;
  first_name?: string;
  last_name?: string;
  timezone?: string;
  language?: string;
  theme?: 'light' | 'dark' | 'auto';
  is_active: boolean;
  is_verified: boolean;
  created_at: string;
  updated_at: string;
}
```

### **VoiceSession Model**
```typescript
interface VoiceSession {
  id: string;
  user_id: string;
  status: 'active' | 'ended' | 'error';
  start_time: string;
  end_time?: string;
  device_info: DeviceInfo;
  preferences: VoicePreferences;
  commands_processed: number;
  total_duration: number;
  created_at: string;
}
```

### **CalendarEvent Model**
```typescript
interface CalendarEvent {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  start_time: string;
  end_time: string;
  location?: string;
  attendees: Attendee[];
  reminders: Reminder[];
  calendar_id: string;
  status: 'confirmed' | 'tentative' | 'cancelled';
  created_at: string;
  updated_at: string;
}
```

---

## 🔒 **SECURITY CONSIDERATIONS**

### **Rate Limiting**
- **Authentication endpoints**: 5 requests per minute
- **Voice endpoints**: 100 requests per minute
- **Calendar endpoints**: 1000 requests per minute
- **General endpoints**: 100 requests per minute

### **Input Validation**
- All inputs are validated using Pydantic schemas
- SQL injection prevention through parameterized queries
- XSS protection through input sanitization
- File upload restrictions and validation

### **Data Encryption**
- All sensitive data encrypted at rest
- Voice data encrypted in transit
- JWT tokens signed with secure algorithms
- HTTPS enforcement for all endpoints

---

*This API specification provides comprehensive documentation for all endpoints, request/response formats, and security considerations for the AI-powered voice assistant backend.*
