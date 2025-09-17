import jwt from 'jsonwebtoken';
import formatResponse from '../utils/formatResponse.js';

export const verifyAccessToken = (req: any, res: any, next: any) => {
  try {
    const accessToken = req.headers.authorization.split(' ')[1]; // Bearer <token>
    const { user } = jwt.verify(
      accessToken,
      process.env.ACCESS_TOKEN_SECRET!,
    ) as jwt.JwtPayload;
    res.locals.user = user;

    return next();
  } catch (error) {
    console.log('Invalid access token', error);
    return res.status(403).json(formatResponse(403, 'Forbidden'));
  }
};

const REFRESH_SECRET = process.env.REFRESH_TOKEN_SECRET!;

interface UserPayload {
  id: number;
  email: string;
  role: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: UserPayload;
    }
  }
}

export const verifyRefreshToken = (req: any, res: any, next: any) => {
  const { refreshToken } = req.cookies;
  if (!refreshToken) {
    return res.status(401).json(formatResponse(401, 'No refresh token provided'));
  }
  try {
    if (!process.env.REFRESH_TOKEN_SECRET) {
      throw new Error('REFRESH_TOKEN_SECRET is not defined');
    }
    const decoded = jwt.verify(
      refreshToken,
      process.env.REFRESH_TOKEN_SECRET,
    ) as jwt.JwtPayload;
    req.user = decoded;
    next();
    } catch (error) {
      console.log('Invalid refresh token', error);
      return res.status(401).json(formatResponse(401, 'Invalid refresh token'));
    }
};
