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

export default function useChatWebSocket(
  roomId: string,
  username: string,
  token: string | null
) {
  const clientRef = useRef<Client | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [messages, setMessages] = useState<ChatMessageDto[]>([]);

  useEffect(() => {
    console.log('[useChatWebSocket] start', { roomId, username, hasToken: !!token });
    if (!token) {
      console.warn('[useChatWebSocket] 토큰 없음 → 연결 스킵');
      return;
    }
    

    // RN/Web 환경 모두에서 STOMP subprotocol을 명시하여 순수 WebSocket 사용
    const wsFactory = () => new WebSocket(WEBSOCKET_URL, ['v12.stomp', 'v11.stomp', 'v10.stomp']);

    const client = new Client({
      webSocketFactory: wsFactory,            // brokerURL와 동시 사용 금지
      reconnectDelay: 4000,
      connectHeaders: { Authorization: `Bearer ${token}` }, // CONNECT 헤더에 JWT 전달
      heartbeatIncoming: 10000,
      heartbeatOutgoing: 10000,
      forceBinaryWSFrames: true,
      appendMissingNULLonIncoming: true,
      debug: (str) => console.log('[STOMP Debug]', str),

      onConnect: (frame: Frame) => {
        console.log('[STOMP] CONNECT 성공', frame.headers);
        setIsConnected(true);

        // 구독 + receipt 달기
        const dest = `/topic/chat/${roomId}`;
        const subReceiptId = `sub-${roomId}-${Date.now()}`;
        client.subscribe(
          dest,
          (msg: IMessage) => {
            try {
              const payload = JSON.parse(msg.body) as ChatMessageDto;
              console.log('[STOMP] 수신:', payload);
              setMessages((prev) => [...prev, payload]);
            } catch (e) {
              console.error('[STOMP] JSON 파싱 실패:', e, msg.body);
            }
          },
          { ack: 'auto', receipt: subReceiptId }
        );
        console.log('[STOMP] 구독 요청 보냄 →', dest, 'receiptId=', subReceiptId);

        // (선택) 입장 알림 보내고 싶으면 주석 해제
        client.publish({
          destination: `/app/chat/${roomId}/addUser`,
          headers: { 'content-type': 'application/json', receipt: `pub-enter-${Date.now()}` },
          body: JSON.stringify({ roomId, sender: username, type: 'ENTER' }),
        });
      },

      onStompError: (frame) => {
        console.error('[STOMP] 프로토콜 에러:', frame.headers['message'], frame.body);
      },

      // 열림 콜백은 공식 옵션에 없음 — open 시점은 debug 로그로 확인 가능
      onWebSocketClose: (evt) => {
        console.warn('[STOMP] WebSocket 닫힘:', evt?.code, evt?.reason);
      },
      onWebSocketError: (evt) => {
        console.error('[STOMP] WebSocket 오류:', evt);
      },
      onDisconnect: () => {
        console.log('[STOMP] DISCONNECT 완료');
        setIsConnected(false);
      },
    });

    // receipt 콜백 (정확한 철자 주의!)
    (client as any).onReceipt = (receiptFrame: Frame) => {
  console.log('[RECEIPT]', receiptFrame.headers['receipt-id']);
};

    client.activate();
    clientRef.current = client;

    return () => {
      console.log('[useChatWebSocket] cleanup → deactivate');
      client.deactivate(); // 내부에서 DISCONNECT 전송 + 소켓 종료
      clientRef.current = null;
    };
  }, [roomId, token, username]);

  const sendMessage = (text: string) => {
    if (!text.trim()) return;
    if (!clientRef.current || !isConnected) {
      console.warn('[STOMP] 연결 안 됨 → 전송 불가');
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
    console.log('[STOMP] 전송 요청 보냄, receiptId=', receiptId);
  };

  return { messages, sendMessage, isConnected };
}
