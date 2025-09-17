import { PrismaClient } from '../generated/prisma/index.js';
import nodemailer from 'nodemailer';
const prisma = new PrismaClient();

export class AuthService {
  // Метод регистрации пользователя
  static async register({
    email,
    username,
    password,
  }: {
    email: string;
    username: string;
    password: string;
  }) {
    // Проверяем, существует ли пользователь
    const existingUser = await prisma.username.findUnique({ where: { email } });

    if (existingUser) {
      return { user: existingUser, created: false };
    }

    // Создаём нового пользователя
    const user = await prisma.username.create({
      data: {
        email,
        name: username,
        password,
        role: 'USER', // если вы используете enum Role
      },
    });

    return { user, created: true };
  }

  // Получение пользователя по email
  static async getUserByEmail(email: string) {
    const user = await prisma.username.findUnique({ where: { email } });
    return user;
  }

  // Получение всех пользователей
  static async getAllUsers() {
    const users = await prisma.username.findMany();
    return users;
  }
}

export async function generate2FACode(userId: number, email: string) {
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  const expires = new Date(Date.now() + 10 * 60 * 1000); // 10 минут
  await prisma.username.update({
    where: { id: userId },
    data: { twoFACode: code, twoFACodeExpires: expires },
  });
  try {
    await send2FACodeEmail(email, code);
  } catch (e) {
    // Откатываем код, если письмо не отправлено
    await prisma.username.update({
      where: { id: userId },
      data: { twoFACode: null, twoFACodeExpires: null },
    });
    throw new Error('Ошибка отправки письма: ' + (e instanceof Error ? e.message : e));
  }
}

export async function send2FACodeEmail(email: string, code: string) {
  const transporter = nodemailer.createTransport({
    host: 'smtp.mail.ru',
    port: 465,
    secure: true,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
    logger: true,
    debug: true,
  });

  const htmlTemplate = `
  <!DOCTYPE html>
  <html lang="ru">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Код подтверждения</title>
    <style>
      body {
        font-family: Arial, sans-serif;
        line-height: 1.6;
        color: #333;
        max-width: 600px;
        margin: 0 auto;
        padding: 20px;
      }
      .header {
        background-color: #4a76a8;
        color: white;
        padding: 15px;
        text-align: center;
        border-radius: 5px 5px 0 0;
      }
      .content {
        border: 1px solid #ddd;
        border-top: none;
        padding: 20px;
        border-radius: 0 0 5px 5px;
      }
      .code {
        font-size: 24px;
        font-weight: bold;
        text-align: center;
        margin: 20px 0;
        padding: 15px;
        background-color: #f5f5f5;
        border-radius: 5px;
        letter-spacing: 5px;
      }
      .footer {
        margin-top: 20px;
        font-size: 12px;
        color: #777;
        text-align: center;
      }
      .note {
        margin-bottom: 20px;
        color: #666;
      }
    </style>
  </head>
  <body>
    <div class="header">
      <h1>Ваш код подтверждения</h1>
    </div>
    <div class="content">
      <p class="note">Для завершения входа в систему используйте следующий код подтверждения:</p>
      
      <div class="code">${code}</div>
      
      <p class="note">Этот код действителен в течение 10 минут. Если вы не запрашивали этот код, пожалуйста, проигнорируйте это письмо.</p>
    </div>
    <div class="footer">
      Это письмо было отправлено автоматически. Пожалуйста, не отвечайте на него.
    </div>
  </body>
  </html>
  `;

  await transporter.sendMail({
    from: process.env.SMTP_FROM || process.env.SMTP_USER,
    to: email,
    subject: 'Ваш код подтверждения',
    text: `Ваш код подтверждения: ${code}`,
    html: htmlTemplate,
  });
}

export async function verify2FACode(userId: number, code: string): Promise<boolean> {
  const user = await prisma.username.findUnique({ where: { id: userId } });
  if (!user || !user.twoFACode || !user.twoFACodeExpires) return false;
  if (user.twoFACode === code && user.twoFACodeExpires > new Date()) {
    await prisma.username.update({
      where: { id: userId },
      data: { twoFACode: null, twoFACodeExpires: null },
    });
    return true;
  }
  return false;
}
