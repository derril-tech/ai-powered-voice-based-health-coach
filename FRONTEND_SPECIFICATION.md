# 🎨 FRONTEND TECHNICAL SPECIFICATION
## AI-Powered Personal Voice Assistant & Calendar Manager

---

## 🛠️ **FRONTEND FRAMEWORKS & TECH STACK**

### **Core Framework**
- **Next.js 14** - React framework with App Router, Server Components, and optimized performance
- **React 18** - Latest React with concurrent features, Suspense, and improved rendering
- **TypeScript 5.3+** - Type-safe development with strict configuration
- **Tailwind CSS 3.3+** - Utility-first CSS framework with custom design system

### **State Management**
- **Zustand 4.4+** - Lightweight state management with persistence
- **React Query/TanStack Query** - Server state management and caching
- **Zustand/Middleware** - DevTools, persist, immer for enhanced development

### **Voice & Audio Processing**
- **Web Speech API** - Native browser speech recognition and synthesis
- **Web Audio API** - Real-time audio processing and visualization
- **MediaRecorder API** - Audio recording and streaming
- **AudioContext** - Advanced audio manipulation and analysis

### **Real-time Communication**
- **Socket.IO Client 4.7+** - WebSocket communication with fallbacks
- **WebSocket API** - Native WebSocket for real-time updates
- **EventSource** - Server-sent events for notifications

### **UI Components & Design**
- **Radix UI** - Accessible, unstyled UI primitives
- **Headless UI** - Unstyled, accessible UI components
- **Framer Motion 10.16+** - Advanced animations and transitions
- **Lucide React** - Beautiful, customizable icons
- **Class Variance Authority** - Type-safe component variants
- **Tailwind Merge** - Utility class merging and conflict resolution

### **Calendar & Date Management**
- **React Big Calendar 1.8+** - Full-featured calendar component
- **FullCalendar 6.1+** - Advanced calendar with drag-and-drop
- **Date-fns 2.30+** - Modern date utility library
- **React Datepicker** - Accessible date picker component

### **Form Handling & Validation**
- **React Hook Form 7.48+** - Performant forms with minimal re-renders
- **Zod 3.22+** - TypeScript-first schema validation
- **React Hook Form + Zod** - Type-safe form validation
- **React Select** - Accessible select component

### **Authentication & Security**
- **NextAuth.js 4.24+** - Complete authentication solution
- **JWT Decode** - Client-side JWT handling
- **OAuth2** - Google, Microsoft, GitHub integration

### **File Handling & Upload**
- **React Dropzone** - Drag-and-drop file upload
- **File API** - Native file handling and processing
- **Blob API** - Binary data handling for audio files

### **Data Visualization**
- **Recharts** - Composable charting library
- **D3.js** - Custom data visualizations
- **Chart.js** - Simple, responsive charts

### **Testing & Quality**
- **Jest 29.7+** - JavaScript testing framework
- **React Testing Library** - Component testing utilities
- **Playwright 1.40+** - End-to-end testing
- **Storybook 7.6+** - Component development and documentation
- **ESLint** - Code linting and quality
- **Prettier** - Code formatting

### **Performance & Optimization**
- **Next.js Image** - Optimized image loading
- **React.memo** - Component memoization
- **useMemo/useCallback** - Hook optimization
- **React.lazy** - Code splitting and lazy loading
- **Service Worker** - Offline functionality and caching

---

## 📦 **FRONTEND DEPENDENCIES**

### **Core Dependencies**
```json
{
  "next": "14.0.4",
  "react": "^18.2.0",
  "react-dom": "^18.2.0",
  "typescript": "^5.3.3",
  "tailwindcss": "^3.3.6",
  "zustand": "^4.4.7",
  "socket.io-client": "^4.7.4",
  "@tanstack/react-query": "^5.8.4"
}
```

### **UI & Design Dependencies**
```json
{
  "@radix-ui/react-dialog": "^1.0.5",
  "@radix-ui/react-dropdown-menu": "^2.0.6",
  "@radix-ui/react-toast": "^1.1.5",
  "@headlessui/react": "^1.7.17",
  "framer-motion": "^10.16.16",
  "lucide-react": "^0.294.0",
  "class-variance-authority": "^0.7.0",
  "tailwind-merge": "^2.0.0"
}
```

