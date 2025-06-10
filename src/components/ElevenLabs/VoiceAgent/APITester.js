// APITester.js
// Component for testing ElevenLabs API connection and credentials

import React, { useState } from 'react';
import { 
  Box, 
  Button, 
  Card, 
  CardContent, 
  Typography, 
  CircularProgress,
  Alert,
  Chip
} from '@mui/material';
import { 
  Science,
  CheckCircle,
  Error,
  Warning
} from '@mui/icons-material';
import elevenLabsConfig from '../../../config/elevenlabs';

const APITester = () => {
  const [testResults, setTestResults] = useState({});
  const [isTestingAPI, setIsTestingAPI] = useState(false);
  const [isTestingWebSocket, setIsTestingWebSocket] = useState(false);

  // Test API credentials
  const testAPICredentials = async () => {
    setIsTestingAPI(true);
    setTestResults(prev => ({ ...prev, api: null }));

    try {
      // Test API key validity by making a simple request
      const response = await fetch('https://api.elevenlabs.io/v1/user', {
        method: 'GET',
        headers: {
          'xi-api-key': elevenLabsConfig.apiKey
        }
      });

      if (response.ok) {
        const userData = await response.json();
        setTestResults(prev => ({ 
          ...prev, 
          api: { 
            success: true, 
            message: `API key valid! User: ${userData.first_name || 'Unknown'}`,
            details: userData
          } 
        }));
      } else {
        const errorData = await response.json().catch(() => ({}));
        setTestResults(prev => ({ 
          ...prev, 
          api: { 
            success: false, 
            message: `API key invalid: ${response.status} ${response.statusText}`,
            details: errorData
          } 
        }));
      }
    } catch (error) {
      setTestResults(prev => ({ 
        ...prev, 
        api: { 
          success: false, 
          message: `API test failed: ${error.message}`,
          details: error
        } 
      }));
    } finally {
      setIsTestingAPI(false);
    }
  };

  // Test WebSocket connection
  const testWebSocketConnection = () => {
    setIsTestingWebSocket(true);
    setTestResults(prev => ({ ...prev, websocket: null }));

    try {
      // ElevenLabs WebSocket requires API key in URL parameters
      const wsUrl = `${elevenLabsConfig.websocketUrl}?agent_id=${elevenLabsConfig.agentId}&xi_api_key=${elevenLabsConfig.apiKey}`;
      console.log('Testing WebSocket connection to:', wsUrl.replace(elevenLabsConfig.apiKey, '***'));
      
      const ws = new WebSocket(wsUrl);

      const timeout = setTimeout(() => {
        ws.close();
        setTestResults(prev => ({ 
          ...prev, 
          websocket: { 
            success: false, 
            message: 'WebSocket connection timeout (10 seconds)',
            details: { reason: 'timeout' }
          } 
        }));
        setIsTestingWebSocket(false);
      }, 10000);

      ws.onopen = () => {
        clearTimeout(timeout);
        setTestResults(prev => ({ 
          ...prev, 
          websocket: { 
            success: true, 
            message: 'WebSocket connection successful!',
            details: { state: 'connected' }
          } 
        }));
        ws.close();
        setIsTestingWebSocket(false);
      };

      ws.onerror = (error) => {
        clearTimeout(timeout);
        console.error('WebSocket error:', error);
        setTestResults(prev => ({ 
          ...prev, 
          websocket: { 
            success: false, 
            message: 'WebSocket connection failed',
            details: error
          } 
        }));
        setIsTestingWebSocket(false);
      };

      ws.onclose = (event) => {
        if (event.code !== 1000) { // Not normal closure
          clearTimeout(timeout);
          console.log('WebSocket closed with code:', event.code, 'reason:', event.reason);
          setTestResults(prev => ({ 
            ...prev, 
            websocket: { 
              success: false, 
              message: `WebSocket closed unexpectedly: ${event.code}${event.reason ? ' - ' + event.reason : ''}`,
              details: { code: event.code, reason: event.reason }
            } 
          }));
          setIsTestingWebSocket(false);
        }
      };

    } catch (error) {
      setTestResults(prev => ({ 
        ...prev, 
        websocket: { 
          success: false, 
          message: `WebSocket test failed: ${error.message}`,
          details: error
        } 
      }));
      setIsTestingWebSocket(false);
    }
  };

  const getResultIcon = (result) => {
    if (!result) return <Warning color="action" />;
    return result.success ? <CheckCircle color="success" /> : <Error color="error" />;
  };

  const getResultSeverity = (result) => {
    if (!result) return 'info';
    return result.success ? 'success' : 'error';
  };

  return (
    <Card sx={{ mb: 2 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Science /> API Connection Tester
        </Typography>
        
        <Typography variant="body2" color="text.secondary" gutterBottom>
          Test your ElevenLabs API credentials and connection before starting a conversation.
          <br />
          <em>Note: WebSocket test may fail due to API handshake requirements, but actual conversations will work if API key is valid.</em>
        </Typography>

        <Box sx={{ mt: 2, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <Button
            variant="outlined"
            onClick={testAPICredentials}
            disabled={isTestingAPI || !elevenLabsConfig.apiKey}
            startIcon={isTestingAPI ? <CircularProgress size={16} /> : getResultIcon(testResults.api)}
          >
            {isTestingAPI ? 'Testing API...' : 'Test API Key'}
          </Button>

          <Button
            variant="outlined"
            onClick={testWebSocketConnection}
            disabled={isTestingWebSocket || !elevenLabsConfig.agentId}
            startIcon={isTestingWebSocket ? <CircularProgress size={16} /> : getResultIcon(testResults.websocket)}
          >
            {isTestingWebSocket ? 'Testing WebSocket...' : 'Test WebSocket'}
          </Button>
        </Box>

        {/* Test Results */}
        <Box sx={{ mt: 2 }}>
          {testResults.api && (
            <Alert 
              severity={getResultSeverity(testResults.api)} 
              sx={{ mb: 1 }}
              icon={getResultIcon(testResults.api)}
            >
              <strong>API Test:</strong> {testResults.api.message}
            </Alert>
          )}

          {testResults.websocket && (
            <Alert 
              severity={getResultSeverity(testResults.websocket)} 
              sx={{ mb: 1 }}
              icon={getResultIcon(testResults.websocket)}
            >
              <strong>WebSocket Test:</strong> {testResults.websocket.message}
            </Alert>
          )}
        </Box>

        {/* Configuration Status */}
        <Box sx={{ mt: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          <Chip 
            label={`API Key: ${elevenLabsConfig.apiKey ? 'Set' : 'Missing'}`}
            color={elevenLabsConfig.apiKey ? 'success' : 'error'}
            size="small"
          />
          <Chip 
            label={`Agent ID: ${elevenLabsConfig.agentId ? 'Set' : 'Missing'}`}
            color={elevenLabsConfig.agentId ? 'success' : 'error'}
            size="small"
          />
        </Box>
      </CardContent>
    </Card>
  );
};

export default APITester; 