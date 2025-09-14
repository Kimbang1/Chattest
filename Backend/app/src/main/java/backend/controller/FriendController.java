package backend.controller;

import backend.dto.FriendDto;
import backend.dto.UserDto;
import backend.service.FriendService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/friends")
@RequiredArgsConstructor
public class FriendController {

    private final FriendService friendService;

    // 현재 로그인한 사용자 정보를 가져옵니다.
    private String getCurrentUsername() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        return authentication.getName();
    }

    // 모든 사용자 목록 조회 (자기 자신 제외)
    @GetMapping("/users")
    public ResponseEntity<List<UserDto>> getAllUsers() {
        String currentUsername = getCurrentUsername();
        return ResponseEntity.ok(friendService.getAllUsers(currentUsername));
    }

    // 친구 요청 보내기
    @PostMapping("/request/{receiverUsername}")
    public ResponseEntity<Void> sendFriendRequest(@PathVariable String receiverUsername) {
        String requesterUsername = getCurrentUsername();
        friendService.sendFriendRequest(requesterUsername, receiverUsername);
        return ResponseEntity.ok().build();
    }

    // 친구 요청 수락
    @PostMapping("/accept/{friendshipId}")
    public ResponseEntity<Void> acceptFriendRequest(@PathVariable Long friendshipId) {
        friendService.acceptFriendRequest(friendshipId);
        return ResponseEntity.ok().build();
    }

    // 친구 요청 거절
    @PostMapping("/decline/{friendshipId}")
    public ResponseEntity<Void> declineFriendRequest(@PathVariable Long friendshipId) {
        friendService.declineFriendRequest(friendshipId);
        return ResponseEntity.ok().build();
    }

    // 내 친구 목록 조회
    @GetMapping
    public ResponseEntity<List<FriendDto>> getFriends() {
        String currentUsername = getCurrentUsername();
        return ResponseEntity.ok(friendService.getFriends(currentUsername));
    }

    // 내가 받은 친구 요청 목록 조회
    @GetMapping("/pending")
    public ResponseEntity<List<FriendDto>> getPendingRequests() {
        String currentUsername = getCurrentUsername();
        return ResponseEntity.ok(friendService.getPendingRequests(currentUsername));
    }
}
