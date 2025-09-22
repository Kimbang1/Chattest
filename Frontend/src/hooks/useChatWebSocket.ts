import { useEffect, useRef, useState } from 'react';
import SockJS from 'sockjs-client';
import { Client, Frame, Message } from '@stomp/stompjs';

interface MessageType {
  sender: string;
  content: string;
  type: 'CHAT' | 'JOIN' | 'LEAVE';
  roomId: string;
}

export default function useChatWebSocket(roomId: string, username: string) {
  const clientRef = useRef<Client | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [messages, setMessages] = useState<MessageType[]>([]);

  useEffect(() => {
    const socket = new SockJS('http://10.0.2.2:8080/ws-stomp'); // RN 에뮬레이터용 주소
    const client = new Client({
      webSocketFactory: () => socket,
      reconnectDelay: 5000,
      debug: (str) => console.log('[STOMP Debug]', str),
      onConnect: (frame: Frame) => {
        console.log('[STOMP] 연결 성공', frame);
        setIsConnected(true);

        // 채팅방 구독
        client.subscribe(`/topic/chat/${roomId}`, (message: Message) => {
          const payload: MessageType = JSON.parse(message.body);
          console.log('[STOMP] 메시지 수신:', payload);
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
  }, [roomId]);

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
