// frontend/src/VoiceAgent.js

import React, { useState, useEffect } from 'react';

const VoiceAgent = () => {
    const [message, setMessage] = useState('');
    const [response, setResponse] = useState('');
    const [ws, setWs] = useState(null);

    useEffect(() => {
        // Change this URL to your backend's WebSocket URL
        const socket = new WebSocket("ws://your-backend-url.onrender.com/ws");
        setWs(socket);

        socket.onmessage = (event) => {
            setResponse(event.data);
        };

        return () => socket.close();
    }, []);

    const sendMessage = () => {
        if (ws) {
            ws.send(message);
            setMessage('');
        }
    };

    return (
        <div>
            <h1>AI Voice Agent</h1>
            <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type your message"
            />
            <button onClick={sendMessage}>Send</button>
            <div>
                <h2>Response:</h2>
                <p>{response}</p>
            </div>
        </div>
    );
};

export default VoiceAgent;