// frontend/src/App.js

import React, { useState, useRef, useEffect, useCallback } from 'react';
import MicRecorder from 'mic-recorder-to-mp3';
import axios from 'axios';
import { Button, Container, Typography, Box } from '@mui/material';
import Lottie from 'react-lottie';
import animationData from './assets/animations/animation.json'; // Ensure this path is correct

function App() {
  const [isRecording, setIsRecording] = useState(false);
  const [response, setResponse] = useState('');
  const [transcription, setTranscription] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [status, setStatus] = useState('idle'); // 'idle', 'recording', 'processing', 'done', 'error'
  const recorderRef = useRef(new MicRecorder({ bitRate: 128 }));
  const apiUrl = process.env.REACT_APP_API_URL;
  const [inputValue, setInputValue] = useState('');
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [chunks, setChunks] = useState([]);

  // Debugging: Log the apiUrl to ensure it's set correctly
  console.log('API URL:', apiUrl);

  // Vérifier que la synthèse vocale est disponible
  useEffect(() => {
    if (!window.speechSynthesis) {
      console.error("Speech synthesis not available");
      return;
    }
    console.log("Speech synthesis available");
  }, []);

  const handleAIResponse = async (transcription) => {
    try {
      setStatus('getting AI response');
      const aiResponse = await axios.post(`${apiUrl}/api/chat`, {
        message: transcription
      });
      console.log("AI response received:", aiResponse.data);
      const responseText = aiResponse.data.response;
      setAiResponse(responseText);
      
      // Appeler directement speakText avec le texte de la réponse
      speakText(responseText);
      
      setStatus('done');
    } catch (error) {
      console.error("Error getting AI response:", error);
      setStatus('error');
    }
  };

  const startRecording = async () => {
    try {
      setStatus('recording');
      setTranscription('');
      setAiResponse('');
      console.log("Starting recording...");
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });
      
      const audioChunks = [];
      recorder.ondataavailable = (e) => {
        console.log("Data available:", e.data);
        audioChunks.push(e.data);
      };

      recorder.onstop = async () => {
        console.log("Recording stopped");
        const audioBlob = new Blob(audioChunks, { type: 'audio/webm;codecs=opus' });
        console.log("Created blob:", audioBlob);
        
        try {
          const formData = new FormData();
          formData.append('audio', audioBlob, 'audio.webm');
          
          console.log("Sending audio to server...");
          setStatus('processing');
          const response = await axios.post(`${apiUrl}/api/transcribe`, formData, {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          });
          console.log("Server response:", response.data);
          setTranscription(response.data.transcription);
          
          // Appeler handleAIResponse avec la transcription
          if (response.data.transcription) {
            await handleAIResponse(response.data.transcription);
          }
        } catch (error) {
          console.error("Error processing audio:", error);
          setStatus('error');
        }
      };
      
      recorder.start(1000);
      setMediaRecorder(recorder);
      setIsRecording(true);
      console.log("Recording started successfully");
    } catch (error) {
      console.error("Error starting recording:", error);
      setStatus('error');
    }
  };

  const stopRecording = useCallback(() => {
    if (mediaRecorder && isRecording) {
      setStatus('processing');
      console.log("Stopping recording...");
      mediaRecorder.stop();
      mediaRecorder.stream.getTracks().forEach(track => {
        console.log("Stopping track:", track);
        track.stop();
      });
      setIsRecording(false);
    }
  }, [mediaRecorder, isRecording]);

  const processText = async (text) => {
    console.log('Processing text:', text);
    try {
      console.log('Sending request to:', `${apiUrl}/api/chat`);
      const response = await axios.post(`${apiUrl}/api/chat`, {
        message: text
      }, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      console.log('Raw response:', response);
      console.log('Response data:', response.data);
      setResponse(response.data.response);
      speakText(response.data.response);
    } catch (error) {
      console.error('Full error object:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      alert('Failed to get AI response. Please try again.');
    }
  };

  // Fonction de synthèse vocale avec plus de logs
  const speakText = (text) => {
    console.log("Starting speech synthesis for:", text);
    if (!window.speechSynthesis) {
      console.error("Speech synthesis not available");
      return;
    }

    // Arrêter toute synthèse vocale en cours
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    utterance.rate = 1.0;
    utterance.pitch = 1.0;

    utterance.onstart = () => {
      console.log("Speech started");
    };

    utterance.onend = () => {
      console.log("Speech ended");
    };

    utterance.onerror = (event) => {
      console.error("Speech error:", event);
    };

    window.speechSynthesis.speak(utterance);
  };

  const defaultOptions = {
    loop: true,
    autoplay: true,
    animationData: animationData,
    rendererSettings: {
      preserveAspectRatio: 'xMidYMid slice'
    }
  };

  useEffect(() => {
    if (inputValue) {
      processInput(inputValue);
    }
  }, [inputValue]);

  const handleInputChange = (event) => {
    setInputValue(event.target.value);
  };

  const processInput = (value) => {
    console.log('Processing input:', value);
  };

  return (
    <Container maxWidth="sm">
      <Typography variant="h3" component="h1" gutterBottom>
        AI Voice Agent
      </Typography>
      <Lottie options={defaultOptions} height={400} width={400} />
      <Box my={4}>
        <Button
          variant="contained"
          color={isRecording ? "secondary" : "primary"}
          onClick={isRecording ? stopRecording : startRecording}
          fullWidth
        >
          {isRecording ? 'Stop Recording' : 'Start Recording'}
        </Button>
      </Box>
      <Box my={4}>
        <Typography variant="h5" component="h2">
          Transcription
        </Typography>
        {status === 'processing' && (
          <Typography variant="body1">
            Processing your audio...
          </Typography>
        )}
        <Typography variant="body1">{transcription || 'No transcription yet'}</Typography>
      </Box>
      <Box my={4}>
        <Typography variant="h5" component="h2">
          AI Response
        </Typography>
        {status === 'getting AI response' && (
          <Typography variant="body1">
            Getting AI response...
          </Typography>
        )}
        <Typography variant="body1">{aiResponse || 'No AI response yet'}</Typography>
      </Box>
      <input
        type="text"
        value={inputValue}
        onChange={handleInputChange}
        placeholder="Type something..."
      />
      <div style={{ 
        textAlign: 'center', 
        color: status === 'error' ? 'red' : 'gray',
        marginBottom: '20px'
      }}>
        Status: {status}
      </div>
    </Container>
  );
}

export default App;
