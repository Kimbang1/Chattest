import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import LoginScreen from '@screens/LoginScreen';
import SignupScreen from '@screens/SignupScreen';

export type AuthStackParamList = {
  Login: undefined;
  SignUp: undefined;
};

const Stack = createStackNavigator<AuthStackParamList>();

const AuthNavigator = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: true }}>
      <Stack.Screen
        name="Login"
        component={LoginScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="SignUp"
        component={SignupScreen}
        options={{ title: '회원가입' }}
      />
    </Stack.Navigator>
  );
};

export default AuthNavigator;
