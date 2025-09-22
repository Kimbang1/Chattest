package backend.websocket; // 패키지 경로는 실제 프로젝트에 맞게 확인하세요.

import backend.security.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

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

@Slf4j
@Component
@RequiredArgsConstructor
public class StompHandler implements ChannelInterceptor {

    private static final Logger log = LoggerFactory.getLogger(StompHandler.class);
    private final JwtTokenProvider jwtTokenProvider;
    private final UserDetailsService userDetailsService;

    @Override
    public Message<?> preSend(Message<?> message, MessageChannel channel) {
        StompHeaderAccessor accessor = StompHeaderAccessor.wrap(message);
        log.info("STOMP Command{}",accessor.getCommand());
        StompCommand command = accessor.getCommand();

        log.info("STOMP 요청 수신. Command: {}, Headers: {}", command, accessor.toNativeHeaderMap());


        if (command == null) {
            return message;
        }

        switch (command) {
            case CONNECT -> {
                log.info("STOMP CONNECT 요청 처리 시작");
                try {
                    String token = resolveToken(accessor);
                    log.info("토큰 추출 시도. 추출된 토큰: {}", (token != null && !token.isBlank()) ? "있음" : "없음");
                    authenticate(accessor, token);
                    log.info("STOMP CONNECT 인증 성공");
                } catch (Exception e) {
                    log.error("STOMP-CONNECT 인증 실패: {}", e.getMessage(), e);
                    throw e;
                }
            }
            case SUBSCRIBE -> {
                log.info("STOMP SUBSCRIBE 요청 수신. User: {}", (accessor.getUser() != null ? accessor.getUser().getName() : "null"));
                authorizeSubscribe(accessor);
            }
            case SEND -> {
                log.info("STOMP SEND 요청 수신. User: {}", (accessor.getUser() != null ? accessor.getUser().getName() : "null"));
                authorizeSend(accessor);
            }
            case DISCONNECT -> {
                log.info("STOMP DISCONNECT 요청 수신. User: {}", (accessor.getUser() != null ? accessor.getUser().getName() : "null"));
            }
            default -> {
                log.info("처리되지 않은 STOMP Command: {}", command);
            }
        }
        return message;
    }

    /**
     * STOMP CONNECT 단계에서 클라이언트를 인증합니다.
     */
    private void authenticate(StompHeaderAccessor accessor, String token) {
        if (token == null || token.isBlank()) {
            log.warn("인증 토큰이 없습니다. 익명 사용자로 연결합니다.");
            return;
        }

        String username = jwtTokenProvider.extractUsername(token);
        log.info("토큰에서 추출된 사용자 이름: {}", username);
        if (username == null) {
            throw new IllegalArgumentException("유효하지 않은 토큰입니다. 사용자 이름을 추출할 수 없습니다.");
        }

        UserDetails userDetails = userDetailsService.loadUserByUsername(username);
        log.info("UserDetails 로드 성공. 사용자: {}", userDetails.getUsername());

        if (!jwtTokenProvider.isTokenValid(token, userDetails)) {
            throw new IllegalArgumentException("토큰 검증에 실패했습니다.");
        }
        log.info("토큰 유효성 검증 성공.");

        UsernamePasswordAuthenticationToken authToken =
                new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities());

        SecurityContextHolder.getContext().setAuthentication(authToken);
        accessor.setUser(authToken); // 웹소켓 세션에 인증 정보 저장
        log.info("SecurityContext 및 웹소켓 세션에 사용자 인증 정보 저장 성공: {}", username);
    }

    /**
     * STOMP SUBSCRIBE 단계에서 구독 권한을 확인합니다.
     */
    private void authorizeSubscribe(StompHeaderAccessor accessor) {
        /*if (accessor.getUser() == null) {
            log.warn("인증되지 않은 사용자의 구독 요청입니다. Destination: {}", accessor.getDestination());
            throw new IllegalStateException("인증되지 않은 사용자의 구독 요청입니다.");
        }*/
        String destination = accessor.getDestination();
        if (destination == null) {
            throw new IllegalArgumentException("구독 대상이 지정되지 않았습니다.");
        }
        // TODO: 사용자가 destination에 구독할 권한이 있는지 비즈니스 로직 추가
        log.info("구독 권한 확인: user={}, dest={}", (accessor.getUser() != null ? accessor.getUser().getName() : "anonymous"), destination);
    }

    /**
     * STOMP SEND 단계에서 메시지 발행 권한을 확인합니다.
     */
    private void authorizeSend(StompHeaderAccessor accessor) {
        /*if (accessor.getUser() == null) {
            log.warn("인증되지 않은 사용자의 발행 요청입니다. Destination: {}", accessor.getDestination());
            throw new IllegalStateException("인증되지 않은 사용자의 발행 요청입니다.");
        }*/
        String destination = accessor.getDestination();
        if (destination == null) {
            throw new IllegalArgumentException("발행 대상이 지정되지 않았습니다.");
        }
        // TODO: 사용자가 destination에 메시지를 보낼 권한이 있는지 비즈니스 로직 추가
        log.info("발행 권한 확인: user={}, dest={}", (accessor.getUser() != null ? accessor.getUser().getName() : "anonymous"), destination);
    }

    /**
     * 헤더 또는 쿼리 파라미터에서 JWT 토큰을 추출합니다.
     */
    private String resolveToken(StompHeaderAccessor accessor) {
        // 1. Authorization 헤더에서 토큰 찾기
        String bearerToken = accessor.getFirstNativeHeader("Authorization");
        log.debug("Authorization 헤더에서 토큰 추출 시도. 헤더 값: {}", bearerToken);
        if (bearerToken != null && bearerToken.startsWith("Bearer ")) {
            String token = bearerToken.substring(7);
            log.info("Authorization 헤더에서 토큰 발견.");
            return token;
        }

        // 2. (옵션) 쿼리 파라미터에서 토큰 찾기 (SockJS 구 버전 호환)
        String query = accessor.getFirstNativeHeader("queryString");
        if (query != null) {
            log.debug("쿼리 스트링에서 토큰 추출 시도. 쿼리: {}", query);
            for (String param : query.split("&")) {
                String[] pair = param.split("=");
                if (pair.length == 2 && pair[0].equals("token")) {
                    log.info("쿼리 파라미터에서 토큰 발견.");
                    return pair[1];
                }
            }
        }
        log.warn("Authorization 헤더와 쿼리 파라미터에서 토큰을 찾을 수 없습니다.");
        return null;
    }
}