### **Voice & Audio Dependencies**
```json
{
  "react-speech-recognition": "^3.10.0",
  "react-speech-kit": "^2.0.5",
  "web-speech-recognition": "^1.0.0",
  "audio-visualizer": "^1.0.0"
}
```

### **Calendar Dependencies**
```json
{
  "react-big-calendar": "^1.8.6",
  "@fullcalendar/react": "^6.1.10",
  "@fullcalendar/daygrid": "^6.1.10",
  "@fullcalendar/timegrid": "^6.1.10",
  "@fullcalendar/interaction": "^6.1.10",
  "date-fns": "^2.30.0",
  "react-datepicker": "^4.21.0"
}
```

### **Form & Validation Dependencies**
```json
{
  "react-hook-form": "^7.48.2",
  "zod": "^3.22.4",
  "@hookform/resolvers": "^3.3.2",
  "react-select": "^5.8.0"
}
```

### **Authentication Dependencies**
```json
{
  "next-auth": "^4.24.5",
  "jwt-decode": "^4.0.0"
}
```

### **Testing Dependencies**
```json
{
  "jest": "^29.7.0",
  "@testing-library/react": "^14.1.2",
  "@testing-library/jest-dom": "^6.1.5",
  "@testing-library/user-event": "^14.5.1",
  "playwright": "^1.40.1",
  "storybook": "^7.6.7"
}
```

---

## 🎨 **UI/UX DESIGN REQUIREMENTS**

### **Voice Interface Design Patterns**
```css
/* Voice State Visual Feedback */
.voice-button {
  /* Base state */
  background: linear-gradient(135deg, #3b82f6, #2563eb);
  border-radius: 50%;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
}

.voice-button.listening {
  /* Active listening state */
  background: linear-gradient(135deg, #10b981, #059669);
  animation: voicePulse 1.5s ease-in-out infinite;
  box-shadow: 0 0 30px rgba(16, 185, 129, 0.6);
  transform: scale(1.1);
}

.voice-button.processing {
  /* AI processing state */
  background: linear-gradient(135deg, #f59e0b, #d97706);
  animation: voiceSpin 2s linear infinite;
  box-shadow: 0 0 30px rgba(245, 158, 11, 0.6);
}

.voice-button.speaking {
  /* TTS speaking state */
  background: linear-gradient(135deg, #8b5cf6, #7c3aed);
  animation: voiceWave 1s ease-in-out infinite;
  box-shadow: 0 0 30px rgba(139, 92, 246, 0.6);
}

/* Audio Visualization */
.audio-visualizer {
  display: flex;
  align-items: flex-end;
  gap: 3px;
  height: 80px;
  padding: 15px;
  background: rgba(0, 0, 0, 0.05);
  border-radius: 12px;
  backdrop-filter: blur(10px);
}

.audio-bar {
  width: 6px;
  background: linear-gradient(to top, #10b981, #3b82f6, #8b5cf6);
  border-radius: 3px;
  transition: height 0.1s ease;
  min-height: 4px;
}

/* Voice Feedback Toast */
.voice-feedback {
  position: fixed;
  bottom: 24px;
  right: 24px;
  background: rgba(0, 0, 0, 0.95);
  color: white;
  padding: 16px 20px;
  border-radius: 12px;
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  z-index: 1000;
  max-width: 350px;
  animation: slideInUp 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
}
```

