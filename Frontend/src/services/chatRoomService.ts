import { ChatRoom } from '../types/chat.d';

const API_BASE_URL = 'http://10.0.2.2:8080';

export const fetchChatRooms = async (): Promise<ChatRoom[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/chatrooms`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data: ChatRoom[] = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching chat rooms:", error);
    // Fallback to dummy data or return empty array in case of error
    return []; 
  }
};
