package backend.controller;


import backend.dto.auth.JwtAuthenticationResponse;
import backend.dto.auth.LoginRequest;
import backend.dto.auth.SignUpRequest;
import backend.dto.UserDto; 
import backend.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping; 
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/signup")
    public ResponseEntity<JwtAuthenticationResponse> signup(@RequestBody SignUpRequest request) {
        return ResponseEntity.ok(authService.signup(request));
    }

    @PostMapping("/login")
    public ResponseEntity<JwtAuthenticationResponse> login(@RequestBody LoginRequest request) {
        System.out.println("로그인시 들어오는 정보:"+ request);
        return ResponseEntity.ok(authService.login(request));
    }

    // 현재 로그인한 사용자 정보를 반환하는 API
    @GetMapping("/me")
    public ResponseEntity<UserDto> getCurrentUser(Authentication authentication) {
        // Authentication 객체에서 사용자 이름을 가져옵니다.
        String username = authentication.getName();
        // AuthService를 통해 사용자 정보를 조회하고 DTO로 변환하여 반환합니다.
        UserDto userDto = authService.getCurrentUserDto(username);
        return ResponseEntity.ok(userDto);
    }
}
