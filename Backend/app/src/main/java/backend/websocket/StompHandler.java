package backend.websocket; // 패키지 경로는 실제 프로젝트에 맞게 확인하세요.

import backend.security.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class StompHandler implements ChannelInterceptor {

    private static final Logger log = LoggerFactory.getLogger(StompHandler.class);
    private final JwtTokenProvider jwtTokenProvider;
    private final UserDetailsService userDetailsService;

    @Override
    public Message<?> preSend(Message<?> message, MessageChannel channel) {
        StompHeaderAccessor accessor = StompHeaderAccessor.wrap(message);
        StompCommand command = accessor.getCommand();

        if (command == null) {
            return message;
        }

        switch (command) {
            case CONNECT -> {
                log.info("STOMP CONNECT 요청 수신");
                try {
                    String token = resolveToken(accessor);
                    authenticate(accessor, token);
                } catch (Exception e) {
                    // 인증 실패 시, 서버 로그에 명확한 에러 메시지 출력
                    log.error("STOMP-CONNECT 인증 실패: {}", e.getMessage());
                    // 예외를 다시 던져 연결을 중단시킬 수 있습니다.
                    // 또는 클라이언트에게 ERROR 프레임을 보낼 수도 있습니다.
                    // 여기서는 로그만 남기고 연결을 거부하도록 합니다. (예외 발생 시 연결 중단됨)
                    throw e;
                }
            }
            case SUBSCRIBE -> {
                log.info("STOMP SUBSCRIBE 요청 수신");
                authorizeSubscribe(accessor);
            }
            case SEND -> {
                log.info("STOMP SEND 요청 수신");
                authorizeSend(accessor);
            }
            case DISCONNECT -> {
                log.info("STOMP DISCONNECT 요청 수신");
            }
            default -> {}
        }
        return message;
    }

    /**
     * STOMP CONNECT 단계에서 클라이언트를 인증합니다.
     */
    private void authenticate(StompHeaderAccessor accessor, String token) {
        if (token == null || token.isBlank()) {
            throw new IllegalArgumentException("인증 토큰이 없습니다.");
        }

        String username = jwtTokenProvider.extractUsername(token);
        if (username == null) {
            throw new IllegalArgumentException("유효하지 않은 토큰입니다.");
        }

        UserDetails userDetails = userDetailsService.loadUserByUsername(username);
        if (!jwtTokenProvider.isTokenValid(token, userDetails)) {
            throw new IllegalArgumentException("토큰 검증에 실패했습니다.");
        }

        UsernamePasswordAuthenticationToken authToken =
                new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities());

        SecurityContextHolder.getContext().setAuthentication(authToken);
        accessor.setUser(authToken); // 웹소켓 세션에 인증 정보 저장
        log.info("사용자 인증 성공: {}", username);
    }

    /**
     * STOMP SUBSCRIBE 단계에서 구독 권한을 확인합니다.
     */
    private void authorizeSubscribe(StompHeaderAccessor accessor) {
        if (accessor.getUser() == null) {
            throw new IllegalStateException("인증되지 않은 사용자의 구독 요청입니다.");
        }
        String destination = accessor.getDestination();
        if (destination == null) {
            throw new IllegalArgumentException("구독 대상이 지정되지 않았습니다.");
        }
        // TODO: 사용자가 destination에 구독할 권한이 있는지 비즈니스 로직 추가
        log.debug("구독 권한 확인: user={}, dest={}", accessor.getUser().getName(), destination);
    }

    /**
     * STOMP SEND 단계에서 메시지 발행 권한을 확인합니다.
     */
    private void authorizeSend(StompHeaderAccessor accessor) {
        if (accessor.getUser() == null) {
            throw new IllegalStateException("인증되지 않은 사용자의 발행 요청입니다.");
        }
        String destination = accessor.getDestination();
        if (destination == null) {
            throw new IllegalArgumentException("발행 대상이 지정되지 않았습니다.");
        }
        // TODO: 사용자가 destination에 메시지를 보낼 권한이 있는지 비즈니스 로직 추가
        log.debug("발행 권한 확인: user={}, dest={}", accessor.getUser().getName(), destination);
    }

    /**
     * 헤더 또는 쿼리 파라미터에서 JWT 토큰을 추출합니다.
     */
    private String resolveToken(StompHeaderAccessor accessor) {
        // 1. Authorization 헤더에서 토큰 찾기
        String bearerToken = accessor.getFirstNativeHeader("Authorization");
        log.debug("Authorization 헤더: {}", bearerToken);
        if (bearerToken != null && bearerToken.startsWith("Bearer ")) {
            return bearerToken.substring(7);
        }

        // 2. (옵션) 쿼리 파라미터에서 토큰 찾기 (SockJS 구 버전 호환)
        String query = accessor.getFirstNativeHeader("queryString");
        if (query != null) {
            log.debug("쿼리 스트링: {}", query);
            for (String param : query.split("&")) {
                String[] pair = param.split("=");
                if (pair.length == 2 && pair[0].equals("token")) {
                    return pair[1];
                }
            }
        }
        return null;
    }
}