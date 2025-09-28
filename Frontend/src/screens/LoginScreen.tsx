import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@store/store';
import { loginUser } from '@store/authSlice';
import { AuthStackParamList } from '@navigation/AuthNavigation';
import { StackScreenProps } from '@react-navigation/stack';

type LoginScreenProps = StackScreenProps<AuthStackParamList, 'Login'>; 

const LoginScreen: React.FC<LoginScreenProps> = ({ navigation /*, route*/ }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');


const dispatch: AppDispatch = useDispatch();
  const { status } = useSelector((state: RootState) => state.auth);

 const handleLogin = () => {
    console.log('[LoginScreen] 로그인 버튼 클릭됨.');
    if (!username || !password) {
      Alert.alert('입력 오류', '사용자 이름과 비밀번호를 모두 입력해주세요.');
      return;
    }

    console.log(`[LoginScreen] Redux loginUser 액션 디스패치 >> 사용자: ${username}`);
    dispatch(loginUser({ username, password }))
      .unwrap()
      .then((response) => {
        console.log('[LoginScreen] 로그인 액션 성공 (unwrap):', response);
        Alert.alert('로그인 성공', '환영합니다!');
      })
      .catch((errorMsg) => {
        console.error('[LoginScreen] 로그인 액션 실패 (unwrap):', errorMsg);
        Alert.alert('로그인 실패', errorMsg || '로그인 중 오류가 발생했습니다.');
      });
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
      {status === 'loading' ? (
        <ActivityIndicator size="large" color="#007AFF" />
      ) : (
        <Button title="로그인" onPress={handleLogin} />
      )}
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