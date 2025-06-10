// ElevenLabsVoiceAgent.js
// Main component for ElevenLabs Conversational AI integration

import React, { useState, useEffect } from 'react';
import { Box, Container, Typography, Alert } from '@mui/material';
import { validateConfig } from '../../../config/elevenlabs';
import VoiceControls from '../VoiceControls/VoiceControls';
import ConversationDisplay from '../ConversationDisplay/ConversationDisplay';
import ConfigurationValidator from './ConfigurationValidator';
import APITester from './APITester';
import { useElevenLabsConversation } from '../../../hooks/ElevenLabs';

const ElevenLabsVoiceAgent = () => {
  // State management
  const [isConfigValid, setIsConfigValid] = useState(false);
  const [configError, setConfigError] = useState(null);
  const [conversation, setConversation] = useState([]);
  const [validationResults, setValidationResults] = useState({});
  
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
    stopRecording
  } = useElevenLabsConversation();

  // Handle validation results from ConfigurationValidator
  const handleValidationChange = (isValid, results) => {
    setIsConfigValid(isValid);
    setValidationResults(results);
    
    if (!isValid) {
      const errors = Object.values(results)
        .filter(r => !r.valid)
        .map(r => r.error)
        .join(', ');
      setConfigError(errors);
    } else {
      setConfigError(null);
    }
  };

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

  return (
    <Container maxWidth="md">
      <Box sx={{ py: 3 }}>
        {/* Header */}
        <Typography variant="h4" component="h1" gutterBottom align="center">
          ElevenLabs Voice Agent
        </Typography>
        
        {/* Configuration Validator */}
        <ConfigurationValidator onValidationChange={handleValidationChange} />
        
        {/* API Tester */}
        {isConfigValid && <APITester />}
        
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
          disabled={!isConfigValid}
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