package backend.repository;

import backend.entity.Friend;
import backend.entity.FriendshipStatus;
import backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface FriendRepository extends JpaRepository<Friend, Long> {

    // 두 사용자 사이의 친구 관계를 찾습니다.
    Optional<Friend> findByRequesterAndReceiver(User requester, User receiver);

    // 특정 사용자가 받은 친구 요청 목록을 찾습니다.
    List<Friend> findByReceiverAndStatus(User receiver, FriendshipStatus status);

    // 특정 사용자의 모든 친구 관계 (요청했거나 받은 것 모두)를 찾습니다.
    List<Friend> findByRequesterOrReceiverAndStatus(User user1, User user2, FriendshipStatus status);
}
