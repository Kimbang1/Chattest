package backend.repository;

import backend.entity.ChatRoom;
import backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ChatRoomRepository extends JpaRepository<ChatRoom, String> {

    @Query("SELECT cr FROM ChatRoom cr WHERE cr.isPrivate = true AND :user1 MEMBER OF cr.participants AND :user2 MEMBER OF cr.participants AND SIZE(cr.participants) = 2")
    Optional<ChatRoom> findPrivateChatRoomByParticipants(@Param("user1") User user1, @Param("user2") User user2);
}
