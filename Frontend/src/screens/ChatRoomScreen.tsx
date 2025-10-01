import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, KeyboardAvoidingView, Platform } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { ChatRoomScreenStyles as styles } from '@styles/chat/ChatRoomScreenStyles';
import MessageBubble from '@components/chat/MessageBubble';
import useChatWebSocket from '@hooks/useChatWebSocket';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { RootState, AppDispatch } from '@store/store';
import { setToken as setTokenAction } from '@store/authSlice';

export type ChatMessageDto = {
  roomId: string;
  sender: string;
  content: string;
  type: 'ENTER' | 'TALK';
  messageId?: string;
  createAt?: string;
  read?: boolean;
};

const ChatRoomScreen = ({ route }: any) => {
  const { roomId, roomName, currentUser } = route.params;

  const dispatch: AppDispatch = useDispatch();
  const reduxToken = useSelector((state: RootState) => state.auth.token);

  const [inputText, setInputText] = useState<string>('');
  const [token, setToken] = useState<string | null>(reduxToken);
  const flatListRef = useRef<FlatList<ChatMessageDto>>(null);

  useEffect(() => {
    setToken(reduxToken);
  }, [reduxToken]);

  useEffect(() => {
    console.log(`[ChatRoomScreen] 채팅방 진입. roomId=${roomId}, user=${currentUser}`);
    if (reduxToken) {
      console.log('[ChatRoomScreen] Redux 토큰이 존재하여 AsyncStorage 조회를 건너뜁니다.');
      return;
    }

    let isMounted = true;
    const loadToken = async () => {
      const storedToken = await AsyncStorage.getItem('jwtToken');
      if (!isMounted) {
        return;
      }
      if (storedToken) {
        console.log('[ChatRoomScreen] AsyncStorage 토큰을 회수하여 Redux에 동기화합니다.');
        setToken(storedToken);
        dispatch(setTokenAction(storedToken));
      } else {
        console.log('[ChatRoomScreen] AsyncStorage에 저장된 토큰이 없습니다.');
        setToken(null);
      }
    };

    loadToken();
    return () => {
      isMounted = false;
    };
  }, [reduxToken, roomId, currentUser, dispatch]);

  const { messages, isConnected, sendMessage } = useChatWebSocket(roomId, currentUser, token);

  useEffect(() => {
    flatListRef.current?.scrollToEnd({ animated: true });
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
            keyExtractor={(item, index) => item.messageId ?? index.toString()} // 서버 messageId 사용
            renderItem={({ item }) => (
              <MessageBubble
                message={item}
                isUser={item.sender === currentUser}
              />
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
              editable
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
