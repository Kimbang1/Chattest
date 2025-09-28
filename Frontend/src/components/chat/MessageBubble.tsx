import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
// import { Message } from '@types/chat.ts';

export type ChatMessageDto = {
  roomId: string;
  sender: string;
  content: string;
  type: 'ENTER' | 'TALK';
  messageId?: string;
  createAt?: string;
  read?: boolean;
};

type Props = {
  message: ChatMessageDto;
  isUser: boolean;
};

const MessageBubble: React.FC<Props> = ({ message, isUser }) => {
  const isSystem = message.type === 'ENTER'; // 시스템 알림 표시용

  if (isSystem) {
    return (
      <View style={styles.systemContainer}>
        <Text style={styles.systemText}>{message.content}</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, isUser ? styles.right : styles.left]}>
      {!isUser && <Text style={styles.sender}>{message.sender}</Text>}
      <View style={[styles.bubble, isUser ? styles.userBubble : styles.otherBubble]}>
        <Text style={styles.messageText}>{message.content}</Text>
      </View>
      {/* 필요하면 시간/읽음표시 */}
      {/* {message.createAt && <Text style={styles.timeText}>{message.createAt}</Text>} */}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 6,
    paddingHorizontal: 12,
    maxWidth: '85%',
  },
  left: { alignSelf: 'flex-start' },
  right: { alignSelf: 'flex-end' },

  sender: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
    marginLeft: 6,
  },

  bubble: {
    borderRadius: 16,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  userBubble: {
    backgroundColor: '#007AFF',
  },
  otherBubble: {
    backgroundColor: '#E9E9EB',
  },

  messageText: {
    color: '#fff',
  },

  systemContainer: {
    alignSelf: 'center',
    marginVertical: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
    backgroundColor: '#F0F0F0',
    borderRadius: 12,
  },
  systemText: {
    fontSize: 12,
    color: '#666',
  },

  // timeText: {
  //   alignSelf: 'flex-end',
  //   fontSize: 10,
  //   color: '#999',
  //   marginTop: 2,
  // },
});

export default MessageBubble;