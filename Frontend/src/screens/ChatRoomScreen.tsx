import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, KeyboardAvoidingView, Platform } from 'react-native';
import { ChatRoomScreenStyles as styles } from '@styles/chat/ChatRoomScreenStyles';
import MessageBubble from '@components/chat/MessageBubble';
import useChatWebSocket from '@hooks/useChatWebSocket';
import AsyncStorage from '@react-native-async-storage/async-storage';  // 토큰 저장소 (이미 쓰고 있을 가능성 높음)

const ChatRoomScreen = ({ route }: any) => {
  const { roomId, roomName, currentUser } = route.params;

  const [inputText, setInputText] = useState<string>('');
  const [token, setToken] = useState<string | null>(null);   // 🔹 토큰 상태 추가
  const flatListRef = useRef<FlatList>(null);

  // 화면 진입 로그
  useEffect(() => {
    console.log(`[ChatRoomScreen] Entered screen. Room ID: ${roomId}, User: ${currentUser}`);
    const loadToken = async () => {
      const storedToken = await AsyncStorage.getItem("token");   // 로그인 시 저장한 토큰 불러오기
      setToken(storedToken);
      console.log("[ChatRoomScreen] Loaded token:", storedToken);
    };
    loadToken();
  }, []);

  // 토큰이 없으면 아직 연결하지 않음
  const { messages, isConnected, sendMessage } = useChatWebSocket({ 
    roomId, 
    username: currentUser, 
    token   // 🔹 token을 훅으로 전달
  });

  if (!currentUser || !roomId || !token) {
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
        renderItem={({ item }) => (
          <MessageBubble message={item} isUser={item.senderName === currentUser} />
        )}
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
