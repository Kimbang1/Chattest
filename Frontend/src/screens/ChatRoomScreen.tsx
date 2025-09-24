import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, KeyboardAvoidingView, Platform } from 'react-native';
import { ChatRoomScreenStyles as styles } from '@styles/chat/ChatRoomScreenStyles';
import MessageBubble from '@components/chat/MessageBubble';
import useChatWebSocket from '@hooks/useChatWebSocket';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ChatRoomScreen = ({ route }: any) => {
  const { roomId, roomName, currentUser } = route.params;

  const [inputText, setInputText] = useState<string>('');
  const [token, setToken] = useState<string | null>(null);
  const flatListRef = useRef<FlatList>(null);

  // 화면 진입 로그 + 토큰 로드
  useEffect(() => {
    console.log(`[ChatRoomScreen] Entered screen. Room ID: ${roomId}, User: ${currentUser}`);
    const loadToken = async () => {
      const storedToken = await AsyncStorage.getItem("jwtToken");
      setToken(storedToken);
      console.log("[ChatRoomScreen] Loaded token:", storedToken);
    };
    loadToken();
  }, []);

  // 항상 훅 호출 → token이 null일 때도 실행
  const { messages, isConnected, sendMessage } = useChatWebSocket(
  roomId,
  currentUser,
  token
);

  // 메시지 수신 시 스크롤 자동 이동
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
      {/* 토큰/유저/룸 준비 안됐을 때 로딩 표시 */}
      {(!currentUser || !roomId || !token) ? (
        <View style={styles.container}>
          <Text>Loading...</Text>
        </View>
      ) : (
        <>
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
        </>
      )}
    </KeyboardAvoidingView>
  );
};

export default ChatRoomScreen;
