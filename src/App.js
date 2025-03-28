// frontend/src/App.js

import React, { useState, useRef, useEffect, useCallback } from 'react';
import MicRecorder from 'mic-recorder-to-mp3';
import axios from 'axios';
import { 
  Button, Container, Typography, Box, TextField, IconButton, 
  Paper, Divider, Avatar, AppBar, Toolbar
} from '@mui/material';
import MicIcon from '@mui/icons-material/Mic';
import SendIcon from '@mui/icons-material/Send';
import StopIcon from '@mui/icons-material/Stop';
import { styled } from '@mui/material/styles';

// Styles personnalisés pour les bulles de chat
const UserMessage = styled(Paper)(({ theme }) => ({
  padding: '10px 15px',
  borderRadius: '18px 18px 0 18px',
  backgroundColor: '#dcf8c6', // Vert clair style WhatsApp
  marginBottom: '8px',
  maxWidth: '70%',
  alignSelf: 'flex-end',
  wordBreak: 'break-word',
  boxShadow: 'none'
}));

const AIMessage = styled(Paper)(({ theme }) => ({
  padding: '10px 15px',
  borderRadius: '18px 18px 18px 0',
  backgroundColor: '#ffffff', // Blanc
  marginBottom: '8px',
  maxWidth: '70%',
  alignSelf: 'flex-start',
  wordBreak: 'break-word',
  boxShadow: '0 1px 1px rgba(0,0,0,0.1)'
}));

const TranslationMessage = styled(Paper)(({ theme }) => ({
  padding: '10px 15px',
  borderRadius: '18px 18px 18px 0',
  backgroundColor: '#f0f0ff', // Bleu très clair
  marginBottom: '8px',
  maxWidth: '70%',
  alignSelf: 'flex-start',
  wordBreak: 'break-word',
  boxShadow: '0 1px 1px rgba(0,0,0,0.1)',
  borderLeft: '3px solid #7986cb' // Bordure bleue
}));

const MessageTime = styled(Typography)(({ theme }) => ({
  fontSize: '0.7rem',
  color: 'rgba(0,0,0,0.6)',
  alignSelf: 'flex-end',
  marginTop: '4px'
}));

const DateDivider = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  margin: '16px 0',
  width: '100%',
  '&::before, &::after': {
    content: '""',
    flex: 1,
    borderBottom: '1px solid rgba(0,0,0,0.1)'
  }
}));

const DateLabel = styled(Typography)(({ theme }) => ({
  padding: '0 16px',
  fontSize: '0.85rem',
  color: 'rgba(0,0,0,0.6)',
  backgroundColor: '#e9edef',
  borderRadius: '8px'
}));

const ChatContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  height: '400px',
  overflowY: 'auto',
  padding: '10px',
  backgroundColor: '#e5ded8',
  backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 60c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z' fill='%23bbb6ae' fill-opacity='0.1' fill-rule='evenodd'/%3E%3C/svg%3E")`,
}));

const InputContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  backgroundColor: '#f0f0f0',
  padding: '10px',
  borderRadius: '0 0 10px 10px',
  alignItems: 'center'
}));

