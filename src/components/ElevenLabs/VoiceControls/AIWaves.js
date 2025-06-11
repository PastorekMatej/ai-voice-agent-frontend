// AIWaves.js
// Dynamic flowing waves visualization for AI voice agent states

import React from 'react';
import { Box } from '@mui/material';
import './AIWaves.css';

const AIWaves = ({ 
  isConnected = false, 
  isRecording = false, 
  agentMode = 'listening',
  width = 400,
  height = 300 
}) => {
  // Determine the wave state based on props
  const getWaveState = () => {
    if (isRecording) {
      return {
        primaryColor: '#ff6b6b',
        secondaryColor: '#ff8e8e',
        tertiaryColor: '#ffb3b3',
        opacity: 0.8,
        speed: 'fast',
        intensity: 'high'
      };
    }
    
    if (isConnected && agentMode === 'speaking') {
      return {
        primaryColor: '#4ecdc4',
        secondaryColor: '#7dd3d3',
        tertiaryColor: '#a3e4e4',
        opacity: 0.7,
        speed: 'medium',
        intensity: 'medium'
      };
    }
    
    if (isConnected) {
      return {
        primaryColor: '#6c5ce7',
        secondaryColor: '#8b7ed8',
        tertiaryColor: '#a29bfe',
        opacity: 0.6,
        speed: 'slow',
        intensity: 'low'
      };
    }
    
    return {
      primaryColor: '#95a5a6',
      secondaryColor: '#b0bec5',
      tertiaryColor: '#cfd8dc',
      opacity: 0.3,
      speed: 'none',
      intensity: 'none'
    };
  };

  const waveState = getWaveState();

  // Generate unique gradient IDs
  const gradientId1 = `wave-gradient-1-${Math.random().toString(36).substr(2, 9)}`;
  const gradientId2 = `wave-gradient-2-${Math.random().toString(36).substr(2, 9)}`;
  const gradientId3 = `wave-gradient-3-${Math.random().toString(36).substr(2, 9)}`;

  // Get animation class based on state
  const getAnimationClass = () => {
    if (waveState.speed === 'fast') return 'waves-fast';
    if (waveState.speed === 'medium') return 'waves-medium';
    if (waveState.speed === 'slow') return 'waves-slow';
    return '';
  };

  return (
    <Box
      className="ai-waves-container"
      sx={{
        width: width,
        height: height,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      <svg
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        className={getAnimationClass()}
      >
        <defs>
          {/* Wave gradients */}
          <linearGradient id={gradientId1} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={waveState.primaryColor} stopOpacity={waveState.opacity} />
            <stop offset="50%" stopColor={waveState.secondaryColor} stopOpacity={waveState.opacity * 0.7} />
            <stop offset="100%" stopColor={waveState.tertiaryColor} stopOpacity={waveState.opacity * 0.4} />
          </linearGradient>
          
          <linearGradient id={gradientId2} x1="100%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={waveState.secondaryColor} stopOpacity={waveState.opacity * 0.8} />
            <stop offset="50%" stopColor={waveState.primaryColor} stopOpacity={waveState.opacity * 0.6} />
            <stop offset="100%" stopColor={waveState.tertiaryColor} stopOpacity={waveState.opacity * 0.3} />
          </linearGradient>
          
          <linearGradient id={gradientId3} x1="50%" y1="0%" x2="50%" y2="100%">
            <stop offset="0%" stopColor={waveState.tertiaryColor} stopOpacity={waveState.opacity * 0.6} />
            <stop offset="50%" stopColor={waveState.secondaryColor} stopOpacity={waveState.opacity * 0.8} />
            <stop offset="100%" stopColor={waveState.primaryColor} stopOpacity={waveState.opacity * 0.4} />
          </linearGradient>
        </defs>
        
        {/* First wave layer */}
        <path
          d={`M0,${height * 0.7} Q${width * 0.25},${height * 0.5} ${width * 0.5},${height * 0.6} T${width},${height * 0.4} V${height} H0 Z`}
          fill={`url(#${gradientId1})`}
          className="wave-layer-1"
        />
        
        {/* Second wave layer */}
        <path
          d={`M0,${height * 0.8} Q${width * 0.3},${height * 0.6} ${width * 0.6},${height * 0.7} T${width},${height * 0.5} V${height} H0 Z`}
          fill={`url(#${gradientId2})`}
          className="wave-layer-2"
        />
        
        {/* Third wave layer */}
        <path
          d={`M0,${height * 0.9} Q${width * 0.4},${height * 0.7} ${width * 0.7},${height * 0.8} T${width},${height * 0.6} V${height} H0 Z`}
          fill={`url(#${gradientId3})`}
          className="wave-layer-3"
        />
        
        {/* Mesh overlay for grid effect */}
        <defs>
          <pattern id="mesh" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
            <path d="M 20 0 L 0 0 0 20" fill="none" stroke={waveState.primaryColor} strokeWidth="0.5" opacity="0.3"/>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#mesh)" className="mesh-overlay" />
        
        {/* Floating particles for enhanced effect */}
        {isConnected && (
          <>
            <circle
              cx={width * 0.2}
              cy={height * 0.3}
              r="2"
              fill={waveState.primaryColor}
              opacity="0.6"
              className="particle particle-1"
            />
            <circle
              cx={width * 0.7}
              cy={height * 0.2}
              r="3"
              fill={waveState.secondaryColor}
              opacity="0.5"
              className="particle particle-2"
            />
            <circle
              cx={width * 0.8}
              cy={height * 0.6}
              r="2.5"
              fill={waveState.tertiaryColor}
              opacity="0.4"
              className="particle particle-3"
            />
          </>
        )}
      </svg>
    </Box>
  );
};

export default AIWaves; 