import { API_BASE_URL } from '@env';
import { getToken } from './authService';

// --- [수정 1] ChatRoom 인터페이스에 'roomId' 속성 추가 ---
// 서버에서 실제로 보내주는 데이터 구조와 타입을 일치시킵니다.
export interface ChatRoom {
  roomId: string; 
  name: string;
}

/**
 * 주어진 사용자 username과 1:1 채팅방을 찾거나 새로 생성합니다.
 * @param targetUsername - 채팅을 시작할 상대방의 사용자 이름
 * @returns {Promise<ChatRoom>} - 찾거나 생성된 채팅방 정보
 */
export const findOrCreatePrivateChatRoom = async (
  targetUsername: string
): Promise<ChatRoom> => {
  const token = await getToken();
  if (!token) {
    throw new Error('인증 토큰이 없습니다. 로그인이 필요합니다.');
  }

  const response = await fetch(`${API_BASE_URL}/api/chatrooms/private`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    // ✅ 쿼리 파라미터 대신 body JSON으로 전달
    body: JSON.stringify({ username: targetUsername }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(
      `채팅방을 생성하거나 찾는 데 실패했습니다. 상태: ${response.status}, 메시지: ${errorBody}`
    );
  }

  const chatRoomData: ChatRoom = await response.json();
  return chatRoomData;
};
