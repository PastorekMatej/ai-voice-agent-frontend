// useElevenLabsConversation.js
// ElevenLabs Conversational AI hook using WebSocket protocol

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
  const [agentMode, setAgentMode] = useState('listening'); // 'listening' or 'speaking'

  // WebSocket and audio references
  const wsRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioStreamRef = useRef(null);
  const audioContextRef = useRef(null);
  const workletNodeRef = useRef(null);

  // Cleanup audio resources
  const cleanupAudioResources = useCallback(() => {
    if (audioStreamRef.current) {
      audioStreamRef.current.getTracks().forEach(track => {
        track.stop();
      });
      audioStreamRef.current = null;
    }
    
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current = null;
    }
    
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    
    if (workletNodeRef.current) {
      workletNodeRef.current.disconnect();
      workletNodeRef.current = null;
    }
  }, []);

  // Play audio chunk received from server
  const playAudioChunk = useCallback(async (audioBase64) => {
    try {
      // Convert base64 to audio buffer
      const audioData = atob(audioBase64);
      const audioBytes = new Uint8Array(audioData.length);
      for (let i = 0; i < audioData.length; i++) {
        audioBytes[i] = audioData.charCodeAt(i);
      }
      
      // Create audio blob and play
      const audioBlob = new Blob([audioBytes], { type: 'audio/wav' });
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);
      
      audio.onended = () => {
        URL.revokeObjectURL(audioUrl);
        setAgentMode('listening');
      };
      
      await audio.play();
      
    } catch (err) {
      console.error('❌ Error playing audio:', err);
      setAgentMode('listening');
    }
  }, []);

  // Handle WebSocket messages according to ElevenLabs protocol
  const handleWebSocketMessage = useCallback((data) => {
    console.log('📨 WebSocket message:', data.type, data);
    
    switch (data.type) {
      case 'conversation_initiation_metadata':
        setConversationId(data.conversation_initiation_metadata_event?.conversation_id);
        console.log('💬 Conversation started:', data.conversation_initiation_metadata_event?.conversation_id);
        break;
        
      case 'user_transcript':
        const userTranscript = data.user_transcription_event?.user_transcript || '';
        setTranscript(userTranscript);
        console.log('🎤 User transcript:', userTranscript);
        break;
        
      case 'agent_response':
        const agentResponse = data.agent_response_event?.agent_response || '';
        setResponse(agentResponse);
        setAgentMode('speaking');
        console.log('🤖 Agent response:', agentResponse);
        break;
        
      case 'audio':
        const audioData = data.audio_event?.audio_base_64;
        if (audioData) {
          playAudioChunk(audioData);
        }
        break;
        
      case 'ping':
        // Respond to ping to keep connection alive
        if (wsRef.current?.readyState === WebSocket.OPEN) {
          wsRef.current.send(JSON.stringify({
            type: 'pong',
            event_id: data.ping_event?.event_id
          }));
        }
        break;
        
      case 'interruption':
        console.log('⚠️ Conversation interrupted:', data.interruption_event?.reason);
        setAgentMode('listening');
        break;
        
      case 'error':
        console.error('❌ Server error:', data);
        setError('Server error occurred. Please try again.');
        break;
        
      default:
        console.log('❓ Unknown message type:', data.type, data);
    }
  }, [playAudioChunk]);

  // Connect to ElevenLabs WebSocket
  const connect = useCallback(async () => {
    try {
      if (!elevenLabsConfig.apiKey) {
        throw new Error('ElevenLabs API key is required. Please set REACT_APP_ELEVENLABS_API_KEY in your environment.');
      }

      if (!elevenLabsConfig.agentId) {
        throw new Error('ElevenLabs Agent ID is required. Please set REACT_APP_ELEVENLABS_AGENT_ID in your environment.');
      }

      setError(null);
      console.log('🔌 Connecting to ElevenLabs...');

      // Build WebSocket URL with authentication
      const wsUrl = `${elevenLabsConfig.websocketUrl}?agent_id=${elevenLabsConfig.agentId}`;
      
      // Create WebSocket connection
      const ws = new WebSocket(wsUrl, [], {
        headers: {
          'xi-api-key': elevenLabsConfig.apiKey
        }
      });

      // Handle WebSocket events
      ws.onopen = () => {
        console.log('✅ Connected to ElevenLabs');
        setIsConnected(true);
        setError(null);
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          handleWebSocketMessage(data);
        } catch (err) {
          console.error('❌ Error parsing WebSocket message:', err);
        }
      };

      ws.onclose = (event) => {
        console.log('🔌 WebSocket closed:', event.code, event.reason);
        setIsConnected(false);
        cleanupAudioResources();
        
        if (event.code !== 1000) { // Not a normal closure
          setError(`Connection closed unexpectedly: ${event.reason || 'Unknown reason'}`);
        }
      };

      ws.onerror = (error) => {
        console.error('❌ WebSocket error:', error);
        setError('Connection error occurred. Please check your API credentials and try again.');
        setIsConnected(false);
      };

      wsRef.current = ws;

    } catch (err) {
      console.error('❌ Failed to connect:', err);
      setError(err.message);
    }
  }, [handleWebSocketMessage, cleanupAudioResources]);

  // Start recording user audio
  const startRecording = useCallback(async () => {
    try {
      if (!isConnected || !wsRef.current) {
        throw new Error('Not connected to ElevenLabs. Please connect first.');
      }

      // Get user media with optimized settings for ElevenLabs
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          sampleRate: 16000,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });

      audioStreamRef.current = stream;

      // Create MediaRecorder for streaming audio
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus',
        audioBitsPerSecond: 16000
      });

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0 && wsRef.current?.readyState === WebSocket.OPEN) {
          // Convert to base64 and send to ElevenLabs
          const reader = new FileReader();
          reader.onload = () => {
            const audioData = reader.result.split(',')[1]; // Remove data URL prefix
            wsRef.current.send(JSON.stringify({
              user_audio_chunk: audioData
            }));
          };
          reader.readAsDataURL(event.data);
        }
      };

      // Send audio chunks every 100ms for low latency
      mediaRecorder.start(100);
      mediaRecorderRef.current = mediaRecorder;
      
      setIsRecording(true);
      setError(null);
      setTranscript(''); // Clear previous transcript
      console.log('🎤 Started recording');

    } catch (err) {
      console.error('❌ Failed to start recording:', err);
      setError('Failed to start recording: ' + err.message);
    }
  }, [isConnected]);

  // Stop recording
  const stopRecording = useCallback(() => {
    try {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
      }
      
      cleanupAudioResources();
      setIsRecording(false);
      console.log('🛑 Stopped recording');
      
    } catch (err) {
      console.error('❌ Error stopping recording:', err);
    }
  }, [cleanupAudioResources]);

  // Disconnect from ElevenLabs
  const disconnect = useCallback(() => {
    try {
      // Stop recording if active
      if (isRecording) {
        stopRecording();
      }

      // Close WebSocket
      if (wsRef.current) {
        wsRef.current.close(1000, 'User disconnected');
        wsRef.current = null;
      }

      // Reset state
      setIsConnected(false);
      setConversationId(null);
      setTranscript('');
      setResponse('');
      setAgentMode('listening');
      setError(null);
      
      cleanupAudioResources();
      console.log('🔌 Disconnected from ElevenLabs');

    } catch (err) {
      console.error('❌ Error disconnecting:', err);
      setError('Error disconnecting: ' + err.message);
    }
  }, [isRecording, stopRecording, cleanupAudioResources]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      disconnect();
    };
  }, [disconnect]);

  return {
    // State
    isConnected,
    isRecording,
    conversationId,
    transcript,
    response,
    agentMode,
    error,
    
    // Actions
    connect,
    disconnect,
    startRecording,
    stopRecording
  };
};

export default useElevenLabsConversation; 