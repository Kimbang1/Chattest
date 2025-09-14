import React, { useEffect, useState } from 'react';
import { StatusBar, useColorScheme, View, ActivityIndicator } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { getToken, setToken as saveToken } from './src/services/authService'; // setToken 추가

import AuthNavigator from './src/navigation/AuthNavigation';
import MainNavigator from './src/navigation/MainNavigator';

function App() {
  const isDarkMode = useColorScheme() === 'dark';
  const [isLoading, setIsLoading] = useState(true);
  const [userToken, setUserToken] = useState<string | null>(null);

  useEffect(() => {
    const checkLoginStatus = async () => {
      try {
        const token = await getToken();
        setUserToken(token);
      } catch (error) {
        console.error('Failed to check login status:', error);
        setUserToken(null);
      } finally {
        setIsLoading(false);
      }
    };
    checkLoginStatus();
  }, []);

  // 로그인 상태를 변경하는 함수
  const handleSetToken = async (token: string | null) => {
    if (token) {
      await saveToken(token); // AsyncStorage에 토큰 저장
    }
    setUserToken(token);
  };

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      <NavigationContainer>
        {userToken ? <MainNavigator setToken={handleSetToken} /> : <AuthNavigator setToken={handleSetToken} />}
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

export default App;
