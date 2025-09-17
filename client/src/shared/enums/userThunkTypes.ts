export enum USER_THUNK_TYPES {
  REFRESH_TOKEN = 'user/refreshToken',
  SIGN_IN = 'user/signIn',
  SIGN_UP = 'user/signUp',
  SIGN_OUT = 'user/signOut',
  SIGN_UP_VERIFY_FA = 'user/signUp/verify2FA',
  SIGN_IN_VERIFY_FA = 'admin/signIn/verify2FA',
  GET_PROFILE = 'allroles/get/me'
}