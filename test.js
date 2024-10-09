const WebSocket = require('ws');

// WebSocket URL
const wsUrl = 'wss://nbstream.binance.com/market?uuid=9c1abb70-7379-4dbe-8498-10d9508d6f9b&lang=en&clienttype=web';

const ws = new WebSocket(wsUrl);

// Event handler for connection open
ws.on('open', () => {
  console.log('Connected to WebSocket endpoint');
  // You can send a message to the server if required
  // ws.send(JSON.stringify({ type: 'subscribe', symbol: 'BTCUSDT' }));
});

// Event handler for receiving messages
ws.on('message', (data) => {
  console.log('Received message:', data);
  // Handle incoming data here
});

// Event handler for errors
ws.on('error', (error) => {
  console.error('WebSocket error:', error);
});

// Event handler for connection close
ws.on('close', () => {
  console.log('Disconnected from WebSocket');
});

