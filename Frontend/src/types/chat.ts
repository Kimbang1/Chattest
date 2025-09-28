// src/types/chat.ts
export interface Message {
  id: string;
  text: string;
  sender: 'user' | 'other';
  timestamp: string;
  type: 'CHAT' | 'JOIN' | 'LEAVE';
  senderName?: string;
}

export interface ChatRoom {
  id: string;
  name: string;
}
