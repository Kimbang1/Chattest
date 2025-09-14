import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { MainStackParamList } from '@navigation/MainNavigator';
import { API_BASE_URL } from '@env';
import { getToken } from '@services/authService';

type UserListScreenNavigationProp = StackNavigationProp<MainStackParamList, 'UserList'>;

interface UserListScreenProps {
  navigation: UserListScreenNavigationProp;
}

interface UserDto {
  id: number;
  username: string;
}

const UserListScreen: React.FC<UserListScreenProps> = ({ navigation }) => {
  const [users, setUsers] = useState<UserDto[]>([]);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const token = await getToken();
      const response = await fetch(`${API_BASE_URL}/api/friends/users`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data: UserDto[] = await response.json();
      setUsers(data);
    } catch (error) {
      console.error("Error fetching users:", error);
      Alert.alert("오류", "사용자 목록을 불러오는데 실패했습니다.");
    }
  };

  const sendFriendRequest = async (receiverUsername: string) => {
    try {
      const token = await getToken();
      const response = await fetch(`${API_BASE_URL}/api/friends/request/${receiverUsername}`, {
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
      Alert.alert("성공", `${receiverUsername}님에게 친구 요청을 보냈습니다.`);
      // 요청 후 사용자 목록을 새로고침하거나 상태를 업데이트할 수 있습니다.
      fetchUsers(); 
    } catch (error: any) {
      console.error("Error sending friend request:", error);
      Alert.alert("오류", error.message || "친구 요청 전송에 실패했습니다.");
    }
  };

  const renderItem = ({ item }: { item: UserDto }) => (
    <View style={styles.userItem}>
      <Text style={styles.username}>{item.username}</Text>
      <TouchableOpacity 
        style={styles.requestButton}
        onPress={() => sendFriendRequest(item.username)}
      >
        <Text style={styles.requestButtonText}>친구 요청</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>다른 사용자</Text>
      <FlatList
        data={users}
        keyExtractor={(item) => String(item.id)}
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
  userItem: {
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
  requestButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 5,
  },
  requestButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  listContent: {
    paddingBottom: 20,
  },
});

export default UserListScreen;
