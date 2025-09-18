import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import MainNavigator from './MainNavigator';
import ChatNavigator from './ChatNavigator';
import { NavigatorScreenParams } from '@react-navigation/native';
import { ChatStackParamList } from './ChatNavigator';

export type HomeTabParamList = {
  Friends: undefined;
  Chats: NavigatorScreenParams<ChatStackParamList>;
};

const Tab = createBottomTabNavigator<HomeTabParamList>();

interface HomeNavigatorProps {
  setToken: (token: string | null) => void;
}

const HomeNavigator: React.FC<HomeNavigatorProps> = ({ setToken }) => {
  return (
    <Tab.Navigator>
      <Tab.Screen name="Friends" options={{ headerShown: false }}>
        {() => <MainNavigator setToken={setToken} />}
      </Tab.Screen>
      <Tab.Screen name="Chats" component={ChatNavigator} options={{ headerShown: false }} />
    </Tab.Navigator>
  );
};

export default HomeNavigator;
