// useChatWebSocket.ts
import { useState, useEffect, useRef } from 'react';
import { Alert } from 'react-native';
import { Client, Message as StompMessage } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { getToken } from '../services/authService';
import { WEBSOCKET_URL } from '@env';

// --- 인터페이스 정의 ---
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

// --- 훅 정의 ---
const useChatWebSocket = ({ roomId, username }: UseChatWebSocketProps): UseChatWebSocketReturn => {
  console.log(`[useChatWebSocket] Hook initialized with Room ID: ${roomId}, User: ${username}`);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const clientRef = useRef<Client | null>(null);

  useEffect(() => {
    const connect = async () => {
      console.log('[useChatWebSocket] Hook mounted. Starting connection...');
      const token = await getToken();
      console.log('[useChatWebSocket] Retrieved token:', token ? `...${token.slice(-10)}` : 'null');

      if (!token) {
        Alert.alert('Authentication Error', 'Please log in to use the chat.');
        return;
      }

      // --- onConnect callback ---
      const onConnected = () => {
        console.log(`[STOMP] Connected ✅ Room: ${roomId}`);
        setIsConnected(true);

        // --- 구독 ---
        const topic = `/topic/chat/${roomId}`;
        console.log(`[STOMP] Subscribing to topic: ${topic}`);
        const subscription = clientRef.current?.subscribe(topic, (frame: StompMessage) => {
          try {
            const payload = JSON.parse(frame.body);
            console.log('[STOMP] Message received:', payload);

            setMessages((prev) => [
              ...prev,
              {
                id: String(Date.now()),
                text:
                  payload.type === 'JOIN'
                    ? `${payload.sender} joined the chat!`
                    : payload.type === 'LEAVE'
                    ? `${payload.sender} left the chat!`
                    : payload.content,
                sender: payload.sender,
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                type: payload.type,
                senderName: payload.sender,
              },
            ]);
          } catch (err) {
            console.error('❌ Failed to parse STOMP message', err);
          }
        });
        console.log('[STOMP] Subscription completed:', subscription?.id);

        // --- 입장 메시지 전송 ---
        safePublish({
          destination: `/app/chat/${roomId}/addUser`,
          body: JSON.stringify({ sender: username, type: 'JOIN', roomId }),
        });
      };

      // --- onStompError callback ---
      const onError = (frame: any) => {
        console.error('❌ STOMP Error:', frame);
        setIsConnected(false);
      };

      // --- STOMP client 생성 (SockJS 사용) ---
      const client = new Client({
        webSocketFactory: () => new SockJS(WEBSOCKET_URL),
        connectHeaders: { Authorization: `Bearer ${token}` },
        debug: (msg) => console.log('[STOMP Debug]', msg),
        reconnectDelay: 5000,
      });
      client.onConnect = onConnected;
      client.onStompError = onError;
      client.activate();
      clientRef.current = client;
    };

    connect();

    // --- 언마운트 시 정리 ---
    return () => {
      console.log('[useChatWebSocket] Cleanup on unmount...');
      safePublish({
        destination: `/app/chat/${roomId}/send`,
        body: JSON.stringify({ sender: username, type: 'LEAVE', roomId }),
      });
      clientRef.current?.deactivate();
      setIsConnected(false);
    };
  }, [roomId, username]);

  // --- 안전하게 publish ---
  const safePublish = (payload: { destination: string; body: string }) => {
    if (clientRef.current && clientRef.current.connected) {
      clientRef.current.publish(payload);
    } else {
      console.warn('[STOMP] Cannot publish, STOMP not connected yet.');
    }
  };

  // --- 메시지 전송 ---
  const sendMessage = (content: string) => {
    if (!content.trim()) return;

    safePublish({
      destination: `/app/chat/${roomId}/send`,
      body: JSON.stringify({
        sender: username,
        content: content.trim(),
        type: 'CHAT',
        roomId,
      }),
    });
  };

  return { messages, isConnected, sendMessage };
};

export default useChatWebSocket;
