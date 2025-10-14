import { useEffect, useRef, useState } from 'react';
import { Client, Frame, IMessage } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { WEBSOCKET_URL } from '@env';

type ChatMessageDto = {
  roomId: string;
  sender: string;
  content: string;
  type: 'ENTER' | 'TALK';
  messageId?: string;
  createAt?: string;
  read?: boolean;
};

// STOMP 클라이언트 연결 훅: 방 정보, 유저, JWT 토큰으로 SockJS 기반 세션을 구성한다.
export default function useChatWebSocket(
  roomId: string,
  username: string,
  token: string | null
) {
  const clientRef = useRef<Client | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [messages, setMessages] = useState<ChatMessageDto[]>([]);

  useEffect(() => {
    console.log('[useChatWebSocket] 훅 시작', {
      roomId,
      username,
      hasToken: !!token,
      WEBSOCKET_URL,
    });

    if (!token || !token.trim()) {
      console.warn('[useChatWebSocket] 토큰이 없어 연결을 보류합니다.');
      return;
    }

    const trimmedToken = token.trim();
    const maskedToken = `${trimmedToken.slice(0, 8)}...${trimmedToken.slice(-5)}`;
    const connectHeaders = { Authorization: `Bearer ${trimmedToken}` };
    console.log('[useChatWebSocket] 인증 헤더 준비 완료.', { maskedToken });

    const sockJsUrl = WEBSOCKET_URL.startsWith('ws')
      ? WEBSOCKET_URL.replace(/^ws/i, 'http')
      : WEBSOCKET_URL;

    // ✅ SockJS 팩토리 방식
    const client = new Client({
      webSocketFactory: () => {
        console.log('[useChatWebSocket] SockJS 연결 시도', { sockJsUrl });
        return new SockJS(sockJsUrl, undefined, {
          transports: ['websocket', 'xhr-streaming', 'xhr-polling'],
        });
      },
      connectHeaders,
      reconnectDelay: 4000,
      heartbeatIncoming: 10000,
      heartbeatOutgoing: 10000,
      debug: (str) => console.log('[STOMP Debug]', str),
      onConnect: (frame: Frame) => {
        console.log('[STOMP] CONNECT 성공', frame.headers);
        setIsConnected(true);

        // 구독
        const dest = `/topic/chat/${roomId}`;
        const subReceiptId = `sub-${roomId}-${Date.now()}`;
        client.subscribe(
          dest,
          (msg: IMessage) => {
            try {
              const payload = JSON.parse(msg.body) as ChatMessageDto;
              console.log('[STOMP] 메시지 수신:', payload);
              setMessages((prev) => [...prev, payload]);
            } catch (err) {
              console.error('[STOMP] JSON 파싱 실패:', err, msg.body);
            }
          },
          { ack: 'auto', receipt: subReceiptId }
        );

        console.log('[STOMP] 구독 요청 완료', { dest, subReceiptId });

        // 입장 알림 발행
        const enterReceiptId = `pub-enter-${Date.now()}`;
        client.publish({
          destination: `/app/chat/${roomId}/addUser`,
          headers: { 'content-type': 'application/json', receipt: enterReceiptId },
          body: JSON.stringify({ roomId, sender: username, type: 'ENTER' }),
        });
      },
      onStompError: (frame) => {
        console.error('[STOMP] 프로토콜 오류:', frame.headers['message'], frame.body);
        setIsConnected(false);
      },
      onWebSocketError: (evt) => {
        console.error('[STOMP] WebSocket 오류:', evt);
        setIsConnected(false);
      },
      onWebSocketClose: (evt) => {
        console.warn('[STOMP] WebSocket 종료:', evt?.code, evt?.reason);
        setIsConnected(false);
      },
    });

    clientRef.current = client;
    client.activate();

    return () => {
      console.log('[useChatWebSocket] cleanup 실행');
      client.deactivate().then(() => {
        if (clientRef.current === client) {
          clientRef.current = null;
          console.log('[useChatWebSocket] client deactivated');
        }
      });
    };
  }, [roomId, username, token]);

  const sendMessage = (text: string) => {
    if (!text.trim()) {
      return;
    }
    if (!clientRef.current || !isConnected) {
      console.warn('[STOMP] 연결 대기 중이라 메시지를 보낼 수 없습니다.');
      return;
    }

    const receiptId = `pub-${roomId}-${Date.now()}`;
    clientRef.current.publish({
      destination: `/app/chat/${roomId}/send`,
      headers: { 'content-type': 'application/json', receipt: receiptId },
      body: JSON.stringify({
        roomId,
        sender: username,
        content: text.trim(),
        type: 'TALK',
      } as ChatMessageDto),
    });
    console.log('[STOMP] 발행 요청 전송', { receiptId });
  };

  return { messages, sendMessage, isConnected };
}
