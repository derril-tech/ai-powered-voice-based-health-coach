/**
 * TypeScript type definitions for AI Voice Assistant
 * This file contains all the core types used throughout the application
 */

// ============================================================================
// CORE TYPES
// ============================================================================

export interface User {
  id: string;
  email: string;
  fullName?: string;
  firstName?: string;
  lastName?: string;
  avatarUrl?: string;
  isActive: boolean;
  isVerified: boolean;
  isPremium: boolean;
  timezone: string;
  language: string;
  theme: 'light' | 'dark' | 'auto';
  voicePreferences?: VoicePreferences;
  speechRate: 'slow' | 'normal' | 'fast';
  voiceId?: string;
  aiModelPreference: string;
  aiTemperature: string;
  aiContextLength: string;
  emailNotifications: boolean;
  pushNotifications: boolean;
  voiceNotifications: boolean;
  lastLogin?: string;
  createdAt: string;
  updatedAt: string;
}

export interface VoicePreferences {
  voiceId: string;
  speechRate: 'slow' | 'normal' | 'fast';
  pitch: number;
  volume: number;
  language: string;
  accent?: string;
}

// ============================================================================
// VOICE & AI TYPES
// ============================================================================

export type VoiceSessionStatus = 
  | 'initiated'
  | 'listening'
  | 'processing'
  | 'responding'
  | 'completed'
  | 'failed'
  | 'cancelled';

export type SpeechRecognitionStatus = 
  | 'pending'
  | 'processing'
  | 'completed'
  | 'failed'
  | 'partial';

export interface VoiceSession {
  id: string;
  userId: string;
  sessionId: string;
  status: VoiceSessionStatus;
  audioFilePath?: string;
  audioDuration?: number;
  audioFormat?: string;
  audioQuality?: string;
  originalTranscript?: string;
  processedTranscript?: string;
  confidenceScore?: number;
  languageDetected?: string;
  aiModelUsed?: string;
  aiResponse?: string;
  aiProcessingTime?: number;
  aiTokensUsed?: number;
  responseAudioPath?: string;
  responseDuration?: number;
  voiceIdUsed?: string;
  speechRateUsed?: string;
  contextData?: Record<string, any>;
  deviceInfo?: DeviceInfo;
  locationData?: LocationData;
  errorMessage?: string;
  errorCode?: string;
  retryCount: number;
  totalProcessingTime?: number;
  networkLatency?: number;
  memoryUsage?: number;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
}

export interface SpeechRecognition {
  id: string;
  voiceSessionId: string;
  status: SpeechRecognitionStatus;
  transcript?: string;
  confidenceScore?: number;
  languageDetected?: string;
  audioSegmentPath?: string;
  segmentStart?: number;
  segmentEnd?: number;
  segmentDuration?: number;
  recognitionService?: string;
  processingTime?: number;
  modelVersion?: string;
  alternativeTranscripts?: string[];
  wordTimings?: WordTiming[];
  errorMessage?: string;
  errorCode?: string;
  createdAt: string;
  updatedAt: string;
}

