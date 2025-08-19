/**
 * API Client Library for AI Voice Assistant
 * Handles all HTTP requests to the backend API
 */

import { 
  ApiResponse, 
  PaginatedResponse, 
  LoginRequest, 
  RegisterRequest, 
  AuthResponse,
  User,
  CalendarEvent,
  VoiceSession,
  AIResponse,
  CalendarIntegration
} from '@/types';

// ============================================================================
// API CONFIGURATION
// ============================================================================

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
const API_VERSION = process.env.NEXT_PUBLIC_API_VERSION || 'v1';
const API_URL = `${API_BASE_URL}/api/${API_VERSION}`;

// ============================================================================
// HTTP CLIENT
// ============================================================================

class ApiClient {
  private baseURL: string;
  private defaultHeaders: Record<string, string>;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
    this.defaultHeaders = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };
  }

  /**
   * Get authentication token from localStorage or cookies
   */
  private getAuthToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('accessToken') || 
             document.cookie.match(/accessToken=([^;]+)/)?.[1] ||
             null;
    }
    return null;
  }

  /**
   * Set authentication token
   */
  private setAuthToken(token: string): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem('accessToken', token);
      document.cookie = `accessToken=${token}; path=/; max-age=3600; secure; samesite=strict`;
    }
  }

  /**
   * Remove authentication token
   */
  private removeAuthToken(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('accessToken');
      document.cookie = 'accessToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    }
  }

  /**
   * Get request headers with authentication
   */
  private getHeaders(additionalHeaders?: Record<string, string>): Record<string, string> {
    const token = this.getAuthToken();
    const headers = { ...this.defaultHeaders, ...additionalHeaders };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    return headers;
  }

  /**
   * Make HTTP request with error handling
   */
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`;
    const headers = this.getHeaders(options.headers as Record<string, string>);
    
    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      // Handle authentication errors
      if (response.status === 401) {
        this.removeAuthToken();
        window.location.href = '/auth/login';
        throw new Error('Authentication required');
      }

      // Handle rate limiting
      if (response.status === 429) {
        const retryAfter = response.headers.get('Retry-After');
        throw new Error(`Rate limited. Please try again in ${retryAfter || 60} seconds.`);
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `HTTP ${response.status}: ${response.statusText}`);
      }

      return data;
    } catch (error) {
      console.error('API Request Error:', error);
      throw error;
    }
  }

  // ============================================================================
  // AUTHENTICATION ENDPOINTS
  // ============================================================================

  /**
   * User login
   */
  async login(credentials: LoginRequest): Promise<ApiResponse<AuthResponse>> {
    const response = await this.request<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });

    if (response.success && response.data) {
      this.setAuthToken(response.data.accessToken);
    }

    return response;
  }

  /**
   * User registration
   */
  async register(userData: RegisterRequest): Promise<ApiResponse<AuthResponse>> {
    const response = await this.request<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });

    if (response.success && response.data) {
      this.setAuthToken(response.data.accessToken);
    }

    return response;
  }

  /**
   * User logout
   */
  async logout(): Promise<ApiResponse<void>> {
    const response = await this.request<void>('/auth/logout', {
      method: 'POST',
    });

    this.removeAuthToken();
    return response;
  }

  /**
   * Refresh access token
   */
  async refreshToken(): Promise<ApiResponse<AuthResponse>> {
    const refreshToken = localStorage.getItem('refreshToken');
    
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    const response = await this.request<AuthResponse>('/auth/refresh', {
      method: 'POST',
      body: JSON.stringify({ refresh_token: refreshToken }),
    });

    if (response.success && response.data) {
      this.setAuthToken(response.data.accessToken);
      localStorage.setItem('refreshToken', response.data.refreshToken);
    }

    return response;
  }

  /**
   * Get current user profile
   */
  async getCurrentUser(): Promise<ApiResponse<User>> {
    return this.request<User>('/auth/me');
  }

  /**
   * Update user profile
   */
  async updateProfile(userData: Partial<User>): Promise<ApiResponse<User>> {
    return this.request<User>('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  }

  /**
   * Change password
   */
  async changePassword(currentPassword: string, newPassword: string): Promise<ApiResponse<void>> {
    return this.request<void>('/auth/change-password', {
      method: 'POST',
      body: JSON.stringify({ current_password: currentPassword, new_password: newPassword }),
    });
  }

  // ============================================================================
  // VOICE ENDPOINTS
  // ============================================================================

  /**
   * Start a new voice session
   */
  async startVoiceSession(): Promise<ApiResponse<VoiceSession>> {
    return this.request<VoiceSession>('/voice/sessions', {
      method: 'POST',
    });
  }

  /**
   * Process voice command
   */
  async processVoiceCommand(
    sessionId: string, 
    transcript: string, 
    audioData?: string,
    context?: Record<string, any>
  ): Promise<ApiResponse<AIResponse>> {
    return this.request<AIResponse>(`/voice/sessions/${sessionId}/process`, {
      method: 'POST',
      body: JSON.stringify({ transcript, audio_data: audioData, context }),
    });
  }

  /**
   * Get voice session by ID
   */
  async getVoiceSession(sessionId: string): Promise<ApiResponse<VoiceSession>> {
    return this.request<VoiceSession>(`/voice/sessions/${sessionId}`);
  }

  /**
   * Get user's voice sessions
   */
  async getVoiceSessions(
    page: number = 1,
    limit: number = 20,
    filters?: Record<string, any>
  ): Promise<PaginatedResponse<VoiceSession>> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...filters,
    });

    return this.request<VoiceSession[]>(`/voice/sessions?${params}`);
  }

  /**
   * Generate voice response
   */
  async generateVoiceResponse(
    text: string,
    voiceId?: string,
    speechRate?: string
  ): Promise<ApiResponse<{ audio_url: string; duration: number }>> {
    return this.request<{ audio_url: string; duration: number }>('/voice/generate', {
      method: 'POST',
      body: JSON.stringify({ text, voice_id: voiceId, speech_rate: speechRate }),
    });
  }

  /**
   * Transcribe audio file
   */
  async transcribeAudio(audioFile: File, language?: string): Promise<ApiResponse<{ transcript: string; confidence: number }>> {
    const formData = new FormData();
    formData.append('audio', audioFile);
    if (language) {
      formData.append('language', language);
    }

    return this.request<{ transcript: string; confidence: number }>('/voice/transcribe', {
      method: 'POST',
      headers: {}, // Let browser set Content-Type for FormData
      body: formData,
    });
  }

  // ============================================================================
  // CALENDAR ENDPOINTS
  // ============================================================================

  /**
   * Get calendar events
   */
  async getCalendarEvents(
    startDate?: string,
    endDate?: string,
    page: number = 1,
    limit: number = 50,
    filters?: Record<string, any>
  ): Promise<PaginatedResponse<CalendarEvent>> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...filters,
    });

    if (startDate) params.append('start_date', startDate);
    if (endDate) params.append('end_date', endDate);

    return this.request<CalendarEvent[]>(`/calendar/events?${params}`);
  }

  /**
   * Get calendar event by ID
   */
  async getCalendarEvent(eventId: string): Promise<ApiResponse<CalendarEvent>> {
    return this.request<CalendarEvent>(`/calendar/events/${eventId}`);
  }

  /**
   * Create calendar event
   */
  async createCalendarEvent(eventData: Partial<CalendarEvent>): Promise<ApiResponse<CalendarEvent>> {
    return this.request<CalendarEvent>('/calendar/events', {
      method: 'POST',
      body: JSON.stringify(eventData),
    });
  }

  /**
   * Update calendar event
   */
  async updateCalendarEvent(eventId: string, eventData: Partial<CalendarEvent>): Promise<ApiResponse<CalendarEvent>> {
    return this.request<CalendarEvent>(`/calendar/events/${eventId}`, {
      method: 'PUT',
      body: JSON.stringify(eventData),
    });
  }

  /**
   * Delete calendar event
   */
  async deleteCalendarEvent(eventId: string): Promise<ApiResponse<void>> {
    return this.request<void>(`/calendar/events/${eventId}`, {
      method: 'DELETE',
    });
  }

  /**
   * Get calendar integrations
   */
  async getCalendarIntegrations(): Promise<ApiResponse<CalendarIntegration[]>> {
    return this.request<CalendarIntegration[]>('/calendar/integrations');
  }

  /**
   * Connect calendar integration
   */
  async connectCalendarIntegration(
    provider: string,
    authCode: string
  ): Promise<ApiResponse<CalendarIntegration>> {
    return this.request<CalendarIntegration>('/calendar/integrations/connect', {
      method: 'POST',
      body: JSON.stringify({ provider, auth_code: authCode }),
    });
  }

  /**
   * Disconnect calendar integration
   */
  async disconnectCalendarIntegration(integrationId: string): Promise<ApiResponse<void>> {
    return this.request<void>(`/calendar/integrations/${integrationId}`, {
      method: 'DELETE',
    });
  }

  /**
   * Sync calendar events
   */
  async syncCalendarEvents(integrationId: string): Promise<ApiResponse<{ synced_count: number }>> {
    return this.request<{ synced_count: number }>(`/calendar/integrations/${integrationId}/sync`, {
      method: 'POST',
    });
  }

  // ============================================================================
  // REMINDERS ENDPOINTS
  // ============================================================================

  /**
   * Get event reminders
   */
  async getEventReminders(eventId: string): Promise<ApiResponse<any[]>> {
    return this.request<any[]>(`/calendar/events/${eventId}/reminders`);
  }

  /**
   * Create event reminder
   */
  async createEventReminder(eventId: string, reminderData: any): Promise<ApiResponse<any>> {
    return this.request<any>(`/calendar/events/${eventId}/reminders`, {
      method: 'POST',
      body: JSON.stringify(reminderData),
    });
  }

  /**
   * Update event reminder
   */
  async updateEventReminder(reminderId: string, reminderData: any): Promise<ApiResponse<any>> {
    return this.request<any>(`/calendar/reminders/${reminderId}`, {
      method: 'PUT',
      body: JSON.stringify(reminderData),
    });
  }

  /**
   * Delete event reminder
   */
  async deleteEventReminder(reminderId: string): Promise<ApiResponse<void>> {
    return this.request<void>(`/calendar/reminders/${reminderId}`, {
      method: 'DELETE',
    });
  }

  // ============================================================================
  // USER PREFERENCES ENDPOINTS
  // ============================================================================

  /**
   * Get user preferences
   */
  async getUserPreferences(): Promise<ApiResponse<any>> {
    return this.request<any>('/user/preferences');
  }

  /**
   * Update user preferences
   */
  async updateUserPreferences(preferences: any): Promise<ApiResponse<any>> {
    return this.request<any>('/user/preferences', {
      method: 'PUT',
      body: JSON.stringify(preferences),
    });
  }

  /**
   * Update voice preferences
   */
  async updateVoicePreferences(voicePreferences: any): Promise<ApiResponse<any>> {
    return this.request<any>('/user/voice-preferences', {
      method: 'PUT',
      body: JSON.stringify(voicePreferences),
    });
  }

  /**
   * Update AI preferences
   */
  async updateAIPreferences(aiPreferences: any): Promise<ApiResponse<any>> {
    return this.request<any>('/user/ai-preferences', {
      method: 'PUT',
      body: JSON.stringify(aiPreferences),
    });
  }

  // ============================================================================
  // ANALYTICS ENDPOINTS
  // ============================================================================

  /**
   * Get user analytics
   */
  async getUserAnalytics(period: string = '30d'): Promise<ApiResponse<any>> {
    return this.request<any>(`/analytics/user?period=${period}`);
  }

  /**
   * Get voice usage analytics
   */
  async getVoiceAnalytics(period: string = '30d'): Promise<ApiResponse<any>> {
    return this.request<any>(`/analytics/voice?period=${period}`);
  }

  /**
   * Get calendar analytics
   */
  async getCalendarAnalytics(period: string = '30d'): Promise<ApiResponse<any>> {
    return this.request<any>(`/analytics/calendar?period=${period}`);
  }

  // ============================================================================
  // HEALTH CHECK ENDPOINTS
  // ============================================================================

  /**
   * Health check
   */
  async healthCheck(): Promise<ApiResponse<{ status: string; timestamp: string }>> {
    return this.request<{ status: string; timestamp: string }>('/health');
  }

  /**
   * Get API status
   */
  async getApiStatus(): Promise<ApiResponse<any>> {
    return this.request<any>('/status');
  }

  // ============================================================================
  // UTILITY METHODS
  // ============================================================================

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return !!this.getAuthToken();
  }

  /**
   * Get current user ID from token
   */
  getCurrentUserId(): string | null {
    const token = this.getAuthToken();
    if (!token) return null;

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.sub || payload.user_id;
    } catch {
      return null;
    }
  }

  /**
   * Clear all stored data
   */
  clearStorage(): void {
    this.removeAuthToken();
    if (typeof window !== 'undefined') {
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
    }
  }
}

// ============================================================================
// EXPORT API CLIENT INSTANCE
// ============================================================================

export const apiClient = new ApiClient(API_URL);

// ============================================================================
// CONVENIENCE EXPORTS
// ============================================================================

export const api = {
  // Authentication
  login: apiClient.login.bind(apiClient),
  register: apiClient.register.bind(apiClient),
  logout: apiClient.logout.bind(apiClient),
  refreshToken: apiClient.refreshToken.bind(apiClient),
  getCurrentUser: apiClient.getCurrentUser.bind(apiClient),
  updateProfile: apiClient.updateProfile.bind(apiClient),
  changePassword: apiClient.changePassword.bind(apiClient),

  // Voice
  startVoiceSession: apiClient.startVoiceSession.bind(apiClient),
  processVoiceCommand: apiClient.processVoiceCommand.bind(apiClient),
  getVoiceSession: apiClient.getVoiceSession.bind(apiClient),
  getVoiceSessions: apiClient.getVoiceSessions.bind(apiClient),
  generateVoiceResponse: apiClient.generateVoiceResponse.bind(apiClient),
  transcribeAudio: apiClient.transcribeAudio.bind(apiClient),

  // Calendar
  getCalendarEvents: apiClient.getCalendarEvents.bind(apiClient),
  getCalendarEvent: apiClient.getCalendarEvent.bind(apiClient),
  createCalendarEvent: apiClient.createCalendarEvent.bind(apiClient),
  updateCalendarEvent: apiClient.updateCalendarEvent.bind(apiClient),
  deleteCalendarEvent: apiClient.deleteCalendarEvent.bind(apiClient),
  getCalendarIntegrations: apiClient.getCalendarIntegrations.bind(apiClient),
  connectCalendarIntegration: apiClient.connectCalendarIntegration.bind(apiClient),
  disconnectCalendarIntegration: apiClient.disconnectCalendarIntegration.bind(apiClient),
  syncCalendarEvents: apiClient.syncCalendarEvents.bind(apiClient),

  // Reminders
  getEventReminders: apiClient.getEventReminders.bind(apiClient),
  createEventReminder: apiClient.createEventReminder.bind(apiClient),
  updateEventReminder: apiClient.updateEventReminder.bind(apiClient),
  deleteEventReminder: apiClient.deleteEventReminder.bind(apiClient),

  // Preferences
  getUserPreferences: apiClient.getUserPreferences.bind(apiClient),
  updateUserPreferences: apiClient.updateUserPreferences.bind(apiClient),
  updateVoicePreferences: apiClient.updateVoicePreferences.bind(apiClient),
  updateAIPreferences: apiClient.updateAIPreferences.bind(apiClient),

  // Analytics
  getUserAnalytics: apiClient.getUserAnalytics.bind(apiClient),
  getVoiceAnalytics: apiClient.getVoiceAnalytics.bind(apiClient),
  getCalendarAnalytics: apiClient.getCalendarAnalytics.bind(apiClient),

  // Health
  healthCheck: apiClient.healthCheck.bind(apiClient),
  getApiStatus: apiClient.getApiStatus.bind(apiClient),

  // Utilities
  isAuthenticated: apiClient.isAuthenticated.bind(apiClient),
  getCurrentUserId: apiClient.getCurrentUserId.bind(apiClient),
  clearStorage: apiClient.clearStorage.bind(apiClient),
};

export default apiClient;
