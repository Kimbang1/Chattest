package backend.service;

import backend.dto.ChatRoomID;
import backend.entity.ChatRoom;
import backend.entity.User;
import backend.repository.ChatRoomRepository;
import backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ChatRoomService {

    private final ChatRoomRepository chatRoomRepository;
    private final UserRepository userRepository;

    /** 모든 채팅방 조회 */
    public List<ChatRoomID> findAllRooms() {
        return chatRoomRepository.findAll().stream()
                .map(chatRoom -> new ChatRoomID(chatRoom.getRoomId(), chatRoom.getName()))
                .collect(Collectors.toList());
    }

    /** 공개 채팅방 생성 */
    @Transactional
    public ChatRoom createChatRoom(String name) {
        ChatRoom chatRoom = ChatRoom.builder()
                .name(name)
                .isPrivate(false)
                .build();
        return chatRoomRepository.save(chatRoom);
    }

    /** 
     * 두 사용자의 username을 기준으로 1:1 채팅방 조회 또는 생성 
     * - username1 : 현재 로그인한 사용자
     * - username2 : 상대방 사용자
     */
    @Transactional
    public ChatRoom findOrCreatePrivateChatRoom(String username1, String username2) {
        User user1 = userRepository.findByUsername(username1)
                .orElseThrow(() -> new RuntimeException("User not found with username: " + username1));
        User user2 = userRepository.findByUsername(username2)
                .orElseThrow(() -> new RuntimeException("User not found with username: " + username2));

        // 기존 방 있으면 반환, 없으면 새로 생성
        return chatRoomRepository.findPrivateChatRoomByParticipants(user1, user2)
                .orElseGet(() -> {
                    Set<User> participants = new HashSet<>();
                    participants.add(user1);
                    participants.add(user2);

                    ChatRoom newChatRoom = ChatRoom.builder()
                            .name(user1.getUsername() + ", " + user2.getUsername())
                            .isPrivate(true)
                            .participants(participants)
                            .build();

                    return chatRoomRepository.save(newChatRoom);
                });
    }
}
