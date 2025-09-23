import { useEffect, useRef, useState } from 'react';
import SockJS from 'sockjs-client';
import { Client, Frame, Message } from '@stomp/stompjs';
import { WEBSOCKET_URL } from '@env';

interface MessageType {
  sender: string;
  content: string;
  type: 'CHAT' | 'JOIN' | 'LEAVE';
  roomId: string;
}

interface Props {
  roomId: string;
  username: string;
  token: string | null; // JWT 토큰
}

export default function useChatWebSocket(roomId: string, username: string, token: string | null) {
  const clientRef = useRef<Client | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [messages, setMessages] = useState<MessageType[]>([]);

  useEffect(() => {
    if (!token) {
      console.warn('[useChatWebSocket] 토큰 없음, 연결 건너뜀');
      return;
    }

    const brokerURL = new SockJS(WEBSOCKET_URL);
    const client = new Client({
      webSocketFactory: () => brokerURL,
      reconnectDelay: 5000,
      connectHeaders: {
        Authorization: `Bearer ${token}`,
      },
      debug: (str) => console.log('[STOMP Debug]', str),
      onConnect: (frame: Frame) => {
        console.log('[STOMP] 연결 성공', frame);
        setIsConnected(true);
        client.subscribe(`/topic/chat/${roomId}`, (message: Message) => {
          const payload: MessageType = JSON.parse(message.body);
          setMessages((prev) => [...prev, payload]);
        });
      },
      onStompError: (frame: Frame) => {
        console.error('[STOMP] 서버 오류:', frame.headers['message'], frame.body);
      },
      onWebSocketError: (evt) => {
        console.error('[STOMP] WebSocket 오류:', evt);
      },
      onDisconnect: () => {
        console.log('[STOMP] 연결 종료');
        setIsConnected(false);
      },
    });

    client.activate();
    clientRef.current = client;

    return () => {
      client.deactivate();
      clientRef.current = null;
    };
  }, [roomId, token]);

  const sendMessage = (content: string) => {
    if (!content.trim()) return;
    if (clientRef.current && isConnected) {
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
      console.warn('[STOMP] 연결되지 않음. 메시지 전송 불가');
    }
  };

  return { messages, sendMessage, isConnected };
}
