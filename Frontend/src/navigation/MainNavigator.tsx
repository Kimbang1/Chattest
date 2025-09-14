import React from 'react';
import { Button, View } from 'react-native';
import { createStackNavigator } from '@react-navigation/stack';
import FriendListScreen from '@screens/FriendListScreen'; // 이름 변경
import ChatRoomScreen from '@screens/ChatRoomScreen';
import UserListScreen from '@screens/UserListScreen'; // 새로 추가
import FriendRequestsScreen from '@screens/FriendRequestsScreen'; // 새로 추가
import { logout } from '@services/authService';

export type MainStackParamList = {
  FriendList: undefined;
  ChatRoom: { roomId: string; roomName: string };
  UserList: undefined;
  FriendRequests: undefined;
};

const Stack = createStackNavigator<MainStackParamList>();

interface MainNavigatorProps {
  setToken: (token: string | null) => void;
}

const MainNavigator: React.FC<MainNavigatorProps> = ({ setToken }) => {

  const handleLogout = async () => {
    await logout();
    setToken(null);
  };

  return (
    <Stack.Navigator screenOptions={{ headerShown: true }}>
      <Stack.Screen 
        name="FriendList" 
        component={FriendListScreen} 
        options={({ navigation }) => ({
          title: '친구 목록',
          headerLeft: () => (
            <Button 
              onPress={() => navigation.navigate('FriendRequests')}
              title="요청" 
            />
          ),
          headerRight: () => (
            <View style={{ flexDirection: 'row' }}>
              <Button 
                onPress={() => navigation.navigate('UserList')}
                title="친구 추가" 
              />
              <Button 
                onPress={handleLogout} 
                title="로그아웃" 
              />
            </View>
          ),
        })} 
      />
      <Stack.Screen 
        name="ChatRoom" 
        component={ChatRoomScreen} 
        options={({ route }) => ({ title: route.params.roomName })} 
      />
      <Stack.Screen 
        name="UserList" 
        component={UserListScreen} 
        options={{ title: '사용자 검색' }} 
      />
      <Stack.Screen 
        name="FriendRequests" 
        component={FriendRequestsScreen} 
        options={{ title: '받은 친구 요청' }} 
      />
    </Stack.Navigator>
  );
}

export default MainNavigator;
