// frontend/src/App.js

import React, { useState, useRef } from 'react';
import MicRecorder from 'mic-recorder-to-mp3';
import axios from 'axios';
require('dotenv').config();

function App() {
  const [isRecording, setIsRecording] = useState(false);
  const [response, setResponse] = useState('');
  const [transcription, setTranscription] = useState('');
  const recorderRef = useRef(new MicRecorder({ bitRate: 128 }));

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
    <div className="App">
      <h1>AI Voice Agent</h1>
      <button onClick={handleRecord}>
        {isRecording ? 'Stop Recording' : 'Start Recording'}
      </button>
      <div>
        <h2>Transcription</h2>
        <p>{transcription}</p>
      </div>
      <div>
        <h2>AI Response</h2>
        <p>{response}</p>
      </div>
    </div>
  );
}

export default App;
