package backend.controller;

import backend.dto.ChatMessageDto;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.stereotype.Controller;
import org.springframework.messaging.handler.annotation.DestinationVariable;

@Controller
public class ChatController{

   // 일반 메시지 전송
    @MessageMapping("/chat/{roomId}/send")      // 클라이언트에서 보낸 경로 (/app/chat/{roomId}/send)
    @SendTo("/topic/chat/{roomId}")            // 구독자들이 받는 경로
    public ChatMessageDto sendMessage(@DestinationVariable String roomId, ChatMessageDto message) {
        message.setRoomId(roomId);
        return message;
    }

    // 유저 입장 알림
    @MessageMapping("/chat/{roomId}/addUser")   // 클라이언트에서 보낸 경로 (/app/chat/{roomId}/addUser)
    @SendTo("/topic/chat/{roomId}")            // 구독자들이 받는 경로
    public ChatMessageDto addUser(@DestinationVariable String roomId, ChatMessageDto message) {
        message.setRoomId(roomId);
        message.setContent(message.getSender() + "님이 입장하셨습니다.");
        return message;
    }
}