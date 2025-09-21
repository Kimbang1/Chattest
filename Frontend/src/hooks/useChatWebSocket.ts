import { useState, useEffect, useRef, useCallback } from 'react';
import { Alert } from 'react-native';
import { Client, Message as StompMessage } from '@stomp/stompjs';
// SockJS import를 제거합니다.
// import SockJS from 'sockjs-client';
import { getToken } from '../services/authService';
import { WEBSOCKET_URL } from '@env';

// --- 인터페이스 정의 (변경 없음) ---
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
  const [messages, setMessages] = useState<Message[]>([]);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const clientRef = useRef<Client | null>(null);

  useEffect(() => {
    let client: Client; // client 변수를 useEffect 스코프 최상단에 선언

    const connect = async () => {
      const token = await getToken();
      if (!token) {
        Alert.alert('Authentication Error', 'Please log in to use the chat.');
        return;
      }

      // --- [핵심 수정 1] http URL을 WebSocket(ws) URL로 변경 ---
      const wsUrl = WEBSOCKET_URL.replace(/^http/, 'ws');
      console.log(`[useChatWebSocket] Connecting to WebSocket: ${wsUrl}`);

      client = new Client({
        // --- [핵심 수정 2] webSocketFactory 대신 brokerURL 사용 ---
        brokerURL: wsUrl,
        connectHeaders: { Authorization: `Bearer ${token}` },
        debug: (msg) => console.log('[STOMP Debug]', msg),
        reconnectDelay: 5000,

        // --- [핵심 수정 3] onConnect 콜백: 연결 성공 시 로직 ---
        onConnect: () => {
          console.log(`[STOMP] Connected ✅ Room: ${roomId}`);
          setIsConnected(true);

          const topic = `/topic/chat/${roomId}`;
          console.log(`[STOMP] Subscribing to topic: ${topic}`);

          // 구독 로직
          client.subscribe(topic, (frame: StompMessage) => {
            try {
              const payload = JSON.parse(frame.body);
              setMessages((prev) => [
                ...prev,
                {
                  id: String(Date.now() + Math.random()),
                  text:
                    payload.type === 'JOIN'
                      ? `${payload.sender} 님이 입장했습니다.`
                      : payload.type === 'LEAVE'
                      ? `${payload.sender} 님이 퇴장했습니다.`
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

          // 입장 메시지 전송
          client.publish({
            destination: `/app/chat/${roomId}/addUser`,
            body: JSON.stringify({ sender: username, type: 'JOIN', roomId }),
          });
        },

        // --- [핵심 수정 4] onStompError 콜백: 에러 발생 시 로직 ---
        onStompError: (frame) => {
          console.error('❌ STOMP Error:', frame.headers['message']);
          console.error('Body:', frame.body);
          setIsConnected(false);
        },
      });

      clientRef.current = client;
      client.activate();
    };

    connect();

    // 언마운트 시 정리 함수
    return () => {
      console.log('[useChatWebSocket] Cleanup on unmount...');
      if (clientRef.current?.connected) {
        clientRef.current.publish({
            destination: `/app/chat/${roomId}/send`,
            body: JSON.stringify({ sender: username, type: 'LEAVE', roomId }),
        });
        clientRef.current.deactivate();
      }
      setIsConnected(false);
    };
  }, []); // 의존성 배열은 비어있어야 합니다.

  // 메시지 전송 함수
  const sendMessage = useCallback((content: string) => {
    if (!content.trim()) return;

    if (clientRef.current && clientRef.current.connected) {
        clientRef.current.publish({
          destination: `/app/chat/${roomId}/send`,
          body: JSON.stringify({
            sender: username,
            content: content.trim(),
            type: 'CHAT',
            roomId,
          }),
        });
    } else {
        console.warn('[STOMP] Cannot publish, STOMP not connected yet.', {stack: new Error().stack});
    }
  }, [roomId, username]);

  return { messages, isConnected, sendMessage };
};

export default useChatWebSocket;

