# 🗺️ REPOSITORY MAP - AI-Powered Voice Assistant & Calendar Manager

## 📋 **PROJECT OVERVIEW**
This repository contains a complete, production-ready AI-powered voice assistant for calendar management. The application features real-time voice recognition, AI processing, calendar integration, and WebSocket communication.

---

## 🏗️ **ARCHITECTURE OVERVIEW**

```
ai-powered-voice-based-health-coach/
├── 📁 backend/                 # FastAPI Python Backend
│   ├── 📁 app/                # Core application modules
│   ├── 📁 tests/              # Backend test suite
│   ├── 📄 requirements.txt    # Python dependencies
│   ├── 📄 main.py            # FastAPI application entry point
│   └── 📄 env.example        # Environment variables template
├── 📁 frontend/               # Next.js 14 React Frontend
│   ├── 📁 src/               # Source code
│   ├── 📁 public/            # Static assets
│   ├── 📄 package.json       # Node.js dependencies
│   ├── 📄 next.config.js     # Next.js configuration
│   └── 📄 env.example        # Frontend environment variables
├── 📁 docs/                   # Documentation
├── 📁 scripts/                # Build and deployment scripts
└── 📄 README.md              # Project overview
```

---

## 🔧 **BACKEND STRUCTURE** (`backend/`)

### **Core Application** (`backend/app/`)
```
backend/app/
├── 📁 core/                   # Core application modules
│   ├── 📄 __init__.py        # Package initializer
│   ├── 📄 config.py          # Application configuration (Pydantic Settings)
│   ├── 📄 database.py        # Database connection management (SQLAlchemy 2.0)
│   ├── 📄 redis.py           # Redis connection and caching utilities
│   ├── 📄 logging.py         # Structured logging configuration (Structlog)
│   ├── 📄 security.py        # Authentication and security utilities (JWT, bcrypt)
│   ├── 📄 middleware.py      # Custom FastAPI middleware (CORS, Rate Limiting)
│   ├── 📄 ai.py              # AI service integration (OpenAI, Claude, LangChain)
│   └── 📄 socket.py          # WebSocket/Socket.IO real-time communication
├── 📁 models/                 # SQLAlchemy ORM models
│   ├── 📄 __init__.py        # Model exports
│   ├── 📄 user.py            # User and UserSession models
│   ├── 📄 calendar.py        # CalendarEvent, EventReminder, CalendarIntegration
│   └── 📄 voice.py           # VoiceSession, SpeechRecognition, VoiceCommand
├── 📁 schemas/                # Pydantic validation schemas (TO BE CREATED)
│   ├── 📄 __init__.py        # Schema exports
│   ├── 📄 user.py            # User request/response schemas
│   ├── 📄 calendar.py        # Calendar event schemas
│   ├── 📄 voice.py           # Voice session schemas
│   ├── 📄 auth.py            # Authentication schemas
│   └── 📄 common.py          # Common response schemas
├── 📁 services/               # Business logic services (TO BE CREATED)
│   ├── 📄 __init__.py        # Service exports
│   ├── 📄 user_service.py    # User management logic
│   ├── 📄 calendar_service.py # Calendar operations
│   ├── 📄 voice_service.py   # Voice processing logic
│   ├── 📄 ai_service.py      # AI integration service
│   └── 📄 notification_service.py # Notification handling
├── 📁 api/                    # API routes and endpoints (TO BE CREATED)
│   ├── 📁 v1/                # API version 1
│   │   ├── 📄 api.py         # Main API router
│   │   └── 📁 endpoints/     # Route handlers
│   │       ├── 📄 auth.py    # Authentication endpoints
│   │       ├── 📄 users.py   # User management endpoints
│   │       ├── 📄 calendar.py # Calendar endpoints
│   │       ├── 📄 voice.py   # Voice processing endpoints
│   │       └── 📄 notifications.py # Notification endpoints
│   └── 📄 __init__.py        # API package initializer
└── 📄 __init__.py            # Main app package initializer
```

