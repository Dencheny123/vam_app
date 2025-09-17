import jwt from 'jsonwebtoken';
import jwtConfig from '../configs/jwtConfig.js';

const generateTokens = (payload: any) => ({
  accessToken: jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET || '', jwtConfig.access),
  refreshToken: jwt.sign(
    payload,
    process.env.REFRESH_TOKEN_SECRET || '',
    jwtConfig.refresh,
  ),
});

export default generateTokens;
