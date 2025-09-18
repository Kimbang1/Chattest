import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import ChatListScreen from '../screens/ChatListScreen';
import ChatRoomScreen from '../screens/ChatRoomScreen';

export type ChatStackParamList = {
  ChatList: undefined;
  ChatRoom: { roomId: string; roomName: string };
};

const Stack = createStackNavigator<ChatStackParamList>();

const ChatNavigator = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen name="ChatList" component={ChatListScreen} options={{ title: 'Chat Rooms' }} />
      <Stack.Screen name="ChatRoom" component={ChatRoomScreen} options={({ route }) => ({ title: route.params.roomName })} />
    </Stack.Navigator>
  );
};

export default ChatNavigator;
