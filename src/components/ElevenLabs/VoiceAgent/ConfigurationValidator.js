// ConfigurationValidator.js
// Component for validating ElevenLabs configuration before connection

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Alert, 
  AlertTitle, 
  Box, 
  Collapse, 
  Link, 
  Typography,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  IconButton
} from '@mui/material';
import { 
  CheckCircle,
  Error,
  ExpandMore,
  ExpandLess,
  OpenInNew
} from '@mui/icons-material';
import elevenLabsConfig from '../../../config/elevenlabs';

const ConfigurationValidator = ({ onValidationChange }) => {
  const [validationResults, setValidationResults] = useState({});
  const [showDetails, setShowDetails] = useState(false);
  const [overallValid, setOverallValid] = useState(false);

  // Memoize validation checks to prevent useEffect dependency issues
  const validationChecks = useMemo(() => [
    {
      id: 'apiKey',
      name: 'API Key',
      check: () => elevenLabsConfig.apiKey && elevenLabsConfig.apiKey.startsWith('sk_'),
      error: 'ElevenLabs API key is missing or invalid',
      help: 'Get your API key from https://elevenlabs.io/app/settings/api-keys'
    },
    {
      id: 'agentId', 
      name: 'Agent ID',
      check: () => elevenLabsConfig.agentId && elevenLabsConfig.agentId.startsWith('agent_'),
      error: 'ElevenLabs Agent ID is missing or invalid',
      help: 'Create an agent at https://elevenlabs.io/app/conversational-ai'
    },
    {
      id: 'websocketSupport',
      name: 'WebSocket Support',
      check: () => typeof WebSocket !== 'undefined',
      error: 'WebSocket is not supported in this browser',
      help: 'Use a modern browser like Chrome, Firefox, Safari, or Edge'
    },
    {
      id: 'audioSupport',
      name: 'Audio API Support', 
      check: () => typeof MediaRecorder !== 'undefined' && typeof navigator.mediaDevices !== 'undefined',
      error: 'Audio recording is not supported in this browser',
      help: 'Ensure you are using a modern browser with microphone support'
    },
    {
      id: 'secureContext',
      name: 'Secure Context',
      check: () => window.isSecureContext || window.location.hostname === 'localhost',
      error: 'Microphone access requires HTTPS or localhost',
      help: 'Use HTTPS for production or localhost for development'
    }
  ], []);

  // Store the validation callback in a ref to prevent infinite loops
  const memoizedOnValidationChange = useRef(onValidationChange || (() => {}));
  
  // Update the ref when the callback changes
  useEffect(() => {
    memoizedOnValidationChange.current = onValidationChange || (() => {});
  }, [onValidationChange]);

  // Run validation checks
  useEffect(() => {
    const results = {};
    let allValid = true;

    validationChecks.forEach(check => {
      const isValid = check.check();
      results[check.id] = {
        valid: isValid,
        name: check.name,
        error: check.error,
        help: check.help
      };
      
      if (!isValid) {
        allValid = false;
      }
    });

    setValidationResults(results);
    setOverallValid(allValid);
    
    // Notify parent component
    if (memoizedOnValidationChange.current) {
      memoizedOnValidationChange.current(allValid, results);
    }
  }, [validationChecks]);

  const getValidationIcon = (isValid) => {
    return isValid ? 
      <CheckCircle sx={{ color: 'success.main' }} /> : 
      <Error sx={{ color: 'error.main' }} />;
  };

  const getSeverity = () => {
    if (overallValid) return 'success';
    
    // Check if only optional items are failing
    const criticalFailed = ['apiKey', 'agentId', 'websocketSupport'].some(
      id => validationResults[id] && !validationResults[id].valid
    );
    
    return criticalFailed ? 'error' : 'warning';
  };

  const getMessage = () => {
    if (overallValid) {
      return 'Configuration is valid! You can connect to ElevenLabs.';
    }
    
    const failedCount = Object.values(validationResults).filter(r => !r.valid).length;
    return `${failedCount} configuration issue${failedCount > 1 ? 's' : ''} found. Please resolve before connecting.`;
  };

  return (
    <Box sx={{ mb: 2 }}>
      <Alert 
        severity={getSeverity()}
        action={
          <IconButton
            size="small"
            onClick={() => setShowDetails(!showDetails)}
            sx={{ color: 'inherit' }}
          >
            {showDetails ? <ExpandLess /> : <ExpandMore />}
          </IconButton>
        }
      >
        <AlertTitle>
          {overallValid ? 'Configuration Valid' : 'Configuration Issues'}
        </AlertTitle>
        {getMessage()}
      </Alert>

      <Collapse in={showDetails}>
        <Box sx={{ mt: 2, p: 2, backgroundColor: 'background.paper', borderRadius: 1 }}>
          <Typography variant="h6" gutterBottom>
            Configuration Details:
          </Typography>
          
          <List dense>
            {validationChecks.map(check => {
              const result = validationResults[check.id];
              if (!result) return null;
              
              return (
                <ListItem key={check.id}>
                  <ListItemIcon>
                    {getValidationIcon(result.valid)}
                  </ListItemIcon>
                  <ListItemText
                    primary={check.name}
                    secondary={
                      result.valid ? (
                        'Configured correctly'
                      ) : (
                        <span>
                          <span style={{ color: 'red', display: 'block', marginBottom: '4px' }}>
                            {result.error}
                          </span>
                          <span style={{ fontSize: '0.75rem', color: 'gray', display: 'block' }}>
                            {result.help}
                          </span>
                        </span>
                      )
                    }
                  />
                </ListItem>
              );
            })}
          </List>

          {!overallValid && (
            <Box sx={{ mt: 2, p: 2, backgroundColor: 'info.light', borderRadius: 1 }}>
              <Typography variant="body2" gutterBottom>
                <strong>Need help setting up?</strong>
              </Typography>
              <Typography variant="body2">
                Check the{' '}
                <Link 
                  href="./ELEVENLABS_SETUP.md" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5 }}
                >
                  Setup Guide <OpenInNew fontSize="small" />
                </Link>
                {' '}for detailed instructions.
              </Typography>
            </Box>
          )}
        </Box>
      </Collapse>
    </Box>
  );
};

export default ConfigurationValidator; 