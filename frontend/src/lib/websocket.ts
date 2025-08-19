/**
 * WebSocket Client Library for AI Voice Assistant
 * Handles real-time communication with the backend
 */

import { io, Socket } from 'socket.io-client';
import { useWebSocketStore } from '@/store';
import { api } from './api';

export interface WebSocketMessage {
  type: 'voice_command' | 'calendar_update' | 'notification' | 'status_update' | 'error';
  data: any;
  timestamp: string;
  requestId?: string;
}

export interface VoiceCommandMessage {
  sessionId: string;
  transcript: string;
  audioData?: string;
  context?: Record<string, any>;
}

export interface CalendarUpdateMessage {
  eventId: string;
  action: 'created' | 'updated' | 'deleted';
  event: any;
}

export interface NotificationMessage {
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  duration?: number;
}

export interface StatusUpdateMessage {
  status: 'connected' | 'disconnected' | 'reconnecting';
  timestamp: string;
}

class WebSocketClient {
  private socket: Socket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private messageQueue: WebSocketMessage[] = [];
  private isConnecting = false;
  private connectionTimeout: NodeJS.Timeout | null = null;

  constructor() {
    this.initializeSocket();
  }

  private initializeSocket(): void {
    const wsUrl = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8000/ws';
    
    this.socket = io(wsUrl, {
      transports: ['websocket', 'polling'],
      autoConnect: false,
      reconnection: true,
      reconnectionAttempts: this.maxReconnectAttempts,
      reconnectionDelay: this.reconnectDelay,
      timeout: 20000,
      forceNew: true,
    });

    this.setupEventListeners();
  }

  private setupEventListeners(): void {
    if (!this.socket) return;

    // Connection events
    this.socket.on('connect', this.handleConnect.bind(this));
    this.socket.on('disconnect', this.handleDisconnect.bind(this));
    this.socket.on('connect_error', this.handleConnectError.bind(this));
    this.socket.on('reconnect', this.handleReconnect.bind(this));
    this.socket.on('reconnect_attempt', this.handleReconnectAttempt.bind(this));
    this.socket.on('reconnect_error', this.handleReconnectError.bind(this));
    this.socket.on('reconnect_failed', this.handleReconnectFailed.bind(this));

    // Custom events
    this.socket.on('voice_response', this.handleVoiceResponse.bind(this));
    this.socket.on('calendar_update', this.handleCalendarUpdate.bind(this));
    this.socket.on('notification', this.handleNotification.bind(this));
    this.socket.on('status_update', this.handleStatusUpdate.bind(this));
    this.socket.on('error', this.handleError.bind(this));
  }

  private handleConnect(): void {
    console.log('WebSocket connected');
    this.reconnectAttempts = 0;
    this.isConnecting = false;
    
    if (this.connectionTimeout) {
      clearTimeout(this.connectionTimeout);
      this.connectionTimeout = null;
    }

    // Update store
    useWebSocketStore.getState().setConnected(true);
    useWebSocketStore.getState().setConnectionStatus('connected');

    // Send queued messages
    this.processMessageQueue();

    // Emit status update
    this.emit('status_update', {
      status: 'connected',
      timestamp: new Date().toISOString(),
    });
  }

  private handleDisconnect(reason: string): void {
    console.log('WebSocket disconnected:', reason);
    
    // Update store
    useWebSocketStore.getState().setConnected(false);
    useWebSocketStore.getState().setConnectionStatus('disconnected');

    // Handle different disconnect reasons
    if (reason === 'io server disconnect') {
      // Server disconnected us, try to reconnect
      this.socket?.connect();
    } else if (reason === 'io client disconnect') {
      // Client disconnected, don't reconnect
      this.cleanup();
    }
  }

  private handleConnectError(error: Error): void {
    console.error('WebSocket connection error:', error);
    this.isConnecting = false;
    
    useWebSocketStore.getState().setConnectionStatus('error');
    useWebSocketStore.getState().setError(error.message);
  }

  private handleReconnect(attemptNumber: number): void {
    console.log('WebSocket reconnected after', attemptNumber, 'attempts');
    this.reconnectAttempts = 0;
    
    useWebSocketStore.getState().setConnectionStatus('connected');
    useWebSocketStore.getState().setError(null);
  }

  private handleReconnectAttempt(attemptNumber: number): void {
    console.log('WebSocket reconnection attempt:', attemptNumber);
    this.reconnectAttempts = attemptNumber;
    
    useWebSocketStore.getState().setConnectionStatus('reconnecting');
    useWebSocketStore.getState().setReconnectAttempts(attemptNumber);
  }

  private handleReconnectError(error: Error): void {
    console.error('WebSocket reconnection error:', error);
    
    useWebSocketStore.getState().setError(error.message);
  }

  private handleReconnectFailed(): void {
    console.error('WebSocket reconnection failed');
    
    useWebSocketStore.getState().setConnectionStatus('failed');
    useWebSocketStore.getState().setError('Failed to reconnect after maximum attempts');
  }

  private handleVoiceResponse(data: any): void {
    console.log('Voice response received:', data);
    
    // Update voice store with response
    const { setAIResponse, setProcessing } = useVoiceStore.getState();
    setAIResponse(data);
    setProcessing(false);
  }

