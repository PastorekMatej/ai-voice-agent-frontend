// VoiceControls.js
// Component for managing voice recording controls and connection status

import React from 'react';
import { Box, Button, Paper, Typography } from '@mui/material';
import { 
  Mic as MicIcon, 
  MicOff as MicOffIcon,
  Phone as PhoneIcon,
  PhoneDisabled as PhoneDisabledIcon 
} from '@mui/icons-material';
import StatusIndicator from './StatusIndicator';

const VoiceControls = ({
  isConnected = false,
  isRecording = false,
  onConnect,
  onDisconnect,
  onStartRecording,
  onStopRecording,
  disabled = false
}) => {
  return (
    <Paper 
      elevation={3} 
      sx={{ 
        p: 3, 
        mb: 3, 
        textAlign: 'center',
        backgroundColor: 'background.paper'
      }}
    >
      {/* Status Display */}
      <Box sx={{ mb: 3 }}>
        <StatusIndicator 
          isConnected={isConnected}
          isRecording={isRecording}
        />
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          {!isConnected && 'Disconnected from ElevenLabs'}
          {isConnected && !isRecording && 'Connected - Ready to talk'}
          {isConnected && isRecording && 'Recording...'}
        </Typography>
      </Box>

      {/* Connection Controls */}
      <Box sx={{ mb: 2 }}>
        {!isConnected ? (
          <Button
            variant="contained"
            color="primary"
            size="large"
            startIcon={<PhoneIcon />}
            onClick={onConnect}
            disabled={disabled}
            sx={{ minWidth: 160 }}
          >
            Connect
          </Button>
        ) : (
          <Button
            variant="outlined"
            color="secondary"
            size="large"
            startIcon={<PhoneDisabledIcon />}
            onClick={onDisconnect}
            disabled={disabled}
            sx={{ minWidth: 160 }}
          >
            Disconnect
          </Button>
        )}
      </Box>

      {/* Recording Controls */}
      {isConnected && (
        <Box>
          {!isRecording ? (
            <Button
              variant="contained"
              color="success"
              size="large"
              startIcon={<MicIcon />}
              onClick={onStartRecording}
              disabled={disabled}
              sx={{ 
                minWidth: 160,
                backgroundColor: 'success.main',
                '&:hover': {
                  backgroundColor: 'success.dark',
                }
              }}
            >
              Start Talking
            </Button>
          ) : (
            <Button
              variant="contained"
              color="error"
              size="large"
              startIcon={<MicOffIcon />}
              onClick={onStopRecording}
              disabled={disabled}
              sx={{ 
                minWidth: 160,
                animation: 'pulse 1.5s ease-in-out infinite'
              }}
            >
              Stop Recording
            </Button>
          )}
        </Box>
      )}

      {/* CSS for pulse animation */}
      <style jsx>{`
        @keyframes pulse {
          0% { opacity: 1; }
          50% { opacity: 0.7; }
          100% { opacity: 1; }
        }
      `}</style>
    </Paper>
  );
};

export default VoiceControls; 