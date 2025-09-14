import { ChatRoom } from '../types/chat.d';
import { API_BASE_URL } from '@env';
import { getToken } from './authService'; // getToken 함수를 import 합니다.

export const fetchChatRooms = async (): Promise<ChatRoom[]> => {
  try {
    const token = await getToken(); // AsyncStorage에서 토큰을 가져옵니다.

    const response = await fetch(`${API_BASE_URL}/api/chatrooms`, {
      headers: {
        // 템플릿 리터럴(``)을 사용하고, 실제 토큰 값을 넣어줍니다.
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json', // 좋은 습관으로 Content-Type도 명시해줍니다.
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data: ChatRoom[] = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching chat rooms:", error);
    return [];
  }
};
