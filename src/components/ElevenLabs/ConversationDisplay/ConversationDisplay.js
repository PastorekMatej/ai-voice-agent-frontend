// ConversationDisplay.js
// Component for displaying conversation history and real-time transcripts

import React, { useEffect, useRef } from 'react';
import { Box, Paper, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';

// Styled components for chat bubbles
const UserMessage = styled(Paper)(({ theme }) => ({
  padding: '12px 16px',
  marginBottom: '8px',
  borderRadius: '18px 18px 4px 18px',
  backgroundColor: '#dcf8c6', // WhatsApp-style green
  alignSelf: 'flex-end',
  maxWidth: '70%',
  wordBreak: 'break-word',
  boxShadow: 'none',
  border: '1px solid #c8e6c9'
}));

const AgentMessage = styled(Paper)(({ theme }) => ({
  padding: '12px 16px',
  marginBottom: '8px',
  borderRadius: '18px 18px 18px 4px',
  backgroundColor: '#ffffff',
  alignSelf: 'flex-start',
  maxWidth: '70%',
  wordBreak: 'break-word',
  boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
  border: '1px solid #e0e0e0'
}));

const TranscriptPreview = styled(Paper)(({ theme }) => ({
  padding: '12px 16px',
  marginBottom: '8px',
  borderRadius: '18px 18px 4px 18px',
  backgroundColor: '#f0f8ff', // Light blue for real-time transcript
  alignSelf: 'flex-end',
  maxWidth: '70%',
  wordBreak: 'break-word',
  opacity: 0.8,
  fontStyle: 'italic',
  border: '2px dashed #2196f3'
}));

const BlinkingCursor = styled('span')(({ theme }) => ({
  animation: 'blink 1s infinite',
  '@keyframes blink': {
    '0%, 50%': { opacity: 1 },
    '51%, 100%': { opacity: 0 }
  }
}));

const ConversationDisplay = ({
  conversation = [],
  isRecording = false,
  currentTranscript = '',
  agentMode = 'listening',
  conversationId = null
}) => {
  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [conversation, currentTranscript]);

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Box
      sx={{ 
        height: '100vh',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: 'white'
      }}
    >
      {/* Messages Container */}
      <Box 
        sx={{ 
          flex: 1,
          overflowY: 'auto',
          p: 3,
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: 'white'
        }}
      >
        {/* Conversation History */}
        {conversation.map((entry) => (
          <Box key={entry.id} sx={{ mb: 1 }}>
            {entry.type === 'user' ? (
              <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                <Box>
                  <UserMessage>
                    <Typography variant="body1">
                      {entry.transcript}
                    </Typography>
                  </UserMessage>
                  <Typography 
                    variant="caption" 
                    color="text.secondary"
                    sx={{ display: 'block', textAlign: 'right', mr: 1 }}
                  >
                    {formatTime(entry.timestamp)}
                  </Typography>
                </Box>
              </Box>
            ) : (
              <Box sx={{ display: 'flex', justifyContent: 'flex-start' }}>
                <Box>
                  <AgentMessage>
                    <Typography variant="body1">
                      {entry.response}
                    </Typography>
                  </AgentMessage>
                  <Typography 
                    variant="caption" 
                    color="text.secondary"
                    sx={{ display: 'block', textAlign: 'left', ml: 1 }}
                  >
                    🤖 Agent • {formatTime(entry.timestamp)}
                  </Typography>
                </Box>
              </Box>
            )}
          </Box>
        ))}

        {/* Real-time Transcript Preview - only show while actively recording and not already in conversation */}
        {isRecording && currentTranscript && currentTranscript.trim() && 
         !conversation.some(entry => entry.type === 'user' && entry.transcript === currentTranscript) && (
          <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
            <TranscriptPreview>
              <Typography variant="body1">
                {currentTranscript}
                <BlinkingCursor>
                  |
                </BlinkingCursor>
              </Typography>
            </TranscriptPreview>
          </Box>
        )}

        {/* Auto-scroll target */}
        <div ref={messagesEndRef} />
      </Box>
    </Box>
  );
};

export default ConversationDisplay; 