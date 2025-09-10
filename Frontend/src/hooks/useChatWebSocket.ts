import { useState, useEffect, useRef } from 'react';
import { Alert } from 'react-native';
import { connectWebSocket, disconnectWebSocket, sendMessage as sendWsMessage, subscribeToTopic } from '../utils/websocket';
import { Message } from '../types/chat.d';

interface UseChatWebSocketProps {
  roomId: string;
}

interface UseChatWebSocketReturn {
  messages: Message[];
  isConnected: boolean;
  sendMessage: (content: string) => void;
  currentUser: string;
}

const useChatWebSocket = ({ roomId }: UseChatWebSocketProps): UseChatWebSocketReturn => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const currentUser = useRef('User' + Math.floor(Math.random() * 1000)).current; // Persist user across re-renders

  useEffect(() => {
    const onConnected = () => {
      setIsConnected(true);
      console.log('WebSocket Connected');
      // Send JOIN message
      sendWsMessage('/app/chat.addUser', {
        sender: currentUser,
        type: 'JOIN',
        roomId: roomId,
      });

      // Subscribe to the specific chat room topic
      subscribeToTopic(`/topic/chat/${roomId}`, (msg: any) => {
        setMessages((prevMessages) => [
          ...prevMessages,
          {
            id: String(prevMessages.length + 1),
            text: msg.type === 'JOIN' || msg.type === 'LEAVE' ? `${msg.sender} ${msg.type === 'JOIN' ? 'joined' : 'left'} the chat!` : msg.content,
            sender: msg.sender === currentUser ? 'user' : 'other',
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            type: msg.type,
            senderName: msg.sender,
          },
        ]);
      });
    };

    const onError = (error: any) => {
      console.error('WebSocket Error:', error);
      setIsConnected(false);
      Alert.alert('Connection Error', 'Could not connect to chat server.');
    };

    connectWebSocket(onConnected, () => {}, onError); // onMessageReceived is handled by subscribeToTopic

    return () => {
      if (isConnected) {
        // Send LEAVE message
        sendWsMessage('/app/chat.sendMessage', {
          sender: currentUser,
          type: 'LEAVE',
          roomId: roomId,
        });
      }
      disconnectWebSocket();
    };
  }, [roomId, currentUser, isConnected]);

  const sendMessage = (content: string) => {
    if (content.trim() && isConnected) {
      const chatMessage = {
        sender: currentUser,
        content: content.trim(),
        type: 'CHAT',
        roomId: roomId,
      };
      sendWsMessage('/app/chat.sendMessage', chatMessage);
    } else if (!isConnected) {
      Alert.alert('Not Connected', 'Cannot send message. Not connected to chat server.');
    }
  };

  return {
    messages,
    isConnected,
    sendMessage,
    currentUser,
  };
};

export default useChatWebSocket;
