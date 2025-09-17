// Тип авторизации
export interface ISignInData {
  email: string;
  password: string;
}

// Тип регистрации
export interface ISignUpData extends ISignInData {
  name: string;
}

// Тип юзера
export type UserType = {
  id: string;// точно ли стринга?
  role: "ADMIN" | "USER"; // проверить
  email: string;
  name: string;
  createdAt?: string;
  updatedAt?: string;
}
// Тип юзера с токеном доступа
export type UserWithTokenType = {
  user: UserType;
  accessToken: string;
  // refreshToken: string;
}

// тип Ответа для получения кода на почту
export type TwoFAResponseType = {
  userId: string;// и точно ли тут стринга?
  message: string;
}

// тип для Запроса!
export type Verify2FADataType = {
  userId: string;
  code: string;
}