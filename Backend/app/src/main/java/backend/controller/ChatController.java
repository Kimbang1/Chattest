package backend.controller;

import backend.dto.ChatMessageDto;
import backend.service.ChatService; // 서비스 계층 연동
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

import java.security.Principal;

@Controller
@RequiredArgsConstructor
public class ChatController {

    private final ChatService chatService;
    private final SimpMessagingTemplate messagingTemplate;

    // 메시지 전송: 클라이언트 publish 경로 = /app/chat/{roomId}/send
    @MessageMapping("/chat/{roomId}/send")
    public void sendMessage(@DestinationVariable String roomId,
                            @Valid @Payload ChatMessageDto message,
                            Principal principal) {
        // 보안: sender는 서버에서 지정(클라이언트 신뢰 X)
        message.setRoomId(roomId);
        if (principal != null) {
            message.setSender(principal.getName());
        }
        if (message.getSender() == null || message.getSender().isBlank()) {
            throw new IllegalStateException("인증된 발신자 정보가 없습니다.");
        }

        // 타입 미지정 시 TALK로 기본 처리
        if (message.getType() == null) {
            message.setType(ChatMessageDto.MessageType.TALK);
        }

        // 비즈니스 처리(예: 저장, 후처리)
        ChatMessageDto processed = chatService.processMessage(message);

        // 구독자에게 브로드캐스트
        String destination = "/topic/chat/" + roomId;  // 클라이언트 구독 경로와 일치
        messagingTemplate.convertAndSend(destination, processed);
    }

    // 입장 이벤트 브로드캐스트: 클라이언트 publish 경로 = /app/chat/{roomId}/addUser
    @MessageMapping("/chat/{roomId}/addUser")
    public void addUser(@DestinationVariable String roomId,
                        @Valid @Payload ChatMessageDto message,
                        Principal principal) {
        message.setRoomId(roomId);
        message.setType(ChatMessageDto.MessageType.ENTER);
        if (principal != null) {
            message.setSender(principal.getName());
        }
        if (message.getSender() == null || message.getSender().isBlank()) {
            throw new IllegalStateException("인증된 발신자 정보가 없습니다.");
        }
        // 입장 메시지 내용 서버에서 생성
        message.setContent(message.getSender() + "님이 입장하셨습니다.");

        ChatMessageDto processed = chatService.processMessage(message);

        String destination = "/topic/chat/" + roomId;
        messagingTemplate.convertAndSend(destination, processed);
    }
}
