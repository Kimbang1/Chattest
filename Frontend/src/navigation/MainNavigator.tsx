import React from 'react';
import { Button } from 'react-native';
import { createStackNavigator } from '@react-navigation/stack';
import ChatListScreen from '@screens/ChatListScreen';
import ChatRoomScreen from '@screens/ChatRoomScreen';
import { logout } from '@services/authService';

export type MainStackParamList = {
  ChatList: undefined;
  ChatRoom: { roomId: string; roomName: string };
};

const Stack = createStackNavigator<MainStackParamList>();

interface MainNavigatorProps {
  setToken: (token: string | null) => void;
}

const MainNavigator: React.FC<MainNavigatorProps> = ({ setToken }) => {

  const handleLogout = async () => {
    await logout(); // AsyncStorage에서 토큰 삭제
    setToken(null); // App.tsx의 상태를 업데이트하여 로그인 화면으로 전환
  };

  return (
    <Stack.Navigator screenOptions={{ headerShown: true }}>
      <Stack.Screen 
        name="ChatList" 
        component={ChatListScreen} 
        options={{
          title: '채팅 목록',
          headerRight: () => (
            <Button onPress={handleLogout} title="로그아웃" />
          ),
        }} 
      />
      <Stack.Screen 
        name="ChatRoom" 
        component={ChatRoomScreen} 
        options={({ route }) => ({ title: route.params.roomName })} 
      />
    </Stack.Navigator>
  );
}

export default MainNavigator;