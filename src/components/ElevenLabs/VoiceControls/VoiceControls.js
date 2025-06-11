// VoiceControls.js
// Component for managing voice recording controls and connection status

import React, { useState, useEffect, useRef } from 'react';
import { Box, Button, Typography } from '@mui/material';
import { 
  Mic as MicIcon, 
  MicOff as MicOffIcon,
  Close as CloseIcon
} from '@mui/icons-material';


const VoiceControls = ({
  isConnected = false,
  isRecording = false,
  agentMode = 'listening',
  onConnect,
  onDisconnect,
  onStartRecording,
  onStopRecording,
  disabled = false
}) => {
  // State for inactivity tracking
  const [isPaused, setIsPaused] = useState(false);
  const [shouldAutoStart, setShouldAutoStart] = useState(false);
  const inactivityTimeoutRef = useRef(null);
  const lastActivityRef = useRef(Date.now());

  // Reset inactivity timer when recording starts/stops
  const resetInactivityTimer = () => {
    if (inactivityTimeoutRef.current) {
      clearTimeout(inactivityTimeoutRef.current);
    }
    
    if (isRecording && !isPaused) {
      lastActivityRef.current = Date.now();
      inactivityTimeoutRef.current = setTimeout(() => {
        setIsPaused(true);
        onStopRecording();
      }, 5000); // 5 seconds
    }
  };

  // Auto-start recording after connection
  useEffect(() => {
    if (isConnected && shouldAutoStart && !isRecording) {
      setShouldAutoStart(false);
      setTimeout(() => {
        onStartRecording();
      }, 500); // Small delay to ensure connection is stable
    }
  }, [isConnected, shouldAutoStart, isRecording, onStartRecording]);

  // Handle inactivity timeout
  useEffect(() => {
    if (isRecording) {
      resetInactivityTimer();
    } else {
      if (inactivityTimeoutRef.current) {
        clearTimeout(inactivityTimeoutRef.current);
      }
    }

    return () => {
      if (inactivityTimeoutRef.current) {
        clearTimeout(inactivityTimeoutRef.current);
      }
    };
  }, [isRecording]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (inactivityTimeoutRef.current) {
        clearTimeout(inactivityTimeoutRef.current);
      }
    };
  }, []);
  // ChatGPT-style button handlers
  const handleRecordingClick = () => {
    if (!isConnected) {
      setShouldAutoStart(true);
      setIsPaused(false);
      onConnect();
      return;
    }
    
    if (isPaused) {
      // Resume from pause
      setIsPaused(false);
      onStartRecording();
    } else if (isRecording) {
      // Manual stop
      setIsPaused(false);
      onStopRecording();
    } else {
      // Start recording
      setIsPaused(false);
      onStartRecording();
    }
  };

  const handleStopConversation = () => {
    if (inactivityTimeoutRef.current) {
      clearTimeout(inactivityTimeoutRef.current);
    }
    setIsPaused(false);
    setShouldAutoStart(false);
    if (isRecording) {
      onStopRecording();
    }
    onDisconnect();
  };

  return (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center',
      justifyContent: 'space-between',
      height: '100%',
      width: '100%'
    }}>
      {/* AI Waves Animation */}
      <Box sx={{ 
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%'
      }}>
        <Box
          component="img"
          src="/images/logo512.png"
          alt="Abstract Design Background"
          sx={{
            width: 500,
            height: 250,
            objectFit: 'contain',
            borderRadius: 2,
            filter: isRecording ? 'brightness(1.1) saturate(1.2)' : 
                   isConnected ? 'brightness(1.05)' : 'brightness(0.9) grayscale(0.3)'
          }}
        />
      </Box>

      {/* Status Text */}
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3, textAlign: 'center' }}>
        {!isConnected && 'Click microphone to start'}
        {isConnected && isPaused && 'Paused - Click to resume'}
        {isConnected && !isRecording && !isPaused && agentMode === 'listening' && 'Ready to talk'}
        {isConnected && !isRecording && !isPaused && agentMode === 'speaking' && 'Agent is speaking...'}
        {isConnected && isRecording && !isPaused && 'Recording...'}
      </Typography>

      {/* ChatGPT-style Buttons */}
      <Box sx={{ 
        display: 'flex', 
        gap: 3, 
        mb: 4,
        justifyContent: 'center',
        alignItems: 'center'
      }}>
        {/* Recording Button */}
        <Button
          variant="contained"
          onClick={handleRecordingClick}
          disabled={disabled}
          sx={{
            width: 64,
            height: 64,
            borderRadius: '50%',
            minWidth: 'unset',
            backgroundColor: isPaused ? '#ef4444' : (isRecording ? '#ef4444' : (!isConnected ? '#3b82f6' : '#10b981')),
            '&:hover': {
              backgroundColor: isPaused ? '#dc2626' : (isRecording ? '#dc2626' : (!isConnected ? '#2563eb' : '#059669')),
            },
            '&:disabled': {
              backgroundColor: '#d1d5db',
              color: '#9ca3af'
            },
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            animation: isRecording ? 'pulse 1.5s ease-in-out infinite' : 'none',
            '@keyframes pulse': {
              '0%': { opacity: 1, transform: 'scale(1)' },
              '50%': { opacity: 0.8, transform: 'scale(1.05)' },
              '100%': { opacity: 1, transform: 'scale(1)' }
            }
          }}
        >
          {isPaused ? <MicIcon sx={{ fontSize: 28 }} /> : (isRecording ? <MicOffIcon sx={{ fontSize: 28 }} /> : <MicIcon sx={{ fontSize: 28 }} />)}
        </Button>

        {/* Stop Conversation Button */}
        {isConnected && (
          <Button
            variant="contained"
            onClick={handleStopConversation}
            disabled={disabled}
            sx={{
              width: 64,
              height: 64,
              borderRadius: '50%',
              minWidth: 'unset',
              backgroundColor: '#6b7280',
              '&:hover': {
                backgroundColor: '#4b5563',
              },
              '&:disabled': {
                backgroundColor: '#d1d5db',
                color: '#9ca3af'
              },
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
            }}
          >
            <CloseIcon sx={{ fontSize: 28 }} />
          </Button>
        )}
      </Box>
    </Box>
  );
};

export default VoiceControls; 