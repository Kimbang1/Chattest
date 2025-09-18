import React, { useEffect, useState } from 'react';
import { StatusBar, useColorScheme, View, ActivityIndicator } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { getToken, setToken as saveToken } from './src/services/authService';
import AppNavigator from './src/navigation/AppNavigator';

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

  const handleSetToken = async (token: string | null) => {
    if (token) {
      await saveToken(token);
    } else {
      // When logging out, make sure to clear the token from storage
      await saveToken('');
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
        <AppNavigator isAuthenticated={!!userToken} setToken={handleSetToken} />
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

export default App;
