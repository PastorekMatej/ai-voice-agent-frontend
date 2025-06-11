// frontend/src/App.js

import React from 'react';
import { Box } from '@mui/material';

// Import ElevenLabs components
import { ElevenLabsVoiceAgent } from './components/ElevenLabs';

function App() {
  return (
    <Box sx={{ width: '100%', height: '100vh' }}>
      <ElevenLabsVoiceAgent />
    </Box>
  );
}

export default App;
