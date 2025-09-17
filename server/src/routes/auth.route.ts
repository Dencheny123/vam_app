import { Router } from 'express';
import { AuthController } from '../controllers/Auth.controller.js';
import { verifyAccessToken, verifyRefreshToken } from '../middlewares/verifyTokens.js';

const authRouter = Router();

// Регистрация
authRouter.post('/signup', async (req, res) => {
  await AuthController.signup(req, res);
});

// Вход
authRouter.post('/signin', async (req, res) => {
  await AuthController.signin(req, res);
});

// Выход
authRouter.post('/signout', async (req, res) => {
  await AuthController.signout(req, res);
});

// Обновление токенов
authRouter.post('/refresh', verifyRefreshToken, async (req, res) => {
  await AuthController.refreshTokens(req, res);
});

// Получение текущего пользователя
authRouter.get('/me', verifyAccessToken, async (req, res) => {
  await AuthController.currentUser(req, res);
});

authRouter.get('/users', async (req, res) => {
  await AuthController.getAllUsers(req, res);
});

// Подтверждение 2FA при регистрации
authRouter.post('/signup/verify', async (req, res) => {
  await AuthController.verifySignup2FA(req, res);
});

// Подтверждение 2FA при входе (для админа)
authRouter.post('/signin/verify', async (req, res) => {
  await AuthController.verifySignin2FA(req, res);
});

export default authRouter;
