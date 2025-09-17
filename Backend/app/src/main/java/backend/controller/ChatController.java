package backend.controller;

import backend.dto.ChatMessageDto;
import backend.service.Chatservice;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.stereotype.Controller;

@Controller
@RequiredArgsConstructor
public class ChatController {

    private final Chatservice chatService;

    // 일반 메시지 전송
    @MessageMapping("/chat/{roomId}/send")      // 클라이언트에서 보낸 경로 (/app/chat/{roomId}/send)
    @SendTo("/topic/chat/{roomId}")            // 구독자들이 받는 경로
    public ChatMessageDto sendMessage(@DestinationVariable String roomId, ChatMessageDto message) {
        message.setRoomId(roomId);
        // 서비스를 통해 메시지 처리
        return chatService.proccessMessage(message);
    }

    // 유저 입장 알림
    @MessageMapping("/chat/{roomId}/addUser")   // 클라이언트에서 보낸 경로 (/app/chat/{roomId}/addUser)
    @SendTo("/topic/chat/{roomId}")            // 구독자들이 받는 경로
    public ChatMessageDto addUser(@DestinationVariable String roomId, ChatMessageDto message) {
        message.setRoomId(roomId);
        message.setContent(message.getSender() + "님이 입장하셨습니다.");
        // 입장 메시지도 필요하다면 서비스에서 처리할 수 있습니다.
        return message;
    }
}
