import { Client, IMessage } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

const WEBSOCKET_URL = 'http://10.0.2.2:8080/ws-stomp'; // Use http for SockJS

let stompClient: Client | null = null;
let reconnectAttempts = 0;
const MAX_RECONNECT_ATTEMPTS = 5;
const RECONNECT_INTERVAL = 3000; // 3 seconds

interface MessageCallback {
  (message: any): void;
}

export const connectWebSocket = (onConnected: () => void, onMessageReceived: MessageCallback, onError: (error: any) => void) => {
  if (stompClient && stompClient.connected) {
    onConnected();
    return;
  }

  const socket = new SockJS(WEBSOCKET_URL);
  stompClient = new Client({
    webSocketFactory: () => socket,
    debug: (str) => {
      console.log(str);
    },
    reconnectDelay: RECONNECT_INTERVAL,
    heartbeatIncoming: 4000,
    heartbeatOutgoing: 4000,
  });

  stompClient.connect(
    {},
    () => {
      console.log('Connected to WebSocket');
      reconnectAttempts = 0;
      onConnected();
      // Subscribe to a general topic for testing, adjust as needed
      stompClient?.subscribe('/topic/public', (message: IMessage) => {
        onMessageReceived(JSON.parse(message.body));
      });
    },
    (error: any) => {
      console.error('WebSocket connection error:', error);
      onError(error);
      if (reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
        reconnectAttempts++;
        console.log(`Attempting to reconnect (${reconnectAttempts}/${MAX_RECONNECT_ATTEMPTS})...`);
        setTimeout(() => connectWebSocket(onConnected, onMessageReceived, onError), RECONNECT_INTERVAL);
      } else {
        console.error('Max reconnect attempts reached. Please refresh the page.');
      }
    }
  );
};

export const disconnectWebSocket = () => {
  if (stompClient) {
    stompClient.disconnect(() => {
      console.log('Disconnected from WebSocket');
      stompClient = null;
    });
  }
};

export const sendMessage = (destination: string, message: any) => {
  if (stompClient && stompClient.connected) {
    stompClient.send(destination, {}, JSON.stringify(message));
  } else {
    console.warn('Cannot send message: WebSocket not connected');
  }
};

export const subscribeToTopic = (topic: string, callback: MessageCallback) => {
  if (stompClient && stompClient.connected) {
    return stompClient.subscribe(topic, (message: IMessage) => {
      callback(JSON.parse(message.body));
    });
  } else {
    console.warn('Cannot subscribe: WebSocket not connected');
    return null;
  }
};