  private handleCalendarUpdate(data: CalendarUpdateMessage): void {
    console.log('Calendar update received:', data);
    
    // Update calendar store
    const { updateEvent, addEvent, removeEvent } = useCalendarStore.getState();
    
    switch (data.action) {
      case 'created':
        addEvent(data.event);
        break;
      case 'updated':
        updateEvent(data.eventId, data.event);
        break;
      case 'deleted':
        removeEvent(data.eventId);
        break;
    }
  }

  private handleNotification(data: NotificationMessage): void {
    console.log('Notification received:', data);
    
    // Add notification to store
    const { addNotification } = useAppStore.getState();
    addNotification({
      id: Date.now().toString(),
      type: data.type,
      title: data.title,
      message: data.message,
      duration: data.duration || 5000,
    });
  }

  private handleStatusUpdate(data: StatusUpdateMessage): void {
    console.log('Status update received:', data);
    
    useWebSocketStore.getState().setConnectionStatus(data.status);
  }

  private handleError(error: any): void {
    console.error('WebSocket error:', error);
    
    useWebSocketStore.getState().setError(error.message || 'Unknown WebSocket error');
  }

  public connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.socket) {
        reject(new Error('Socket not initialized'));
        return;
      }

      if (this.socket.connected) {
        resolve();
        return;
      }

      if (this.isConnecting) {
        reject(new Error('Connection already in progress'));
        return;
      }

      this.isConnecting = true;
      useWebSocketStore.getState().setConnectionStatus('connecting');

      // Set connection timeout
      this.connectionTimeout = setTimeout(() => {
        this.isConnecting = false;
        reject(new Error('Connection timeout'));
      }, 10000);

      this.socket.connect();

      // Listen for connect event
      const onConnect = () => {
        this.socket?.off('connect', onConnect);
        this.socket?.off('connect_error', onConnectError);
        resolve();
      };

      const onConnectError = (error: Error) => {
        this.socket?.off('connect', onConnect);
        this.socket?.off('connect_error', onConnectError);
        this.isConnecting = false;
        reject(error);
      };

      this.socket.on('connect', onConnect);
      this.socket.on('connect_error', onConnectError);
    });
  }

  public disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
    }
    this.cleanup();
  }

  private cleanup(): void {
    this.isConnecting = false;
    this.messageQueue = [];
    
    if (this.connectionTimeout) {
      clearTimeout(this.connectionTimeout);
      this.connectionTimeout = null;
    }

    useWebSocketStore.getState().setConnected(false);
    useWebSocketStore.getState().setConnectionStatus('disconnected');
  }

  public emit(event: string, data: any): void {
    if (!this.socket || !this.socket.connected) {
      // Queue message for later
      this.messageQueue.push({
        type: event as any,
        data,
        timestamp: new Date().toISOString(),
      });
      return;
    }

    this.socket.emit(event, data);
  }

  private processMessageQueue(): void {
    while (this.messageQueue.length > 0) {
      const message = this.messageQueue.shift();
      if (message && this.socket?.connected) {
        this.socket.emit(message.type, message.data);
      }
    }
  }

  public sendVoiceCommand(message: VoiceCommandMessage): void {
    this.emit('voice_command', message);
  }

  public sendCalendarUpdate(message: CalendarUpdateMessage): void {
    this.emit('calendar_update', message);
  }

  public joinRoom(roomId: string): void {
    this.emit('join_room', { roomId });
  }

  public leaveRoom(roomId: string): void {
    this.emit('leave_room', { roomId });
  }

  public isConnected(): boolean {
    return this.socket?.connected || false;
  }

  public getConnectionStatus(): string {
    return useWebSocketStore.getState().connectionStatus;
  }

  public getError(): string | null {
    return useWebSocketStore.getState().error;
  }
}

// Create singleton instance
export const websocketClient = new WebSocketClient();

// React hook for WebSocket
export const useWebSocket = () => {
  const {
    isConnected,
    connectionStatus,
    error,
    reconnectAttempts,
    setConnected,
    setConnectionStatus,
    setError,
    setReconnectAttempts,
  } = useWebSocketStore();

  const connect = useCallback(async () => {
    try {
      await websocketClient.connect();
    } catch (error) {
      console.error('Failed to connect:', error);
    }
  }, []);

  const disconnect = useCallback(() => {
    websocketClient.disconnect();
  }, []);

  const sendVoiceCommand = useCallback((message: VoiceCommandMessage) => {
    websocketClient.sendVoiceCommand(message);
  }, []);

  const sendCalendarUpdate = useCallback((message: CalendarUpdateMessage) => {
    websocketClient.sendCalendarUpdate(message);
  }, []);

  const joinRoom = useCallback((roomId: string) => {
    websocketClient.joinRoom(roomId);
  }, []);

  const leaveRoom = useCallback((roomId: string) => {
    websocketClient.leaveRoom(roomId);
  }, []);

  return {
    isConnected,
    connectionStatus,
    error,
    reconnectAttempts,
    connect,
    disconnect,
    sendVoiceCommand,
    sendCalendarUpdate,
    joinRoom,
    leaveRoom,
  };
};

// Auto-connect on app initialization
if (typeof window !== 'undefined') {
  // Connect when user is authenticated
  const checkAndConnect = () => {
    const token = localStorage.getItem('auth_token');
    if (token && !websocketClient.isConnected()) {
      websocketClient.connect().catch(console.error);
    }
  };

  // Check on page load
  checkAndConnect();

  // Listen for auth changes
  window.addEventListener('storage', (e) => {
    if (e.key === 'auth_token') {
      checkAndConnect();
    }
  });
}

export default websocketClient;