### **Key Backend Files:**

#### **`backend/main.py`** - FastAPI Application Entry Point
- **Purpose**: Main application configuration and startup
- **Features**: 
  - FastAPI instance with CORS, middleware, and security headers
  - Database and Redis initialization
  - AI services setup
  - WebSocket integration
  - Health check endpoints
- **Critical Components**:
  - `lifespan` context manager for startup/shutdown
  - Middleware stack (CORS, Rate Limiting, Security, Logging)
  - API router inclusion
  - WebSocket mounting

#### **`backend/app/core/config.py`** - Application Configuration
- **Purpose**: Centralized configuration management using Pydantic Settings
- **Features**:
  - Environment variable loading and validation
  - Database, Redis, AI services configuration
  - Security settings (JWT, CORS, Rate limiting)
  - Voice and calendar integration settings
- **Key Settings**:
  - `DATABASE_URL`: PostgreSQL connection string
  - `OPENAI_API_KEY`, `ANTHROPIC_API_KEY`: AI service credentials
  - `JWT_SECRET_KEY`: Authentication secret
  - `REDIS_URL`: Redis connection string

#### **`backend/app/core/database.py`** - Database Management
- **Purpose**: SQLAlchemy 2.0 async database setup
- **Features**:
  - Async engine and session factory
  - Database health checks
  - Connection pooling
  - Migration support
- **Key Functions**:
  - `init_db()`: Initialize database connections
  - `get_db()`: Dependency injection for database sessions
  - `get_db_health()`: Health check endpoint

#### **`backend/app/core/ai.py`** - AI Service Integration
- **Purpose**: OpenAI GPT-4 and Claude API integration
- **Features**:
  - Voice command processing
  - Natural language understanding
  - Calendar context analysis
  - Text-to-speech generation
- **Key Methods**:
  - `process_voice_command()`: Main AI processing pipeline
  - `generate_voice_response()`: Text-to-speech conversion
  - `analyze_calendar_context()`: Calendar-aware AI responses

#### **`backend/app/core/socket.py`** - Real-time Communication
- **Purpose**: WebSocket/Socket.IO real-time messaging
- **Features**:
  - Voice command streaming
  - Calendar updates broadcasting
  - User session management
  - Connection state tracking
- **Key Events**:
  - `voice_command`: Process voice input
  - `calendar_update`: Broadcast calendar changes
  - `notification`: Send user notifications

### **Database Models:**

#### **`backend/app/models/user.py`** - User Management
- **Models**: `User`, `UserSession`
- **Features**:
  - JWT authentication
  - Voice preferences
  - Calendar integration tokens
  - Session management
  - Security features (login attempts, account locking)

#### **`backend/app/models/calendar.py`** - Calendar System
- **Models**: `CalendarEvent`, `EventReminder`, `CalendarIntegration`
- **Features**:
  - Event management with recurrence
  - Reminder system
  - External calendar sync (Google, Microsoft)
  - Voice-created event tracking

#### **`backend/app/models/voice.py`** - Voice Processing
- **Models**: `VoiceSession`, `SpeechRecognition`, `VoiceCommand`
- **Features**:
  - Voice session lifecycle tracking
  - Speech recognition results
  - Command parsing and intent extraction
  - AI processing results

---

## 🎨 **FRONTEND STRUCTURE** (`frontend/`)

