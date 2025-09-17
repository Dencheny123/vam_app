import jwtConfig from './jwtConfig.js';

const cookieConfig = {
  access: {
    maxAge: jwtConfig.access.expiresIn, // Время жизни access-токена в cookie
    httpOnly: true, // Cookie нельзя прочитать через JavaScript (защита от XSS)
    secure: true,
    // sameSite: 'lax',
    // path: '/',
  },
  refresh: {
    maxAge: jwtConfig.refresh.expiresIn, // Время жизни refresh-токена в cookie
    httpOnly: true, // То же самое — безопаснее
    secure: true,
    // sameSite: 'lax',
    // path: '/',
  },
};

export default cookieConfig;
