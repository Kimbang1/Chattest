package backend.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import lombok.Getter;
import lombok.Setter;

// 1. @Entity: 이 클래스가 데이터베이스 테이블의 설계도임을 JPA에게 알려줍니다.
@Entity
@Getter
@Setter
public class ChatMessage {

    // 2. @Id: 이 필드가 테이블의 기본 키(Primary Key)임을 나타냅니다.
    //    모든 엔티티는 반드시 @Id가 있어야 합니다.
    @Id
    // 3. @GeneratedValue: 기본 키 값을 데이터베이스가 자동으로 생성하도록 합니다. (예: 1, 2, 3, ...)
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String roomId;
    private String sender;
    private String content;

    // JPA는 기본 생성자를 필요로 합니다.
    public ChatMessage() {
    }
}
