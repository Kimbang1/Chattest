import React, { useEffect, useState, useCallback } from 'react';
import { StatusBar, useColorScheme, View, ActivityIndicator, StyleSheet } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { getToken, setToken as saveToken } from './src/services/authService';
import AppNavigator from './src/navigation/AppNavigator';

/**
 * 앱의 가장 최상위 진입점 컴포넌트입니다.
 * 1. 앱 시작 시 스토리지에서 로그인 토큰을 확인합니다.
 * 2. 로딩 상태를 관리하고, 로딩 중에는 스피너를 보여줍니다.
 * 3. 로그인 상태에 따라 적절한 네비게이터(로그인/메인)를 렌더링합니다.
 */
function App(): React.JSX.Element {
  const isDarkMode = useColorScheme() === 'dark';

  // 상태 관리
  const [isLoading, setIsLoading] = useState(true); // 앱 초기 데이터 로딩 상태
  const [userToken, setUserToken] = useState<string | null>(null); // 사용자 로그인 토큰

  // 앱이 처음 마운트될 때 "단 한 번만" 실행되는 로직
  useEffect(() => {
    const checkLoginStatus = async () => {
      try {
        const token = await getToken();
        setUserToken(token); // 스토리지에 토큰이 있으면 상태에 저장
      } catch (error) {
        console.error('Failed to check login status:', error);
        setUserToken(null); // 에러 발생 시 로그아웃 처리
      } finally {
        setIsLoading(false); // 로딩 완료
      }
    };

    checkLoginStatus();
  }, []); // 의존성 배열이 비어있어, 처음 렌더링 시 1회만 실행됩니다. (✅ 올바른 구현)

  // 로그인/로그아웃 처리를 위한 함수.
  // useCallback을 사용하여 불필요한 함수 재생성을 방지합니다. (성능 최적화)
  const handleAuthChange = useCallback(async (token: string | null) => {
    try {
        if (token) {
          // 로그인: 토큰 저장 및 상태 업데이트
          await saveToken(token);
          setUserToken(token);
        } else {
          // 로그아웃: 스토리지에서 토큰 제거 및 상태 업데이트
          await saveToken(''); // 빈 문자열로 저장하여 토큰 삭제
          setUserToken(null);
        }
    } catch (error) {
        console.error('Failed to handle auth change:', error);
    }
  }, []);

  // 초기 토큰 확인 중일 때 로딩 화면을 보여줍니다.
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      <NavigationContainer>
        {/*
         * AppNavigator에 로그인 상태와 인증 처리 함수를 props로 전달합니다.
         * isAuthenticated가 변경되면 AppNavigator 내부에서 화면이 올바르게 전환됩니다.
         */}
        <AppNavigator isAuthenticated={!!userToken} setToken={handleAuthChange} />
      </NavigationContainer>
    </SafeAreaProvider>
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