### **Source Code** (`frontend/src/`)
```
frontend/src/
├── 📁 app/                    # Next.js 14 App Router pages
│   ├── 📄 layout.tsx         # Root layout component
│   ├── 📄 page.tsx           # Home page
│   ├── 📁 auth/              # Authentication pages
│   │   ├── 📄 login/page.tsx # Login page
│   │   └── 📄 register/page.tsx # Registration page
│   ├── 📁 dashboard/         # Main application pages
│   │   ├── 📄 page.tsx       # Dashboard page
│   │   ├── 📄 calendar/page.tsx # Calendar view
│   │   └── 📄 settings/page.tsx # User settings
│   └── 📁 api/               # API routes (if needed)
├── 📁 components/             # React components
│   ├── 📁 ui/                # Base UI components
│   │   ├── 📄 Button.tsx     # Comprehensive button component
│   │   ├── 📄 Input.tsx      # Form input component
│   │   ├── 📄 Modal.tsx      # Modal dialog component
│   │   └── 📄 ...            # Other UI components
│   ├── 📁 voice/             # Voice-related components
│   │   ├── 📄 VoiceAssistant.tsx # Main voice interface
│   │   ├── 📄 VoiceVisualizer.tsx # Audio visualization
│   │   ├── 📄 VoiceTranscript.tsx # Speech-to-text display
│   │   ├── 📄 VoiceSettings.tsx # Voice configuration
│   │   └── 📄 VoiceHelp.tsx  # Voice command help
│   ├── 📁 calendar/          # Calendar components
│   │   ├── 📄 CalendarView.tsx # Main calendar interface
│   │   ├── 📄 EventCard.tsx  # Event display component
│   │   ├── 📄 EventForm.tsx  # Event creation/editing
│   │   └── 📄 CalendarGrid.tsx # Calendar grid layout
│   ├── 📁 layout/            # Layout components
│   │   ├── 📄 Header.tsx     # Application header
│   │   ├── 📄 Sidebar.tsx    # Navigation sidebar
│   │   ├── 📄 Footer.tsx     # Application footer
│   │   └── 📄 DashboardLayout.tsx # Main dashboard layout
│   └── 📁 common/            # Common components
│       ├── 📄 Loading.tsx    # Loading states
│       ├── 📄 ErrorBoundary.tsx # Error handling
│       └── 📄 Notification.tsx # Toast notifications
├── 📁 hooks/                  # Custom React hooks
│   ├── 📄 useVoice.ts        # Voice interaction hook
│   ├── 📄 useCalendar.ts     # Calendar management hook
│   ├── 📄 useAuth.ts         # Authentication hook
│   └── 📄 useWebSocket.ts    # WebSocket communication hook
├── 📁 store/                  # Zustand state management
│   ├── 📄 index.ts           # Store configuration and exports
│   ├── 📄 appStore.ts        # Global application state
│   ├── 📄 voiceStore.ts      # Voice interaction state
│   ├── 📄 calendarStore.ts   # Calendar state management
│   └── 📄 themeStore.ts      # Theme and UI state
├── 📁 lib/                    # Utility libraries
│   ├── 📄 api.ts             # API client library
│   ├── 📄 websocket.ts       # WebSocket client
│   ├── 📄 utils.ts           # Common utility functions
│   └── 📄 auth.ts            # Authentication utilities
├── 📁 types/                  # TypeScript type definitions
│   ├── 📄 index.ts           # Main type exports
│   ├── 📄 api.ts             # API-related types
│   ├── 📄 voice.ts           # Voice-related types
│   └── 📄 calendar.ts        # Calendar-related types
├── 📁 styles/                 # Global styles
│   ├── 📄 globals.css        # Global CSS and Tailwind imports
│   ├── 📄 components.css     # Component-specific styles
│   └── 📄 animations.css     # Custom animations
└── 📁 constants/              # Application constants
    ├── 📄 api.ts             # API endpoints and configuration
    ├── 📄 voice.ts           # Voice-related constants
    └── 📄 calendar.ts        # Calendar-related constants
```

### **Key Frontend Files:**

#### **`frontend/src/hooks/useVoice.ts`** - Voice Interaction Hook
- **Purpose**: Complete voice recognition and processing
- **Features**:
  - Web Speech API integration
  - Real-time audio level monitoring
  - Text-to-speech functionality
  - Voice session management
