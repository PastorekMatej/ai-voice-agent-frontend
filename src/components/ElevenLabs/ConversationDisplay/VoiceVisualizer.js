// VoiceVisualizer.js
// Component for visualizing voice activity during recording and speaking

import React, { useEffect, useState } from 'react';
import { Box } from '@mui/material';

const VoiceVisualizer = ({ 
  isActive = false, 
  mode = 'listening', // 'listening', 'speaking', 'idle'
  size = 'medium' // 'small', 'medium', 'large'
}) => {
  const [animationState, setAnimationState] = useState(0);

  // Create different patterns for different modes
  useEffect(() => {
    if (!isActive) {
      setAnimationState(0);
      return;
    }

    const interval = setInterval(() => {
      setAnimationState(prev => (prev + 1) % 3);
    }, 200);

    return () => clearInterval(interval);
  }, [isActive]);

  const getBarCount = () => {
    switch (size) {
      case 'small': return 5;
      case 'large': return 12;
      default: return 8; // medium
    }
  };

  const getHeight = () => {
    switch (size) {
      case 'small': return 30;
      case 'large': return 60;
      default: return 40; // medium
    }
  };

  const getColor = () => {
    switch (mode) {
      case 'speaking': return '#4caf50'; // Green for agent speaking
      case 'listening': return '#2196f3'; // Blue for listening
      default: return '#e0e0e0'; // Grey for idle
    }
  };

  const barCount = getBarCount();
  const height = getHeight();
  const color = getColor();

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: height,
        padding: '8px',
        borderRadius: '8px',
        backgroundColor: isActive ? 'rgba(0,0,0,0.05)' : 'transparent',
        transition: 'background-color 0.3s ease'
      }}
    >
      {Array.from({ length: barCount }).map((_, index) => {
        const shouldAnimate = isActive && (
          mode === 'speaking' || 
          (mode === 'listening' && animationState === index % 3)
        );
        
        return (
          <Box
            key={index}
            sx={{
              width: '4px',
              height: shouldAnimate ? `${60 + Math.random() * 40}%` : '20%',
              backgroundColor: isActive ? color : '#e0e0e0',
              borderRadius: '2px',
              margin: '0 2px',
              transition: 'all 0.2s ease',
              transform: shouldAnimate ? 'scaleY(1.2)' : 'scaleY(1)'
            }}
          />
        );
      })}
    </Box>
  );
};

export default VoiceVisualizer; 