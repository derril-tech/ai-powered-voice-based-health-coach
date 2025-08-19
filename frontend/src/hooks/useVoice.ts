/**
 * Voice Hook for AI Voice Assistant
 * Manages voice interactions, speech recognition, and text-to-speech
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { useVoiceStore, useAppStore } from '@/store';
import { api } from '@/lib/api';
import { VoiceSession, AIResponse, VoiceSessionStatus } from '@/types';

// ============================================================================
// SPEECH RECOGNITION TYPES
// ============================================================================

interface SpeechRecognitionEvent extends Event {
  resultIndex: number;
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionResult {
  isFinal: boolean;
  transcript: string;
  confidence: number;
}

interface SpeechRecognitionError extends Event {
  error: string;
  message: string;
}

// ============================================================================
// VOICE HOOK
// ============================================================================

export const useVoice = () => {
  // Store hooks
  const {
    isListening,
    isProcessing,
    isSpeaking,
    currentSession,
    transcript,
    confidence,
    error,
    audioLevel,
    isMuted,
    isPaused,
    setListening,
    setProcessing,
    setSpeaking,
    setCurrentSession,
    setTranscript,
    setConfidence,
    setError,
    setAudioLevel,
    setMuted,
    setPaused,
    reset: resetVoiceState,
  } = useVoiceStore();

  const { addNotification } = useAppStore();

  // Local state
  const [isSupported, setIsSupported] = useState(false);
  const [permission, setPermission] = useState<'granted' | 'denied' | 'prompt'>('prompt');
  const [isInitialized, setIsInitialized] = useState(false);

  // Refs
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const microphoneRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // ============================================================================
  // INITIALIZATION
  // ============================================================================

  /**
   * Initialize speech recognition
   */
  const initializeSpeechRecognition = useCallback(() => {
    try {
      // Check browser support
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (!SpeechRecognition) {
        setIsSupported(false);
        setError('Speech recognition is not supported in this browser');
        return false;
      }

      setIsSupported(true);

      // Create recognition instance
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';
      recognition.maxAlternatives = 3;

      // Event handlers
      recognition.onstart = () => {
        setListening(true);
        setError(null);
        addNotification({
          type: 'info',
          title: 'Voice Recognition',
          message: 'Listening for voice commands...',
        });
      };

      recognition.onresult = (event: SpeechRecognitionEvent) => {
        let finalTranscript = '';
        let interimTranscript = '';
        let maxConfidence = 0;

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const result = event.results[i];
          const transcript = result[0].transcript;
          const confidence = result[0].confidence;

          if (result.isFinal) {
            finalTranscript += transcript;
            maxConfidence = Math.max(maxConfidence, confidence);
          } else {
            interimTranscript += transcript;
          }
        }

        setTranscript(finalTranscript || interimTranscript);
        setConfidence(maxConfidence);

        // Process final transcript
        if (finalTranscript) {
          processVoiceCommand(finalTranscript, maxConfidence);
        }
      };

      recognition.onerror = (event: SpeechRecognitionError) => {
        console.error('Speech recognition error:', event.error);
        setError(`Speech recognition error: ${event.error}`);
        setListening(false);
        
        addNotification({
          type: 'error',
          title: 'Voice Recognition Error',
          message: `Error: ${event.error}`,
        });
      };

      recognition.onend = () => {
        setListening(false);
        addNotification({
          type: 'info',
          title: 'Voice Recognition',
          message: 'Voice recognition stopped',
        });
      };

      recognitionRef.current = recognition;
      setIsInitialized(true);
      return true;
    } catch (error) {
      console.error('Failed to initialize speech recognition:', error);
      setError('Failed to initialize speech recognition');
      return false;
    }
  }, [setListening, setError, setTranscript, setConfidence, addNotification]);

  /**
   * Initialize audio context for level monitoring
   */
  const initializeAudioContext = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const analyser = audioContext.createAnalyser();
      const microphone = audioContext.createMediaStreamSource(stream);

      analyser.fftSize = 256;
      microphone.connect(analyser);

      audioContextRef.current = audioContext;
      analyserRef.current = analyser;
      microphoneRef.current = microphone;

      // Start audio level monitoring
      updateAudioLevel();
    } catch (error) {
      console.error('Failed to initialize audio context:', error);
      setError('Failed to access microphone');
    }
  }, [setError]);

  /**
   * Update audio level
   */
  const updateAudioLevel = useCallback(() => {
    if (!analyserRef.current) return;

    const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
    analyserRef.current.getByteFrequencyData(dataArray);

    // Calculate average volume
    const average = dataArray.reduce((sum, value) => sum + value, 0) / dataArray.length;
    const normalizedLevel = average / 255;

    setAudioLevel(normalizedLevel);

    animationFrameRef.current = requestAnimationFrame(updateAudioLevel);
  }, [setAudioLevel]);

  /**
   * Initialize voice functionality
   */
  const initialize = useCallback(async () => {
    if (isInitialized) return;

    // Check permissions
    if ('permissions' in navigator) {
      try {
        const permission = await navigator.permissions.query({ name: 'microphone' as PermissionName });
        setPermission(permission.state);
        
        permission.onchange = () => {
          setPermission(permission.state);
        };
      } catch (error) {
        console.warn('Could not check microphone permission:', error);
      }
    }

    // Initialize speech recognition
    const recognitionInitialized = initializeSpeechRecognition();
    
    if (recognitionInitialized) {
      // Initialize audio context for level monitoring
      await initializeAudioContext();
    }
  }, [isInitialized, initializeSpeechRecognition, initializeAudioContext]);

  // ============================================================================
  // VOICE COMMANDS
  // ============================================================================

  /**
   * Process voice command
   */
  const processVoiceCommand = useCallback(async (command: string, confidence: number) => {
    if (!currentSession) {
      console.warn('No active voice session');
      return;
    }

    try {
      setProcessing(true);
      setError(null);

      // Call API to process command
      const response = await api.processVoiceCommand(
        currentSession.sessionId,
        command,
        undefined, // audioData
        { confidence }
      );

      if (response.success && response.data) {
        const aiResponse = response.data;
        
        // Handle AI response
        await handleAIResponse(aiResponse);
      } else {
        throw new Error(response.error || 'Failed to process voice command');
      }
    } catch (error) {
      console.error('Error processing voice command:', error);
      setError(error instanceof Error ? error.message : 'Failed to process voice command');
      
      addNotification({
        type: 'error',
        title: 'Voice Command Error',
        message: error instanceof Error ? error.message : 'Failed to process voice command',
      });
    } finally {
      setProcessing(false);
    }
  }, [currentSession, setProcessing, setError, addNotification]);

  /**
   * Handle AI response
   */
  const handleAIResponse = useCallback(async (aiResponse: AIResponse) => {
    try {
      // Speak the response
      if (aiResponse.response) {
        await speak(aiResponse.response);
      }

      // Handle different command types
      switch (aiResponse.commandType) {
        case 'calendar':
          // Handle calendar commands
          addNotification({
            type: 'success',
            title: 'Calendar Updated',
            message: aiResponse.response,
          });
          break;
        
        case 'reminder':
          // Handle reminder commands
          addNotification({
            type: 'success',
            title: 'Reminder Set',
            message: aiResponse.response,
          });
          break;
        
        case 'query':
          // Handle query commands
          addNotification({
            type: 'info',
            title: 'Query Result',
            message: aiResponse.response,
          });
          break;
        
        default:
          // Handle other commands
          addNotification({
            type: 'info',
            title: 'Voice Assistant',
            message: aiResponse.response,
          });
      }
    } catch (error) {
      console.error('Error handling AI response:', error);
      setError('Failed to handle AI response');
    }
  }, [speak, addNotification, setError]);

  // ============================================================================
  // SPEECH RECOGNITION CONTROLS
  // ============================================================================

  /**
   * Start listening
   */
  const startListening = useCallback(async () => {
    if (!isSupported || !isInitialized) {
      await initialize();
    }

    if (!recognitionRef.current) {
      setError('Speech recognition not initialized');
      return;
    }

    if (permission === 'denied') {
      setError('Microphone permission denied');
      addNotification({
        type: 'error',
        title: 'Permission Denied',
        message: 'Please enable microphone access to use voice commands',
      });
      return;
    }

    try {
      // Start a new voice session
      const sessionResponse = await api.startVoiceSession();
      if (sessionResponse.success && sessionResponse.data) {
        setCurrentSession(sessionResponse.data);
      }

      recognitionRef.current.start();
    } catch (error) {
      console.error('Error starting speech recognition:', error);
      setError('Failed to start voice recognition');
    }
  }, [isSupported, isInitialized, permission, initialize, setCurrentSession, setError, addNotification]);

  /**
   * Stop listening
   */
  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setListening(false);
  }, [setListening]);

  /**
   * Toggle listening
   */
  const toggleListening = useCallback(() => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  }, [isListening, startListening, stopListening]);

  // ============================================================================
  // TEXT-TO-SPEECH
  // ============================================================================

  /**
   * Speak text
   */
  const speak = useCallback(async (text: string, options?: {
    voiceId?: string;
    speechRate?: string;
    onStart?: () => void;
    onEnd?: () => void;
    onError?: (error: string) => void;
  }) => {
    if (isMuted) return;

    try {
      setSpeaking(true);
      options?.onStart?.();

      // Try Web Speech API first
      if ('speechSynthesis' in window) {
        await speakWithWebSpeech(text, options);
      } else {
        // Fallback to API
        await speakWithAPI(text, options);
      }
    } catch (error) {
      console.error('Error speaking text:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to speak text';
      setError(errorMessage);
      options?.onError?.(errorMessage);
    } finally {
      setSpeaking(false);
      options?.onEnd?.();
    }
  }, [isMuted, setSpeaking, setError]);

  /**
   * Speak using Web Speech API
   */
  const speakWithWebSpeech = useCallback((text: string, options?: {
    voiceId?: string;
    speechRate?: string;
    onEnd?: () => void;
  }): Promise<void> => {
    return new Promise((resolve, reject) => {
      try {
        const utterance = new SpeechSynthesisUtterance(text);
        
        // Set voice
        if (options?.voiceId) {
          const voices = speechSynthesis.getVoices();
          const voice = voices.find(v => v.name === options.voiceId);
          if (voice) utterance.voice = voice;
        }

        // Set speech rate
        if (options?.speechRate) {
          const rateMap: Record<string, number> = {
            slow: 0.8,
            normal: 1.0,
            fast: 1.2,
          };
          utterance.rate = rateMap[options.speechRate] || 1.0;
        }

        utterance.onend = () => {
          options?.onEnd?.();
          resolve();
        };

        utterance.onerror = (event) => {
          reject(new Error(`Speech synthesis error: ${event.error}`));
        };

        speechSynthesis.speak(utterance);
      } catch (error) {
        reject(error);
      }
    });
  }, []);

  /**
   * Speak using API
   */
  const speakWithAPI = useCallback(async (text: string, options?: {
    voiceId?: string;
    speechRate?: string;
    onEnd?: () => void;
  }): Promise<void> => {
    try {
      const response = await api.generateVoiceResponse(
        text,
        options?.voiceId,
        options?.speechRate
      );

      if (response.success && response.data) {
        await playAudio(response.data.audio_url);
        options?.onEnd?.();
      } else {
        throw new Error(response.error || 'Failed to generate voice response');
      }
    } catch (error) {
      throw error;
    }
  }, []);

  /**
   * Play audio from URL
   */
  const playAudio = useCallback((audioUrl: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      try {
        const audio = new Audio(audioUrl);
        audioRef.current = audio;

        audio.onended = () => {
          resolve();
        };

        audio.onerror = () => {
          reject(new Error('Failed to play audio'));
        };

        audio.play().catch(reject);
      } catch (error) {
        reject(error);
      }
    });
  }, []);

  // ============================================================================
  // AUDIO CONTROLS
  // ============================================================================

  /**
   * Toggle mute
   */
  const toggleMute = useCallback(() => {
    setMuted(!isMuted);
    
    if (isMuted) {
      addNotification({
        type: 'info',
        title: 'Voice Assistant',
        message: 'Voice output unmuted',
      });
    } else {
      addNotification({
        type: 'info',
        title: 'Voice Assistant',
        message: 'Voice output muted',
      });
    }
  }, [isMuted, setMuted, addNotification]);

  /**
   * Toggle pause
   */
  const togglePause = useCallback(() => {
    setPaused(!isPaused);
    
    if (isPaused) {
      // Resume speech synthesis
      if ('speechSynthesis' in window) {
        speechSynthesis.resume();
      }
      
      addNotification({
        type: 'info',
        title: 'Voice Assistant',
        message: 'Voice output resumed',
      });
    } else {
      // Pause speech synthesis
      if ('speechSynthesis' in window) {
        speechSynthesis.pause();
      }
      
      addNotification({
        type: 'info',
        title: 'Voice Assistant',
        message: 'Voice output paused',
      });
    }
  }, [isPaused, setPaused, addNotification]);

  /**
   * Stop speaking
   */
  const stopSpeaking = useCallback(() => {
    // Stop speech synthesis
    if ('speechSynthesis' in window) {
      speechSynthesis.cancel();
    }

    // Stop audio playback
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }

    setSpeaking(false);
  }, [setSpeaking]);

  // ============================================================================
  // SESSION MANAGEMENT
  // ============================================================================

  /**
   * Start new voice session
   */
  const startSession = useCallback(async () => {
    try {
      const response = await api.startVoiceSession();
      if (response.success && response.data) {
        setCurrentSession(response.data);
        return response.data;
      } else {
        throw new Error(response.error || 'Failed to start voice session');
      }
    } catch (error) {
      console.error('Error starting voice session:', error);
      setError('Failed to start voice session');
      throw error;
    }
  }, [setCurrentSession, setError]);

  /**
   * End current voice session
   */
  const endSession = useCallback(() => {
    setCurrentSession(null);
    setTranscript('');
    setConfidence(0);
    setError(null);
  }, [setCurrentSession, setTranscript, setConfidence, setError]);

  // ============================================================================
  // CLEANUP
  // ============================================================================

  useEffect(() => {
    // Initialize on mount
    initialize();

    // Cleanup on unmount
    return () => {
      // Stop speech recognition
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }

      // Stop speech synthesis
      if ('speechSynthesis' in window) {
        speechSynthesis.cancel();
      }

      // Stop audio playback
      if (audioRef.current) {
        audioRef.current.pause();
      }

      // Cancel animation frame
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }

      // Close audio context
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, [initialize]);

  // ============================================================================
  // RETURN VALUES
  // ============================================================================

  return {
    // State
    isListening,
    isProcessing,
    isSpeaking,
    currentSession,
    transcript,
    confidence,
    error,
    audioLevel,
    isMuted,
    isPaused,
    isSupported,
    permission,
    isInitialized,

    // Speech recognition
    startListening,
    stopListening,
    toggleListening,

    // Text-to-speech
    speak,
    stopSpeaking,

    // Audio controls
    toggleMute,
    togglePause,

    // Session management
    startSession,
    endSession,

    // Utilities
    reset: resetVoiceState,
  };
};

// ============================================================================
// EXPORT
// ============================================================================

export default useVoice;
