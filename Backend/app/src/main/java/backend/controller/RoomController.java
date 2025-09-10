package backend.controller;
import backend.dto.ChatMessageDto;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

@Controller
public class RoomController {

    private final SimpMessagingTemplate messagingTemplate;

    @Autowired
    public RoomController(SimpMessagingTemplate messagingTemplate) {
        this.messagingTemplate = messagingTemplate;
    }

    //일반 메시지 전송
    @MessageMapping("/chat.sendMessage") //클라이언트에서 보낸 경로(/app/chat.sendMessage)
    public void sendMessage(ChatMessageDto message){
        messagingTemplate.convertAndSend("/topic/chat/" + message.getRoomId(), message);
    }

    //유저 입장 알림
    @MessageMapping("/chat.addUser")    //클라이언트에서 보낸 경로(/app/chat.addUSer)
    public void addUser(ChatMessageDto message){
        message.setContent(message.getSender() + "님이 입장하셨습니다.");
        messagingTemplate.convertAndSend("/topic/chat/" + message.getRoomId(), message);
    }
}
