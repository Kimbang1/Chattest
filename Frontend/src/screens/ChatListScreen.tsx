import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity } from 'react-native';
import { ChatListScreenStyles as styles } from '../styles/chat/ChatListScreenStyles';

import { ChatRoom } from '../types/chat.d';
import { fetchChatRooms } from '../services/chatRoomService';

const ChatListScreen = ({ navigation }: any) => {
  const [chatRooms, setChatRooms] = useState<ChatRoom[]>([]);

  useEffect(() => {
    const getChatRooms = async () => {
      const rooms = await fetchChatRooms();
      setChatRooms(rooms);
    };
    getChatRooms();
  }, []);

  const renderItem = ({ item }: { item: ChatRoom }) => (
    <TouchableOpacity
      style={styles.roomItem}
      onPress={() => navigation.navigate('ChatRoom', { roomId: item.id, roomName: item.name })}
    >
      <Text style={styles.roomName}>{item.name}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Available Chat Rooms</Text>
      <FlatList
        data={chatRooms}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
};

export default ChatListScreen;