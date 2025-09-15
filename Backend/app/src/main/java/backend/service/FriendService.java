package backend.service;

import backend.dto.FriendDto;
import backend.dto.UserDto;
import backend.entity.Friend;
import backend.entity.FriendshipStatus;
import backend.entity.User;
import backend.repository.FriendRepository;
import backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;
import java.util.stream.Stream;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class FriendService {

    private final UserRepository userRepository;
    private final FriendRepository friendRepository;

    // 모든 사용자 목록 조회 (자기 자신 제외)
    public List<UserDto> getAllUsers(String currentUsername) {
        User currentUser = userRepository.findByUsername(currentUsername)
                .orElseThrow(() -> new RuntimeException("Current user not found"));
        return userRepository.findAll().stream()
                .filter(user -> !user.equals(currentUser))
                .map(user -> new UserDto(user.getId(), user.getUsername()))
                .collect(Collectors.toList());
    }

    // 친구 요청 보내기
    @Transactional
    public void sendFriendRequest(String requesterUsername, String receiverUsername) {
        User requester = userRepository.findByUsername(requesterUsername).orElseThrow(() -> new RuntimeException("Requester not found"));
        User receiver = userRepository.findByUsername(receiverUsername).orElseThrow(() -> new RuntimeException("Receiver not found"));

        // 이미 친구 관계가 있는지 확인
        if (friendRepository.findByRequesterAndReceiver(requester, receiver).isPresent() ||
            friendRepository.findByRequesterAndReceiver(receiver, requester).isPresent()) {
            throw new RuntimeException("Friend request already exists or they are already friends.");
        }

        Friend friendRequest = Friend.builder()
                .requester(requester)
                .receiver(receiver)
                .status(FriendshipStatus.PENDING)
                .build();
        friendRepository.save(friendRequest);
    }

    // 친구 요청 수락
    @Transactional
    public void acceptFriendRequest(Long friendshipId) {
        Friend friend = friendRepository.findById(friendshipId).orElseThrow(() -> new RuntimeException("Friendship not found"));
        friend.setStatus(FriendshipStatus.ACCEPTED);
        friendRepository.save(friend);

        // Check if reciprocal friendship already exists
        friendRepository.findByRequesterAndReceiver(friend.getReceiver(), friend.getRequester()).ifPresentOrElse(
            existingFriend -> {
                existingFriend.setStatus(FriendshipStatus.ACCEPTED);
                friendRepository.save(existingFriend);
            },
            () -> {
                Friend reciprocalFriend = Friend.builder()
                        .requester(friend.getReceiver())
                        .receiver(friend.getRequester())
                        .status(FriendshipStatus.ACCEPTED)
                        .build();
                friendRepository.save(reciprocalFriend);
            }
        );
    }

    // 친구 요청 거절
    @Transactional
    public void declineFriendRequest(Long friendshipId) {
        friendRepository.deleteById(friendshipId);
    }

    @Transactional
    public void unfriend(Long friendshipId) {
        Friend friend1 = friendRepository.findById(friendshipId).orElseThrow(() -> new RuntimeException("Friendship not found"));
        User user1 = friend1.getRequester();
        User user2 = friend1.getReceiver();

        Friend friend2 = friendRepository.findByRequesterAndReceiver(user2, user1).orElseThrow(() -> new RuntimeException("Friendship not found"));

        friendRepository.delete(friend1);
        friendRepository.delete(friend2);
    }

    // 내 친구 목록 조회 (수락된 상태만)
    public List<FriendDto> getFriends(String currentUsername) {
        User currentUser = userRepository.findByUsername(currentUsername).orElseThrow(() -> new RuntimeException("User not found"));
        
        // 내가 요청해서 수락된 경우 + 나에게 요청해서 내가 수락한 경우
        Stream<Friend> friendsStream = friendRepository.findFriendsByUserAndStatus(currentUser, FriendshipStatus.ACCEPTED).stream();

        return friendsStream.map(friend -> {
            User friendUser = friend.getRequester().equals(currentUser) ? friend.getReceiver() : friend.getRequester();
            return new FriendDto(friend.getId(), new UserDto(friendUser.getId(), friendUser.getUsername()), friend.getStatus());
        }).collect(Collectors.toList());
    }

    // 내가 받은 친구 요청 목록 조회 (대기 중인 상태만)
    public List<FriendDto> getPendingRequests(String currentUsername) {
        User currentUser = userRepository.findByUsername(currentUsername).orElseThrow(() -> new RuntimeException("User not found"));
        return friendRepository.findByReceiverAndStatus(currentUser, FriendshipStatus.PENDING).stream()
                .map(friend -> new FriendDto(friend.getId(), new UserDto(friend.getRequester().getId(), friend.getRequester().getUsername()), friend.getStatus()))
                .collect(Collectors.toList());
    }
}
