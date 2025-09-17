package backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.Getter;
import lombok.Setter;


@Data                   // getter, setter, toString, equals, hashCode 자동 생성
@NoArgsConstructor      // 기본 생성자
@AllArgsConstructor     // 모든 필드를 받는 생성자
@Getter
@Setter 
public class ChatMessageDto {
    private String roomId; 
    private String sender;
    private String content;
    private MessageType type;
    private String messageId;
    private String createAt;
    private boolean read;

    public enum MessageType {
        ENTER, TALK
    }
}
