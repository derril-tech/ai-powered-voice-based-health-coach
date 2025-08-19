/**
 * Zustand Store Configuration for AI Voice Assistant
 * Centralized state management using Zustand
 */

import { create } from 'zustand';
import { devtools, persist, subscribeWithSelector } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { 
  User, 
  VoiceSession, 
  CalendarEvent, 
  Notification, 
  Theme,
  VoiceState,
  CalendarState,
  AppState,
  CalendarFilters,
  EventType,
  EventStatus
} from '@/types';

// ============================================================================
// APP STORE
// ============================================================================

interface AppStore extends AppState {
  // Actions
  setUser: (user: User | null) => void;
  setAuthenticated: (isAuthenticated: boolean) => void;
  setLoading: (isLoading: boolean) => void;
  setTheme: (theme: Theme) => void;
  addNotification: (notification: Omit<Notification, 'id' | 'createdAt'>) => void;
  removeNotification: (id: string) => void;
  clearNotifications: () => void;
  setVoiceSession: (session: VoiceSession | null) => void;
  setCalendarEvents: (events: CalendarEvent[]) => void;
  addCalendarEvent: (event: CalendarEvent) => void;
  updateCalendarEvent: (eventId: string, updates: Partial<CalendarEvent>) => void;
  removeCalendarEvent: (eventId: string) => void;
  setSelectedEvent: (event: CalendarEvent | null) => void;
  setVoiceListening: (isListening: boolean) => void;
  setVoiceProcessing: (isProcessing: boolean) => void;
  setVoiceSpeaking: (isSpeaking: boolean) => void;
  setConnectionStatus: (status: 'connected' | 'connecting' | 'disconnected' | 'error') => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

const initialAppState: AppState = {
  user: null,
  isAuthenticated: false,
  isLoading: false,
  theme: {
    mode: 'light',
    primary: '#0ea5e9',
    secondary: '#d946ef',
    accent: '#10b981',
    background: '#ffffff',
    surface: '#f8fafc',
    text: '#0f172a',
    textSecondary: '#64748b',
    border: '#e2e8f0',
    error: '#ef4444',
    warning: '#f59e0b',
    success: '#22c55e',
    info: '#3b82f6',
  },
  notifications: [],
  voiceSession: null,
  calendarEvents: [],
  selectedEvent: null,
  isVoiceListening: false,
  isVoiceProcessing: false,
  isVoiceSpeaking: false,
  connectionStatus: 'disconnected',
  error: null,
};

export const useAppStore = create<AppStore>()(
  devtools(
    persist(
      subscribeWithSelector(
        immer((set, get) => ({
          ...initialAppState,

          setUser: (user) =>
            set((state) => {
              state.user = user;
              state.isAuthenticated = !!user;
            }),

          setAuthenticated: (isAuthenticated) =>
            set((state) => {
              state.isAuthenticated = isAuthenticated;
            }),

          setLoading: (isLoading) =>
            set((state) => {
              state.isLoading = isLoading;
            }),

          setTheme: (theme) =>
            set((state) => {
              state.theme = theme;
            }),

          addNotification: (notification) =>
            set((state) => {
              const newNotification: Notification = {
                ...notification,
                id: Date.now().toString(),
                createdAt: new Date().toISOString(),
              };
              state.notifications.push(newNotification);
            }),

          removeNotification: (id) =>
            set((state) => {
              state.notifications = state.notifications.filter(n => n.id !== id);
            }),

          clearNotifications: () =>
            set((state) => {
              state.notifications = [];
            }),

          setVoiceSession: (session) =>
            set((state) => {
              state.voiceSession = session;
            }),

          setCalendarEvents: (events) =>
            set((state) => {
              state.calendarEvents = events;
            }),

          addCalendarEvent: (event) =>
            set((state) => {
              state.calendarEvents.push(event);
            }),

          updateCalendarEvent: (eventId, updates) =>
            set((state) => {
              const eventIndex = state.calendarEvents.findIndex(e => e.id === eventId);
              if (eventIndex !== -1) {
                state.calendarEvents[eventIndex] = {
                  ...state.calendarEvents[eventIndex],
                  ...updates,
                };
              }
            }),

          removeCalendarEvent: (eventId) =>
            set((state) => {
              state.calendarEvents = state.calendarEvents.filter(e => e.id !== eventId);
            }),

          setSelectedEvent: (event) =>
            set((state) => {
              state.selectedEvent = event;
            }),

          setVoiceListening: (isListening) =>
            set((state) => {
              state.isVoiceListening = isListening;
            }),

          setVoiceProcessing: (isProcessing) =>
            set((state) => {
              state.isVoiceProcessing = isProcessing;
            }),

          setVoiceSpeaking: (isSpeaking) =>
            set((state) => {
              state.isVoiceSpeaking = isSpeaking;
            }),

          setConnectionStatus: (status) =>
            set((state) => {
              state.connectionStatus = status;
            }),

          setError: (error) =>
            set((state) => {
              state.error = error;
            }),

          reset: () =>
            set(() => initialAppState),
        })
      ),
      {
        name: 'app-store',
        partialize: (state) => ({
          user: state.user,
          isAuthenticated: state.isAuthenticated,
          theme: state.theme,
          notifications: state.notifications,
        }),
      }
    ),
    {
      name: 'app-store',
    }
  )
);

// ============================================================================
// VOICE STORE
// ============================================================================

interface VoiceStore extends VoiceState {
  // Actions
  setListening: (isListening: boolean) => void;
  setProcessing: (isProcessing: boolean) => void;
  setSpeaking: (isSpeaking: boolean) => void;
  setCurrentSession: (session: VoiceSession | null) => void;
  setTranscript: (transcript: string) => void;
  setConfidence: (confidence: number) => void;
  setError: (error: string | null) => void;
  setAudioLevel: (level: number) => void;
  setMuted: (isMuted: boolean) => void;
  setPaused: (isPaused: boolean) => void;
  reset: () => void;
}

const initialVoiceState: VoiceState = {
  isListening: false,
  isProcessing: false,
  isSpeaking: false,
  currentSession: null,
  transcript: '',
  confidence: 0,
  error: null,
  audioLevel: 0,
  isMuted: false,
  isPaused: false,
};

export const useVoiceStore = create<VoiceStore>()(
  devtools(
    subscribeWithSelector(
      immer((set) => ({
        ...initialVoiceState,

        setListening: (isListening) =>
          set((state) => {
            state.isListening = isListening;
          }),

        setProcessing: (isProcessing) =>
          set((state) => {
            state.isProcessing = isProcessing;
          }),

        setSpeaking: (isSpeaking) =>
          set((state) => {
            state.isSpeaking = isSpeaking;
          }),

        setCurrentSession: (session) =>
          set((state) => {
            state.currentSession = session;
          }),

        setTranscript: (transcript) =>
          set((state) => {
            state.transcript = transcript;
          }),

        setConfidence: (confidence) =>
          set((state) => {
            state.confidence = confidence;
          }),

        setError: (error) =>
          set((state) => {
            state.error = error;
          }),

        setAudioLevel: (level) =>
          set((state) => {
            state.audioLevel = level;
          }),

        setMuted: (isMuted) =>
          set((state) => {
            state.isMuted = isMuted;
          }),

        setPaused: (isPaused) =>
          set((state) => {
            state.isPaused = isPaused;
          }),

        reset: () =>
          set(() => initialVoiceState),
      })
    ),
    {
      name: 'voice-store',
    }
  )
);

// ============================================================================
// CALENDAR STORE
// ============================================================================

interface CalendarStore extends CalendarState {
  // Actions
  setEvents: (events: CalendarEvent[]) => void;
  addEvent: (event: CalendarEvent) => void;
  updateEvent: (eventId: string, updates: Partial<CalendarEvent>) => void;
  removeEvent: (eventId: string) => void;
  setSelectedEvent: (event: CalendarEvent | null) => void;
  setSelectedDate: (date: Date) => void;
  setView: (view: 'day' | 'week' | 'month' | 'year') => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  setFilters: (filters: Partial<CalendarFilters>) => void;
  resetFilters: () => void;
  reset: () => void;
}

const initialCalendarState: CalendarState = {
  events: [],
  selectedEvent: null,
  selectedDate: new Date(),
  view: 'month',
  isLoading: false,
  error: null,
  filters: {
    eventTypes: [],
    statuses: [],
    dateRange: {
      start: new Date(),
      end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
    },
    search: '',
    showRecurring: true,
    showAllDay: true,
  },
};

export const useCalendarStore = create<CalendarStore>()(
  devtools(
    persist(
      subscribeWithSelector(
        immer((set) => ({
          ...initialCalendarState,

          setEvents: (events) =>
            set((state) => {
              state.events = events;
            }),

          addEvent: (event) =>
            set((state) => {
              state.events.push(event);
            }),

          updateEvent: (eventId, updates) =>
            set((state) => {
              const eventIndex = state.events.findIndex(e => e.id === eventId);
              if (eventIndex !== -1) {
                state.events[eventIndex] = {
                  ...state.events[eventIndex],
                  ...updates,
                };
              }
            }),

          removeEvent: (eventId) =>
            set((state) => {
              state.events = state.events.filter(e => e.id !== eventId);
            }),

          setSelectedEvent: (event) =>
            set((state) => {
              state.selectedEvent = event;
            }),

          setSelectedDate: (date) =>
            set((state) => {
              state.selectedDate = date;
            }),

          setView: (view) =>
            set((state) => {
              state.view = view;
            }),

          setLoading: (isLoading) =>
            set((state) => {
              state.isLoading = isLoading;
            }),

          setError: (error) =>
            set((state) => {
              state.error = error;
            }),

          setFilters: (filters) =>
            set((state) => {
              state.filters = { ...state.filters, ...filters };
            }),

          resetFilters: () =>
            set((state) => {
              state.filters = initialCalendarState.filters;
            }),

          reset: () =>
            set(() => initialCalendarState),
        })
      ),
      {
        name: 'calendar-store',
        partialize: (state) => ({
          selectedDate: state.selectedDate,
          view: state.view,
          filters: state.filters,
        }),
      }
    ),
    {
      name: 'calendar-store',
    }
  )
);

// ============================================================================
// THEME STORE
// ============================================================================

interface ThemeStore {
  theme: Theme;
  isDark: boolean;
  setTheme: (theme: Theme) => void;
  toggleDarkMode: () => void;
  setDarkMode: (isDark: boolean) => void;
}

const lightTheme: Theme = {
  mode: 'light',
  primary: '#0ea5e9',
  secondary: '#d946ef',
  accent: '#10b981',
  background: '#ffffff',
  surface: '#f8fafc',
  text: '#0f172a',
  textSecondary: '#64748b',
  border: '#e2e8f0',
  error: '#ef4444',
  warning: '#f59e0b',
  success: '#22c55e',
  info: '#3b82f6',
};

const darkTheme: Theme = {
  mode: 'dark',
  primary: '#38bdf8',
  secondary: '#e879f9',
  accent: '#34d399',
  background: '#0f172a',
  surface: '#1e293b',
  text: '#f8fafc',
  textSecondary: '#cbd5e1',
  border: '#334155',
  error: '#f87171',
  warning: '#fbbf24',
  success: '#4ade80',
  info: '#60a5fa',
};

export const useThemeStore = create<ThemeStore>()(
  devtools(
    persist(
      subscribeWithSelector(
        immer((set, get) => ({
          theme: lightTheme,
          isDark: false,

          setTheme: (theme) =>
            set((state) => {
              state.theme = theme;
              state.isDark = theme.mode === 'dark';
            }),

          toggleDarkMode: () =>
            set((state) => {
              const newTheme = state.isDark ? lightTheme : darkTheme;
              state.theme = newTheme;
              state.isDark = !state.isDark;
            }),

          setDarkMode: (isDark) =>
            set((state) => {
              const newTheme = isDark ? darkTheme : lightTheme;
              state.theme = newTheme;
              state.isDark = isDark;
            }),
        })
      ),
      {
        name: 'theme-store',
        partialize: (state) => ({
          theme: state.theme,
          isDark: state.isDark,
        }),
      }
    ),
    {
      name: 'theme-store',
    }
  )
);

// ============================================================================
// NOTIFICATION STORE
// ============================================================================

interface NotificationStore {
  notifications: Notification[];
  addNotification: (notification: Omit<Notification, 'id' | 'createdAt'>) => void;
  removeNotification: (id: string) => void;
  clearNotifications: () => void;
  clearByType: (type: Notification['type']) => void;
}

export const useNotificationStore = create<NotificationStore>()(
  devtools(
    subscribeWithSelector(
      immer((set) => ({
        notifications: [],

        addNotification: (notification) =>
          set((state) => {
            const newNotification: Notification = {
              ...notification,
              id: Date.now().toString(),
              createdAt: new Date().toISOString(),
            };
            state.notifications.push(newNotification);
          }),

        removeNotification: (id) =>
          set((state) => {
            state.notifications = state.notifications.filter(n => n.id !== id);
          }),

        clearNotifications: () =>
          set((state) => {
            state.notifications = [];
          }),

        clearByType: (type) =>
          set((state) => {
            state.notifications = state.notifications.filter(n => n.type !== type);
          }),
      })
    ),
    {
      name: 'notification-store',
    }
  )
);

// ============================================================================
// WEBSOCKET STORE
// ============================================================================

interface WebSocketStore {
  isConnected: boolean;
  isConnecting: boolean;
  connectionId: string | null;
  userId: string | null;
  error: string | null;
  setConnected: (isConnected: boolean) => void;
  setConnecting: (isConnecting: boolean) => void;
  setConnectionId: (connectionId: string | null) => void;
  setUserId: (userId: string | null) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

export const useWebSocketStore = create<WebSocketStore>()(
  devtools(
    subscribeWithSelector(
      immer((set) => ({
        isConnected: false,
        isConnecting: false,
        connectionId: null,
        userId: null,
        error: null,

        setConnected: (isConnected) =>
          set((state) => {
            state.isConnected = isConnected;
          }),

        setConnecting: (isConnecting) =>
          set((state) => {
            state.isConnecting = isConnecting;
          }),

        setConnectionId: (connectionId) =>
          set((state) => {
            state.connectionId = connectionId;
          }),

        setUserId: (userId) =>
          set((state) => {
            state.userId = userId;
          }),

        setError: (error) =>
          set((state) => {
            state.error = error;
          }),

        reset: () =>
          set((state) => {
            state.isConnected = false;
            state.isConnecting = false;
            state.connectionId = null;
            state.userId = null;
            state.error = null;
          }),
      })
    ),
    {
      name: 'websocket-store',
    }
  )
);

// ============================================================================
// UTILITY SELECTORS
// ============================================================================

// App store selectors
export const useUser = () => useAppStore((state) => state.user);
export const useIsAuthenticated = () => useAppStore((state) => state.isAuthenticated);
export const useIsLoading = () => useAppStore((state) => state.isLoading);
export const useTheme = () => useAppStore((state) => state.theme);
export const useNotifications = () => useAppStore((state) => state.notifications);
export const useVoiceSession = () => useAppStore((state) => state.voiceSession);
export const useCalendarEvents = () => useAppStore((state) => state.calendarEvents);
export const useSelectedEvent = () => useAppStore((state) => state.selectedEvent);
export const useVoiceStates = () => useAppStore((state) => ({
  isListening: state.isVoiceListening,
  isProcessing: state.isVoiceProcessing,
  isSpeaking: state.isVoiceSpeaking,
}));
export const useConnectionStatus = () => useAppStore((state) => state.connectionStatus);
export const useError = () => useAppStore((state) => state.error);

// Voice store selectors
export const useVoiceState = () => useVoiceStore((state) => state);
export const useIsVoiceListening = () => useVoiceStore((state) => state.isListening);
export const useIsVoiceProcessing = () => useVoiceStore((state) => state.isProcessing);
export const useIsVoiceSpeaking = () => useVoiceStore((state) => state.isSpeaking);
export const useCurrentVoiceSession = () => useVoiceStore((state) => state.currentSession);
export const useTranscript = () => useVoiceStore((state) => state.transcript);
export const useConfidence = () => useVoiceStore((state) => state.confidence);
export const useVoiceError = () => useVoiceStore((state) => state.error);
export const useAudioLevel = () => useVoiceStore((state) => state.audioLevel);
export const useIsMuted = () => useVoiceStore((state) => state.isMuted);
export const useIsPaused = () => useVoiceStore((state) => state.isPaused);

// Calendar store selectors
export const useCalendarState = () => useCalendarStore((state) => state);
export const useEvents = () => useCalendarStore((state) => state.events);
export const useSelectedCalendarEvent = () => useCalendarStore((state) => state.selectedEvent);
export const useSelectedDate = () => useCalendarStore((state) => state.selectedDate);
export const useCalendarView = () => useCalendarStore((state) => state.view);
export const useCalendarLoading = () => useCalendarStore((state) => state.isLoading);
export const useCalendarError = () => useCalendarStore((state) => state.error);
export const useCalendarFilters = () => useCalendarStore((state) => state.filters);

// Theme store selectors
export const useCurrentTheme = () => useThemeStore((state) => state.theme);
export const useIsDarkMode = () => useThemeStore((state) => state.isDark);

// WebSocket store selectors
export const useWebSocketState = () => useWebSocketStore((state) => state);
export const useIsWebSocketConnected = () => useWebSocketStore((state) => state.isConnected);
export const useIsWebSocketConnecting = () => useWebSocketStore((state) => state.isConnecting);
export const useConnectionId = () => useWebSocketStore((state) => state.connectionId);
export const useWebSocketError = () => useWebSocketStore((state) => state.error);

// ============================================================================
// STORE EXPORTS
// ============================================================================

export {
  useAppStore,
  useVoiceStore,
  useCalendarStore,
  useThemeStore,
  useNotificationStore,
  useWebSocketStore,
};
