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

    public List<ChatRoomID> findAllRooms() {
        return chatRoomRepository.findAll().stream()
                .map(chatRoom -> new ChatRoomID(chatRoom.getRoomId(), chatRoom.getName()))
                .collect(Collectors.toList());
    }

    @Transactional
    public ChatRoom createChatRoom(String name) {
        ChatRoom chatRoom = ChatRoom.builder()
                .name(name)
                .isPrivate(false)
                .build();
        return chatRoomRepository.save(chatRoom);
    }

    @Transactional
    public ChatRoom findOrCreatePrivateChatRoom(Long userId1, Long userId2) {
        User user1 = userRepository.findById(userId1).orElseThrow(() -> new RuntimeException("User not found with id: " + userId1));
        User user2 = userRepository.findById(userId2).orElseThrow(() -> new RuntimeException("User not found with id: " + userId2));

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
