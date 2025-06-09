// ConversationDisplay.js
// Component for displaying conversation history and real-time transcripts

import React, { useEffect, useRef } from 'react';
import { Box, Paper, Typography, Divider } from '@mui/material';
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

const ConversationDisplay = ({ 
  conversation = [], 
  isRecording = false, 
  currentTranscript = '' 
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
    <Paper 
      elevation={2} 
      sx={{ 
        height: 400,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      {/* Header */}
      <Box sx={{ p: 2, backgroundColor: 'primary.main', color: 'white' }}>
        <Typography variant="h6">
          Conversation
        </Typography>
        <Typography variant="body2" sx={{ opacity: 0.9 }}>
          {conversation.length === 0 ? 'No messages yet' : `${conversation.length} messages`}
        </Typography>
      </Box>

      <Divider />

      {/* Messages Container */}
      <Box 
        sx={{ 
          flex: 1,
          overflowY: 'auto',
          p: 2,
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: '#f5f5f5',
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23e0e0e0' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }}
      >
        {/* Show welcome message if no conversation */}
        {conversation.length === 0 && !currentTranscript && (
          <Box sx={{ textAlign: 'center', mt: 4, opacity: 0.6 }}>
            <Typography variant="body1" color="text.secondary">
              🎤 Start a conversation with ElevenLabs
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Click "Connect" and then "Start Talking" to begin
            </Typography>
          </Box>
        )}

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

        {/* Real-time Transcript Preview */}
        {isRecording && currentTranscript && (
          <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
            <TranscriptPreview>
              <Typography variant="body1">
                {currentTranscript}
                <span style={{ animation: 'blink 1s infinite' }}>|</span>
              </Typography>
            </TranscriptPreview>
          </Box>
        )}

        {/* Auto-scroll target */}
        <div ref={messagesEndRef} />
      </Box>

      {/* CSS for blinking cursor */}
      <style jsx>{`
        @keyframes blink {
          0%, 50% { opacity: 1; }
          51%, 100% { opacity: 0; }
        }
      `}</style>
    </Paper>
  );
};

export default ConversationDisplay; 