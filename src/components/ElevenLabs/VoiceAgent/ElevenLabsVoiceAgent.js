// ElevenLabsVoiceAgent.js
// Main component for ElevenLabs Conversational AI integration

import React, { useState, useEffect, useRef } from 'react';
import { Box, Container, Typography, Alert } from '@mui/material';
import elevenLabsConfig, { validateConfig } from '../../../config/elevenlabs';
import VoiceControls from '../VoiceControls/VoiceControls';
import ConversationDisplay from '../ConversationDisplay/ConversationDisplay';
import { useElevenLabsConversation } from '../../../hooks/ElevenLabs';

const ElevenLabsVoiceAgent = () => {
  // State management
  const [isConfigValid, setIsConfigValid] = useState(false);
  const [configError, setConfigError] = useState(null);
  const [conversation, setConversation] = useState([]);
  
  // ElevenLabs conversation hook
  const {
    isConnected,
    isRecording,
    conversationId,
    transcript,
    response,
    agentMode,
    error: conversationError,
    connect,
    disconnect,
    startRecording,
    stopRecording,
    sendContextualUpdate
  } = useElevenLabsConversation();

  // Validate configuration on mount
  useEffect(() => {
    try {
      validateConfig();
      setIsConfigValid(true);
      setConfigError(null);
    } catch (error) {
      setIsConfigValid(false);
      setConfigError(error.message);
      console.error('ElevenLabs configuration error:', error);
    }
  }, []);

  // Handle conversation updates
  useEffect(() => {
    if (transcript || response) {
      const newEntry = {
        id: Date.now(),
        timestamp: new Date(),
        transcript: transcript || '',
        response: response || '',
        type: transcript ? 'user' : 'agent'
      };
      
      setConversation(prev => [...prev, newEntry]);
    }
  }, [transcript, response]);

  // Event handlers
  const handleConnect = async () => {
    if (!isConfigValid) return;
    try {
      await connect();
    } catch (error) {
      console.error('Failed to connect to ElevenLabs:', error);
    }
  };

  const handleDisconnect = () => {
    disconnect();
    setConversation([]);
  };

  const handleStartRecording = () => {
    if (isConnected) {
      startRecording();
    }
  };

  const handleStopRecording = () => {
    if (isRecording) {
      stopRecording();
    }
  };

  // Render configuration error if invalid
  if (!isConfigValid) {
    return (
      <Container maxWidth="md">
        <Box sx={{ mt: 4 }}>
          <Alert severity="error">
            <Typography variant="h6">Configuration Error</Typography>
            <Typography variant="body2">
              {configError || 'Invalid ElevenLabs configuration. Please check your environment variables.'}
            </Typography>
          </Alert>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="md">
      <Box sx={{ py: 3 }}>
        {/* Header */}
        <Typography variant="h4" component="h1" gutterBottom align="center">
          ElevenLabs Voice Agent
        </Typography>
        
        {/* Error Display */}
        {conversationError && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {conversationError}
          </Alert>
        )}
        
        {/* Voice Controls */}
        <VoiceControls
          isConnected={isConnected}
          isRecording={isRecording}
          agentMode={agentMode}
          onConnect={handleConnect}
          onDisconnect={handleDisconnect}
          onStartRecording={handleStartRecording}
          onStopRecording={handleStopRecording}
        />
        
        {/* Conversation Display */}
        <ConversationDisplay
          conversation={conversation}
          isRecording={isRecording}
          currentTranscript={transcript}
          agentMode={agentMode}
          conversationId={conversationId}
        />
      </Box>
    </Container>
  );
};

export default ElevenLabsVoiceAgent; 