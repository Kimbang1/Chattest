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


@Component
@RequiredArgsConstructor
public class StompHandler implements ChannelInterceptor {

    private static final Logger log = LoggerFactory.getLogger(StompHandler.class);
    private final JwtTokenProvider jwtTokenProvider;
    private final UserDetailsService userDetailsService;

    @Override
    public Message<?> preSend(Message<?> message, MessageChannel channel) {
        StompHeaderAccessor accessor = StompHeaderAccessor.wrap(message);
        log.debug("STOMP 요청 수신. Command: {}, Headers: {}", accessor.getCommand(), accessor.toNativeHeaderMap());

        if (accessor.getCommand() == null) {
            log.warn("STOMP Command가 null입니다. 메시지 처리 건너뜀.");
            return message;
        }

        switch (accessor.getCommand()) {
            case CONNECT:
                log.info("STOMP CONNECT 요청. 전체 헤더: {}", accessor.toNativeHeaderMap());
                try {
                    String token = resolveToken(accessor);
                    log.info("토큰 추출 결과: {}", (token != null && !token.isBlank()) ? token : "없음");
                    authenticate(accessor, token);
                    log.info("STOMP CONNECT 인증 성공");
                } catch (Exception e) {
                    log.error("STOMP CONNECT 인증 실패: {}", e.getMessage(), e);
                    throw new IllegalStateException("STOMP CONNECT 인증 실패: " + e.getMessage(), e);
                }
                break;
            case SUBSCRIBE:
                log.info("STOMP SUBSCRIBE 요청. User: {}", (accessor.getUser() != null ? accessor.getUser().getName() : "null"));
                authorizeSubscribe(accessor);
                break;
            case SEND:
                log.info("STOMP SEND 요청. User: {}", (accessor.getUser() != null ? accessor.getUser().getName() : "null"));
                authorizeSend(accessor);
                break;
            case DISCONNECT:
                log.info("STOMP DISCONNECT 요청. User: {}", (accessor.getUser() != null ? accessor.getUser().getName() : "null"));
                break;
            default:
                log.info("처리되지 않은 STOMP Command: {}", accessor.getCommand());
                break;
        }
        return message;
    }

    private void authenticate(StompHeaderAccessor accessor, String token) {
        if (token == null || token.isBlank()) {
            log.error("인증 토큰이 없습니다. STOMP 연결 거부.");
            throw new IllegalArgumentException("인증 토큰이 없습니다.");
        }

        try {
            String username = jwtTokenProvider.extractUsername(token);
            log.debug("토큰에서 추출된 사용자 이름: {}", username);
            if (username == null) {
                log.error("토큰에서 사용자 이름을 추출할 수 없습니다.");
                throw new IllegalArgumentException("유효하지 않은 토큰: 사용자 이름 추출 실패");
            }

            UserDetails userDetails = userDetailsService.loadUserByUsername(username);
            log.debug("UserDetails 로드 성공: {}", userDetails.getUsername());

            if (!jwtTokenProvider.isTokenValid(token, userDetails)) {
                log.error("토큰 검증 실패: {}", token);
                throw new IllegalArgumentException("토큰 검증에 실패했습니다.");
            }
            log.debug("토큰 유효성 검증 성공: {}", username);

            UsernamePasswordAuthenticationToken authToken =
                    new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities());
            SecurityContextHolder.getContext().setAuthentication(authToken);
            accessor.setUser(authToken);
            log.info("SecurityContext 및 웹소켓 세션에 사용자 인증 정보 저장: {}", username);
        } catch (Exception e) {
            log.error("인증 과정에서 예외 발생: {}", e.getMessage(), e);
            throw new IllegalArgumentException("인증 실패: " + e.getMessage(), e);
        }
    }

    private void authorizeSubscribe(StompHeaderAccessor accessor) {
        String destination = accessor.getDestination();
        if (destination == null) {
            log.error("구독 대상이 지정되지 않았습니다.");
            throw new IllegalArgumentException("구독 대상이 지정되지 않았습니다.");
        }
        log.info("구독 권한 확인: user={}, dest={}", 
                 (accessor.getUser() != null ? accessor.getUser().getName() : "anonymous"), destination);
    }

    private void authorizeSend(StompHeaderAccessor accessor) {
        String destination = accessor.getDestination();
        if (destination == null) {
            log.error("발행 대상이 지정되지 않았습니다.");
            throw new IllegalArgumentException("발행 대상이 지정되지 않았습니다.");
        }
        log.info("발행 권한 확인: user={}, dest={}", 
                 (accessor.getUser() != null ? accessor.getUser().getName() : "anonymous"), destination);
    }

    private String resolveToken(StompHeaderAccessor accessor) {
        String bearerToken = accessor.getFirstNativeHeader("Authorization");
        log.debug("Authorization 헤더: {}", bearerToken);

        if (bearerToken != null && bearerToken.startsWith("Bearer ")) {
            String token = bearerToken.substring(7);
            log.debug("토큰 추출 성공: {}", token);
            return token;
        }

        log.warn("유효한 Bearer 토큰이 없습니다. 헤더: {}", bearerToken);
        return null;
    }
}
