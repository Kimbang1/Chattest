import { Client, IMessage, StompSubscription } from '@stomp/stompjs';
import { WEBSOCKET_URL } from '@env';

console.log("Native WebSocket URL:", WEBSOCKET_URL);

// 메시지 수신 콜백 타입
interface MessageCallback {
  (message: any): void;
}

/**
 * STOMP 클라이언트를 생성하고 기본 설정을 구성합니다.
 * @param onConnected - 웹소켓 연결 성공 시 호출될 콜백
 * @param onError - 오류 발생 시 호출될 콜백
 * @param token - 인증에 사용할 JWT 토큰
 * @returns {Client} 설정이 완료된 STOMP 클라이언트 객체
 */
export const createStompClient = (onConnected: () => void, onError: (error: any) => void, token?: string): Client => {
  const connectHeaders = token ? { Authorization: `Bearer ${token}` } : undefined;
  console.log('[createStompClient] STOMP 연결 헤더:', connectHeaders);

  const client = new Client({
    brokerURL: WEBSOCKET_URL,
    connectHeaders: connectHeaders,
    debug: (str) => {
      console.log('[STOMP Debug]', new Date(), str);
    },
    reconnectDelay: 3000,
    heartbeatIncoming: 4000,
    heartbeatOutgoing: 4000,
    onConnect: () => {
      console.log('✅ WebSocket Connected');
      onConnected();
    },
    onStompError: (frame) => {
      const errorMessage = frame.headers['message'] || 'STOMP Error';
      console.error('❌ Broker reported error: ' + errorMessage);
      console.error('Additional details: ' + frame.body);
      onError(frame);
    },
    onWebSocketError: (error) => {
      console.error('❌ WebSocket connection error:', error);
      onError(error);
    },
    onWebSocketClose: (event) => {
      console.log('🔌 WebSocket connection closed:', event);
    }
  });

  return client;
};

/**
 * 활성화된 STOMP 클라이언트의 연결을 끊습니다.
 * @param client - 비활성화할 STOMP 클라이언트
 */
export const disconnectWebSocket = (client: Client | null) => {
  if (client) {
    client.deactivate();
    console.log('웹소켓을 종료합니다.');
  }
};

/**
 * 특정 토픽으로 메시지를 전송(publish)합니다.
 * @param client - STOMP 클라이언트
 * @param destination - 메시지를 보낼 주소(토픽)
 * @param message - 전송할 메시지 객체 (JSON으로 변환됨)
 */
export const sendMessage = (client: Client | null, destination: string, message: any) => {
  if (client && client.connected) {
    client.publish({ destination, body: JSON.stringify(message) });
  } else {
    console.warn('Cannot send message: WebSocket not connected');
  }
};

/**
 * 특정 토픽을 구독하여 메시지를 수신합니다.
 * @param client - STOMP 클라이언트
 * @param topic - 구독할 주소(토픽)
 * @param callback - 메시지 수신 시 호출될 콜백 함수
 * @returns {StompSubscription | null} 구독 객체 (나중에 구독 취소 시 사용)
 */
export const subscribeToTopic = (client: Client | null, topic: string, callback: MessageCallback): StompSubscription | null => {
  if (client && client.connected) {
    console.log(`Subscribing to topic: ${topic}`);
    return client.subscribe(topic, (message: IMessage) => {
      callback(JSON.parse(message.body));
    });
  } else {
    console.warn(`Cannot subscribe to topic "${topic}": WebSocket not connected`);
    return null;
  }
};

/**
 * 토픽 구독을 취소합니다.
 * @param subscription - 구독 취소할 StompSubscription 객체
 */
export const unsubscribeFromTopic = (subscription: StompSubscription | null) => {
  if (subscription) {
    subscription.unsubscribe();
    console.log('Unsubscribed from topic');
  }
};