### **Calendar Interface Design**
```css
/* Modern Calendar Grid */
.calendar-container {
  background: var(--background);
  border-radius: 16px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  border: 1px solid var(--border);
}

.calendar-header {
  background: linear-gradient(135deg, var(--primary-50), var(--primary-100));
  padding: 20px;
  border-bottom: 1px solid var(--border);
}

.calendar-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 1px;
  background: var(--border);
}

.calendar-day {
  background: var(--background);
  min-height: 120px;
  padding: 12px;
  position: relative;
  transition: all 0.2s ease;
  cursor: pointer;
}

.calendar-day:hover {
  background: var(--accent);
  transform: translateY(-1px);
}

.calendar-day.today {
  background: linear-gradient(135deg, var(--primary-50), var(--primary-100));
  border: 2px solid var(--primary-500);
  font-weight: 600;
}

/* Event Cards */
.event-card {
  background: var(--card-background);
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 10px 12px;
  margin-bottom: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
  overflow: hidden;
  font-size: 12px;
  line-height: 1.4;
}

.event-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
  border-color: var(--primary-300);
}

.event-card.voice-created {
  border-left: 4px solid var(--voice-listening);
  background: linear-gradient(90deg, var(--voice-listening-50), transparent);
}

.event-card.urgent {
  border-left: 4px solid var(--error);
  background: linear-gradient(90deg, var(--error-50), transparent);
  animation: pulse 2s infinite;
}

/* Event Type Indicators */
.event-type-meeting { border-left-color: var(--calendar-meeting); }
.event-type-appointment { border-left-color: var(--calendar-appointment); }
.event-type-reminder { border-left-color: var(--calendar-reminder); }
.event-type-task { border-left-color: var(--calendar-task); }
```

### **Responsive Design System**
```css
/* Mobile-First Breakpoints */
:root {
  --container-padding: 16px;
  --border-radius: 8px;
  --font-size-base: 14px;
}

@media (min-width: 768px) {
  :root {
    --container-padding: 24px;
    --border-radius: 12px;
    --font-size-base: 16px;
  }
}

@media (min-width: 1024px) {
  :root {
    --container-padding: 32px;
    --border-radius: 16px;
    --font-size-base: 18px;
  }
}

/* Touch-Friendly Interface */
.voice-button {
  min-height: 56px; /* iOS recommended touch target */
  min-width: 56px;
  padding: 16px;
  border-radius: 28px;
  font-size: 16px;
  font-weight: 600;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.voice-button:active {
  transform: scale(0.95);
}

/* Accessibility Enhancements */
.voice-button:focus {
  outline: 2px solid var(--primary-500);
  outline-offset: 2px;
  box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1);
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

/* High Contrast Mode Support */
@media (prefers-contrast: high) {
  .voice-button {
    border: 2px solid currentColor;
  }
  
  .event-card {
    border: 2px solid currentColor;
  }
}

/* Reduced Motion Support */
@media (prefers-reduced-motion: reduce) {
  .voice-button {
    animation: none;
    transition: none;
  }
  
  .audio-bar {
    transition: none;
  }
}
```

---

## 🔧 **FRONTEND TECHNICAL IMPLEMENTATION**

