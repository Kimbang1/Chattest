package backend.config;

import lombok.NonNull;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.ChannelRegistration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.scheduling.concurrent.ThreadPoolTaskScheduler;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;
import backend.websocket.StompHandler;

@Configuration
@EnableWebSocketMessageBroker
@RequiredArgsConstructor
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    // STOMP CONNECT에서 JWT 검증
    private final StompHandler stompHandler;

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        registry.addEndpoint("/ws-stomp")
                .setAllowedOriginPatterns("*")
                .withSockJS();
    }

    @Override
    public void configureMessageBroker(@NonNull MessageBrokerRegistry registry) {
        // 클라이언트 -> 서버로 publish할 때 쓰는 prefix
        registry.setApplicationDestinationPrefixes("/app");
        // 서버 -> 클라이언트로 broadcast할 때 쓰는 prefix
        registry.enableSimpleBroker("/topic", "/queue");

        // 유저별 DM(선택) 필요하면 주석 해제
        registry.setUserDestinationPrefix("/user");

        // 하트비트 스케줄러 (선택이지만, 이미 사용하길 원해서 유지)
        ThreadPoolTaskScheduler scheduler = new ThreadPoolTaskScheduler();
        scheduler.setPoolSize(1);
        scheduler.setThreadNamePrefix("stomp-heartbeat-");
        scheduler.initialize();
        registry.enableSimpleBroker("/topic", "/queue")
                .setHeartbeatValue(new long[]{10000, 10000})
                .setTaskScheduler(scheduler);
    }

    @Override
    public void configureClientInboundChannel(@NonNull ChannelRegistration registration) {
        // CONNECT/SUBSCRIBE/SEND 인터셉트하여 JWT 검증
        registration.interceptors(stompHandler);
    }
}
