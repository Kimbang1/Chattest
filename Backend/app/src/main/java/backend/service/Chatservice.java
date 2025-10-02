package backend.service;

import backend.dto.ChatMessageDto;
import backend.dto.ChatRoomID;

import org.springframework.stereotype.Service;

import java.util.*;


@Service
public class ChatService {

    // 메모리 기반 채팅방 저장(실제 서비스에서 DB로 변경예정)
    private final Map<String, ChatRoomID> ChatRoomIds = new HashMap<>();

    //모든 채팅방 반환
    public Collection<ChatRoomID> getAllRooms(){
        return ChatRoomIds.values();
    }

    //채팅방 생성
    public ChatRoomID createRoom(String name){
        String roomId = UUID.randomUUID().toString();
        ChatRoomID room = new ChatRoomID(roomId, name);
        ChatRoomIds.put(roomId, room);
        return room;
    }

    //특정 채팅방 조회
    public ChatRoomID getRoom(String roomId){
        return ChatRoomIds.get(roomId);
    }

    //메시지 처리(DB 저장 가능)
     public ChatMessageDto processMessage(ChatMessageDto message) {
        // 예: 저장/검증/ID발급/타임스탬프 세팅 등
        if (message.getMessageId() == null) {
            message.setMessageId(UUID.randomUUID().toString());
        }
        if (message.getCreateAt() == null) {
            message.setCreateAt(java.time.LocalDateTime.now().toString());
        }
        message.setContent("[Process] " + message.getContent());
        return message;
    }

    
}