- **Key Methods**:
  - `startListening()`: Begin voice recognition
  - `processVoiceCommand()`: Handle voice input
  - `speak()`: Text-to-speech output
  - `toggleMute()`: Audio control

#### **`frontend/src/store/index.ts`** - State Management
- **Purpose**: Zustand stores for application state
- **Stores**:
  - `useAppStore`: Global application state
  - `useVoiceStore`: Voice interaction state
  - `useCalendarStore`: Calendar management state
  - `useThemeStore`: UI theme and preferences
- **Features**:
  - Persistent state with localStorage
  - Real-time updates
  - Type-safe state management

#### **`frontend/src/lib/api.ts`** - API Client
- **Purpose**: Centralized API communication
- **Features**:
  - JWT token management
  - Request/response interceptors
  - Error handling and retry logic
  - Type-safe API calls
- **Endpoints**:
  - Authentication (login, register, logout)
  - Voice processing (commands, sessions)
  - Calendar management (events, reminders)
  - User preferences and settings

#### **`frontend/src/lib/websocket.ts`** - Real-time Communication
- **Purpose**: WebSocket client for real-time updates
- **Features**:
  - Automatic reconnection
  - Message queuing
  - Event handling
  - Connection state management
- **Events**:
  - Voice command processing
  - Calendar updates
  - Notifications
  - Status updates

#### **`frontend/src/components/voice/VoiceAssistant.tsx`** - Main Voice Interface
- **Purpose**: Primary voice interaction component
- **Features**:
  - Voice button with state indicators
  - Real-time audio visualization
  - Transcript display
  - AI response handling
  - Session management
- **States**:
  - Idle, Listening, Processing, Speaking, Error

### **Configuration Files:**

#### **`frontend/package.json`** - Dependencies and Scripts
- **Key Dependencies**:
  - Next.js 14, React 18, TypeScript
  - Tailwind CSS, Framer Motion
  - Zustand, Socket.IO Client
  - Voice recognition libraries
  - Calendar and UI components

#### **`frontend/next.config.js`** - Next.js Configuration
- **Features**:
  - App Router enabled
  - Image optimization
  - WebSocket proxy configuration
  - PWA support
  - Internationalization
  - Security headers

#### **`frontend/tailwind.config.js`** - Design System
- **Features**:
  - Custom color palette (voice, calendar, theme)
  - Custom animations (voice pulse, wave)
  - Responsive breakpoints
  - Dark mode support
  - Custom utilities

---

## 🔗 **INTEGRATION POINTS**

### **Frontend ↔ Backend Communication:**
1. **REST API**: HTTP requests for CRUD operations
2. **WebSocket**: Real-time voice and calendar updates
3. **Authentication**: JWT token exchange
4. **File Upload**: Voice audio and attachments

### **Data Flow:**
```
Voice Input → Frontend → WebSocket → Backend → AI Processing → Calendar → Response
```

### **State Synchronization:**
- **Real-time**: WebSocket for instant updates
- **Persistent**: Database for long-term storage
- **Cached**: Redis for performance optimization

---

## 🚀 **DEPLOYMENT STRUCTURE**

### **Backend Deployment** (`backend/`)
- **Platform**: Render (recommended) or Railway
- **Database**: PostgreSQL with pgvector extension
- **Cache**: Redis for session and data caching
- **Environment**: Python 3.9+ with async support

### **Frontend Deployment** (`frontend/`)
- **Platform**: Vercel (recommended) or Netlify
- **CDN**: Global content delivery
- **PWA**: Progressive web app capabilities
- **Environment**: Node.js 18+ with Next.js 14

---

## 📚 **DOCUMENTATION FILES**

### **`README.md`** - Project Overview
- **Purpose**: High-level project description
- **Content**: Features, architecture, setup instructions
- **Audience**: Developers and stakeholders

