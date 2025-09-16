import { useState, useEffect, useRef } from 'react';
import { Alert } from 'react-native';
import { Client } from '@stomp/stompjs';
import { createStompClient, disconnectWebSocket, sendMessage as sendWsMessage, subscribeToTopic } from '@utils/websocket';
import { getToken } from '../services/authService';

// 인터페이스 정의
interface Message {
  id: string;
  text: string;
  sender: string;
  timestamp: string;
  type: 'JOIN' | 'CHAT' | 'LEAVE';
  senderName: string;
}

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
    const connect = async () => {
      const token = await getToken();
      console.log('--- 웹소켓 연결 시도 ---');
      console.log("획득한 토큰:", token);

        if (!token) {
        console.error('❌ 토큰이 없어 웹소켓 연결을 시도할 수 없습니다.');
        Alert.alert('Authentication Error', 'Please log in to use the chat.');
        return;
    }

      const onConnected = () => {
        setIsConnected(true);
        console.log('✅ 웹소켓 연결 성공');
        
        // 메시지 수신 토픽 구독
        subscribeToTopic(clientRef.current, `/topic/chat/${roomId}`, (msg: any) => {
          console.log('➡️ 메시지 수신:', msg);
          setMessages((prevMessages) => [
            ...prevMessages,
            {
              id: String(Date.now()), // 고유 ID 생성
              text: msg.type === 'JOIN' || msg.type === 'LEAVE' ? `${msg.sender} ${msg.type === 'JOIN' ? 'joined' : 'left'} the chat!` : msg.content,
              sender: msg.sender,
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              type: msg.type,
              senderName: msg.sender,
            },
          ]);
        });

        // 입장 메시지 전송
        console.log('⬆️ 입장 메시지 전송');
        sendWsMessage(clientRef.current, '/app/chat.addUsere', {
          sender: username,
          type: 'JOIN',
          roomId: roomId,
        });
      };

      const onError = (error: any) => {
        console.error('❌ 웹소켓 에러 발생:', error);
        setIsConnected(false);
        Alert.alert('Connection Error', 'Could not connect to chat server.');
      };

      const client = createStompClient(onConnected, onError, token || undefined);
      client.activate();
      clientRef.current = client;
    };

    connect();

    // 컴포넌트 언마운트 시 웹소켓 연결 종료
    return () => {
      if (clientRef.current) {
        console.log('⬇️ 퇴장 메시지 전송 후 웹소켓 연결 종료');
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
      console.log('⬆️ 채팅 메시지 전송:', content);
      sendWsMessage(clientRef.current, '/app/chat.sendMessage', {
        sender: username,
        content: content.trim(),
        type: 'CHAT',
        roomId: roomId,
      });
    } else {
      console.warn('⚠️ 메시지 전송 실패: 웹소켓 연결 안됨');
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