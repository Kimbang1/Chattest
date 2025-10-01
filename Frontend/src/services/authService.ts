import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '@env';

export type AuthResponse = {
  token: string;
};

export interface LoginRequest {
  username: string;
  password: string;
}

export const login = async ({ username, password }: LoginRequest): Promise<AuthResponse> => {
  const url = `${API_BASE_URL}/api/auth/login`;
  console.log(`[authService] 로그인 요청 시작: ${url}`);

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password }),
    });

    if (!response.ok) {
      let errorMessage = '로그인에 실패했습니다.';
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorMessage;
      } catch (parseError) {
        errorMessage = response.statusText || errorMessage;
      }
      throw new Error(errorMessage);
    }

    const data: AuthResponse = await response.json();
    return data;
  } catch (error) {
    console.error('[authService] 로그인 중 예외 발생:', error);
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

    if (!response.ok) {
      let errorMessage = '회원가입에 실패했습니다.';
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorMessage;
      } catch (parseError) {
        errorMessage = response.statusText || errorMessage;
      }
      throw new Error(errorMessage);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('[authService] 회원가입 중 예외 발생:', error);
    throw error;
  }
};

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
