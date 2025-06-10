# 🚀 ElevenLabs Integration Setup Guide

## 📋 Prerequisites

1. **ElevenLabs Account**: Create a free account at [ElevenLabs.io](https://elevenlabs.io)
2. **Conversational AI Access**: Enable Conversational AI in your ElevenLabs dashboard
3. **API Credits**: Ensure you have sufficient API credits for voice conversations

## 🔑 Step 1: Get Your API Credentials

### 1.1 Get Your API Key
1. Go to [ElevenLabs API Settings](https://elevenlabs.io/app/settings/api-keys)
2. Copy your API key (starts with `sk-...`)

### 1.2 Create a Conversational Agent
1. Go to [Conversational AI Dashboard](https://elevenlabs.io/app/conversational-ai)
2. Click "Create New Agent"
3. Configure your agent:
   - **Name**: Choose a name for your agent
   - **Voice**: Select a voice (recommended: high-quality voices for best results)
   - **Language**: Set to French for this project
   - **Personality**: Define how your agent should behave
4. Copy the Agent ID (starts with `agent_...`)

## ⚙️ Step 2: Environment Configuration

Create a `.env` file in your frontend directory with the following configuration:

```bash
# ======================================
# ElevenLabs Conversational AI Configuration
# ======================================

# REQUIRED: ElevenLabs API Key
REACT_APP_ELEVENLABS_API_KEY=sk-your-actual-api-key-here

# REQUIRED: ElevenLabs Agent ID  
REACT_APP_ELEVENLABS_AGENT_ID=agent-your-actual-agent-id-here

# ======================================
# Optional: Voice and Language Settings
# ======================================

# Voice model (recommended for low latency)
REACT_APP_ELEVENLABS_MODEL=eleven_turbo_v2_5

# Voice settings (0.0 - 1.0)
REACT_APP_ELEVENLABS_STABILITY=0.75
REACT_APP_ELEVENLABS_SIMILARITY_BOOST=0.75

# Language settings
REACT_APP_DEFAULT_LANGUAGE=fr-FR

# ======================================
# Development Settings
# ======================================

REACT_APP_ENVIRONMENT=development
REACT_APP_ENABLE_DEBUG=true
```

## 🌐 Step 3: WebSocket Authentication

The ElevenLabs Conversational AI uses WebSocket connections with the following endpoint:
- **URL**: `wss://api.elevenlabs.io/v1/convai/conversation`
- **Authentication**: API key in query parameters or headers
- **Protocol**: Real-time bidirectional audio streaming

## 🎤 Step 4: Audio Configuration

### Supported Audio Formats:
- **Input**: WebM with Opus codec (16kHz, mono)
- **Output**: Base64 encoded audio chunks
- **Latency**: ~150-300ms with optimized settings

### Browser Requirements:
- **Microphone Access**: Required for voice input
- **WebSocket Support**: Modern browsers (Chrome, Firefox, Safari, Edge)
- **Audio API**: Web Audio API support

## 🧪 Step 5: Testing Your Integration

1. **Start the Application**:
   ```bash
   npm start
   ```

2. **Navigate to ElevenLabs Tab**: Click the "ElevenLabs" tab in the header

3. **Test Connection**:
   - Click "Connect" button
   - Look for green status indicator
   - Check browser console for connection logs

4. **Test Voice Interaction**:
   - Click "Start Recording" (allow microphone access)
   - Speak in French
   - Wait for agent response
   - Audio should play automatically

## 🔧 Step 6: Troubleshooting

### Common Issues:

#### Connection Fails
- ✅ **Check API Key**: Ensure it starts with `sk-` and is valid
- ✅ **Check Agent ID**: Ensure it starts with `agent_` and exists
- ✅ **Network**: Check if WebSocket connections are allowed
- ✅ **Credits**: Ensure you have sufficient ElevenLabs credits

#### No Audio Output
- ✅ **Browser Permissions**: Allow audio playback
- ✅ **Volume**: Check system and browser volume
- ✅ **Audio Format**: Browser must support Web Audio API

#### Recording Issues
- ✅ **Microphone Permission**: Allow microphone access
- ✅ **HTTPS**: Microphone requires secure context (localhost or HTTPS)
- ✅ **Audio Input**: Check microphone settings in browser

### Debug Console Logs:
- 🔌 Connection messages: `Connected to ElevenLabs`
- 🎤 Audio messages: `Started recording`, `User transcript`
- 🤖 Agent messages: `Agent response`, `Agent Speaking`
- ❌ Error messages: Check for specific error details

## 📊 Step 7: Usage Monitoring

### ElevenLabs Dashboard:
- Monitor API usage at [ElevenLabs Usage](https://elevenlabs.io/app/usage)
- Track conversation analytics
- Manage agent configurations

### Development Console:
- Real-time WebSocket message logging
- Audio processing status
- Error tracking and debugging

## 🚀 Step 8: Advanced Configuration

### Custom Voice Settings:
```bash
# Use specific voice ID instead of agent default
REACT_APP_ELEVENLABS_VOICE_ID=voice_id_here

# Fine-tune voice parameters
REACT_APP_ELEVENLABS_STABILITY=0.8
REACT_APP_ELEVENLABS_SIMILARITY_BOOST=0.9
```

### Performance Optimization:
- **Model**: Use `eleven_turbo_v2_5` for lowest latency
- **Audio**: 16kHz mono for optimal performance
- **Chunking**: 100ms audio chunks for real-time processing

## 📚 Additional Resources

- [ElevenLabs API Documentation](https://elevenlabs.io/docs/api-reference/conversational-ai)
- [WebSocket Protocol Guide](https://elevenlabs.io/docs/conversational-ai/websocket-protocol)
- [Voice Settings Guide](https://elevenlabs.io/docs/speech-synthesis/voice-settings)
- [Troubleshooting Guide](https://elevenlabs.io/docs/troubleshooting)

## ✅ Ready to Go!

Once you've completed these steps:
1. Your ElevenLabs integration should be fully functional
2. You can have real-time voice conversations in French
3. The agent will respond with natural speech synthesis
4. All interactions are processed through ElevenLabs' advanced AI

Happy voice chatting! 🎉 