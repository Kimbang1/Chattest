import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { MainStackParamList } from '@navigation/MainNavigator';
import { API_BASE_URL } from '@env';
import { getToken } from '@services/authService';
import { useFocusEffect } from '@react-navigation/native';

type FriendListScreenNavigationProp = StackNavigationProp<MainStackParamList, 'FriendList'>;

interface FriendListScreenProps {
  navigation: FriendListScreenNavigationProp;
}

interface UserDto {
  id: number;
  username: string;
}

interface FriendDto {
  friendshipId: number;
  user: UserDto;
  status: string; // PENDING, ACCEPTED, DECLINED 등
}

const FriendListScreen: React.FC<FriendListScreenProps> = ({ navigation }) => {
  const [friends, setFriends] = useState<FriendDto[]>([]);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const [currentUsername, setCurrentUsername] = useState<string | null>(null);

  // 현재 사용자 정보를 가져오는 함수
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
      setCurrentUserId(data.id);
      setCurrentUsername(data.username);
    } catch (error) {
      console.error("Error fetching current user:", error);
      Alert.alert("오류", "사용자 정보를 불러오는데 실패했습니다.");
    }
  };

  // 화면이 포커스될 때마다 친구 목록과 현재 사용자 정보를 새로고침합니다.
  useFocusEffect(
    useCallback(() => {
      fetchCurrentUser();
      fetchFriends();
    }, [])
  );

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
      Alert.alert("오류", "친구 목록을 불러오는데 실패했습니다.");
    }
  };

  const renderItem = ({ item }: { item: FriendDto }) => {
    if (currentUserId === null) return null; // 현재 사용자 ID가 없으면 렌더링하지 않음

    // 두 사용자 ID를 정렬하여 고유한 roomId를 생성합니다.
    const userIds = [currentUserId, item.user.id].sort((a, b) => a - b);
    const roomId = `chat_${userIds[0]}_${userIds[1]}`;

    return (
      <TouchableOpacity
        style={styles.friendItem}
        onPress={() => navigation.navigate('ChatRoom', { roomId: roomId, roomName: item.user.username, currentUser: currentUsername })}
      >
        <Text style={styles.friendName}>{item.user.username}</Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>내 친구</Text>
      <FlatList
        data={friends}
        keyExtractor={(item) => String(item.friendshipId)}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <Text style={styles.emptyText}>아직 친구가 없습니다. 친구를 추가해보세요!</Text>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  friendItem: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2,
  },
  friendName: {
    fontSize: 18,
    color: '#333',
  },
  listContent: {
    paddingBottom: 20,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
    color: '#666',
  },
});

export default FriendListScreen;