import axios, { AxiosError } from "axios";
import { createAsyncThunk } from "@reduxjs/toolkit";
import { axiosInstance, setAccessToken } from '@/shared/lib/axiosInstance'
import type { ServerResponseType } from "@/shared/types";
import type {
  UserWithTokenType,
  ISignInData,
  ISignUpData,
  Verify2FADataType,
  TwoFAResponseType, 
  UserType,
} from "../model/userTypes";
import { USER_THUNK_TYPES } from "@/shared/enums/userThunkTypes";
import { AUTH_API_ROUTES } from "@/shared/enums/authApiRoutes";

// ! (non-null assertion) говорит TypeScript, что err.response точно существует
// ? (optional chaining) используется когда мы не уверены, существует ли свойство.

// Обновление токенов
export const refreshTokenThunk = createAsyncThunk<
  ServerResponseType<UserWithTokenType>,
  void,
  { rejectValue: ServerResponseType<null> }
>(
  USER_THUNK_TYPES.REFRESH_TOKEN,
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post<ServerResponseType<UserWithTokenType>>(
        AUTH_API_ROUTES.REFRESH_TOKEN
      );

      if (!response.data?.data?.accessToken) {
        throw new Error("Сервер не вернул accessToken");
      }

      const accessToken = response.data.data.accessToken;

      // Сохраняем токен в localStorage
      if (typeof window !== 'undefined' && accessToken) {
        localStorage.setItem('token', accessToken);
      }

      // Если у тебя есть функция для установки токена в axios или куда-то еще, вызывай её тоже
      setAccessToken(accessToken);

      return response.data;
    } catch (error: unknown) {
      // Обработка ошибок
      let errorMessage = 'Неизвестная ошибка при обновлении токена';
      let statusCode = 500;
      let errorData = null;

      if (axios.isAxiosError<ServerResponseType<null>>(error)) {
        errorMessage = error.response?.data?.message || error.message;
        statusCode = error.response?.status || 500;
        errorData = error.response?.data || null;
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }

      console.error('Ошибка обновления токена:', {
        message: errorMessage,
        statusCode,
        error: errorData,
      });

      return rejectWithValue({
        statusCode,
        message: errorMessage,
        data: null,
        error: errorData?.error || 'Token refresh failed',
      });
    }
  }
);


// в случае выхода из система лучше использовать метод delete или post,так как изменения происходят
// на уровне удаления текущей сессии,
// текущего токена. Get запрос может кешироваться и менять состояние, например при перезагрзки страницы.
// delete в свою очеред может быть заблокирован некоторыми прокси.
// для реализации RestAPI лучше использовать post - так как этот метод не только про создание
// но про изменение на сервере. post более безопасен,  чем delete
export const signOutThunk = createAsyncThunk<
ServerResponseType<null>,
  void,
  { rejectValue: ServerResponseType<null> }
>(USER_THUNK_TYPES.SIGN_OUT, async (_, { rejectWithValue }) => {
  try {
    const { data } = await axiosInstance.post(
      AUTH_API_ROUTES.SIGN_OUT
    );
    setAccessToken("");
    return data;
  } catch (error) {
    const err = error as AxiosError<ServerResponseType<null>>;
    return rejectWithValue(err.response!.data);
  }
});

// регистрация под 2FA
export const signUpThunk = createAsyncThunk<
ServerResponseType<TwoFAResponseType>,
  ISignUpData,
  { rejectValue: ServerResponseType<null> }
>(USER_THUNK_TYPES.SIGN_UP, async (userData, { rejectWithValue }) => {
  try {
    const { data } = await axiosInstance.post<
    ServerResponseType<TwoFAResponseType>
    >(AUTH_API_ROUTES.SIGN_UP, userData);
    return data;
  } catch (error) {
    const err = error as AxiosError<ServerResponseType<null>>;
    return rejectWithValue(err.response!.data);
  }
});

// санка на подтверждение почты при реге
export const verifySignUp2FAThunk = createAsyncThunk<
ServerResponseType<UserWithTokenType>,
  Verify2FADataType,
  { rejectValue: ServerResponseType<null> }
>(
  USER_THUNK_TYPES.SIGN_UP_VERIFY_FA,
  async (verifyData, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.post<
      ServerResponseType<UserWithTokenType>
      >(AUTH_API_ROUTES.SIGN_UP_2FA, verifyData);
      setAccessToken(data.data.accessToken);
      return data;
    } catch (error) {
      const err = error as AxiosError<ServerResponseType<null>>;
      return rejectWithValue(err.response!.data);
    }
  }
);

// санка на вход
export const signInThunk = createAsyncThunk<
ServerResponseType<UserWithTokenType | TwoFAResponseType>,
  ISignInData,
  { rejectValue: ServerResponseType<null> }
>(USER_THUNK_TYPES.SIGN_IN, async (userData, { rejectWithValue }) => {
  try {
    const { data } = await axiosInstance.post<
    ServerResponseType<UserWithTokenType | TwoFAResponseType>
    >(AUTH_API_ROUTES.SIGN_IN, userData);
    if ("accessToken" in data.data) {
      setAccessToken(data.data.accessToken);
    }
    return data;
  } catch (error) {
    const err = error as AxiosError<ServerResponseType<null>>;
    return rejectWithValue(err.response!.data);
  }
});

// Подтверждение 2FA при входе (для админов)
export const verifySignIn2FAForAdminThunk = createAsyncThunk<
ServerResponseType<UserWithTokenType>,
  Verify2FADataType,
  { rejectValue: ServerResponseType<null> }
>(
  USER_THUNK_TYPES.SIGN_IN_VERIFY_FA,
  async (verifyData, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.post<
      ServerResponseType<UserWithTokenType>
      >(AUTH_API_ROUTES.SIGN_IN_2FA, verifyData);
      setAccessToken(data.data.accessToken);
      return data;
    } catch (error) {
      const err = error as AxiosError<ServerResponseType<null>>;
      return rejectWithValue(err.response!.data);
    }
  }
);

// получение текующего юзера
export const getProfileThunk = createAsyncThunk<
ServerResponseType<UserType>,
  void,
  { rejectValue: ServerResponseType<null> }
>(USER_THUNK_TYPES.GET_PROFILE, async (_, { rejectWithValue }) => {
  try {
    const { data } = await axiosInstance.get<ServerResponseType<UserType>>(
      "/auth/me",
      { withCredentials: true }
    );
    console.log("getProfileThunk data:", data); // Для отладки
    return data;
  } catch (error) {
    const err = error as AxiosError<ServerResponseType<null>>;
    console.error("getProfileThunk error:", err.response?.data);
    return rejectWithValue(err.response?.data || {
      statusCode: 500,
      message: "Ошибка получения профиля",
      data: null,
      error: err.message || "Unknown error",
    });
  }
});