package backend.entity;

public enum FriendshipStatus {
    PENDING,  // 친구 요청 대기 중
    ACCEPTED, // 친구 수락됨
    DECLINED, // 친구 거절됨
    BLOCKED   // 차단됨
}
