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
  const [agentMode, setAgentMode] = useState('idle'); // 'idle', 'listening', 'speaking'

  // WebSocket and audio references
  const wsRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioStreamRef = useRef(null);
  const audioContextRef = useRef(null);
  const workletNodeRef = useRef(null);
  
  // Add ref for isRecording to avoid closure issues
  const isRecordingRef = useRef(false);
  
  // Audio queue management
  const audioQueueRef = useRef([]);
  const isPlayingRef = useRef(false);
  
  // Sync isRecording ref with state
  useEffect(() => {
    isRecordingRef.current = isRecording;
  }, [isRecording]);

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

  // Process audio queue
  const processAudioQueue = useCallback(async () => {
    if (isPlayingRef.current || audioQueueRef.current.length === 0) {
      return;
    }
    
    isPlayingRef.current = true;
    setAgentMode('speaking');
    
    while (audioQueueRef.current.length > 0) {
      const audioBase64 = audioQueueRef.current.shift();
      
      try {
        await playAudioChunk(audioBase64);
      } catch (err) {
        console.error('❌ Error playing queued audio:', err);
      }
    }
    
    isPlayingRef.current = false;
    setAgentMode('listening');
  }, []);

  // Play audio chunk received from server
  const playAudioChunk = useCallback(async (audioBase64) => {
    return new Promise((resolve, reject) => {
      try {
        // ElevenLabs sends PCM audio - create a WAV wrapper for browser playback
        const audioData = atob(audioBase64);
        const audioBytes = new Uint8Array(audioData.length);
        for (let i = 0; i < audioData.length; i++) {
          audioBytes[i] = audioData.charCodeAt(i);
        }
        
        // Create WAV header for PCM 16kHz mono data
        const sampleRate = 16000;
        const numChannels = 1;
        const bitsPerSample = 16;
        const byteRate = sampleRate * numChannels * bitsPerSample / 8;
        const blockAlign = numChannels * bitsPerSample / 8;
        const dataSize = audioBytes.length;
        const fileSize = 36 + dataSize;
        
        const wavBuffer = new ArrayBuffer(44 + dataSize);
        const view = new DataView(wavBuffer);
        
        // WAV header
        const writeString = (offset, string) => {
          for (let i = 0; i < string.length; i++) {
            view.setUint8(offset + i, string.charCodeAt(i));
          }
        };
        
        writeString(0, 'RIFF');
        view.setUint32(4, fileSize, true);
        writeString(8, 'WAVE');
        writeString(12, 'fmt ');
        view.setUint32(16, 16, true);
        view.setUint16(20, 1, true);
        view.setUint16(22, numChannels, true);
        view.setUint32(24, sampleRate, true);
        view.setUint32(28, byteRate, true);
        view.setUint16(32, blockAlign, true);
        view.setUint16(34, bitsPerSample, true);
        writeString(36, 'data');
        view.setUint32(40, dataSize, true);
        
        // Copy audio data
        const wavData = new Uint8Array(wavBuffer, 44);
        wavData.set(audioBytes);
        
        // Create audio blob and play
        const audioBlob = new Blob([wavBuffer], { type: 'audio/wav' });
        const audioUrl = URL.createObjectURL(audioBlob);
        const audio = new Audio(audioUrl);
        
        audio.onended = () => {
          URL.revokeObjectURL(audioUrl);
          resolve();
        };
        
        audio.onerror = (error) => {
          console.error('❌ Audio playback error:', error);
          URL.revokeObjectURL(audioUrl);
          reject(error);
        };
        
        audio.play().catch(reject);
        
      } catch (err) {
        console.error('❌ Error playing audio:', err);
        reject(err);
      }
    });
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
        
      case 'agent_response_correction':
        const correctedResponse = data.agent_response_correction_event?.corrected_response || '';
        setResponse(correctedResponse);
        console.log('🔧 Agent response correction:', correctedResponse);
        break;
        
      case 'audio':
        const audioData = data.audio_event?.audio_base_64;
        if (audioData) {
          audioQueueRef.current.push(audioData);
          processAudioQueue();
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
  }, [processAudioQueue]);

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
      const wsUrl = `${elevenLabsConfig.websocketUrl}?agent_id=${elevenLabsConfig.agentId}&xi_api_key=${elevenLabsConfig.apiKey}`;
      
      // Create WebSocket connection
      const ws = new WebSocket(wsUrl);

      // Handle WebSocket events
      ws.onopen = () => {
        console.log('✅ Connected to ElevenLabs');
        setIsConnected(true);
        setError(null);
        
        // Send conversation initiation message as required by ElevenLabs protocol
        try {
          const initMessage = {
            type: 'conversation_initiation_client_data'
          };
          console.log('📤 Sending conversation initiation message');
          ws.send(JSON.stringify(initMessage));
        } catch (err) {
          console.error('❌ Error sending conversation initiation:', err);
        }
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
        setIsRecording(false);
        cleanupAudioResources();
        
        if (event.code !== 1000) { // Not a normal closure
          setError(`Connection closed unexpectedly: ${event.reason || 'Unknown reason'}`);
        }
      };

      ws.onerror = (error) => {
        console.error('❌ WebSocket error:', error);
        setError('Connection error occurred. Please check your API credentials and try again.');
        setIsConnected(false);
        setIsRecording(false);
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
      console.log('🎤 Starting recording... Connection status:', isConnected, 'WebSocket state:', wsRef.current?.readyState);
      
      if (!isConnected || !wsRef.current) {
        throw new Error('Not connected to ElevenLabs. Please connect first.');
      }

      if (wsRef.current.readyState !== WebSocket.OPEN) {
        throw new Error('WebSocket is not open. Current state: ' + wsRef.current.readyState);
      }

      console.log('🎤 Requesting microphone access...');
      
      // Get user media with optimized settings for ElevenLabs PCM
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          sampleRate: 16000,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });

      console.log('🎤 Microphone access granted, setting up Web Audio API for PCM capture...');
      audioStreamRef.current = stream;

      // Create audio context for PCM capture
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)({
          sampleRate: 16000
        });
      }

      // Create audio worklet for PCM processing
      const source = audioContextRef.current.createMediaStreamSource(stream);
      const processor = audioContextRef.current.createScriptProcessor(4096, 1, 1);
      
      processor.onaudioprocess = (event) => {
        if (wsRef.current?.readyState === WebSocket.OPEN && isRecordingRef.current) {
          const inputBuffer = event.inputBuffer;
          const inputData = inputBuffer.getChannelData(0);
          
          // Convert float32 PCM to int16 PCM
          const pcmData = new Int16Array(inputData.length);
          for (let i = 0; i < inputData.length; i++) {
            pcmData[i] = Math.max(-32768, Math.min(32767, inputData[i] * 32768));
          }
          
          // Convert to base64
          const uint8Array = new Uint8Array(pcmData.buffer);
          const base64Audio = btoa(String.fromCharCode(...uint8Array));
          
          // Send PCM audio to ElevenLabs
          const message = {
            user_audio_chunk: base64Audio
          };
          console.log('📤 Sending PCM audio chunk, size:', base64Audio.length);
          wsRef.current.send(JSON.stringify(message));
        }
      };
      
      // Connect the audio processing chain
      source.connect(processor);
      processor.connect(audioContextRef.current.destination);
      
      // Store references for cleanup
      workletNodeRef.current = processor;
      mediaRecorderRef.current = { source, processor }; // Store for cleanup
      
      setIsRecording(true);
      setAgentMode('speaking'); // User is now speaking
      
      console.log('🎤 Started PCM recording successfully');

    } catch (err) {
      console.error('❌ Failed to start recording:', err);
      setError('Failed to start recording: ' + err.message);
      setIsRecording(false);
    }
  }, [isConnected]);

  // Stop recording
  const stopRecording = useCallback(() => {
    try {
      if (mediaRecorderRef.current) {
        console.log('🛑 Stopping Web Audio API recording...');
        const { source, processor } = mediaRecorderRef.current;
        if (source) source.disconnect();
        if (processor) processor.disconnect();
        mediaRecorderRef.current = null;
      }
      
      if (audioStreamRef.current) {
        console.log('🛑 Stopping audio stream...');
        audioStreamRef.current.getTracks().forEach(track => track.stop());
        audioStreamRef.current = null;
      }
      
      setIsRecording(false);
      setAgentMode('listening');
      // Clear the transcript to remove the preview after recording stops
      setTranscript('');
      console.log('🛑 Stopped recording and cleared transcript');
      
    } catch (err) {
      console.error('❌ Error stopping recording:', err);
      setIsRecording(false);
    }
  }, []);

  // Disconnect from ElevenLabs
  const disconnect = useCallback(() => {
    try {
      console.log('🔌 Disconnecting... Current state - Connected:', isConnected, 'Recording:', isRecording);
      
      // Stop recording if active
      if (mediaRecorderRef.current) {
        console.log('🛑 Stopping Web Audio API recording...');
        const { source, processor } = mediaRecorderRef.current;
        if (source) source.disconnect();
        if (processor) processor.disconnect();
        mediaRecorderRef.current = null;
      }
      
      // Close WebSocket
      if (wsRef.current) {
        console.log('🔌 Closing WebSocket...');
        wsRef.current.close();
        wsRef.current = null;
      }
      
      // Clean up audio resources
      cleanupAudioResources();
      
      // Reset state
      setIsConnected(false);
      setIsRecording(false);
      setConversationId(null);
      setTranscript('');
      setResponse('');
      setAgentMode('idle');
      setError(null);
      
      console.log('🔌 Disconnected from ElevenLabs');
      
    } catch (err) {
      console.error('❌ Error during disconnect:', err);
    }
  }, [cleanupAudioResources]);

  // Cleanup on unmount - create a stable reference
  const disconnectRef = useRef();
  disconnectRef.current = disconnect;
  
  useEffect(() => {
    return () => {
      disconnectRef.current();
    };
  }, []); // Empty dependency array to prevent re-running

  // Clear transcript function
  const clearTranscript = useCallback(() => {
    setTranscript('');
  }, []);

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
    stopRecording,
    clearTranscript
  };
};

export default useElevenLabsConversation; 