export interface VoiceCommand {
  id: string;
  voiceSessionId: string;
  commandType: string;
  commandAction: string;
  originalText: string;
  parsedCommand?: Record<string, any>;
  intentConfidence?: number;
  entitiesExtracted?: NamedEntity[];
  slotsFilled?: Record<string, any>;
  processingStatus: 'pending' | 'processing' | 'completed' | 'failed';
  processingResult?: Record<string, any>;
  processingTime?: number;
  contextData?: Record<string, any>;
  userPreferences?: Record<string, any>;
  errorMessage?: string;
  errorCode?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AIResponse {
  success: boolean;
  commandType: 'calendar' | 'reminder' | 'query' | 'error';
  action: 'create' | 'update' | 'delete' | 'get' | 'schedule';
  confidence: number;
  entities: CalendarEntities;
  response: string;
  suggestions: string[];
  originalTranscript: string;
  error?: string;
}

// ============================================================================
// CALENDAR TYPES
// ============================================================================

export type EventStatus = 
  | 'scheduled'
  | 'confirmed'
  | 'tentative'
  | 'cancelled'
  | 'completed';

export type EventType = 
  | 'meeting'
  | 'appointment'
  | 'task'
  | 'reminder'
  | 'birthday'
  | 'holiday'
  | 'custom';

export type ReminderType = 
  | 'email'
  | 'push'
  | 'voice'
  | 'sms'
  | 'calendar';

export interface CalendarEvent {
  id: string;
  userId: string;
  title: string;
  description?: string;
  location?: string;
  eventType: EventType;
  status: EventStatus;
  startTime: string;
  endTime: string;
  allDay: boolean;
  timezone: string;
  isRecurring: boolean;
  recurrenceRule?: string;
  recurrenceExceptions?: string[];
  attendees?: Attendee[];
  organizer?: string;
  externalId?: string;
  externalCalendarId?: string;
  externalUrl?: string;
  voiceCreated: boolean;
  voiceCommand?: string;
  aiProcessed: boolean;
  aiSummary?: string;
  durationMinutes: number;
  isPast: boolean;
  isUpcoming: boolean;
  isToday: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface EventReminder {
  id: string;
  eventId: string;
  userId: string;
  reminderType: ReminderType;
  reminderTime: string;
  message?: string;
  isSent: boolean;
  sentAt?: string;
  isDismissed: boolean;
  dismissedAt?: string;
  voiceReminder: boolean;
  voiceMessage?: string;
  isOverdue: boolean;
  isUpcoming: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CalendarIntegration {
  id: string;
  userId: string;
  provider: 'google' | 'microsoft' | 'apple';
  calendarId: string;
  calendarName: string;
  calendarColor?: string;
  accessToken: string;
  refreshToken?: string;
  tokenExpiresAt?: string;
  isActive: boolean;
  syncEnabled: boolean;
  syncDirection: 'inbound' | 'outbound' | 'bidirectional';
  lastSyncAt?: string;
  syncStatus: 'pending' | 'success' | 'failed';
  isTokenExpired: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CalendarEntities {
  title?: string;
  startTime?: string;
  endTime?: string;
  location?: string;
  attendees?: string[];
  description?: string;
  eventType?: EventType;
  isAllDay?: boolean;
  timezone?: string;
}

export interface Attendee {
  email: string;
  name?: string;
  responseStatus?: 'accepted' | 'declined' | 'tentative' | 'needsAction';
  isOrganizer?: boolean;
}

export interface NamedEntity {
  text: string;
  type: string;
  confidence: number;
  startIndex: number;
  endIndex: number;
}

export interface WordTiming {
  word: string;
  startTime: number;
  endTime: number;
  confidence: number;
}

// ============================================================================
// API TYPES
// ============================================================================

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  errors?: Record<string, string[]>;
  timestamp: string;
  requestId: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface LoginRequest {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterRequest {
  email: string;
  password: string;
  confirmPassword: string;
  fullName?: string;
  firstName?: string;
  lastName?: string;
  acceptTerms: boolean;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  tokenType: string;
}

// ============================================================================
// WEBSOCKET TYPES
// ============================================================================

export interface WebSocketMessage {
  type: string;
  data?: any;
  timestamp: string;
  requestId?: string;
}

export interface VoiceCommandMessage extends WebSocketMessage {
  type: 'voice_command';
  data: {
    transcript: string;
    audioData?: string;
    context?: Record<string, any>;
  };
}

export interface VoiceResponseMessage extends WebSocketMessage {
  type: 'voice_response';
  data: AIResponse;
}

export interface VoiceProcessingMessage extends WebSocketMessage {
  type: 'voice_processing';
  data: {
    status: 'processing' | 'completed' | 'failed';
    progress?: number;
  };
}

export interface CalendarUpdateMessage extends WebSocketMessage {
  type: 'calendar_update';
  data: {
    action: 'create' | 'update' | 'delete';
    event: CalendarEvent;
  };
}

export interface ConnectionMessage extends WebSocketMessage {
  type: 'connection_established' | 'connection_error';
  data: {
    connectionId?: string;
    userId?: string;
    error?: string;
  };
}

// ============================================================================
// UI & COMPONENT TYPES
// ============================================================================

export interface Theme {
  mode: 'light' | 'dark' | 'auto';
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  surface: string;
  text: string;
  textSecondary: string;
  border: string;
  error: string;
  warning: string;
  success: string;
  info: string;
}

export interface DeviceInfo {
  userAgent: string;
  platform: string;
  browser: string;
  version: string;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  screenWidth: number;
  screenHeight: number;
  timezone: string;
  language: string;
}

export interface LocationData {
  latitude?: number;
  longitude?: number;
  accuracy?: number;
  city?: string;
  country?: string;
  timezone?: string;
}

export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
  createdAt: string;
}

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  closeOnOverlayClick?: boolean;
  closeOnEscape?: boolean;
}

export interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  disabled?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  onClick?: () => void;
  children: React.ReactNode;
  className?: string;
}

// ============================================================================
// STATE MANAGEMENT TYPES
// ============================================================================

export interface AppState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  theme: Theme;
  notifications: Notification[];
  voiceSession: VoiceSession | null;
  calendarEvents: CalendarEvent[];
  selectedEvent: CalendarEvent | null;
  isVoiceListening: boolean;
  isVoiceProcessing: boolean;
  isVoiceSpeaking: boolean;
  connectionStatus: 'connected' | 'connecting' | 'disconnected' | 'error';
  error: string | null;
}

export interface VoiceState {
  isListening: boolean;
  isProcessing: boolean;
  isSpeaking: boolean;
  currentSession: VoiceSession | null;
  transcript: string;
  confidence: number;
  error: string | null;
  audioLevel: number;
  isMuted: boolean;
  isPaused: boolean;
}

export interface CalendarState {
  events: CalendarEvent[];
  selectedEvent: CalendarEvent | null;
  selectedDate: Date;
  view: 'day' | 'week' | 'month' | 'year';
  isLoading: boolean;
  error: string | null;
  filters: CalendarFilters;
}

export interface CalendarFilters {
  eventTypes: EventType[];
  statuses: EventStatus[];
  dateRange: {
    start: Date;
    end: Date;
  };
  search: string;
  showRecurring: boolean;
  showAllDay: boolean;
}

// ============================================================================
// UTILITY TYPES
// ============================================================================

export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;

export type EventHandler<T = any> = (event: T) => void;

export type AsyncFunction<T = any, R = any> = (params: T) => Promise<R>;

export type LoadingState = 'idle' | 'loading' | 'success' | 'error';

export interface LoadingStateData<T> {
  data: T | null;
  loading: LoadingState;
  error: string | null;
}

// ============================================================================
// CONSTANTS
// ============================================================================

export const VOICE_SESSION_STATUSES: Record<VoiceSessionStatus, string> = {
  initiated: 'Initiated',
  listening: 'Listening',
  processing: 'Processing',
  responding: 'Responding',
  completed: 'Completed',
  failed: 'Failed',
  cancelled: 'Cancelled',
};

export const EVENT_TYPES: Record<EventType, string> = {
  meeting: 'Meeting',
  appointment: 'Appointment',
  task: 'Task',
  reminder: 'Reminder',
  birthday: 'Birthday',
  holiday: 'Holiday',
  custom: 'Custom',
};

export const EVENT_STATUSES: Record<EventStatus, string> = {
  scheduled: 'Scheduled',
  confirmed: 'Confirmed',
  tentative: 'Tentative',
  cancelled: 'Cancelled',
  completed: 'Completed',
};

export const REMINDER_TYPES: Record<ReminderType, string> = {
  email: 'Email',
  push: 'Push',
  voice: 'Voice',
  sms: 'SMS',
  calendar: 'Calendar',
};

export const SPEECH_RATES: Record<string, string> = {
  slow: 'Slow',
  normal: 'Normal',
  fast: 'Fast',
};

export const AI_MODELS = {
  'gpt-4': 'GPT-4',
  'gpt-3.5-turbo': 'GPT-3.5 Turbo',
  'claude-3-sonnet': 'Claude 3 Sonnet',
  'claude-3-haiku': 'Claude 3 Haiku',
  'claude-3-opus': 'Claude 3 Opus',
} as const;

export const VOICE_IDS = {
  alloy: 'Alloy',
  echo: 'Echo',
  fable: 'Fable',
  onyx: 'Onyx',
  nova: 'Nova',
  shimmer: 'Shimmer',
} as const;

// ============================================================================
// EXPORT ALL TYPES
// ============================================================================

export type {
  User,
  VoicePreferences,
  VoiceSession,
  SpeechRecognition,
  VoiceCommand,
  AIResponse,
  CalendarEvent,
  EventReminder,
  CalendarIntegration,
  CalendarEntities,
  Attendee,
  NamedEntity,
  WordTiming,
  ApiResponse,
  PaginatedResponse,
  LoginRequest,
  RegisterRequest,
  AuthResponse,
  WebSocketMessage,
  VoiceCommandMessage,
  VoiceResponseMessage,
  VoiceProcessingMessage,
  CalendarUpdateMessage,
  ConnectionMessage,
  Theme,
  DeviceInfo,
  LocationData,
  Notification,
  ModalProps,
  ButtonProps,
  AppState,
  VoiceState,
  CalendarState,
  CalendarFilters,
  DeepPartial,
  Optional,
  RequiredFields,
  EventHandler,
  AsyncFunction,
  LoadingState,
  LoadingStateData,
};
