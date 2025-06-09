// useElevenLabsConversation.js
// Main hook for managing ElevenLabs conversation state and WebSocket connection

import { useState, useRef, useCallback, useEffect } from 'react';
import elevenLabsConfig from '../../config/elevenlabs';

const useElevenLabsConversation = () => {
  // Connection state
  const [isConnected, setIsConnected] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [conversationId, setConversationId] = useState(null);
  const [error, setError] = useState(null);

  // Conversation state
  const [transcript, setTranscript] = useState('');
  const [response, setResponse] = useState('');

  // WebSocket and audio references
  const wsRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioStreamRef = useRef(null);

  // Connect to ElevenLabs WebSocket
  const connect = useCallback(async () => {
    try {
      setError(null);
      
      // Validate configuration
      if (!elevenLabsConfig.apiKey || !elevenLabsConfig.agentId) {
        throw new Error('Missing ElevenLabs API key or Agent ID');
      }

      // Create WebSocket connection
      const wsUrl = `${elevenLabsConfig.websocket.url}/${elevenLabsConfig.agentId}`;
      const ws = new WebSocket(wsUrl, [], {
        headers: {
          'Authorization': `Bearer ${elevenLabsConfig.apiKey}`,
        }
      });

      ws.onopen = () => {
        console.log('Connected to ElevenLabs');
        setIsConnected(true);
        setError(null);
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          handleWebSocketMessage(data);
        } catch (err) {
          console.error('Error parsing WebSocket message:', err);
        }
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        setError('Connection error occurred');
      };

      ws.onclose = () => {
        console.log('Disconnected from ElevenLabs');
        setIsConnected(false);
        setIsRecording(false);
      };

      wsRef.current = ws;
      
    } catch (err) {
      console.error('Failed to connect:', err);
      setError(err.message);
    }
  }, []);

  // Handle WebSocket messages
  const handleWebSocketMessage = useCallback((data) => {
    switch (data.type) {
      case 'conversation_initiation_metadata':
        setConversationId(data.conversation_id);
        break;
      case 'user_transcript':
        setTranscript(data.transcript || '');
        break;
      case 'agent_response':
        setResponse(data.response || '');
        break;
      case 'audio':
        // Handle audio playback
        handleAudioPlayback(data.audio_data);
        break;
      case 'error':
        setError(data.message || 'Unknown error occurred');
        break;
      default:
        console.log('Unknown message type:', data.type);
    }
  }, []);

  // Handle audio playback
  const handleAudioPlayback = useCallback((audioData) => {
    try {
      // Convert base64 audio to playable format
      const audioBuffer = atob(audioData);
      const bytes = new Uint8Array(audioBuffer.length);
      for (let i = 0; i < audioBuffer.length; i++) {
        bytes[i] = audioBuffer.charCodeAt(i);
      }
      
      const audioBlob = new Blob([bytes], { type: 'audio/wav' });
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);
      
      audio.play().catch(err => {
        console.error('Error playing audio:', err);
      });
      
      // Clean up URL after playback
      audio.onended = () => {
        URL.revokeObjectURL(audioUrl);
      };
    } catch (err) {
      console.error('Error handling audio playback:', err);
    }
  }, []);

  // Start recording
  const startRecording = useCallback(async () => {
    try {
      if (!isConnected || !wsRef.current) {
        throw new Error('Not connected to ElevenLabs');
      }

      // Get user media
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          sampleRate: elevenLabsConfig.audio.sampleRate,
          channelCount: elevenLabsConfig.audio.channels,
          echoCancellation: elevenLabsConfig.audio.enableEchoCancellation,
          noiseSuppression: elevenLabsConfig.audio.enableNoiseSuppression,
        }
      });

      audioStreamRef.current = stream;

      // Create MediaRecorder for audio streaming
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0 && wsRef.current?.readyState === WebSocket.OPEN) {
          // Convert audio data to base64 and send
          const reader = new FileReader();
          reader.onload = () => {
            const audioData = reader.result.split(',')[1]; // Remove data URL prefix
            wsRef.current.send(JSON.stringify({
              type: 'audio_data',
              audio_data: audioData
            }));
          };
          reader.readAsDataURL(event.data);
        }
      };

      mediaRecorder.start(100); // Send chunks every 100ms
      mediaRecorderRef.current = mediaRecorder;
      setIsRecording(true);
      setError(null);

    } catch (err) {
      console.error('Failed to start recording:', err);
      setError('Failed to start recording: ' + err.message);
    }
  }, [isConnected]);

  // Stop recording
  const stopRecording = useCallback(() => {
    try {
      if (mediaRecorderRef.current) {
        mediaRecorderRef.current.stop();
        mediaRecorderRef.current = null;
      }

      if (audioStreamRef.current) {
        audioStreamRef.current.getTracks().forEach(track => track.stop());
        audioStreamRef.current = null;
      }

      setIsRecording(false);
    } catch (err) {
      console.error('Error stopping recording:', err);
    }
  }, []);

  // Disconnect
  const disconnect = useCallback(() => {
    try {
      // Stop recording if active
      if (isRecording) {
        stopRecording();
      }

      // Close WebSocket
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }

      // Reset state
      setIsConnected(false);
      setConversationId(null);
      setTranscript('');
      setResponse('');
      setError(null);

    } catch (err) {
      console.error('Error during disconnect:', err);
    }
  }, [isRecording, stopRecording]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      disconnect();
    };
  }, [disconnect]);

  return {
    isConnected,
    isRecording,
    conversationId,
    transcript,
    response,
    error,
    connect,
    disconnect,
    startRecording,
    stopRecording
  };
};

export default useElevenLabsConversation; 