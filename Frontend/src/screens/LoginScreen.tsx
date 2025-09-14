import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { login } from '@services/authService';
import { AuthStackParamList } from '@navigation/AuthNavigation';

// AuthNavigator로부터 setToken 함수를 props로 받습니다.
type LoginScreenNavigationProp = StackNavigationProp<AuthStackParamList, 'Login'>;

interface LoginScreenProps {
  navigation: LoginScreenNavigationProp;
  setToken: (token: string | null) => void;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ navigation, setToken }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    console.log('[LoginScreen] 로그인 버튼 클릭됨.');
    try {
      console.log(`[LoginScreen] 로그인 시도 >> 사용자: ${username}`);
      const response = await login(username, password);
      console.log('[LoginScreen] 로그인 성공, 응답:', response);

      Alert.alert('로그인 성공', '환영합니다!');
      if (response.token) {
        setToken(response.token); // App.js의 상태를 변경하여 MainNavigator로 전환
      }
    } catch (error: any) {
      // 💥 authService에서 던져진 상세한 오류를 여기서 출력합니다.
      console.error('[LoginScreen] 로그인 실패:', error);
      Alert.alert('로그인 실패', error.message || '로그인 중 오류가 발생했습니다.');
    }
  };


  return (
    <View style={styles.container}>
      <Text style={styles.title}>로그인</Text>
      <TextInput
        style={styles.input}
        placeholder="사용자 이름"
        value={username}
        onChangeText={setUsername}
        autoCapitalize="none"
      />
      <TextInput
        style={styles.input}
        placeholder="비밀번호"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <Button title="로그인" onPress={handleLogin} />
      <Button title="회원가입" onPress={() => navigation.navigate('SignUp')} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 30,
    color: '#333',
  },
  input: {
    width: '100%',
    height: 50,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 15,
    marginBottom: 15,
    backgroundColor: '#fff',
    fontSize: 16,
  },
});

export default LoginScreen;