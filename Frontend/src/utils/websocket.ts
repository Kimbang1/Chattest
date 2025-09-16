import { Client, IMessage, StompSubscription } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { WEBSOCKET_URL } from '@env'; // .env 파일에서 API_BASE_URL을 가져옵니다.

/**
 * SockJS는 http/https 프로토콜로 연결을 시작하므로,
 * API_BASE_URL이 'http://...' 또는 'https://...' 형태인지 확인하세요.
 */
console.log("SockJS의 웹소켓 URL:", WEBSOCKET_URL);

// 메시지 수신 콜백 타입
interface MessageCallback {
  (message: any): void;
}

/**
 * STOMP 클라이언트를 생성하고 기본 설정을 구성합니다.
 * @param onConnected - 웹소켓 연결 성공 시 호출될 콜백
 * @param onError - 오류 발생 시 호출될 콜백
 * @returns {Client} 설정이 완료된 STOMP 클라이언트 객체
 */
export const createStompClient = (onConnected: () => void, onError: (error: any) => void, token?: string): Client => {
  const client = new Client({
    webSocketFactory: () => new SockJS(WEBSOCKET_URL),
    connectHeaders: token ? { Authorization: `Bearer ${token}` } : {},
    debug: (str) => {
      console.log(new Date(), str);
    },

    // 연결이 끊겼을 때 3초마다 재연결을 시도합니다.
    reconnectDelay: 3000,
    heartbeatIncoming: 4000,
    heartbeatOutgoing: 4000,

    // 연결 성공 시 onConnected 콜백을 호출합니다.
    onConnect: () => {
      console.log('✅ WebSocket Connected');
      onConnected();
    },
    
    // STOMP 프로토콜 오류 발생 시 호출됩니다.
    onStompError: (frame) => {
      const errorMessage = frame.headers['message'] || 'STOMP Error';
      console.error('❌ Broker reported error: ' + errorMessage);
      console.error('Additional details: ' + frame.body);
      onError(frame);
    },

    // 웹소켓 자체의 연결 오류 발생 시 호출됩니다.
    onWebSocketError: (error) => {
      console.error('❌ WebSocket connection error:', error);
      onError(error);
    },

    // 웹소켓 연결이 닫혔을 때 호출됩니다.
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