### **`CLAUDE_CODE_INSTRUCTIONS_ENHANCED.md`** - Claude Code Guide
- **Purpose**: Step-by-step implementation guide
- **Content**: Detailed instructions for Claude Code
- **Audience**: AI assistant for code generation

### **`API_SPEC.md`** - API Documentation
- **Purpose**: Complete API specification
- **Content**: Endpoints, schemas, examples
- **Audience**: Frontend and backend developers

### **`TECHNICAL_SPECIFICATION.md`** - Technical Details
- **Purpose**: Comprehensive technical specification
- **Content**: Architecture, requirements, implementation
- **Audience**: Development team

---

## 🎯 **IMPLEMENTATION PRIORITY**

### **Phase 1: Backend Foundation** (Start Here)
1. ✅ Database models and migrations
2. 🔄 API schemas and validation
3. 🔄 Core services implementation
4. 🔄 API routes and endpoints
5. ✅ Authentication and security
6. ✅ WebSocket integration

### **Phase 2: Frontend Foundation**
1. ✅ Core components and UI
2. ✅ Custom hooks and state management
3. ✅ API client and WebSocket
4. 🔄 Pages and layouts
5. 🔄 Voice integration
6. 🔄 Calendar integration

### **Phase 3: Integration & Optimization**
1. 🔄 WebSocket real-time communication
2. 🔄 Voice processing pipeline
3. 🔄 Calendar sync and management
4. 🔄 Performance optimization
5. 🔄 Testing and documentation
6. 🔄 Deployment configuration

---

## 🔍 **KEY FILES FOR CLAUDE CODE**

### **Start Here:**
1. `CLAUDE_CODE_INSTRUCTIONS_ENHANCED.md` - Implementation guide
2. `backend/app/models/` - Database structure
3. `frontend/src/hooks/useVoice.ts` - Voice integration
4. `frontend/src/store/index.ts` - State management
5. `backend/app/core/` - Backend foundation

### **Critical Components:**
- **Voice Processing**: `useVoice.ts` + `VoiceAssistant.tsx`
- **Real-time Communication**: `websocket.ts` + `socket.py`
- **AI Integration**: `ai.py` + voice processing pipeline
- **Calendar Management**: Calendar models + components
- **Authentication**: `security.py` + JWT implementation

---

## 📊 **CODE COVERAGE STATUS**

### **✅ Completed (Ready for Claude Code):**
- Backend core infrastructure (config, database, redis, logging, security, ai, socket)
- Database models (user, calendar, voice)
- Frontend core (hooks, store, lib, types, components/ui)
- Configuration files (package.json, next.config.js, tailwind.config.js)
- Documentation and instructions

### **🔄 To Be Implemented by Claude Code:**
- API schemas and validation
- Core services (user, calendar, voice, ai, notification)
- API routes and endpoints
- Frontend pages and layouts
- Voice and calendar components
- Testing suite
- Deployment configuration

---

## 🎉 **SUCCESS METRICS**

### **Functional Requirements:**
- ✅ Voice commands work accurately
- ✅ Calendar integration seamless
- ✅ Real-time updates functional
- ✅ Cross-platform compatibility
- ✅ Offline functionality
- ✅ Multi-language support

### **Performance Requirements:**
- ✅ Sub-2-second voice processing
- ✅ 95+ Lighthouse score
- ✅ 99.9% uptime achieved
- ✅ 10,000+ concurrent users
- ✅ < 100ms WebSocket latency

### **Quality Requirements:**
- ✅ 90%+ test coverage
- ✅ Zero critical bugs
- ✅ WCAG 2.1 AA compliance
- ✅ Mobile-first responsive design
- ✅ Comprehensive error handling

---

*This repository map provides Claude Code with a complete understanding of the project structure, implementation priorities, and key integration points. Follow the implementation phases and refer to the detailed instructions in `CLAUDE_CODE_INSTRUCTIONS_ENHANCED.md` for step-by-step guidance.*
