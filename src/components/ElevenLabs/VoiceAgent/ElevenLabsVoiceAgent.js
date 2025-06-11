// ElevenLabsVoiceAgent.js
// Main component for ElevenLabs Conversational AI integration

import React, { useState, useEffect } from 'react';
import { Box, Alert } from '@mui/material';
import VoiceControls from '../VoiceControls/VoiceControls';
import ConversationDisplay from '../ConversationDisplay/ConversationDisplay';
import { useElevenLabsConversation } from '../../../hooks/ElevenLabs';

const ElevenLabsVoiceAgent = () => {
  // State management
  const [conversation, setConversation] = useState([]);
  const [lastProcessedTranscript, setLastProcessedTranscript] = useState('');
  const [lastProcessedResponse, setLastProcessedResponse] = useState('');
  
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
    clearTranscript
  } = useElevenLabsConversation();



  // Handle conversation updates with deduplication
  useEffect(() => {
    // Handle new transcript (user message)
    if (transcript && transcript !== lastProcessedTranscript && transcript.trim()) {
      const newEntry = {
        id: `user-${Date.now()}`,
        timestamp: new Date(),
        transcript: transcript,
        response: '',
        type: 'user'
      };
      
      setConversation(prev => [...prev, newEntry]);
      setLastProcessedTranscript(transcript);
      
      // Clear the transcript immediately after adding to conversation to prevent duplicates
      clearTranscript();
    }
  }, [transcript, lastProcessedTranscript, isRecording, clearTranscript]);

  useEffect(() => {
    // Handle new response (agent message)
    if (response && response !== lastProcessedResponse && response.trim()) {
      const newEntry = {
        id: `agent-${Date.now()}`,
        timestamp: new Date(),
        transcript: '',
        response: response,
        type: 'agent'
      };
      
      setConversation(prev => [...prev, newEntry]);
      setLastProcessedResponse(response);
    }
  }, [response, lastProcessedResponse]);

  // Event handlers
  const handleConnect = async () => {
    try {
      await connect();
    } catch (error) {
      console.error('Failed to connect to ElevenLabs:', error);
    }
  };

  const handleDisconnect = () => {
    disconnect();
    setConversation([]);
    setLastProcessedTranscript('');
    setLastProcessedResponse('');
  };

  const handleStartRecording = () => {
    if (isConnected && !isRecording) {
      startRecording();
    }
  };

  const handleStopRecording = () => {
    if (isRecording) {
      stopRecording();
    }
  };

    return (
    <Box sx={{ 
      display: 'flex', 
      height: '100vh',
      width: '100%'
    }}>
      {/* Left Side - AI Waves and Controls */}
      <Box sx={{ 
        flex: 1,
        backgroundColor: 'white',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: 3
      }}>

        
        {/* AI Waves */}
        <Box sx={{ 
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <VoiceControls
            isConnected={isConnected}
            isRecording={isRecording}
            agentMode={agentMode}
            onConnect={handleConnect}
            onDisconnect={handleDisconnect}
            onStartRecording={handleStartRecording}
            onStopRecording={handleStopRecording}
          />
        </Box>
      </Box>
      
      {/* Right Side - Conversation */}
      <Box sx={{ 
        flex: 1,
        backgroundColor: 'white',
        display: 'flex',
        flexDirection: 'column'
      }}>
        <ConversationDisplay
          conversation={conversation}
          isRecording={isRecording}
          currentTranscript={transcript}
          agentMode={agentMode}
          conversationId={conversationId}
        />
      </Box>
    </Box>
  );
};

export default ElevenLabsVoiceAgent; 