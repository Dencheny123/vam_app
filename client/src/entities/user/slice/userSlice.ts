import { createSlice } from '@reduxjs/toolkit';
import {
  getProfileThunk,
  refreshTokenThunk,
  signInThunk,
  signOutThunk,
  signUpThunk,
  verifySignIn2FAForAdminThunk,
  verifySignUp2FAThunk,
} from '../api/userThunkApi';
import type { UserType } from '../model/userTypes';

type UserStateType = {
  user: UserType | null;
  isInitialized: boolean;
  loading: boolean;
  error: string | null;
  twoFAPending: boolean; // Флаг для отображения формы 2FA
  twoFAUserId: string | null; // Хранение userId для 2FA
};

const initialState: UserStateType = {
  user: null,
  isInitialized: false,
  loading: false,
  error: null,
  twoFAPending: false,
  twoFAUserId: null,
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    reset2FA: (state) => {
      state.twoFAPending = false;
      state.twoFAUserId = null;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Получение профиля
      .addCase(getProfileThunk.pending, (state) => {
        state.loading = true;
      })
      .addCase(getProfileThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.isInitialized = true;
        state.user = action.payload.data;
      })
      .addCase(getProfileThunk.rejected, (state, action) => {
        state.loading = false;
        state.isInitialized = true;
        state.user = null;
        state.error = action.payload?.message || 'Ошибка получения профиля';
      })

      // обновка токена для отлова ошибок
      .addCase(refreshTokenThunk.pending, (state) => {
        state.loading = true;
      })
      .addCase(refreshTokenThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.isInitialized = true;
        state.user = action.payload.data.user;
        console.log('refreshTokenThunk fulfilled, state.user:', state.user); // Для отладки
      })
      .addCase(refreshTokenThunk.rejected, (state, action) => {
        state.loading = false;
        state.isInitialized = true;
        state.user = null;
        state.error = action.payload?.message || 'Ошибка получения токена';
      })
      // рега
      .addCase(signUpThunk.pending, (state) => {
        state.loading = true;
      })
      .addCase(signUpThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.twoFAPending = true;
        state.twoFAUserId = action.payload.data.userId;
      })
      .addCase(signUpThunk.rejected, (state, action) => {
        state.error = action.payload?.message || 'Ошибка регистрации';
      })
      // авторизация
      .addCase(signInThunk.pending, (state) => {
        state.loading = true;
      })
      .addCase(signInThunk.fulfilled, (state, action) => {
        state.loading = false;
        if ('userId' in action.payload.data) {
          // услочивие под 2FA (админ)
          state.twoFAPending = true;
          state.twoFAUserId = action.payload.data.userId;
        } else {
          // Успешный вход (обычный пользователь)
          state.isInitialized = true;
          state.user = action.payload.data.user;
        }
      })
      .addCase(signInThunk.rejected, (state, action) => {
        state.error = action.payload?.message || 'Ошибка входа в аккаунт';
      })
      // выход
      .addCase(signOutThunk.pending, (state) => {
        state.loading = true;
      })
      .addCase(signOutThunk.fulfilled, (state) => {
        state.loading = false;
        state.isInitialized = false;
        state.user = null;
      })
      .addCase(signOutThunk.rejected, (state, action) => {
        state.error = action.payload?.message || 'Ошибка выхода из аккаунта';
      })
      // Подтверждение 2FA на регу
      .addCase(verifySignUp2FAThunk.pending, (state) => {
        state.loading = true;
      })
      .addCase(verifySignUp2FAThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.isInitialized = true;
        state.twoFAPending = false;
        state.twoFAUserId = null;
        state.user = action.payload.data.user;
      })
      .addCase(verifySignUp2FAThunk.rejected, (state, action) => {
        state.error = action.payload?.message || 'Ошибка подтверждения 2FA';
      })
      // Подтверждение 2FA при входе
      .addCase(verifySignIn2FAForAdminThunk.pending, (state) => {
        state.loading = true;
      })
      .addCase(verifySignIn2FAForAdminThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.isInitialized = true;
        state.twoFAPending = false;
        state.twoFAUserId = null;
        state.user = action.payload.data.user;
      })
      .addCase(verifySignIn2FAForAdminThunk.rejected, (state, action) => {
        state.error = action.payload?.message || 'Ошибка подтверждения 2FA';
      });
  },
});

export const { reset2FA } = userSlice.actions;
export const userReducer = userSlice.reducer;
