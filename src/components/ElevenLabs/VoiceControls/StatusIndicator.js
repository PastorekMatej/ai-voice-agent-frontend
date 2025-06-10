// StatusIndicator.js
// Visual indicator for connection and recording status

import React from 'react';
import { Box, Typography } from '@mui/material';
import { 
  Circle as CircleIcon,
  RadioButtonChecked as RecordingIcon 
} from '@mui/icons-material';

const StatusIndicator = ({ 
  isConnected = false, 
  isRecording = false, 
  agentMode = 'listening' 
}) => {
  const getStatusColor = () => {
    if (isRecording) return 'error.main';
    if (isConnected && agentMode === 'speaking') return 'info.main';
    if (isConnected) return 'success.main';
    return 'grey.400';
  };

  const getStatusText = () => {
    if (isRecording) return 'Recording';
    if (isConnected && agentMode === 'speaking') return 'Agent Speaking';
    if (isConnected) return 'Connected';
    return 'Disconnected';
  };

  const getStatusIcon = () => {
    if (isRecording) {
      return <RecordingIcon sx={{ fontSize: 24, color: getStatusColor() }} />;
    }
    return <CircleIcon sx={{ fontSize: 24, color: getStatusColor() }} />;
  };

  return (
    <Box 
      sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        gap: 1 
      }}
    >
      <Box
        sx={{
          animation: isRecording ? 'pulse 1s ease-in-out infinite' : 'none',
          display: 'flex',
          alignItems: 'center',
          '@keyframes pulse': {
            '0%': { opacity: 1, transform: 'scale(1)' },
            '50%': { opacity: 0.7, transform: 'scale(1.1)' },
            '100%': { opacity: 1, transform: 'scale(1)' }
          }
        }}
      >
        {getStatusIcon()}
      </Box>
      <Typography 
        variant="body1" 
        sx={{ 
          color: getStatusColor(),
          fontWeight: isRecording ? 'bold' : 'normal'
        }}
      >
        {getStatusText()}
      </Typography>
    </Box>
  );
};

export default StatusIndicator; 