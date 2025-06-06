// DOCKER IMPLEMENTATION: Environment configuration for container deployment

const config = {
    // DOCKER IMPLEMENTATION: API URL configuration for container communication
    apiUrl: process.env.REACT_APP_API_URL || "http://localhost:5001",
    
    // DOCKER IMPLEMENTATION: Environment detection for container deployment
    environment: process.env.NODE_ENV || "development",
    
    // DOCKER IMPLEMENTATION: Feature flags for container environment
    features: {
      enableAnalytics: process.env.REACT_APP_ENABLE_ANALYTICS === "true",
      enableDebugMode: process.env.NODE_ENV === "development",
    },
    
    // DOCKER IMPLEMENTATION: Container-friendly timeout settings
    timeouts: {
      apiRequest: 30000, // 30 seconds
      audioRecording: 60000, // 60 seconds
    }
};

export default config;