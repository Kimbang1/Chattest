import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '@env';

interface AuthResponse {
  token: string;
  // 다른 사용자 정보가 있다면 추가
}

export const login = async (username: string, password: string ) => {
  const url = `${API_BASE_URL}/api/auth/login`;
  console.log(`[authService] Attempting to fetch from: ${url}`); // 로그 추가

  try { // 👈 1. 전체 로직을 try 블록으로 감쌉니다.
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password }),
    });

    // 👈 2. 응답이 실패했을 때, 본문(body)을 안전하게 파싱합니다.
    if (!response.ok) {
      let errorMessage = '로그인에 실패했습니다.';
      try {
        // 에러 메시지가 JSON 형태일 경우 그것을 사용
        const errorData = await response.json();
        errorMessage = errorData.message || errorMessage;
      } catch (e) {
        // JSON 파싱 실패 시 (HTML, 텍스트 등), HTTP 상태 텍스트를 사용
        errorMessage = response.statusText;
      }
      throw new Error(errorMessage);
    }

    const data = await response.json();
    await AsyncStorage.setItem('jwtToken', data.token);
    return data;

  } catch (error) { // 👈 3. 네트워크 오류나 위에서 던져진 오류를 여기서 잡습니다.
    console.error('Login Error:', error);
    // UI에 표시할 수 있도록 에러를 다시 던지거나, 적절히 처리합니다.
    throw error;
  }
};

export const signup = async (username: string, email: string, password: string) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, email, password }),
    });

    // HTTP 응답이 성공(2xx)이 아닐 경우의 처리
    if (!response.ok) {
      let errorMessage = '회원가입에 실패했습니다.';
      try {
        // 서버가 JSON 형태로 에러 메시지를 보냈을 경우
        const errorData = await response.json();
        errorMessage = errorData.message || errorMessage;
      } catch (e) {
        // 서버가 JSON이 아닌 다른 형태(HTML, 텍스트 등)로 응답했을 경우
        errorMessage = response.statusText;
      }
      throw new Error(errorMessage);
    }

    // 성공적인 응답 처리
    const data = await response.json();
    return data;

  } catch (error) { // 네트워크 오류 또는 위에서 발생시킨 오류를 처리
    console.error('Signup Error:', error);
    // 오류를 호출한 곳으로 다시 전달하여 UI 등에서 처리할 수 있게 함
    throw error;
  }
};

// getToken과 removeToken 함수를 올바른 위치로 이동
export const getToken = async () => {
  return await AsyncStorage.getItem('jwtToken');
};

export const setToken = async (token: string) => {
  await AsyncStorage.setItem('jwtToken', token);
};

export const removeToken = async () => {
  await AsyncStorage.removeItem('jwtToken');
};

export const logout = async () => {
  await removeToken();
};
