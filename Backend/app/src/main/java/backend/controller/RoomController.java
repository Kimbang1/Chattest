package backend.controller;
import backend.dto.ChatMessageDto;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.stereotype.Controller;

@Controller
public class RoomController {

    //일반 메시지 전송
    @MessageMapping("/chat.sendMessage") //클라이언트에서 보낸 경로(/app/chat.sendMessage)
    @SendTo("/topic/public")             //구독자들이 받는 경로
    public ChatMessageDto sendMessage(ChatMessageDto message){
        return message;
    }

    //유저 입장 알림
    @MessageMapping("/chat.addUser")    //클라이언트에서 보낸 경로(/app/chat.addUSer)
    @SendTo("/topic/public")            //구독자들이 받는 경로
    public ChatMessageDto addUser(ChatMessageDto message){
        message.setContent(message.getSender() + "님이 입장하셨습니다.");
        return message;
    }
}
