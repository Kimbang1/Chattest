
import { useState, useEffect, useRef } from 'react';
import { Alert } from 'react-native';
import { Client } from '@stomp/stompjs';
import { createStompClient, disconnectWebSocket, sendMessage as sendWsMessage, subscribeToTopic } from '@utils/websocket';
import { Message } from '../types/chat.d';

interface UseChatWebSocketProps {
  roomId: string;
  username: string;
}

interface UseChatWebSocketReturn {
  messages: Message[];
  isConnected: boolean;
  sendMessage: (content: string) => void;
}

const useChatWebSocket = ({ roomId, username }: UseChatWebSocketProps): UseChatWebSocketReturn => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const clientRef = useRef<Client | null>(null);

  useEffect(() => {
    const onConnected = () => {
      setIsConnected(true);
      console.log('WebSocket Connected');
      subscribeToTopic(clientRef.current, `/topic/chat/${roomId}`, (msg: any) => {
        setMessages((prevMessages) => [
          ...prevMessages,
          {
            id: String(prevMessages.length + 1),
            text: msg.type === 'JOIN' || msg.type === 'LEAVE' ? `${msg.sender} ${msg.type === 'JOIN' ? 'joined' : 'left'} the chat!` : msg.content,
            sender: msg.sender === username ? 'user' : 'other',
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            type: msg.type,
            senderName: msg.sender,
          },
        ]);
      });

      sendWsMessage(clientRef.current, '/app/chat.addUser', {
        sender: username,
        type: 'JOIN',
        roomId: roomId,
      });
    };

    const onError = (error: any) => {
      console.error('WebSocket Error:', error);
      setIsConnected(false);
      Alert.alert('Connection Error', 'Could not connect to chat server.');
    };

    const client = createStompClient(onConnected, () => {}, onError);
    client.activate();
    clientRef.current = client;

    return () => {
      if (clientRef.current) {
        sendWsMessage(clientRef.current, '/app/chat.sendMessage', {
          sender: username,
          type: 'LEAVE',
          roomId: roomId,
        });
        disconnectWebSocket(clientRef.current);
      }
    };
  }, [roomId, username]);

  const sendMessage = (content: string) => {
    if (content.trim() && clientRef.current && clientRef.current.connected) {
        sendWsMessage(clientRef.current, '/app/chat.sendMessage', {
            sender: username, 
            content: content.trim(), 
            type: 'CHAT', 
            roomId: roomId 
        });
    } else {
      Alert.alert('Cannot send message', 'WebSocket is not connected.');
    }
  };

  return {
    messages,
    isConnected,
    sendMessage,
  };
};

export default useChatWebSocket;
