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

export default function useChatWebSocket(
  roomId: string,
  username: string,
  token: string | null
) {
  const clientRef = useRef<Client | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [messages, setMessages] = useState<MessageType[]>([]);

  useEffect(() => {
    console.log("[useChatWebSocket] effect 실행됨", { roomId, username, token });

    if (!token) {
      console.warn("[useChatWebSocket] 토큰 없음 → 연결 스킵");
      return;
    }

    // SockJS 객체 직접 생성
    const socket = new SockJS(WEBSOCKET_URL);
    console.log("[useChatWebSocket] SockJS 연결 시도 →", WEBSOCKET_URL);

    const headers = {
      Authorization: `Bearer ${token}`,
    };
    console.log("[useChatWebSocket] STOMP 연결 헤더:", headers); // 2. 헤더 포함 여부 확인 로그

    const client = new Client({
      webSocketFactory: () => socket,
      reconnectDelay: 5000,
      connectHeaders: headers,
      debug: (str) => console.log("[STOMP Debug]", str),

      // 연결 성공시
      onConnect: (frame: Frame) => {
        console.log("[STOMP] CONNECT 성공:", frame);
        setIsConnected(true);

        const destination = `/topic/chat/${roomId}`;
        console.log(`[STOMP] 구독 요청 전송 확인 → ${destination}`); // 1. 구독 요청 확인 로그

        client.subscribe(destination, (message: Message) => {
          try {
            const payload: MessageType = JSON.parse(message.body);
            console.log("[STOMP] 메시지 수신:", payload);
            setMessages((prev) => [...prev, payload]);
          } catch (err) {
            console.error("[STOMP] 메시지 파싱 실패:", err, message.body);
          }
        });
      },

      // 서버에서 STOMP 에러 날렸을 때
      onStompError: (frame: Frame) => {
        console.error("[STOMP] STOMP 프로토콜 에러:", frame.headers["message"], frame.body);
      },

      // 소켓 자체 오류
      onWebSocketError: (evt) => {
        console.error("[STOMP] WebSocket 오류:", evt);
      },

      onDisconnect: () => {
        console.log("[STOMP] 연결 종료");
        setIsConnected(false);
      },
    });

    client.activate();
    clientRef.current = client;

    return () => {
      console.log("[useChatWebSocket] cleanup 실행");
      client.deactivate();
      clientRef.current = null;
    };
  }, [roomId, token, username]);

  const sendMessage = (content: string) => {
    if (!content.trim()) return;
    if (clientRef.current && isConnected) {
      console.log("[STOMP] 메시지 전송 시도:", content);
      clientRef.current.publish({
        destination: `/app/chat/${roomId}/send`,
        body: JSON.stringify({
          sender: username,
          content: content.trim(),
          type: "CHAT",
          roomId,
        }),
      });
    } else {
      console.warn("[STOMP] 연결되지 않음 → 메시지 전송 불가");
    }
  };

  return { messages, sendMessage, isConnected };
}