function App() {
  const [isRecording, setIsRecording] = useState(false);
  const [transcription, setTranscription] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [status, setStatus] = useState('idle');
  const [videoState, setVideoState] = useState('idle');
  const [messages, setMessages] = useState([]);
  const [translations, setTranslations] = useState({});
  const [inputText, setInputText] = useState('');
  
  const videoRef = useRef(null);
  const chatContainerRef = useRef(null);
  const apiUrl = "http://localhost:5001";
  const [mediaRecorder, setMediaRecorder] = useState(null);

  // Charger les messages du localStorage
  useEffect(() => {
    const savedMessages = localStorage.getItem('chatMessages');
    const savedTranslations = localStorage.getItem('chatTranslations');
    if (savedMessages) {
      setMessages(JSON.parse(savedMessages));
    }
    if (savedTranslations) {
      setTranslations(JSON.parse(savedTranslations));
    }
  }, []);

  // Sauvegarder les messages dans localStorage quand ils changent
  useEffect(() => {
    localStorage.setItem('chatMessages', JSON.stringify(messages));
    localStorage.setItem('chatTranslations', JSON.stringify(translations));
    
    // Faire défiler vers le bas quand de nouveaux messages arrivent
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages, translations]);

  // Fonction pour traduire en slovaque (simulation)
  const translateToSlovak = async (text) => {
    // En production, remplacez ceci par un appel API à un service de traduction
    try {
      const response = await axios.post(`${apiUrl}/api/chat`, {
        message: `Translate this French text to Slovak: "${text}"`
      });
      
      return response.data.response;
    } catch (error) {
      console.error("Error translating text:", error);
      return "Chyba prekladu"; // Erreur de traduction en slovaque
    }
  };

  const addMessage = async (text, sender, timestamp = new Date()) => {
    const messageId = Date.now().toString();
    const newMessage = {
      id: messageId,
      text,
      sender,
      timestamp
    };
    
    setMessages(prevMessages => [...prevMessages, newMessage]);
    
    // Si c'est un message AI, obtenir la traduction
    if (sender === 'ai') {
      const translation = await translateToSlovak(text);
      setTranslations(prev => ({
        ...prev,
        [messageId]: translation
      }));
    }
  };

  const handleAIResponse = async (userText) => {
    try {
      setStatus('getting AI response');
      setVideoState('speaking');
      
      // Ajouter le message de l'utilisateur
      if (userText) {
        await addMessage(userText, 'user');
      }
      
      console.log("Sending to chat API:", userText);
      console.log("Chat API URL:", `${apiUrl}/api/chat`);
      
      const aiResponse = await axios.post(`${apiUrl}/api/chat`, {
        message: userText
      }, {
        headers: {
          'Accept-Language': 'fr',
          'Content-Type': 'application/json'
        }
      });
      
      console.log("AI response received:", aiResponse);
      const responseText = aiResponse.data.response;
      console.log("Response text:", responseText);
      setAiResponse(responseText);
      
      // Ajouter la réponse de l'AI
      await addMessage(responseText, 'ai');
      
      // Synthèse vocale
      await speakText(responseText);
      
      setStatus('done');
      setVideoState('idle');
    } catch (error) {
      console.error("Error getting AI response:", error);
      if (error.response) {
        console.error("Server error:", error.response.status, error.response.data);
      } else if (error.request) {
        console.error("No response received:", error.request);
      } else {
        console.error("Request error:", error.message);
      }
      setStatus('error');
      setVideoState('idle');
    }
  };

  const startRecording = async () => {
    try {
      console.log("Starting recording...");
      setStatus('recording');
      setVideoState('listening');
      
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      console.log("Got media stream:", stream);
      
      const recorder = new MediaRecorder(stream);
      setMediaRecorder(recorder);
      
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
          formData.append('audio', audioBlob, 'recording.webm');
          
          console.log("Sending audio to server...");
          console.log("API URL:", `${apiUrl}/api/transcribe`);
          
          // Ajoutez un timeout plus long pour les requêtes
          const response = await axios.post(`${apiUrl}/api/transcribe`, formData, {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
            timeout: 30000 // 30 secondes
          });
          
          console.log("Transcription response received:", response.status);
          console.log("Response data:", response.data);
          
          const transcribedText = response.data.transcription;
          console.log("Transcribed text:", transcribedText);
          setTranscription(transcribedText);
          
          // Traiter la réponse de l'AI
          if (transcribedText && transcribedText.trim()) {
            await handleAIResponse(transcribedText);
          } else {
            console.warn("Transcription vide reçue");
            setStatus('idle');
            setVideoState('idle');
          }
        } catch (error) {
          console.error("Error processing audio:", error);
          
          // Afficher plus de détails sur l'erreur
          if (error.response) {
            // Le serveur a répondu avec un statut d'erreur
            console.error("Server error status:", error.response.status);
            console.error("Server error data:", error.response.data);
            console.error("Server error headers:", error.response.headers);
          } else if (error.request) {
            // La requête a été faite mais pas de réponse
            console.error("No response received. Request details:", error.request);
            console.error("Request was sent to:", error.config.url);
          } else {
            // Erreur lors de la configuration de la requête
            console.error("Request error:", error.message);
          }
          
          setStatus('error');
          setVideoState('idle');
        }
      };
      
      recorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error("Error starting recording:", error);
      setStatus('error');
      setVideoState('idle');
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

  const handleSendMessage = async () => {
    if (!inputText.trim()) return;
    
    setStatus('processing');
    setVideoState('speaking');
    await handleAIResponse(inputText);
    setInputText('');
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Fonction de synthèse vocale
  const speakText = async (text) => {
    console.log("Starting speech synthesis for:", text);
    try {
      const response = await axios.post(`${apiUrl}/api/synthesize`, {
        message: text
      }, {
        responseType: 'blob'
      });

      const audioBlob = new Blob([response.data], { type: 'audio/mpeg' });
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);
      audio.play();
    } catch (error) {
      console.error("Error during speech synthesis:", error);
    }
  };

  // Fonction pour formater les dates
  const formatMessageDate = (date) => {
    const messageDate = new Date(date);
    const now = new Date();
    const isToday = messageDate.toDateString() === now.toDateString();
    
    if (isToday) {
      return messageDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    
    return messageDate.toLocaleDateString([], { day: '2-digit', month: '2-digit', year: 'numeric' }) + 
           ' ' + messageDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Fonction pour vérifier si on doit afficher une séparation de date
  const shouldShowDateDivider = (currentIndex, messages) => {
    if (currentIndex === 0) return true;
    
    const currentDate = new Date(messages[currentIndex].timestamp).toDateString();
    const prevDate = new Date(messages[currentIndex - 1].timestamp).toDateString();
    
    return currentDate !== prevDate;
  };

  // Remplacer votre useEffect existant pour la vidéo par celui-ci:
  useEffect(() => {
    // Référence à l'élément vidéo pour éviter les changements fréquents
    const videoElement = videoRef.current;
    
    if (!videoElement) return;
    
    // Fonction pour charger et jouer une vidéo avec gestion d'erreur
    const loadAndPlay = async (src) => {
      try {
        console.log('Tentative de chargement de la vidéo:', src);
        
        // Vérifier le support du format
        const video = document.createElement('video');
        console.log('Support MP4:', video.canPlayType('video/mp4'));
        console.log('Support WebM:', video.canPlayType('video/webm'));
        
        // Vérifier si le fichier existe
        const response = await fetch(src);
        if (!response.ok) {
          throw new Error(`Fichier vidéo non trouvé: ${src} (${response.status})`);
        }
        
        // Vérifier le type MIME de la réponse
        console.log('Type MIME:', response.headers.get('content-type'));
        
        // Pause et réinitialisation
        videoElement.pause();
        
        // Changer la source
        videoElement.src = src;
        console.log('Source vidéo définie sur:', videoElement.src);
        
        // Ajouter des écouteurs d'événements pour le débogage
        videoElement.addEventListener('loadstart', () => console.log('Début du chargement'));
        videoElement.addEventListener('loadeddata', () => console.log('Données chargées'));
        videoElement.addEventListener('error', (e) => console.error('Erreur vidéo:', videoElement.error));
        
        // Attendre que la vidéo soit chargée
        await new Promise((resolve) => {
          videoElement.onloadeddata = resolve;
          setTimeout(resolve, 1000);
        });
        
        // Jouer la vidéo
        if (videoElement.paused) {
          await videoElement.play();
        }
      } catch (err) {
        console.error("Erreur détaillée:", err);
      }
    };
    
    // Choisir la vidéo en fonction de l'état
    let videoSrc = '';
    switch(videoState) {
      case 'listening':
        videoSrc = '/videos/listening_brave.mp4';
        break;
      case 'speaking':
        videoSrc = '/videos/speaking_brave.mp4';
        break;
      default:
        videoSrc = '/videos/idle_brave.mp4';
    }
    
    loadAndPlay(videoSrc);
    
    // Nettoyage
    return () => {
      if (videoElement) {
        videoElement.pause();
      }
    };
  }, [videoState]);

  // Fonction testServerConnection
  const testServerConnection = async () => {
    try {
      console.log("Testing server connection...");
      console.log("Trying to connect to:", `${apiUrl}/`);
      
      // Ajouter un timeout pour éviter que la requête reste bloquée
      const response = await axios.get(`${apiUrl}/`, { 
        timeout: 5000,
        headers: {
          'Accept': 'application/json'
        }
      });
      
      console.log("Server test response:", response.data);
      alert("Connexion au serveur réussie!");
    } catch (error) {
      console.error("Server test error:", error);
      
      if (error.response) {
        // Le serveur a répondu avec un statut d'erreur
        console.error("Server responded with error:", error.response.status, error.response.data);
        alert(`Erreur du serveur: ${error.response.status} - ${JSON.stringify(error.response.data)}`);
      } else if (error.request) {
        // La requête a été faite mais pas de réponse
        console.error("No response from server. Request:", error.request);
        alert("Pas de réponse du serveur. Vérifiez que le serveur est en cours d'exécution sur " + apiUrl);
      } else {
        // Erreur lors de la configuration de la requête
        console.error("Request setup error:", error.message);
        alert("Erreur de configuration de la requête: " + error.message);
      }
    }
  };

  return (
    <Container maxWidth={false} sx={{ display: 'flex', flexDirection: 'column', height: '100vh', py: 2 }}>
      {/* Header - Style WhatsApp */}
      <AppBar position="static" sx={{ borderRadius: '10px 10px 0 0', backgroundColor: '#128C7E' }}>
        <Toolbar>
          <Avatar 
            alt="AI Agent" 
            src="/avatar.png" 
            sx={{ width: 40, height: 40, marginRight: 2 }} 
          />
          <Box>
            <Typography variant="h6">AI Voice Agent</Typography>
            <Typography variant="caption" sx={{ opacity: 0.8 }}>
              {status === 'recording' ? 'Enregistrement...' : 
               status === 'processing' ? 'Traitement...' : 
               status === 'speaking' ? 'En train de parler...' : 'En ligne'}
      </Typography>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Zone de vidéo */}
      <Box 
        sx={{
          width: '100%',
          height: 300,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          my: 2,
          borderRadius: '8px',
          overflow: 'hidden',
          backgroundColor: '#f0f0f0'
        }}
      >
        <video
          ref={videoRef}
          muted
          loop
          playsInline
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            borderRadius: '8px'
          }}
        />
      </Box>

      {/* Zone de chat unique avec messages français et slovaques */}
      <ChatContainer ref={chatContainerRef}>
        {messages.map((msg, index) => (
          <React.Fragment key={msg.id}>
            {shouldShowDateDivider(index, messages) && (
              <DateDivider>
                <DateLabel>
                  {new Date(msg.timestamp).toLocaleDateString([], { weekday: 'long', day: 'numeric', month: 'long' })}
                </DateLabel>
              </DateDivider>
            )}
            <Box
              sx={{
                display: 'flex',
                justifyContent: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                mb: 1,
                width: '100%'
              }}
            >
              {msg.sender === 'user' ? (
                <UserMessage>
                  <Typography variant="body1">{msg.text}</Typography>
                  <MessageTime>{formatMessageDate(msg.timestamp)}</MessageTime>
                </UserMessage>
              ) : (
                <AIMessage>
                  <Typography variant="body1">{msg.text}</Typography>
                  <MessageTime>{formatMessageDate(msg.timestamp)}</MessageTime>
                </AIMessage>
              )}
            </Box>
            
            {/* Ajouter la traduction slovaque immédiatement après le message AI */}
            {msg.sender === 'ai' && translations[msg.id] && (
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'flex-start',
                  mb: 1,
                  width: '100%'
                }}
              >
                <TranslationMessage>
                  <Typography variant="body1">{translations[msg.id]}</Typography>
                  <MessageTime>{formatMessageDate(msg.timestamp)}</MessageTime>
                </TranslationMessage>
              </Box>
            )}
          </React.Fragment>
        ))}
        
        {status === 'processing' && (
          <Box sx={{ display: 'flex', justifyContent: 'flex-start', mb: 1 }}>
            <AIMessage>
              <Typography variant="body2">En train de réfléchir...</Typography>
            </AIMessage>
          </Box>
        )}
      </ChatContainer>

      {/* Zone de saisie - Style WhatsApp */}
      <InputContainer>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Tapez un message..."
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyPress={handleKeyPress}
          size="small"
          sx={{ 
            mr: 1,
            backgroundColor: '#fff',
            borderRadius: '18px',
            '& .MuiOutlinedInput-root': {
              borderRadius: '18px',
            }
          }}
        />
        {!isRecording ? (
          <>
            <IconButton
              color="primary"
              onClick={startRecording}
              sx={{ backgroundColor: '#128C7E', color: 'white', '&:hover': { backgroundColor: '#0e6b5e' } }}
            >
              <MicIcon />
            </IconButton>
            <IconButton
              color="primary"
              onClick={handleSendMessage}
              disabled={!inputText.trim()}
              sx={{ 
                ml: 1,
                backgroundColor: '#128C7E', 
                color: 'white', 
                '&:hover': { backgroundColor: '#0e6b5e' },
                '&.Mui-disabled': { backgroundColor: '#ccc', color: '#666' }
              }}
            >
              <SendIcon />
            </IconButton>
          </>
        ) : (
          <IconButton
            color="secondary"
            onClick={stopRecording}
            sx={{ backgroundColor: '#EA4335', color: 'white', '&:hover': { backgroundColor: '#d73c2c' } }}
          >
            <StopIcon />
          </IconButton>
        )}
      </InputContainer>

      {/* Ajoutez ce bouton juste après la zone de vidéo dans le JSX */}
      <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
        <Button 
          variant="contained" 
          color="secondary" 
          onClick={testServerConnection}
          sx={{ backgroundColor: '#128C7E', '&:hover': { backgroundColor: '#0e6b5e' } }}
        >
          Tester la connexion au serveur
        </Button>
      </Box>
    </Container>
  );
}

export default App;
