package backend.controller;

import backend.dto.ChatMessageDto;
import backend.service.ChatService; // 네 서비스 타입 그대로 사용
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

import java.security.Principal;

@Controller
@RequiredArgsConstructor
public class ChatController {

    private final ChatService chatService;
    private final SimpMessagingTemplate messagingTemplate;

    // 메시지 전송: 클라 publish 경로 = /app/chat/{roomId}/send
    @MessageMapping("/chat/{roomId}/send")
    public void sendMessage(@DestinationVariable String roomId,
                            ChatMessageDto message,
                            Principal principal) {
        // 보안: sender는 서버에서 확정(클라 값 신뢰 X)
        message.setRoomId(roomId);
        if (principal != null) {
            message.setSender(principal.getName());
        }

        // 필요시 타입 기본값
        if (message.getType() == null) {
            message.setType(ChatMessageDto.MessageType.TALK);
        }

        // 비즈니스 처리(저장/필터링/읽음 처리 등)
        ChatMessageDto processed = chatService.processMessage(message); 

        // 구독자에게 브로드캐스트
        String destination = "/topic/chat/" + roomId;  // 클라 구독 경로와 일치
        messagingTemplate.convertAndSend(destination, processed);
    }

    // 유저 입장 알림: 클라 publish 경로 = /app/chat/{roomId}/addUser
    @MessageMapping("/chat/{roomId}/addUser")
    public void addUser(@DestinationVariable String roomId,
                        ChatMessageDto message,
                        Principal principal) {
        message.setRoomId(roomId);
        message.setType(ChatMessageDto.MessageType.ENTER);
        if (principal != null) {
            message.setSender(principal.getName());
        }
        // 입장 메시지 내용(서버에서 생성)
        message.setContent(message.getSender() + "님이 입장하셨습니다.");

        ChatMessageDto processed = chatService.processMessage(message);

        String destination = "/topic/chat/" + roomId;
        messagingTemplate.convertAndSend(destination, processed);
    }
}
