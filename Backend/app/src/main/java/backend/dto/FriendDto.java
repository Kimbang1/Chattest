package backend.dto;

import backend.entity.FriendshipStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FriendDto {
    private Long friendshipId; // Friend 엔티티의 ID
    private UserDto user;       // 친구의 정보
    private FriendshipStatus status; // 친구 관계 상태
}
