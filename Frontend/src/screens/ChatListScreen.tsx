import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, Button, TextInput, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { MainStackParamList } from '../navigation/MainNavigator';
import { fetchChatRooms, createChatRoom } from '../services/chatRoomService';
import { getCurrentUser } from '../services/authService'; // 1. Import getCurrentUser
import { ChatRoom } from '../types/chat';

const ChatListScreen = () => {
  const [chatRooms, setChatRooms] = useState<ChatRoom[]>([]);
  const [newRoomName, setNewRoomName] = useState('');
  const [currentUser, setCurrentUser] = useState<string | null>(null); // 2. Add state for currentUser
  const navigation = useNavigation<StackNavigationProp<MainStackParamList>>();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const user = await getCurrentUser(); // 3. Fetch current user
        setCurrentUser(user.username); // Assuming the user object has a username property
        await loadChatRooms();
      } catch (error) {
        console.error('Failed to fetch initial data:', error);
        Alert.alert('Error', 'Failed to load data. Please try again.');
      }
    };
    fetchData();
  }, []);

  const loadChatRooms = async () => {
    const rooms = await fetchChatRooms();
    setChatRooms(rooms);
  };

  const handleCreateRoom = async () => {
    if (newRoomName.trim() === '') {
      Alert.alert('Error', 'Please enter a room name.');
      return;
    }
    try {
      await createChatRoom(newRoomName);
      setNewRoomName('');
      loadChatRooms();
    } catch (error) {
      console.error('Error creating chat room:', error);
      Alert.alert('Error', 'Failed to create chat room.');
    }
  };

  const renderItem = ({ item }: { item: ChatRoom }) => (
    // 4. Pass currentUser in navigation params
    <TouchableOpacity onPress={() => navigation.navigate('ChatRoom', { roomId: item.roomId, roomName: item.name, currentUser: currentUser! })}>
      <View style={{ padding: 15, borderBottomWidth: 1, borderBottomColor: '#ccc' }}>
        <Text style={{ fontSize: 18 }}>{item.name}</Text>
      </View>
    </TouchableOpacity>
  );

  if (!currentUser) {
    return <View><Text>Loading user...</Text></View>; // Loading state while fetching user
  }

  return (
    <View style={{ flex: 1 }}>
      <View style={{ padding: 10, flexDirection: 'row' }}>
        <TextInput
          style={{ flex: 1, borderWidth: 1, borderColor: '#ccc', padding: 8 }}
          placeholder="New room name"
          value={newRoomName}
          onChangeText={setNewRoomName}
        />
        <Button title="Create" onPress={handleCreateRoom} />
      </View>
      <FlatList
        data={chatRooms}
        renderItem={renderItem}
        keyExtractor={(item) => item.roomId}
        onRefresh={loadChatRooms}
        refreshing={false}
      />
    </View>
  );
};

export default ChatListScreen;
