import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Message } from '@@types/chat.d';

interface MessageBubbleProps {
  message: Message;
  isUser: boolean;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ message, isUser }) => {
  return (
    <View style={[styles.messageBubble, isUser ? styles.userMessage : styles.otherMessage]}>
      {message.type === 'CHAT' && !isUser && message.senderName && (
        <Text style={styles.senderName}>{message.senderName}</Text>
      )}
      <Text style={styles.messageText}>{message.text}</Text>
      <Text style={styles.timestamp}>{message.timestamp}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  messageBubble: {
    maxWidth: '80%',
    padding: 10,
    borderRadius: 15,
    marginBottom: 8,
    flexDirection: 'column',
  },
  userMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#DCF8C6',
    borderBottomRightRadius: 2,
  },
  otherMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#FFFFFF',
    borderBottomLeftRadius: 2,
  },
  senderName: {
    fontSize: 12,
    color: '#007AFF',
    marginBottom: 2,
    fontWeight: 'bold',
  },
  messageText: {
    fontSize: 16,
    color: '#333',
  },
  timestamp: {
    fontSize: 10,
    color: '#777',
    alignSelf: 'flex-end',
    marginTop: 5,
  },
});

export default MessageBubble;
