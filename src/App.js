// frontend/src/App.js

import React, { useState, useRef } from 'react';
import MicRecorder from 'mic-recorder-to-mp3';
import axios from 'axios';
import { Button, Container, Typography, Box } from '@mui/material';

function App() {
  const [isRecording, setIsRecording] = useState(false);
  const [response, setResponse] = useState('');
  const [transcription, setTranscription] = useState('');
  const recorderRef = useRef(new MicRecorder({ bitRate: 128 }));
  const apiUrl = process.env.REACT_APP_API_URL;

  const handleRecord = () => {
    if (isRecording) {
      console.log('Stopping recording...');
      recorderRef.current.stop().getMp3().then(([buffer, blob]) => {
        console.log('Recorded Blob:', blob);
        const formData = new FormData();
        formData.append('audio', blob, 'audio.mp3');

        axios.post('http://localhost:5000/api/transcribe', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }).then(response => {
          const text = response.data.transcription;
          setTranscription(text);
          processText(text);
        }).catch(error => {
          console.error('Error transcribing audio:', error);
          alert('Failed to transcribe audio. Please try again.');
        });
      }).catch((e) => {
        console.error('Error getting MP3:', e);
        alert('Failed to process recording. Please try again.');
      });
    } else {
      console.log('Starting recording...');
      recorderRef.current.start().then(() => {
        console.log('Recording started');
      }).catch((e) => {
        console.error('Error starting recording:', e);
        alert('Failed to start recording. Please check microphone permissions.');
      });
    }
    setIsRecording(!isRecording);
  };

  const processText = async (text) => {
    console.log('Processing text:', text);
    try {
      console.log('Sending request to:', 'http://localhost:5000/api/chat');
      const response = await axios.post('http://localhost:5000/api/chat', {
        message: text
      }, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      console.log('Raw response:', response);
      console.log('Response data:', response.data);
      setResponse(response.data.response);
      speak(response.data.response);
    } catch (error) {
      console.error('Full error object:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      alert('Failed to get AI response. Please try again.');
    }
  };

  const speak = (text) => {
    const utterance = new SpeechSynthesisUtterance(text);
    window.speechSynthesis.speak(utterance);
  };

  return (
    <Container maxWidth="sm">
      <Typography variant="h3" component="h1" gutterBottom>
        AI Voice Agent
      </Typography>
      <Box my={4}>
        <Button
          variant="contained"
          color={isRecording ? "secondary" : "primary"}
          onClick={handleRecord}
          fullWidth
        >
          {isRecording ? 'Stop Recording' : 'Start Recording'}
        </Button>
      </Box>
      <Box my={4}>
        <Typography variant="h5" component="h2">
          Transcription
        </Typography>
        <Typography variant="body1">{transcription}</Typography>
      </Box>
      <Box my={4}>
        <Typography variant="h5" component="h2">
          AI Response
        </Typography>
        <Typography variant="body1">{response}</Typography>
      </Box>
    </Container>
  );
}

export default App;