### **Voice Processing Architecture**
```typescript
// Voice Processing Hook
export const useVoice = () => {
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [confidence, setConfidence] = useState(0);
  const [audioLevel, setAudioLevel] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);

  // Initialize speech recognition
  const initializeSpeechRecognition = useCallback(() => {
    if (!('webkitSpeechRecognition' in window)) {
      setError('Speech recognition not supported');
      return;
    }

    recognitionRef.current = new (window as any).webkitSpeechRecognition();
    const recognition = recognitionRef.current;

    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      setIsListening(true);
      setError(null);
    };

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let finalTranscript = '';
      let interimTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript;
        } else {
          interimTranscript += transcript;
        }
      }

      setTranscript(finalTranscript || interimTranscript);
      setConfidence(event.results[event.results.length - 1][0].confidence);
    };

    recognition.onerror = (event: SpeechRecognitionError) => {
      setError(`Speech recognition error: ${event.error}`);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };
  }, []);

  // Audio level monitoring
  const startAudioMonitoring = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioContextRef.current = new AudioContext();
      const audioContext = audioContextRef.current;

      const source = audioContext.createMediaStreamSource(stream);
      analyserRef.current = audioContext.createAnalyser();
      
      source.connect(analyserRef.current);
      
      const updateAudioLevel = () => {
        if (!analyserRef.current) return;
        
        const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
        analyserRef.current.getByteFrequencyData(dataArray);
        
        const average = dataArray.reduce((sum, value) => sum + value, 0) / dataArray.length;
        setAudioLevel(average / 255);
        
        requestAnimationFrame(updateAudioLevel);
      };
      
      updateAudioLevel();
    } catch (error) {
      console.error('Error accessing microphone:', error);
    }
  }, []);

  // Voice command processing
  const processVoiceCommand = useCallback(async (command: string) => {
    setIsProcessing(true);
    setError(null);

    try {
      const response = await fetch('/api/voice/process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ command, confidence })
      });

      if (!response.ok) {
        throw new Error('Failed to process voice command');
      }

      const result = await response.json();
      
      // Handle AI response
      if (result.speak) {
        await speak(result.response);
      }
      
      return result;
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Unknown error');
      throw error;
    } finally {
      setIsProcessing(false);
    }
  }, [confidence]);

  // Text-to-speech
  const speak = useCallback((text: string) => {
    if (!('speechSynthesis' in window)) {
      setError('Text-to-speech not supported');
      return;
    }

    setIsSpeaking(true);
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.voice = speechSynthesis.getVoices().find(voice => 
      voice.lang === 'en-US' && voice.name.includes('Neural')
    ) || null;
    
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => {
      setIsSpeaking(false);
      setError('Text-to-speech error');
    };
    
    speechSynthesis.speak(utterance);
  }, []);

  // Start/stop listening
  const toggleListening = useCallback(() => {
    if (!recognitionRef.current) {
      initializeSpeechRecognition();
      startAudioMonitoring();
    }

    if (isListening) {
      recognitionRef.current?.stop();
    } else {
      recognitionRef.current?.start();
    }
  }, [isListening, initializeSpeechRecognition, startAudioMonitoring]);

  useEffect(() => {
    initializeSpeechRecognition();
    startAudioMonitoring();

    return () => {
      recognitionRef.current?.stop();
      audioContextRef.current?.close();
    };
  }, [initializeSpeechRecognition, startAudioMonitoring]);

  return {
    isListening,
    isProcessing,
    isSpeaking,
    transcript,
    confidence,
    audioLevel,
    error,
    toggleListening,
    processVoiceCommand,
    speak
  };
};
```

### **Real-time WebSocket Integration**
```typescript
// WebSocket Hook for Real-time Communication
export const useWebSocket = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const socketRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const messageQueueRef = useRef<any[]>([]);

  const connect = useCallback((url: string, token: string) => {
    if (socketRef.current?.readyState === WebSocket.OPEN) {
      return;
    }

    try {
      const socket = new WebSocket(`${url}?token=${token}`);
      socketRef.current = socket;

      socket.onopen = () => {
        setIsConnected(true);
        setConnectionError(null);
        
        // Process queued messages
        while (messageQueueRef.current.length > 0) {
          const message = messageQueueRef.current.shift();
          if (message) {
            socket.send(JSON.stringify(message));
          }
        }
      };

      socket.onclose = (event) => {
        setIsConnected(false);
        
        if (!event.wasClean) {
          setConnectionError('Connection lost. Reconnecting...');
          
          // Exponential backoff reconnection
          const delay = Math.min(1000 * Math.pow(2, 3), 30000);
          reconnectTimeoutRef.current = setTimeout(() => {
            connect(url, token);
          }, delay);
        }
      };

      socket.onerror = (error) => {
        setConnectionError('WebSocket error');
        console.error('WebSocket error:', error);
      };

      socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          handleMessage(data);
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };
    } catch (error) {
      setConnectionError('Failed to connect');
      console.error('WebSocket connection error:', error);
    }
  }, []);

  const sendMessage = useCallback((type: string, payload: any) => {
    const message = { type, payload, timestamp: Date.now() };
    
    if (socketRef.current?.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify(message));
    } else {
      messageQueueRef.current.push(message);
    }
  }, []);

  const handleMessage = useCallback((data: any) => {
    switch (data.type) {
      case 'voice_response':
        // Handle AI voice response
        break;
      case 'calendar_update':
        // Handle calendar updates
        break;
      case 'notification':
        // Handle notifications
        break;
      case 'error':
        setConnectionError(data.payload.message);
        break;
    }
  }, []);

  useEffect(() => {
    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (socketRef.current) {
        socketRef.current.close();
      }
    };
  }, []);

  return {
    isConnected,
    connectionError,
    connect,
    sendMessage
  };
};
```

---

## 🚀 **FRONTEND SERVICES & INTEGRATIONS**

### **Required Third-Party Services**

