package backend.dto;

import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data                   // getter, setter, toString, equals, hashCode 자동 생성
@NoArgsConstructor      // 기본 생성자
@AllArgsConstructor     // 모든 필드를 받는 생성자
public class ChatMessageDto {
    @NotBlank(message = "채팅방 ID는 필수 값입니다.")
    private String roomId;

    @Size(max = 50, message = "발신자 정보는 50자를 넘길 수 없습니다.")
    private String sender;

    @Size(max = 1000, message = "메시지는 1000자를 넘길 수 없습니다.")
    private String content;

    @NotNull(message = "메시지 유형이 지정되지 않았습니다.")
    private MessageType type;
    private String messageId;
    private String createAt;
    private boolean read;

    @AssertTrue(message = "대화 메시지는 내용이 비어 있을 수 없습니다.")
    public boolean isContentValidForType() {
        if (type == null) {
            return false;
        }
        if (type == MessageType.TALK) {
            return content != null && !content.trim().isEmpty();
        }
        return true;
    }

    public enum MessageType {
        ENTER, TALK
    }
}
