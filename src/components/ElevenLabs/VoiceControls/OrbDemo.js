// OrbDemo.js
// Demo component to showcase different states of the Pulsing AI Orb

import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, Button } from '@mui/material';
import PulsingAIOrb from './PulsingAIOrb';

const OrbDemo = () => {
  const [currentState, setCurrentState] = useState(0);
  
  const states = [
    {
      name: 'Disconnected',
      isConnected: false,
      isRecording: false,
      agentMode: 'listening'
    },
    {
      name: 'Connected & Listening',
      isConnected: true,
      isRecording: false,
      agentMode: 'listening'
    },
    {
      name: 'Recording',
      isConnected: true,
      isRecording: true,
      agentMode: 'listening'
    },
    {
      name: 'Agent Speaking',
      isConnected: true,
      isRecording: false,
      agentMode: 'speaking'
    }
  ];

  // Auto-cycle through states every 4 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentState((prev) => (prev + 1) % states.length);
    }, 4000);

    return () => clearInterval(interval);
  }, [states.length]);

  const currentStateData = states[currentState];

  return (
    <Paper 
      elevation={3} 
      sx={{ 
        p: 4, 
        m: 2, 
        textAlign: 'center',
        backgroundColor: 'background.paper',
        maxWidth: 400,
        margin: 'auto'
      }}
    >
      <Typography variant="h5" gutterBottom>
        Pulsing AI Orb Demo
      </Typography>
      
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Automatically cycling through different AI states
      </Typography>

      <Box sx={{ mb: 3 }}>
        <PulsingAIOrb 
          isConnected={currentStateData.isConnected}
          isRecording={currentStateData.isRecording}
          agentMode={currentStateData.agentMode}
          size={150}
        />
      </Box>

      <Typography variant="h6" sx={{ mb: 2 }}>
        Current State: {currentStateData.name}
      </Typography>

      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, justifyContent: 'center' }}>
        {states.map((state, index) => (
          <Button
            key={index}
            variant={currentState === index ? 'contained' : 'outlined'}
            size="small"
            onClick={() => setCurrentState(index)}
            sx={{ mb: 1 }}
          >
            {state.name}
          </Button>
        ))}
      </Box>

      <Typography variant="caption" color="text.secondary" sx={{ mt: 2, display: 'block' }}>
        Click buttons above to manually switch states
      </Typography>
    </Paper>
  );
};

export default OrbDemo; 