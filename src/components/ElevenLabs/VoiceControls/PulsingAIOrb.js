// PulsingAIOrb.js
// Dynamic pulsing orb visualization for AI voice agent states

import React from 'react';
import { Box } from '@mui/material';
import './PulsingAIOrb.css';

const PulsingAIOrb = ({ 
  isConnected = false, 
  isRecording = false, 
  agentMode = 'listening',
  size = 100 
}) => {
  // Determine the orb's visual state based on props
  const getOrbState = () => {
    if (isRecording) {
      return {
        primaryColor: '#ff6b6b',
        secondaryColor: '#ff8e8e',
        tertiaryColor: '#ffb3b3',
        animation: 'recording',
        intensity: 'high'
      };
    }
    
    if (isConnected && agentMode === 'speaking') {
      return {
        primaryColor: '#4ecdc4',
        secondaryColor: '#7dd3d3',
        tertiaryColor: '#a3e4e4',
        animation: 'speaking',
        intensity: 'medium'
      };
    }
    
    if (isConnected) {
      return {
        primaryColor: '#45b7d1',
        secondaryColor: '#6bc5d9',
        tertiaryColor: '#91d3e1',
        animation: 'listening',
        intensity: 'low'
      };
    }
    
    return {
      primaryColor: '#95a5a6',
      secondaryColor: '#b0bec5',
      tertiaryColor: '#cfd8dc',
      animation: 'idle',
      intensity: 'none'
    };
  };

  const orbState = getOrbState();

  // Generate unique gradient IDs to avoid conflicts
  const gradientId = `orb-gradient-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  const ringGradientId = `ring-gradient-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  // Get animation classes based on state
  const getOrbClassName = () => {
    if (isRecording) return 'orb-breathe-fast';
    if (agentMode === 'speaking') return 'orb-breathe-medium';
    if (isConnected) return 'orb-breathe-slow';
    return '';
  };

  const getRippleClassName = (isDelayed = false) => {
    if (isRecording) return isDelayed ? 'orb-ripple-fast-delayed' : 'orb-ripple-fast';
    return isDelayed ? 'orb-ripple-medium-delayed' : 'orb-ripple-medium';
  };

  return (
    <Box
      className="pulsing-orb-container"
      sx={{
        width: size,
        height: size,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative'
      }}
    >
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        style={{ position: 'absolute' }}
      >
        <defs>
          {/* Main orb gradient */}
          <radialGradient id={gradientId} cx="30%" cy="30%">
            <stop offset="0%" stopColor={orbState.primaryColor} stopOpacity="0.9" />
            <stop offset="50%" stopColor={orbState.secondaryColor} stopOpacity="0.7" />
            <stop offset="100%" stopColor={orbState.tertiaryColor} stopOpacity="0.5" />
          </radialGradient>
          
          {/* Ring gradient */}
          <radialGradient id={ringGradientId} cx="50%" cy="50%">
            <stop offset="80%" stopColor={orbState.primaryColor} stopOpacity="0" />
            <stop offset="90%" stopColor={orbState.secondaryColor} stopOpacity="0.6" />
            <stop offset="100%" stopColor={orbState.primaryColor} stopOpacity="0" />
          </radialGradient>
        </defs>
        
        {/* Outer ripple rings */}
        {(isRecording || agentMode === 'speaking') && (
          <>
            <circle
              cx={size / 2}
              cy={size / 2}
              r={size * 0.4}
              fill="none"
              stroke={orbState.primaryColor}
              strokeWidth="2"
              opacity="0.6"
              className={getRippleClassName(false)}
            />
            <circle
              cx={size / 2}
              cy={size / 2}
              r={size * 0.35}
              fill="none"
              stroke={orbState.secondaryColor}
              strokeWidth="1"
              opacity="0.4"
              className={getRippleClassName(true)}
            />
          </>
        )}
        
        {/* Main orb */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={size * 0.25}
          fill={`url(#${gradientId})`}
          className={`${getOrbClassName()} ${isConnected ? 'orb-connected' : ''}`}
        />
        
        {/* Inner highlight */}
        <circle
          cx={size * 0.4}
          cy={size * 0.4}
          r={size * 0.08}
          fill="rgba(255,255,255,0.4)"
          className={isConnected ? 'orb-shimmer' : ''}
        />
      </svg>
    </Box>
  );
};

export default PulsingAIOrb; 