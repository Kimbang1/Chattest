
import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, KeyboardAvoidingView, Platform } from 'react-native';
import { ChatRoomScreenStyles as styles } from '@styles/chat/ChatRoomScreenStyles';
import MessageBubble from '@components/chat/MessageBubble';
import useChatWebSocket from '@hooks/useChatWebSocket';

const ChatRoomScreen = ({ route }: any) => {
  const { roomId, roomName } = route.params;
  const [inputText, setInputText] = useState<string>('');
  const flatListRef = useRef<FlatList>(null);

  const { messages, isConnected, sendMessage } = useChatWebSocket({ roomId });

  useEffect(() => {
    if (flatListRef.current) {
      flatListRef.current.scrollToEnd({ animated: true });
    }
  }, [messages]);

  const handleSendMessage = () => {
    sendMessage(inputText);
    setInputText('');
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0} // Adjust as needed
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
        renderItem={({ item }) => <MessageBubble message={item} isUser={item.sender === 'user'} />}
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
          editable={isConnected} // Disable input if not connected
        />
        <TouchableOpacity style={styles.sendButton} onPress={handleSendMessage} disabled={!isConnected}>
          <Text style={styles.sendButtonText}>Send</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

export default ChatRoomScreen;
