package backend.config;

import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.ChannelRegistration;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;
import backend.websocket.StompHandler;

@Configuration
@RequiredArgsConstructor
public class StompChannelConfig implements WebSocketMessageBrokerConfigurer {
  private final StompHandler stompHandler;

  @Override
  public void configureClientInboundChannel(ChannelRegistration registration) {
    registration.interceptors(stompHandler); // ★ CONNECT/SUBSCRIBE/SEND 가로채서 JWT 검증
  }
}
