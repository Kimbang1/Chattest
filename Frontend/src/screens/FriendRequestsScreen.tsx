import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { MainStackParamList } from '@navigation/MainNavigator';
import { API_BASE_URL } from '@env';
import { getToken } from '@services/authService';

type FriendRequestsScreenNavigationProp = StackNavigationProp<MainStackParamList, 'FriendRequests'>;

interface FriendRequestsScreenProps {
  navigation: FriendRequestsScreenNavigationProp;
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

const FriendRequestsScreen: React.FC<FriendRequestsScreenProps> = ({ navigation }) => {
  const [pendingRequests, setPendingRequests] = useState<FriendDto[]>([]);

  useEffect(() => {
    fetchPendingRequests();
  }, []);

  const fetchPendingRequests = async () => {
    try {
      const token = await getToken();
      const response = await fetch(`${API_BASE_URL}/api/friends/pending`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data: FriendDto[] = await response.json();
      setPendingRequests(data);
    } catch (error) {
      console.error("Error fetching pending requests:", error);
      Alert.alert("오류", "친구 요청 목록을 불러오는데 실패했습니다.");
    }
  };

  const handleFriendRequest = async (friendshipId: number, action: 'accept' | 'decline') => {
    try {
      const token = await getToken();
      const response = await fetch(`${API_BASE_URL}/api/friends/${action}/${friendshipId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }
      Alert.alert("성공", `친구 요청을 ${action === 'accept' ? '수락' : '거절'}했습니다.`);
      fetchPendingRequests(); // 목록 새로고침
    } catch (error: any) {
      console.error(`Error ${action}ing friend request:`, error);
      Alert.alert("오류", error.message || `친구 요청 ${action === 'accept' ? '수락' : '거절'}에 실패했습니다.`);
    }
  };

  const renderItem = ({ item }: { item: FriendDto }) => (
    <View style={styles.requestItem}>
      <Text style={styles.username}>{item.user.username}님의 친구 요청</Text>
      <View style={styles.actionsContainer}>
        <TouchableOpacity 
          style={[styles.actionButton, styles.acceptButton]}
          onPress={() => handleFriendRequest(item.friendshipId, 'accept')}
        >
          <Text style={styles.buttonText}>수락</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.actionButton, styles.declineButton]}
          onPress={() => handleFriendRequest(item.friendshipId, 'decline')}
        >
          <Text style={styles.buttonText}>거절</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>받은 친구 요청</Text>
      <FlatList
        data={pendingRequests}
        keyExtractor={(item) => String(item.friendshipId)}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
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
  requestItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  username: {
    fontSize: 18,
    color: '#333',
  },
  actionsContainer: {
    flexDirection: 'row',
  },
  actionButton: {
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 5,
    marginLeft: 10,
  },
  acceptButton: {
    backgroundColor: '#28a745', // Green
  },
  declineButton: {
    backgroundColor: '#dc3545', // Red
  },
  buttonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  listContent: {
    paddingBottom: 20,
  },
});

export default FriendRequestsScreen;
