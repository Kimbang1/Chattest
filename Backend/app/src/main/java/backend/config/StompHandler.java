package backend.config;

import backend.security.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
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

    private final JwtTokenProvider jwtTokenProvider;
    private final UserDetailsService userDetailsService;

   @Override
    public Message<?> preSend(Message<?> message, MessageChannel channel) {
    StompHeaderAccessor accessor = StompHeaderAccessor.wrap(message);

        // ✅ 모든 사용자 정의 헤더를 출력하는 올바른 방법
      System.out.println("**Authorization 헤더 값:" + accessor.getFirstNativeHeader("Authorization"));

        if (accessor.getCommand() == null) return message;

        switch (accessor.getCommand()) {
            case CONNECT -> {
                System.out.println("STOMP CONNECT received. Authenticating...");
                authenticate(accessor);
            }
            case SUBSCRIBE -> authorizeSubscribe(accessor);
            case SEND -> authorizeSend(accessor);
            default -> { /* NOP */ }
        }
        return message;
    }

    private void authenticate(StompHeaderAccessor accessor) {
        String token = resolveToken(accessor);
        if (token == null) throw new IllegalArgumentException("인증 토큰이 없습니다.");

        String username = jwtTokenProvider.extractUsername(token);
        if (username == null) throw new IllegalArgumentException("유효하지 않은 토큰입니다.");

        UserDetails userDetails = userDetailsService.loadUserByUsername(username);
        if (!jwtTokenProvider.isTokenValid(token, userDetails)) {
            throw new IllegalArgumentException("토큰 검증 실패");
        }

        UsernamePasswordAuthenticationToken authToken =
                new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities());

        SecurityContextHolder.getContext().setAuthentication(authToken);
        accessor.setUser(authToken); // 이후 @Header("simpUser") 또는 accessor.getUser() 접근 가능
    }

    private void authorizeSubscribe(StompHeaderAccessor accessor) {
        // 예) /topic/room.{roomId} 구독 시, 해당 룸 접근 권한 확인
        var user = accessor.getUser();
        if (user == null) throw new IllegalStateException("인증되지 않은 구독 요청");
        String dest = accessor.getDestination();
        if (dest == null) throw new IllegalArgumentException("구독 대상이 없습니다.");
        // 룸 접근 검증 로직 추가 (예: 룸 멤버십 확인)
    }

    private void authorizeSend(StompHeaderAccessor accessor) {
        var user = accessor.getUser();
        if (user == null) throw new IllegalStateException("인증되지 않은 발행 요청");
        String dest = accessor.getDestination();
        if (dest == null) throw new IllegalArgumentException("발행 대상이 없습니다.");
        // payload의 senderId == user.getName() 같은 매칭 검증 로직 권장
    }

    private String resolveToken(StompHeaderAccessor accessor) {
        // 1) 헤더에서 시도
        String bearer = accessor.getFirstNativeHeader("Authorization");
        System.out.println("Received Authorization header: " + bearer); 

        if (bearer != null && bearer.startsWith("Bearer ")) {
            return bearer.substring(7);
        }
        // 2) SockJS 대응: 쿼리 파라미터 token=? 에서 시도 (옵션)
        String query = accessor.getNativeHeader("queryString") != null
                ? accessor.getFirstNativeHeader("queryString")
                : null;
        if (query != null) {
            for (String p : query.split("&")) {
                String[] kv = p.split("=");
                if (kv.length == 2 && kv[0].equals("token")) return kv[1];
            }
        }
        return null;
    }
}