package backend.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        // 1. 엔드포인트 설정: 클라이언트가 연결할 접속 지점
        // 이 경로로 처음 웹소켓 핸드셰이크가 이루어집니다. (예: ws://localhost:8080/ws-stomp)
        registry.addEndpoint("/ws-stomp")
                .setAllowedOriginPatterns("*") // 모든 출처에서의 CORS 허용
                .withSockJS(); // SockJS를 사용하여 브라우저 호환성 향상
    }

    @Override
    public void configureMessageBroker(MessageBrokerRegistry registry) {
        // 2. 메시지 브로커 설정
        // "/topic"으로 시작하는 경로를 구독하는 클라이언트에게 메시지를 전달합니다.
        registry.enableSimpleBroker("/topic");

        // "/app"으로 시작하는 경로로 들어온 메시지는 @MessageMapping이 붙은 메서드로 라우팅됩니다.
        registry.setApplicationDestinationPrefixes("/app");
    }
}
