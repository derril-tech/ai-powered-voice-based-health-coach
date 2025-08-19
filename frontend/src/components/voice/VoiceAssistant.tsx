/**
 * Voice Assistant Component
 * Main voice interaction interface for the AI assistant
 */

import React, { useState, useEffect, useRef } from 'react';
import { useVoice } from '@/hooks/useVoice';
import { useWebSocket } from '@/lib/websocket';
import { useAppStore, useVoiceStore } from '@/store';
import { Button } from '@/components/ui/Button';
import { Mic, MicOff, Volume2, VolumeX, Settings, HelpCircle } from 'lucide-react';
import { cn, formatDuration } from '@/lib/utils';
import { VoiceVisualizer } from './VoiceVisualizer';
import { VoiceTranscript } from './VoiceTranscript';
import { VoiceSettings } from './VoiceSettings';
import { VoiceHelp } from './VoiceHelp';

interface VoiceAssistantProps {
  className?: string;
  compact?: boolean;
  showTranscript?: boolean;
  showVisualizer?: boolean;
  autoStart?: boolean;
}

export const VoiceAssistant: React.FC<VoiceAssistantProps> = ({
  className,
  compact = false,
  showTranscript = true,
  showVisualizer = true,
  autoStart = false,
}) => {
  const {
    isListening,
    isProcessing,
    isSpeaking,
    isSupported,
    permission,
    transcript,
    confidence,
    error,
    audioLevel,
    isMuted,
    isPaused,
    startListening,
    stopListening,
    toggleListening,
    speak,
    stopSpeaking,
    toggleMute,
    togglePause,
    startSession,
    endSession,
    reset,
  } = useVoice();

  const { isConnected, sendVoiceCommand } = useWebSocket();
  const { user } = useAppStore();
  const { currentSession, aiResponse } = useVoiceStore();

  const [showSettings, setShowSettings] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [sessionStartTime, setSessionStartTime] = useState<Date | null>(null);
  const [sessionDuration, setSessionDuration] = useState(0);
  const [lastCommand, setLastCommand] = useState<string>('');
  const [commandHistory, setCommandHistory] = useState<string[]>([]);

  const sessionTimerRef = useRef<NodeJS.Timeout | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  // Auto-start session if enabled
  useEffect(() => {
    if (autoStart && isSupported && permission === 'granted') {
      startSession();
    }
  }, [autoStart, isSupported, permission, startSession]);

  // Session timer
  useEffect(() => {
    if (currentSession && !sessionStartTime) {
      setSessionStartTime(new Date());
    } else if (!currentSession && sessionStartTime) {
      setSessionStartTime(null);
      setSessionDuration(0);
    }
  }, [currentSession, sessionStartTime]);

  useEffect(() => {
    if (sessionStartTime) {
      sessionTimerRef.current = setInterval(() => {
        setSessionDuration(Math.floor((Date.now() - sessionStartTime.getTime()) / 1000));
      }, 1000);
    } else {
      if (sessionTimerRef.current) {
        clearInterval(sessionTimerRef.current);
        sessionTimerRef.current = null;
      }
    }

    return () => {
      if (sessionTimerRef.current) {
        clearInterval(sessionTimerRef.current);
      }
    };
  }, [sessionStartTime]);

  // Handle voice commands
  const handleVoiceCommand = async (command: string) => {
    if (!command.trim() || !isConnected || !currentSession) return;

    setLastCommand(command);
    setCommandHistory(prev => [command, ...prev.slice(0, 9)]); // Keep last 10 commands

    try {
      sendVoiceCommand({
        sessionId: currentSession.sessionId,
        transcript: command,
        context: {
          userId: user?.id,
          timestamp: new Date().toISOString(),
          confidence,
          audioLevel,
        },
      });
    } catch (error) {
      console.error('Failed to send voice command:', error);
    }
  };

  // Handle AI response
  useEffect(() => {
    if (aiResponse && aiResponse.response) {
      speak(aiResponse.response);
    }
  }, [aiResponse, speak]);

  // Handle transcript updates
  useEffect(() => {
    if (transcript && !isListening && transcript !== lastCommand) {
      handleVoiceCommand(transcript);
    }
  }, [transcript, isListening, lastCommand]);

  // Get current voice state
  const getVoiceState = (): 'idle' | 'listening' | 'processing' | 'speaking' | 'error' => {
    if (error) return 'error';
    if (isSpeaking) return 'speaking';
    if (isProcessing) return 'processing';
    if (isListening) return 'listening';
    return 'idle';
  };

  // Get voice state color
  const getVoiceStateColor = () => {
    const state = getVoiceState();
    switch (state) {
      case 'listening':
        return 'text-voice-listening';
      case 'processing':
        return 'text-voice-processing';
      case 'speaking':
        return 'text-voice-speaking';
      case 'error':
        return 'text-voice-error';
      default:
        return 'text-gray-500';
    }
  };

  // Get voice state text
  const getVoiceStateText = () => {
    const state = getVoiceState();
    switch (state) {
      case 'listening':
        return 'Listening...';
      case 'processing':
        return 'Processing...';
      case 'speaking':
        return 'Speaking...';
      case 'error':
        return 'Error';
      default:
        return 'Ready';
    }
  };

  if (!isSupported) {
    return (
      <div className={cn('voice-assistant-not-supported', className)}>
        <div className="text-center p-6">
          <MicOff className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-700 mb-2">
            Voice Not Supported
          </h3>
          <p className="text-gray-500 text-sm">
            Your browser doesn't support voice recognition. Please use a modern browser like Chrome, Firefox, or Safari.
          </p>
        </div>
      </div>
    );
  }

  if (permission === 'denied') {
    return (
      <div className={cn('voice-assistant-permission-denied', className)}>
        <div className="text-center p-6">
          <MicOff className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-700 mb-2">
            Microphone Permission Denied
          </h3>
          <p className="text-gray-500 text-sm mb-4">
            Please enable microphone access in your browser settings to use voice commands.
          </p>
          <Button
            variant="outline"
            onClick={() => window.location.reload()}
          >
            Reload Page
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className={cn('voice-assistant', className)}>
      {/* Main Voice Interface */}
      <div className={cn(
        'voice-interface',
        compact ? 'p-4' : 'p-6',
        'bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700'
      )}>
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className={cn(
              'w-3 h-3 rounded-full',
              isConnected ? 'bg-green-500' : 'bg-red-500'
            )} />
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {isConnected ? 'Connected' : 'Disconnected'}
            </span>
          </div>
          
          <div className="flex items-center space-x-2">
            {currentSession && (
              <span className="text-xs text-gray-500">
                Session: {formatDuration(sessionDuration)}
              </span>
            )}
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowHelp(true)}
              className="p-2"
            >
              <HelpCircle className="w-4 h-4" />
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowSettings(true)}
              className="p-2"
            >
              <Settings className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Voice Visualizer */}
        {showVisualizer && (
          <div className="mb-4">
            <VoiceVisualizer
              audioLevel={audioLevel}
              isListening={isListening}
              isProcessing={isProcessing}
              isSpeaking={isSpeaking}
              compact={compact}
            />
          </div>
        )}

        {/* Main Voice Button */}
        <div className="flex justify-center mb-4">
          <Button
            variant="voice"
            size={compact ? 'voice' : 'voiceLarge'}
            voiceState={getVoiceState()}
            onClick={toggleListening}
            disabled={!isSupported || permission !== 'granted' || isProcessing}
            className={cn(
              'transition-all duration-300 ease-in-out',
              'hover:scale-105 active:scale-95',
              'focus:outline-none focus:ring-4 focus:ring-blue-300 focus:ring-opacity-50'
            )}
          >
            {isListening ? (
              <Mic className="w-6 h-6" />
            ) : isProcessing ? (
              <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Mic className="w-6 h-6" />
            )}
          </Button>
        </div>

        {/* Voice State */}
        <div className="text-center mb-4">
          <p className={cn('text-sm font-medium', getVoiceStateColor())}>
            {getVoiceStateText()}
          </p>
          {confidence > 0 && (
            <p className="text-xs text-gray-500 mt-1">
              Confidence: {Math.round(confidence * 100)}%
            </p>
          )}
        </div>

        {/* Control Buttons */}
        <div className="flex justify-center space-x-4 mb-4">
          <Button
            variant="outline"
            size="sm"
            onClick={toggleMute}
            className={cn(
              'flex items-center space-x-2',
              isMuted && 'bg-red-50 border-red-200 text-red-600'
            )}
          >
            {isMuted ? (
              <VolumeX className="w-4 h-4" />
            ) : (
              <Volume2 className="w-4 h-4" />
            )}
            <span>{isMuted ? 'Unmute' : 'Mute'}</span>
          </Button>

          {isSpeaking && (
            <Button
              variant="outline"
              size="sm"
              onClick={stopSpeaking}
              className="flex items-center space-x-2"
            >
              <VolumeX className="w-4 h-4" />
              <span>Stop</span>
            </Button>
          )}

          {currentSession && (
            <Button
              variant="outline"
              size="sm"
              onClick={endSession}
              className="flex items-center space-x-2"
            >
              <span>End Session</span>
            </Button>
          )}
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {/* AI Response */}
        {aiResponse && (
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800 font-medium mb-1">AI Response:</p>
            <p className="text-sm text-blue-700">{aiResponse.response}</p>
            {aiResponse.suggestions && aiResponse.suggestions.length > 0 && (
              <div className="mt-2">
                <p className="text-xs text-blue-600 mb-1">Suggestions:</p>
                <div className="flex flex-wrap gap-1">
                  {aiResponse.suggestions.map((suggestion, index) => (
                    <span
                      key={index}
                      className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded"
                    >
                      {suggestion}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Transcript */}
        {showTranscript && transcript && (
          <div className="mb-4">
            <VoiceTranscript
              transcript={transcript}
              confidence={confidence}
              compact={compact}
            />
          </div>
        )}

        {/* Command History */}
        {commandHistory.length > 0 && !compact && (
          <div className="mt-4">
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Recent Commands
            </h4>
            <div className="space-y-1">
              {commandHistory.slice(0, 3).map((command, index) => (
                <div
                  key={index}
                  className="text-xs text-gray-600 dark:text-gray-400 p-2 bg-gray-50 dark:bg-gray-700 rounded"
                >
                  {command}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Settings Modal */}
      {showSettings && (
        <VoiceSettings
          isOpen={showSettings}
          onClose={() => setShowSettings(false)}
        />
      )}

      {/* Help Modal */}
      {showHelp && (
        <VoiceHelp
          isOpen={showHelp}
          onClose={() => setShowHelp(false)}
        />
      )}
    </div>
  );
};

export default VoiceAssistant;