#### **AI & Voice Services**
1. **OpenAI API** - GPT-4 for natural language processing
   - Sign up: https://platform.openai.com/
   - Pricing: Pay-per-use model
   - Rate limits: 3,500 requests/minute

2. **Anthropic Claude API** - Advanced reasoning and analysis
   - Sign up: https://console.anthropic.com/
   - Pricing: Pay-per-use model
   - Rate limits: 5 requests/minute

3. **Azure Speech Services** - High-quality speech recognition and synthesis
   - Sign up: https://azure.microsoft.com/services/cognitive-services/speech-services/
   - Pricing: Pay-per-use model
   - Features: Custom voice models, real-time transcription

4. **Google Speech-to-Text** - Alternative speech recognition
   - Sign up: https://cloud.google.com/speech-to-text
   - Pricing: Pay-per-use model
   - Features: 120+ languages, custom models

#### **Calendar Integration Services**
1. **Google Calendar API** - Primary calendar integration
   - Sign up: https://console.cloud.google.com/
   - OAuth 2.0 setup required
   - Rate limits: 1,000,000 requests/day

2. **Microsoft Graph API** - Outlook calendar integration
   - Sign up: https://portal.azure.com/
   - Azure AD app registration required
   - Rate limits: 10,000 requests/10 minutes

#### **Authentication Services**
1. **NextAuth.js** - Complete authentication solution
   - Providers: Google, Microsoft, GitHub, Email
   - JWT handling and session management
   - OAuth 2.0 integration

#### **Analytics & Monitoring**
1. **Google Analytics 4** - User behavior tracking
   - Sign up: https://analytics.google.com/
   - Free tier available
   - Custom events for voice interactions

2. **PostHog** - Product analytics and feature flags
   - Sign up: https://posthog.com/
   - Free tier: 1M events/month
   - A/B testing and user insights

3. **Sentry** - Error tracking and performance monitoring
   - Sign up: https://sentry.io/
   - Free tier: 5,000 errors/month
   - Real-time error tracking

#### **File Storage & CDN**
1. **AWS S3** - Audio file storage
   - Sign up: https://aws.amazon.com/s3/
   - Pricing: Pay-per-use
   - Features: Lifecycle policies, encryption

2. **Cloudinary** - Media optimization and delivery
   - Sign up: https://cloudinary.com/
   - Free tier: 25GB storage, 25GB bandwidth
   - Audio/video optimization

#### **Email & Notifications**
1. **SendGrid** - Email delivery service
   - Sign up: https://sendgrid.com/
   - Free tier: 100 emails/day
   - Transactional email templates

2. **Resend** - Modern email API
   - Sign up: https://resend.com/
   - Free tier: 3,000 emails/month
   - React email templates

#### **Development & Testing**
1. **Vercel** - Frontend deployment and hosting
   - Sign up: https://vercel.com/
   - Free tier: Unlimited personal projects
   - Automatic deployments from Git

2. **GitHub** - Version control and CI/CD
   - Sign up: https://github.com/
   - Free tier: Unlimited public repositories
   - GitHub Actions for automation

---

## 📱 **MOBILE & ACCESSIBILITY REQUIREMENTS**

### **Mobile-First Design**
- **Touch Targets**: Minimum 44px for all interactive elements
- **Gesture Support**: Swipe, pinch, and tap gestures for calendar navigation
- **Offline Support**: Service Worker for offline functionality
- **PWA Features**: Installable app with splash screen and icons

### **Accessibility (WCAG 2.1 AA)**
- **Screen Reader Support**: ARIA labels and semantic HTML
- **Keyboard Navigation**: Full keyboard accessibility
- **Color Contrast**: Minimum 4.5:1 ratio for normal text
- **Focus Management**: Visible focus indicators
- **Voice Commands**: Alternative input methods for all functions

### **Performance Requirements**
- **Lighthouse Score**: 95+ for all metrics
- **First Contentful Paint**: < 1.5 seconds
- **Time to Interactive**: < 3 seconds
- **Voice Processing**: < 2 seconds response time
- **Bundle Size**: < 500KB initial load

---

*This comprehensive frontend specification provides Claude Code with all the technical details, dependencies, and integration requirements needed to build a world-class voice assistant frontend.*
