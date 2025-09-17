import { PrismaClient } from '../generated/prisma/index.js';
import nodemailer from 'nodemailer';

const prisma = new PrismaClient();

interface NotificationSettings {
  email: boolean;
  push: boolean;
  telegram: boolean;
  newOrders: boolean;
  staleOrders: boolean;
  deadlineReminders: boolean;
  telegramBotToken?: string | null;
  telegramChatId?: string | null;
  emailRecipients?: string | null;
  staleOrderHours: number;
}

interface SendNotificationOptions {
  orderId: number;
  type: 'new_order' | 'stale_order' | 'deadline';
  message: string;
}

export class NotificationService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: 'smtp.mail.ru',
      port: 465,
      secure: true,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
  }

  async getSettings(): Promise<NotificationSettings> {
    let settings = await prisma.notificationSettings.findFirst();
    
    if (!settings) {
      settings = await prisma.notificationSettings.create({
        data: {
          email: true,
          push: false,
          telegram: false,
          newOrders: true,
          staleOrders: true,
          deadlineReminders: true,
          staleOrderHours: 24,
        },
      });
    }

    return settings;
  }

  async updateSettings(newSettings: Partial<NotificationSettings>) {
    const existing = await this.getSettings();
    
    return prisma.notificationSettings.update({
      where: { id: (existing as any).id },
      data: newSettings,
    });
  }

  async sendNotification(options: SendNotificationOptions) {
    const settings = await this.getSettings();
    const order = await prisma.order.findUnique({
      where: { id: options.orderId },
    });

    if (!order) {
      throw new Error(`Order with id ${options.orderId} not found`);
    }

    const notificationPromises: Promise<any>[] = [];

    // Email notifications
    if (settings.email && settings.emailRecipients) {
      const recipients = settings.emailRecipients.split(',').map(email => email.trim());
      
      recipients.forEach(recipient => {
        notificationPromises.push(
          this.sendEmailNotification(recipient, options.message, options.type)
            .then(success => this.logNotification({
              orderId: options.orderId,
              type: options.type,
              method: 'email',
              recipient,
              message: options.message,
              success,
              error: success ? undefined : 'Email sending failed',
            }))
            .catch(error => this.logNotification({
              orderId: options.orderId,
              type: options.type,
              method: 'email',
              recipient,
              message: options.message,
              success: false,
              error: error.message,
            }))
        );
      });
    }

    // Telegram notifications
    if (settings.telegram && settings.telegramBotToken && settings.telegramChatId) {
      notificationPromises.push(
        this.sendTelegramNotification(options.message, settings.telegramBotToken, settings.telegramChatId)
          .then(success => this.logNotification({
            orderId: options.orderId,
            type: options.type,
            method: 'telegram',
            recipient: settings.telegramChatId!,
            message: options.message,
            success,
            error: success ? undefined : 'Telegram sending failed',
          }))
          .catch(error => this.logNotification({
            orderId: options.orderId,
            type: options.type,
            method: 'telegram',
            recipient: settings.telegramChatId!,
            message: options.message,
            success: false,
            error: error.message,
          }))
      );
    }

    // Push notifications (would require additional setup)
    if (settings.push) {
      // Implement push notification logic here
      notificationPromises.push(
        Promise.resolve().then(() => this.logNotification({
          orderId: options.orderId,
          type: options.type,
          method: 'push',
          message: options.message,
          success: false,
          error: 'Push notifications not implemented yet',
        }))
      );
    }

    await Promise.allSettled(notificationPromises);
  }

  private async sendEmailNotification(to: string, message: string, type: string): Promise<boolean> {
    try {
      const subject = `Уведомление о заказе: ${this.getNotificationSubject(type)}`;
      
      // Получаем информацию о заказе для красивого оформления
      const orderMatch = message.match(/Заказ #(\d+)/);
      let orderInfoHtml = '';
      
      if (orderMatch) {
        const orderId = parseInt(orderMatch[1]);
        const order = await prisma.order.findUnique({
          where: { id: orderId },
        });
        
        if (order) {
          const statusLabels = {
            'NEW': 'Новый',
            'IN_PROGRESS': 'В работе',
            'COMPLETED': 'Завершен',
            'CANCELLED': 'Отменен'
          };
          
          orderInfoHtml = `
            <div class="field">
              <span class="field-name">Клиент:</span> ${order.name}
            </div>
            <div class="field">
              <span class="field-name">Телефон:</span> ${order.phone}
            </div>
            ${order.email ? `<div class="field"><span class="field-name">Email:</span> ${order.email}</div>` : ''}
            ${order.address ? `<div class="field"><span class="field-name">Адрес:</span> ${order.address}</div>` : ''}
            ${order.amount ? `<div class="field"><span class="field-name">Сумма:</span> ${order.amount} руб.</div>` : ''}
            <div class="field">
              <span class="field-name">Статус:</span> ${statusLabels[order.status as keyof typeof statusLabels] || order.status}
            </div>
            <div class="field">
              <span class="field-name">Создан:</span> ${order.createdAt.toLocaleString('ru-RU')}
            </div>
          `;
        }
      }

      const htmlTemplate = `
      <!DOCTYPE html>
      <html lang="ru">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${subject}</title>
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
          .field {
            margin-bottom: 15px;
          }
          .field-name {
            font-weight: bold;
            color: #4a76a8;
          }
          .message {
            background-color: #f9f9f9;
            padding: 15px;
            border-radius: 5px;
            border-left: 4px solid #4a76a8;
            margin-top: 20px;
          }
          .footer {
            margin-top: 20px;
            font-size: 12px;
            color: #777;
            text-align: center;
          }
          .notification-type {
            display: inline-block;
            padding: 6px 12px;
            background-color: #e7f3ff;
            border-radius: 15px;
            color: #4a76a8;
            font-size: 12px;
            font-weight: bold;
            margin-bottom: 15px;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>СТРОЙКА • ${this.getNotificationSubject(type)}</h1>
        </div>
        <div class="content">
          <div class="notification-type">
            ${this.getNotificationSubject(type).toUpperCase()}
          </div>
          
          ${orderInfoHtml || `
            <div class="field">
              <span class="field-name">Сообщение:</span> ${message.replace(/\n/g, '<br>')}
            </div>
          `}
          
          <div class="message">
            <strong>Детали уведомления:</strong><br>
            ${message.replace(/\n/g, '<br>')}
          </div>
        </div>
        <div class="footer">
          Это автоматическое уведомление от системы СТРОЙКА<br>
          © 2024 СТРОЙКА. Все права защищены.
        </div>
      </body>
      </html>
      `;

      await this.transporter.sendMail({
        from: process.env.EMAIL_USER,
        to,
        subject,
        text: message,
        html: htmlTemplate,
      });

      return true;
    } catch (error) {
      console.error('Email sending error:', error);
      return false;
    }
  }

  private async sendTelegramNotification(message: string, botToken: string, chatId: string): Promise<boolean> {
    try {
      const url = `https://api.telegram.org/bot${botToken}/sendMessage`;
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chat_id: chatId,
          text: message,
          parse_mode: 'HTML',
        }),
      });

      return response.ok;
    } catch (error) {
      console.error('Telegram sending error:', error);
      return false;
    }
  }

  private async logNotification(data: {
    orderId: number;
    type: string;
    method: string;
    recipient?: string;
    message: string;
    success: boolean;
    error?: string;
  }) {
    await prisma.notificationHistory.create({
      data,
    });
  }

  private getNotificationSubject(type: string): string {
    const subjects = {
      new_order: 'Новый заказ',
      stale_order: 'Зависший заказ',
      deadline: 'Напоминание о дедлайне',
    };

    return subjects[type as keyof typeof subjects] || 'Уведомление о заказе';
  }

  async checkStaleOrders() {
    const settings = await this.getSettings();
    const staleTime = new Date();
    staleTime.setHours(staleTime.getHours() - settings.staleOrderHours);

    const staleOrders = await prisma.order.findMany({
      where: {
        status: 'NEW',
        createdAt: { lt: staleTime },
        newOrderNotified: true,
        deadlineNotified: false,
      },
    });

    for (const order of staleOrders) {
      const message = `Заказ #${order.id} находится в статусе "Новый" более ${settings.staleOrderHours} часов.\n`
        + `Клиент: ${order.name}\n`
        + `Телефон: ${order.phone}\n`
        + `Email: ${order.email || 'не указан'}\n`
        + `Создан: ${order.createdAt.toLocaleString('ru-RU')}`;

      await this.sendNotification({
        orderId: order.id,
        type: 'stale_order',
        message,
      });

      await prisma.order.update({
        where: { id: order.id },
        data: { deadlineNotified: true },
      });
    }
  }

  async notifyNewOrder(orderId: number) {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order || order.newOrderNotified) {
      return;
    }

    const settings = await this.getSettings();
    
    if (settings.newOrders) {
      const message = `Новый заказ #${order.id}\n`
        + `Клиент: ${order.name}\n`
        + `Телефон: ${order.phone}\n`
        + `Email: ${order.email || 'не указан'}\n`
        + `Услуга: ${order.message || 'не указана'}\n`
        + `Адрес: ${order.address || 'не указан'}\n`
        + `Сумма: ${order.amount ? `${order.amount} руб.` : 'не указана'}`;

      await this.sendNotification({
        orderId: order.id,
        type: 'new_order',
        message,
      });

      await prisma.order.update({
        where: { id: order.id },
        data: { newOrderNotified: true },
      });
    }
  }

  async checkDeadlines() {
    const settings = await this.getSettings();
    
    if (!settings.deadlineReminders) {
      return;
    }

    const now = new Date();
    const upcomingDeadlines = await prisma.order.findMany({
      where: {
        deadline: {
          not: null,
          gt: now,
          lt: new Date(now.getTime() + 24 * 60 * 60 * 1000), // Within next 24 hours
        },
        deadlineNotified: false,
      },
    });

    for (const order of upcomingDeadlines) {
      if (order.deadline) {
        const hoursLeft = Math.ceil((order.deadline.getTime() - now.getTime()) / (60 * 60 * 1000));
        
        const message = `Напоминание о дедлайне заказа #${order.id}\n`
          + `Клиент: ${order.name}\n`
          + `Телефон: ${order.phone}\n`
          + `Дедлайн: ${order.deadline.toLocaleString('ru-RU')}\n`
          + `Осталось времени: ${hoursLeft} часов`;

        await this.sendNotification({
          orderId: order.id,
          type: 'deadline',
          message,
        });

        await prisma.order.update({
          where: { id: order.id },
          data: { deadlineNotified: true },
        });
      }
    }
  }
}

export const notificationService = new NotificationService();