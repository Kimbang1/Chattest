package backend.controller;

import backend.dto.ChatRoomID;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Arrays;
import java.util.List;

@RestController
@RequestMapping("/api/chatrooms")
public class ChatRoomRestController {

    @GetMapping
    public List<ChatRoomID> getChatRooms() {
        // TODO: Implement actual service call to fetch chat rooms from a database or service layer.
        // For now, returning an empty list as hardcoded data has been removed.
        return Arrays.asList();
    }
}
