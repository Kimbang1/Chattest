import React, { useEffect } from 'react';
import { StatusBar, useColorScheme, View, ActivityIndicator, StyleSheet } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { Provider, useSelector, useDispatch } from 'react-redux';
import { store, RootState, AppDispatch } from './src/store/store';
import { setToken, logout } from './src/store/authSlice';
import { getToken } from './src/services/authService';
import AppNavigator from './src/navigation/AppNavigator';

// AppWrapper: Redux 상태에 따라 네비게이터를 렌더링하는 컴포넌트
const AppWrapper = () => {
  const { isAuthenticated, token } = useSelector((state: RootState) => state.auth);
  const dispatch: AppDispatch = useDispatch();
  const [isLoading, setIsLoading] = React.useState(true);
  const handleTokenUpdate = React.useCallback(
    (nextToken: string | null) => {
      if (nextToken) {
        dispatch(setToken(nextToken));
        return;
      }
      dispatch(logout());
    },
    [dispatch]
  );

  useEffect(() => {
    const checkLoginStatus = async () => {
      try {
        const storedToken = await getToken();
        if (storedToken) {
          console.log('[App.tsx] 앱 시작. AsyncStorage에서 토큰 발견. Redux 상태 업데이트.');
          dispatch(setToken(storedToken));
        }
      } catch (error) {
        console.error('[App.tsx] 토큰 확인 중 에러:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkLoginStatus();
  }, [dispatch]);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  // Redux 스토어의 `isAuthenticated` 상태에 따라 네비게이터를 렌더링
  return <AppNavigator isAuthenticated={isAuthenticated} setToken={handleTokenUpdate} />;
};

function App(): React.JSX.Element {
  const isDarkMode = useColorScheme() === 'dark';

  return (
    <Provider store={store}>
      <SafeAreaProvider>
        <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
        <NavigationContainer>
          <AppWrapper />
        </NavigationContainer>
      </SafeAreaProvider>
    </Provider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
});

export default App;

