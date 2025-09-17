package backend.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ChatRoomID {

    private String roomId;
    private String name;
    private String lastMessage;             //마지막 메시지 미리보기
    private String lastMessageAt;           //마지막 메시지 시간
    private int unreadCount;                //안 읽은 메시지 수


    public ChatRoomID(String roomId, String name){
        this.roomId = roomId;
        this.name = name;
    }
}
