const jwtConfig = {
  access: {
    expiresIn: 1000 * 60 * 30, // время жизни access токена // 30 минут
  },
  refresh: {
    expiresIn: 1000 * 60 * 60 * 24, // время жизни refresh токена // 24 часа
  },
};

export default jwtConfig;
