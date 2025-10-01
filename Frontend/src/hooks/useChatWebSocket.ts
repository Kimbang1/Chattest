import { useEffect, useRef, useState } from 'react';
import { Client, Frame, IMessage } from '@stomp/stompjs';
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

// STOMP 클라이언트 연결 훅: 방 정보, 유저, JWT 토큰으로 웹소켓 세션을 구성한다.
export default function useChatWebSocket(roomId: string, username: string, token: string | null) {
  const clientRef = useRef<Client | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [messages, setMessages] = useState<ChatMessageDto[]>([]);

  useEffect(() => {
    console.log('[useChatWebSocket] 훅 시작', { roomId, username, hasToken: !!token, WEBSOCKET_URL });
    if (!token || !token.trim()) {
      console.warn('[useChatWebSocket] 토큰이 없어 연결을 보류합니다.');
      return;
    }

    const wsFactory = () => {
      const ws = new WebSocket(WEBSOCKET_URL, ['v12.stomp', 'v11.stomp', 'v10.stomp']);
      const originalSend = ws.send.bind(ws);
      ws.send = ((data) => {
        console.log('[WebSocket raw send]', data);
        originalSend(data);
      }) as typeof ws.send;
      ws.onopen = () => console.log('[WebSocket] 연결 수립');
      ws.onerror = (e) => console.error('[WebSocket] 오류 발생:', e);
      ws.onclose = (e) => console.warn('[WebSocket] 연결 종료:', e.code, e.reason);
      return ws;
    };

    const trimmedToken = token.trim();
    const maskedToken = `${trimmedToken.slice(0, 8)}...${trimmedToken.slice(-5)}`;
    const connectHeaders = { Authorization: `Bearer ${trimmedToken}` };
    console.log('[useChatWebSocket] 인증 헤더 준비 완료.', { maskedToken });

    const client = new Client({
      webSocketFactory: wsFactory,
      reconnectDelay: 4000,
      connectHeaders,
      heartbeatIncoming: 10000,
      heartbeatOutgoing: 10000,
      forceBinaryWSFrames: true,
      appendMissingNULLonIncoming: true,
      debug: (str) => console.log('[STOMP Debug]', str),
      onConnect: (frame: Frame) => {
        console.log('[STOMP] CONNECT 성공', frame.headers);
        setIsConnected(true);
        const dest = `/topic/chat/${roomId}`;
        const subReceiptId = `sub-${roomId}-${Date.now()}`;
        client.subscribe(
          dest,
          (msg: IMessage) => {
            try {
              const payload = JSON.parse(msg.body) as ChatMessageDto;
              console.log('[STOMP] 메시지 수신:', payload);
              setMessages((prev) => [...prev, payload]);
            } catch (parseError) {
              console.error('[STOMP] JSON 파싱 실패:', parseError, msg.body);
            }
          },
          { ack: 'auto', receipt: subReceiptId }
        );
        console.log('[STOMP] 구독 요청 전송', { dest, subReceiptId });

        client.publish({
          destination: `/app/chat/${roomId}/addUser`,
          headers: { 'content-type': 'application/json', receipt: `pub-enter-${Date.now()}` },
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

    client.logRawCommunication = true;
    client.activate();
    clientRef.current = client;

    return () => {
      console.log('[useChatWebSocket] cleanup → deactivate 실행', { active: clientRef.current?.active });
      if (clientRef.current) {
        clientRef.current
          .deactivate()
          .then(() => {
            console.log('[useChatWebSocket] client deactivated');
            clientRef.current = null;
          })
          .catch((err) => {
            console.error('[useChatWebSocket] deactivate 중 오류:', err);
          });
      }
    };
  }, [roomId, username, token]);

  const sendMessage = (text: string) => {
    if (!text.trim()) return;
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
