// ElevenLabs Configuration
// Configuration for ElevenLabs Conversational AI integration
// Using @elevenlabs/elevenlabs-js package

const elevenLabsConfig = {
  // Core API Configuration
  apiKey: process.env.REACT_APP_ELEVENLABS_API_KEY,
  agentId: process.env.REACT_APP_ELEVENLABS_AGENT_ID,
  
  // API URLs
  apiUrl: 'https://api.elevenlabs.io',
  websocketUrl: 'wss://api.elevenlabs.io/v1/convai/conversation',
  
  // Voice Settings
  voiceSettings: {
    voiceId: process.env.REACT_APP_ELEVENLABS_VOICE_ID || '',
    model: process.env.REACT_APP_ELEVENLABS_MODEL || 'eleven_turbo_v2_5',
    stability: parseFloat(process.env.REACT_APP_ELEVENLABS_STABILITY) || 0.75,
    similarityBoost: parseFloat(process.env.REACT_APP_ELEVENLABS_SIMILARITY_BOOST) || 0.75,
  },
  
  // Language Settings
  language: process.env.REACT_APP_DEFAULT_LANGUAGE || 'fr-FR',
  
  // WebSocket Configuration
  websocket: {
    url: 'wss://api.elevenlabs.io/v1/convai/conversation',
    reconnectInterval: 5000,
    maxReconnectAttempts: 5,
  },
  
  // Audio Settings
  audio: {
    sampleRate: 16000,
    channels: 1,
    bitDepth: 16,
    enableEchoCancellation: true,
    enableNoiseSuppression: true,
  },
  
  // Debug Settings
  debug: {
    enabled: process.env.REACT_APP_ENABLE_DEBUG === 'true',
    logLevel: process.env.NODE_ENV === 'development' ? 'debug' : 'error',
  },
  
  // Feature Flags
  features: {
    enableTranslation: process.env.REACT_APP_ENABLE_TRANSLATION === 'true',
    enableMemory: true,
    enableInterruption: true,
    enableBackgroundNoise: false,
  },
  
  // Conversation Settings
  conversation: {
    maxDuration: 300000, // 5 minutes in milliseconds
    silenceTimeout: 3000, // 3 seconds
    autoStart: false,
  },
};

// Validation function
export const validateConfig = () => {
  const errors = [];
  
  if (!elevenLabsConfig.apiKey) {
    errors.push('REACT_APP_ELEVENLABS_API_KEY is required');
  }
  
  if (!elevenLabsConfig.agentId) {
    errors.push('REACT_APP_ELEVENLABS_AGENT_ID is required');
  }
  
  if (errors.length > 0) {
    throw new Error(`ElevenLabs configuration errors:\n${errors.join('\n')}`);
  }
  
  return true;
};

// Helper function to get environment-specific configuration
export const getEnvironmentConfig = () => {
  const env = process.env.NODE_ENV || 'development';
  
  const envConfigs = {
    development: {
      ...elevenLabsConfig,
      debug: { ...elevenLabsConfig.debug, enabled: true },
    },
    production: {
      ...elevenLabsConfig,
      debug: { ...elevenLabsConfig.debug, enabled: false },
    },
  };
  
  return envConfigs[env] || elevenLabsConfig;
};

export default elevenLabsConfig; 