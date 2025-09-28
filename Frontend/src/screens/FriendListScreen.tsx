import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
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
  // --- [수정 1] 로딩 상태를 관리할 state 추가 ---
  const [isLoading, setIsLoading] = useState(true);

  // useFocusEffect는 화면이 포커스될 때마다 데이터를 새로고침합니다.
  useFocusEffect(
    useCallback(() => {
      const fetchData = async () => {
        // --- [수정 2] 데이터를 불러오기 전에 로딩 상태를 true로 설정 ---
        setIsLoading(true);
        try {
          const token = await getToken();
          if (!token) throw new Error("No token found");

          // 두 API 호출을 병렬로 처리하여 속도 개선 (Promise.all)
          const [userResponse, friendsResponse] = await Promise.all([
            fetch(`${API_BASE_URL}/api/auth/me`, {
              headers: { 'Authorization': `Bearer ${token}` },
            }),
            fetch(`${API_BASE_URL}/api/friends`, {
              headers: { 'Authorization': `Bearer ${token}` },
            }),
          ]);

          if (!userResponse.ok) throw new Error(`HTTP error! status: ${userResponse.status}`);
          const userData: UserDto = await userResponse.json();
          setCurrentUsername(userData.username);

          if (!friendsResponse.ok) throw new Error(`HTTP error! status: ${friendsResponse.status}`);
          const friendsData: FriendDto[] = await friendsResponse.json();
          setFriends(friendsData);

        } catch (error) {
          console.error("Error fetching data:", error);
          // 사용자에게 오류 알림
          Alert.alert("Error", "Failed to load data. Please try again later.");
        } finally {
          // --- [수정 3] 데이터 로딩이 성공하든 실패하든 로딩 상태를 false로 변경 ---
          setIsLoading(false);
        }
      };

      fetchData();
    }, [])
  );

  const handleFriendPress = async (friend: UserDto) => {
    // --- [수정 4] 현재 사용자 이름이 로드되지 않았다면 아무것도 하지 않음 (오류 방지) ---
    if (!currentUsername) {
      Alert.alert("Please wait", "Loading user data...");
      return;
    }

    try {
      const chatRoom = await findOrCreatePrivateChatRoom(friend.username);
      navigation.navigate('Chats', {
        screen: 'ChatRoom',
        params: {
          roomId: chatRoom.roomId,
          roomName: friend.username,
          currentUser: currentUsername // 이제 이 값은 절대 null이 아님
        }
      });
    } catch (error) {
      console.error("Error finding or creating chat room:", error);
      const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
      Alert.alert("Error", "Could not open chat room.\n" + errorMessage);
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

  // --- [수정 5] 로딩 중일 때는 로딩 인디케이터를 보여줌 ---
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={friends}
        keyExtractor={(item) => String(item.friendshipId)}
        renderItem={renderItem}
        ListEmptyComponent={<Text style={styles.emptyText}>친구가 없습니다.</Text>}
      />
    </View>
  );
};

// 스타일시트 보강
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  friendItemContainer: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  friendItem: {
    flex: 1,
  },
  friendName: {
    fontSize: 18,
    color: '#333',
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 50,
    fontSize: 16,
    color: '#888',
  }
});

export default FriendListScreen;
