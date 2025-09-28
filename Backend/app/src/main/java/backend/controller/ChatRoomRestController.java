package backend.controller;

import backend.dto.ChatRoomID;
import backend.entity.ChatRoom;
import backend.entity.User;
import backend.service.ChatRoomService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/chatrooms")
@RequiredArgsConstructor
public class ChatRoomRestController {

    private final ChatRoomService chatRoomService;

    @GetMapping
    public List<ChatRoomID> getChatRooms() {
        return chatRoomService.findAllRooms();
    }

    @PostMapping
    public ChatRoom createChatRoom(@RequestParam String name) {
        return chatRoomService.createChatRoom(name);
    }

@PostMapping("/private")
public ChatRoom findOrCreatePrivateChatRoom(
        @AuthenticationPrincipal User currentUser,
        @RequestBody Map<String, String> payload) {

    String username = payload.get("username"); // 상대방
    return chatRoomService.findOrCreatePrivateChatRoom(currentUser.getUsername(), username);
}

}
