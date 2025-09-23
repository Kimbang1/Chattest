import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import * as authService from '@services/authService';
import AsyncStorage from '@react-native-async-storage/async-storage';

// 로그인 응답 타입 정의
interface AuthResponse {
  token: string;
}

// Thunk: 비동기 로그인 로직
export const loginUser = createAsyncThunk<AuthResponse, authService.LoginRequest, { rejectValue: string }>
(
  'auth/loginUser',
  async (credentials, { rejectWithValue }) => {
    try {
      console.log('[authSlice] 로그인 시도 (thunk 시작):', credentials.username);
      const response = await authService.login(credentials.username, credentials.password);
      await AsyncStorage.setItem('jwtToken', response.token);
      console.log('[authSlice] 토큰 AsyncStorage에 저장 성공.');
      return response;
    } catch (error: any) {
      console.error('[authSlice] 로그인 실패 (thunk 에러):', error.message);
      return rejectWithValue(error.message || '로그인에 실패했습니다.');
    }
  }
);

// 인증 상태 타입 정의
interface AuthState {
  token: string | null;
  isAuthenticated: boolean;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

const initialState: AuthState = {
  token: null,
  isAuthenticated: false,
  status: 'idle',
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    // 동기적으로 토큰을 설정하는 액션 (앱 시작 시 사용)
    setToken: (state, action: PayloadAction<string>) => {
      console.log('[authSlice] setToken 액션 실행. 토큰 설정됨.');
      state.token = action.payload;
      state.isAuthenticated = true;
    },
    // 로그아웃 액션
    logout: (state) => {
      console.log('[authSlice] logout 액션 실행. 토큰 및 상태 초기화.');
      state.token = null;
      state.isAuthenticated = false;
      AsyncStorage.removeItem('jwtToken');
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        console.log('[authSlice] 로그인 상태: loading');
        state.status = 'loading';
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        console.log('[authSlice] 로그인 상태: succeeded');
        state.status = 'succeeded';
        state.token = action.payload.token;
        state.isAuthenticated = true;
        console.log('[authSlice] 스토어에 토큰 저장 성공:', action.payload.token);
      })
      .addCase(loginUser.rejected, (state, action) => {
        console.log('[authSlice] 로그인 상태: failed');
        state.status = 'failed';
        state.error = action.payload || 'Unknown error';
        console.error('[authSlice] 스토어 업데이트 실패 (rejected):', action.payload);
      });
  },
});

export const { setToken, logout } = authSlice.actions;
export default authSlice.reducer;
