package backend.service;

import backend.dto.auth.JwtAuthenticationResponse;
import backend.dto.auth.LoginRequest;
import backend.dto.auth.SignUpRequest;
import backend.dto.UserDto;
import backend.entity.Role;
import backend.entity.User;
import backend.repository.UserRepository;
import backend.security.JwtTokenProvider; 
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import backend.dto.UserDto; // UserDto import 추가

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;
    private final AuthenticationManager authenticationManager;

    public JwtAuthenticationResponse signup(SignUpRequest request) {
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new IllegalArgumentException("Username already exists");
        }
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("Email already in use");
        }

        var user = User.builder()
                .username(request.getUsername())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(Role.USER) // 기본 Role.USER 할당
                .build();
        userRepository.save(user);
        var jwt = jwtTokenProvider.generateToken(user);
        return JwtAuthenticationResponse.builder().token(jwt).build();
    }

    public JwtAuthenticationResponse login(LoginRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword()));
        var user = userRepository.findByUsername(request.getUsername())
                .orElseThrow(() -> new IllegalArgumentException("Invalid username or password."));
        var jwt = jwtTokenProvider.generateToken(user);
        return JwtAuthenticationResponse.builder().token(jwt).build();
    }

    // 사용자 이름을 받아 UserDto를 반환하는 메서드 추가
    public UserDto getCurrentUserDto(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new IllegalArgumentException("User not found."));
        return new UserDto(user.getId(), user.getUsername());
    }
}
