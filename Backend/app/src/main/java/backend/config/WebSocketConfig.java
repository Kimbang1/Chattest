package backend.config;

import backend.websocket.StompHandler;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Configuration;
import org.springframework.lang.NonNull;
import org.springframework.messaging.simp.config.ChannelRegistration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.scheduling.concurrent.ThreadPoolTaskScheduler;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

@Configuration
@EnableWebSocketMessageBroker
@RequiredArgsConstructor
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    private final StompHandler stompHandler; // JWT 토큰 인증 핸들러

   @Override
public void registerStompEndpoints(StompEndpointRegistry registry) {
         // ✅ 모바일/RN 전용: 순수 WebSocket
        registry.addEndpoint("/ws-stomp")
                .setAllowedOriginPatterns("*");
    }

    @Override
    public void configureMessageBroker(@NonNull MessageBrokerRegistry registry) {
        ThreadPoolTaskScheduler taskScheduler = new ThreadPoolTaskScheduler();
        taskScheduler.setPoolSize(1);
        taskScheduler.setThreadNamePrefix("stomp-heartbeat-");
        taskScheduler.initialize();
        registry.setApplicationDestinationPrefixes("/app");

        registry.enableSimpleBroker("/topic")
                .setHeartbeatValue(new long[]{10000, 10000})
                .setTaskScheduler(taskScheduler);
    }

    @Override
    public void configureClientInboundChannel(@NonNull ChannelRegistration registration) {
        // STOMP 연결 시 JWT 토큰 인증을 위해 인터셉터를 등록합니다.
        registration.interceptors(stompHandler);
    }
}
