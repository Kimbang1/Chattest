import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useNavigation, CompositeNavigationProp, useFocusEffect } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { MainStackParamList } from '@navigation/MainNavigator';
import { API_BASE_URL } from '@env';
import { getToken } from '@services/authService';
import { findOrCreatePrivateChatRoom } from '@services/chatRoomService';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { HomeTabParamList } from '@navigation/HomeNavigator';

type FriendListScreenNavigationProp = CompositeNavigationProp<
  StackNavigationProp<MainStackParamList, 'FriendList'>,
  BottomTabNavigationProp<HomeTabParamList>
>;

interface UserDto {
  id: number;
  username: string;
}

interface FriendDto {
  friendshipId: number;
  user: UserDto;
  status: string;
}

const FriendListScreen: React.FC = () => {
  const navigation = useNavigation<FriendListScreenNavigationProp>();
  const [friends, setFriends] = useState<FriendDto[]>([]);
  const [currentUsername, setCurrentUsername] = useState<string | null>(null);

  const fetchCurrentUser = async () => {
    try {
      const token = await getToken();
      const response = await fetch(`${API_BASE_URL}/api/auth/me`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data: UserDto = await response.json();
      setCurrentUsername(data.username);
    } catch (error) {
      console.error("Error fetching current user:", error);
    }
  };

  const fetchFriends = async () => {
    try {
      const token = await getToken();
      const response = await fetch(`${API_BASE_URL}/api/friends`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data: FriendDto[] = await response.json();
      setFriends(data);
    } catch (error) {
      console.error("Error fetching friends:", error);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchCurrentUser();
      fetchFriends();
    }, [])
  );

  const handleFriendPress = async (friend: UserDto) => {
    try {
      const chatRoom = await findOrCreatePrivateChatRoom(friend.id);
      navigation.navigate('Chats', { 
        screen: 'ChatRoom', 
        params: { 
          roomId: chatRoom.roomId, 
          roomName: friend.username, 
          currentUser: currentUsername 
        } 
      });
    } catch (error) {
      console.error("Error finding or creating chat room:", error);
      const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
      Alert.alert("오류", "채팅방을 열 수 없습니다.\n" + errorMessage);
    }
  };

  const renderItem = ({ item }: { item: FriendDto }) => (
    <View style={styles.friendItemContainer}>
      <TouchableOpacity
        style={styles.friendItem}
        onPress={() => handleFriendPress(item.user)}
      >
        <Text style={styles.friendName}>{item.user.username}</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={friends}
        keyExtractor={(item) => String(item.friendshipId)}
        renderItem={renderItem}
        ListEmptyComponent={<Text>No friends yet.</Text>}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  friendItemContainer: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  friendItem: {
    flex: 1,
  },
  friendName: {
    fontSize: 18,
  },
});

export default FriendListScreen;
