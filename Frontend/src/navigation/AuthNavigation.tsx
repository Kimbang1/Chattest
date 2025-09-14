import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import LoginScreen from '@screens/LoginScreen';
import SignupScreen from '@screens/SignupScreen';

export type AuthStackParamList = {
  Login: { setToken: (token: string | null) => void };
  SignUp: undefined;
};

const Stack = createStackNavigator<AuthStackParamList>();

interface AuthNavigatorProps {
  setToken: (token: string | null) => void;
}

const AuthNavigator: React.FC<AuthNavigatorProps> = ({ setToken }) => {
  return (
    <Stack.Navigator 
      // 기본적으로 헤더를 표시하도록 설정합니다.
      screenOptions={{ headerShown: true }}
    >
      <Stack.Screen 
        name="Login" 
        options={{ headerShown: false }} // 로그인 화면에서만 헤더를 숨깁니다.
      >
        {(props) => <LoginScreen {...props} setToken={setToken} />}
      </Stack.Screen>
      <Stack.Screen 
        name="SignUp" 
        component={SignupScreen} 
        options={{ title: '회원가입' }} // 회원가입 화면의 헤더 제목 설정
      />
    </Stack.Navigator>
  );
}

export default AuthNavigator;
