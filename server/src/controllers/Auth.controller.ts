import type { Request, Response } from 'express';
import { PrismaClient } from '../generated/prisma/index.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import cookieConfig from '../configs/cookieConfig.js';
import formatResponse from '../utils/formatResponse.js';
import generateTokens from '../utils/generateTokens.js';
import { generate2FACode, verify2FACode } from '../services/Auth.service.js';

const prisma = new PrismaClient();

const ACCESS_SECRET = process.env.ACCESS_TOKEN_SECRET!;
const REFRESH_SECRET = process.env.REFRESH_TOKEN_SECRET!;

export class AuthController {
  // Регистрация с 2FA
  static async signup(req: Request, res: Response) {
    const { email, name, password } = req.body;

    if (!email || !name || !password) {
      return res.status(400).json(formatResponse(400, 'Отсутствие обязательных полей'));
    }

    try {
      const existingUser = await prisma.username.findUnique({ where: { email } });

      if (existingUser) {
        return res.status(409).json(formatResponse(409, 'Пользователь уже существует'));
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const user = await prisma.username.create({
        data: {
          email,
          name: name,
          password: hashedPassword,
          role: 'USER',
        },
      });

      // Генерируем и отправляем 2FA-код
      await generate2FACode(user.id, user.email);
      return res
        .status(200)
        .json(
          formatResponse(
            200,
            'Код 2FA отправлен на электронную почту. Пожалуйста, проверьте его для завершения регистрации.',
            { userId: user.id },
          ),
        );
    } catch (error) {
      console.error(error);
      return res.status(500).json(formatResponse(500, 'Server error'));
    }
  }

  // Подтверждение 2FA при регистрации
  static async verifySignup2FA(req: Request, res: Response) {
    const { userId, code } = req.body;
    if (!userId || !code) {
      return res.status(400).json(formatResponse(400, 'Отсутствует идентификатор пользователя или код'));
    }
    const user = await prisma.username.findUnique({ where: { id: userId } });
    if (!user) {
      return res.status(404).json(formatResponse(404, 'Пользователь не найден'));
    }
    const valid = await verify2FACode(user.id, code);
    if (!valid) {
      return res.status(400).json(formatResponse(400, 'Неверный или просроченный код 2FA'));
    }
    const { password: _, ...safeUser } = user;
    const { accessToken, refreshToken } = generateTokens({
      id: user.id,
      email: user.email,
      role: user.role,
    });
    return res.cookie('refreshToken', refreshToken, cookieConfig.refresh).json(
      formatResponse(201, 'Пользователь зарегистрирован и подтвержден', {
        accessToken,
        user: safeUser,
      }),
    );
  }

  // Вход с 2FA для админа
  static async signin(req: Request, res: Response) {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json(formatResponse(400, 'Отсутствует электронная почта или пароль'));
    }

    try {
      const user = await prisma.username.findUnique({ where: { email } });

      if (!user) {
        return res.status(401).json(formatResponse(401, 'Неверные учетные данные'));
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(401).json(formatResponse(401, 'Неверные учетные данные'));
      }

      if (user.role === 'ADMIN') {
        // Генерируем и отправляем 2FA-код
        await generate2FACode(user.id, user.email);
        return res
          .status(200)
          .json(
            formatResponse(
              200,
              'Код 2FA отправлен на электронную почту. Пожалуйста, проверьте его для завершения входа.',
              { userId: user.id },
            ),
          );
      }

      // Для обычных пользователей — обычная авторизация
      const { password: _, ...safeUser } = user;
      const { accessToken, refreshToken } = generateTokens({
        id: user.id,
        email: user.email,
        role: user.role,
      });

      return res
        .cookie('refreshToken', refreshToken, cookieConfig.refresh)
        .json(formatResponse(200, 'Login successful', { accessToken, user: safeUser }));
    } catch (error) {
      console.error(error);
      return res.status(500).json(formatResponse(500, 'Ошибка сервера'));
    }
  }

  // Подтверждение 2FA для входа админа
  static async verifySignin2FA(req: Request, res: Response) {
    const { userId, code } = req.body;
    if (!userId || !code) {
      return res.status(400).json(formatResponse(400, 'Отсутствует идентификатор пользователя или код'));
    }
    const user = await prisma.username.findUnique({ where: { id: userId } });
    if (!user) {
      return res.status(404).json(formatResponse(404, 'Пользователь не найден'));
    }
    const valid = await verify2FACode(user.id, code);
    if (!valid) {
      return res.status(400).json(formatResponse(400, 'Неверный или просроченный код 2FA'));
    }
    const { password: _, ...safeUser } = user;
    const { accessToken, refreshToken } = generateTokens({
      id: user.id,
      email: user.email,
      role: user.role,
    });
    return res
      .cookie('refreshToken', refreshToken, cookieConfig.refresh)
      .json(formatResponse(200, 'Вход выполнен успешно', { accessToken, user: safeUser }));
  }

  // Выход
  static async signout(req: Request, res: Response) {
    return res
      .clearCookie('refreshToken', cookieConfig.refresh)
      .json(formatResponse(200, 'Выход выполнен успешно'));
  }

  // Обновление токенов
  static async refreshTokens(req: Request, res: Response) {
    try {
      const user = await prisma.username.findUnique({ where: { id: req.user?.id } });
      if (!user) {
        return res.status(404).json(formatResponse(404, 'Пользователь не найден'));
      }

      const { accessToken, refreshToken } = generateTokens({
        id: user.id,
        email: user.email,
        role: user.role,
      });

      return res
        .cookie('refreshToken', refreshToken, cookieConfig.refresh)
        .json(formatResponse(200, 'Жетоны обновлены', { accessToken, user }));
    } catch (error) {
      console.error(error);
      return res.status(500).json(formatResponse(500, 'Ошибка сервера'));
    }
  }

  // Получить текущего пользователя
  static async currentUser(req: Request, res: Response) {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json(formatResponse(401, 'Не авторизован'));
      }

      const token = authHeader.split(' ')[1];
      const decoded = jwt.verify(token, ACCESS_SECRET) as jwt.JwtPayload;

      const user = await prisma.username.findUnique({ where: { id: decoded.id } });
      if (!user) {
        return res.status(404).json(formatResponse(404, 'Пользователь не найден'));
      }

      const { password: _, ...safeUser } = user;
      return res.status(200).json(formatResponse(200, 'Пользователь получен', safeUser));
    } catch (error) {
      console.error(error);
      return res.status(401).json(formatResponse(401, 'Неверный или просроченный токен'));
    }
  }

  static async getAllUsers(req: Request, res: Response) {
    const users = await prisma.username.findMany();
    return res.status(200).json(formatResponse(200, 'Пользователи получены', users));
  }
}
