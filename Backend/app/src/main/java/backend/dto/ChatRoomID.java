package backend.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ChatRoomID {

    private String roomId;
    private String name;


    public ChatRoomID(String roomId, String name){
        this.roomId = roomId;
        this.name = name;
    }
}
