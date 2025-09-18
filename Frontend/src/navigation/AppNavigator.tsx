import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import AuthNavigator from './AuthNavigation';
import HomeNavigator from './HomeNavigator';

export type RootStackParamList = {
  Auth: undefined;
  Home: undefined;
};

const Stack = createStackNavigator<RootStackParamList>();

interface AppNavigatorProps {
  isAuthenticated: boolean;
  setToken: (token: string | null) => void; 
}

const AppNavigator: React.FC<AppNavigatorProps> = ({ isAuthenticated, setToken }) => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {isAuthenticated ? (
        <Stack.Screen name="Home">
          {() => <HomeNavigator setToken={setToken} />}
        </Stack.Screen>
      ) : (
        <Stack.Screen name="Auth" component={AuthNavigator} />
      )}
    </Stack.Navigator>
  );
};

export default AppNavigator;
