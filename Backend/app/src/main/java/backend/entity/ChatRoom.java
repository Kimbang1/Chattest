package backend.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.HashSet;
import java.util.Set;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "chat_rooms")
public class ChatRoom {

    @Id
    private String roomId;

    private String name;

    private boolean isPrivate;

    @ManyToMany(fetch = FetchType.EAGER)
    @JoinTable(
            name = "chat_room_participants",
            joinColumns = @JoinColumn(name = "chat_room_id"),
            inverseJoinColumns = @JoinColumn(name = "user_id")
    )
    private Set<User> participants = new HashSet<>();

    @PrePersist
    public void initializeUUID() {
        if (roomId == null) {
            roomId = UUID.randomUUID().toString();
        }
    }
}
