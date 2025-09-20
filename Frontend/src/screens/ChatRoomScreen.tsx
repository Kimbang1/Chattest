import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, KeyboardAvoidingView, Platform } from 'react-native';
import { ChatRoomScreenStyles as styles } from '@styles/chat/ChatRoomScreenStyles';
import MessageBubble from '@components/chat/MessageBubble';
import useChatWebSocket from '@hooks/useChatWebSocket';

const ChatRoomScreen = ({ route }: any) => {
  const { roomId, roomName, currentUser } = route.params;
  console.log(`[ChatRoomScreen] Entered screen. Room ID: ${roomId}, User: ${currentUser}`);

  const [inputText, setInputText] = useState<string>('');
  const flatListRef = useRef<FlatList>(null);

  const { messages, isConnected, sendMessage } = useChatWebSocket({ roomId, username: currentUser });

  if (!currentUser || !roomId) {
    return (
      <View style={styles.container}>
        <Text>Loading...</Text>
      </View>
    );
  }

  useEffect(() => {
    if (flatListRef.current) {
      flatListRef.current.scrollToEnd({ animated: true });
    }
  }, [messages]);

  const handleSendMessage = () => {
    if (inputText.trim()) {
      sendMessage(inputText);
      setInputText('');
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'padding'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <Text style={styles.roomTitle}>Chat Room: {roomName}</Text>
      {!isConnected && (
        <View style={styles.connectionStatus}>
          <Text style={styles.connectionStatusText}>Connecting...</Text>
        </View>
      )}
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item, index) => item.id || index.toString()}
        renderItem={({ item }) => <MessageBubble message={item} isUser={item.senderName === currentUser} />}
        contentContainerStyle={styles.messagesContainer}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
      />
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.textInput}
          value={inputText}
          onChangeText={setInputText}
          placeholder="Type your message..."
          placeholderTextColor="#999"
          multiline
          editable={true}
        />
        <TouchableOpacity style={styles.sendButton} onPress={handleSendMessage}>
          <Text style={styles.sendButtonText}>Send</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

export default ChatRoomScreen;