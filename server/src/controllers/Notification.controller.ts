import { Request, Response } from 'express';
import { PrismaClient } from '../generated/prisma/index.js';
import { notificationService } from '../services/Notification.service.js';

const prisma = new PrismaClient();

export class NotificationController {
  static async getSettings(req: Request, res: Response) {
    try {
      const settings = await notificationService.getSettings();
      res.json(settings);
    } catch (error) {
      console.error('Error getting notification settings:', error);
      res.status(500).json({ error: 'Failed to get notification settings' });
    }
  }

  static async updateSettings(req: Request, res: Response) {
    try {
      const {
        email,
        push,
        telegram,
        newOrders,
        staleOrders,
        deadlineReminders,
        telegramBotToken,
        telegramChatId,
        emailRecipients,
        staleOrderHours,
      } = req.body;

      const updatedSettings = await notificationService.updateSettings({
        email,
        push,
        telegram,
        newOrders,
        staleOrders,
        deadlineReminders,
        telegramBotToken,
        telegramChatId,
        emailRecipients,
        staleOrderHours,
      });

      res.json(updatedSettings);
    } catch (error) {
      console.error('Error updating notification settings:', error);
      res.status(500).json({ error: 'Failed to update notification settings' });
    }
  }

  static async getNotificationHistory(req: Request, res: Response) {
    try {
      const { page = 1, limit = 50, type, method } = req.query;
      const skip = (Number(page) - 1) * Number(limit);
      
      const where: any = {};
      if (type) where.type = type;
      if (method) where.method = method;

      const [notifications, total] = await Promise.all([
        prisma.notificationHistory.findMany({
          where,
          orderBy: { createdAt: 'desc' },
          skip,
          take: Number(limit),
        }),
        prisma.notificationHistory.count({ where }),
      ]);

      res.json({
        data: notifications,
        total,
        page: Number(page),
        totalPages: Math.ceil(total / Number(limit)),
      });
    } catch (error) {
      console.error('Error getting notification history:', error);
      res.status(500).json({ error: 'Failed to get notification history' });
    }
  }

  static async testNotification(req: Request, res: Response): Promise<any> {
    try {
      const { type, orderId } = req.body;

      if (!orderId) {
        return res.status(400).json({ error: 'Order ID is required' });
      }

      // Проверяем существование заказа
      const order = await prisma.order.findUnique({
        where: { id: Number(orderId) },
      });

      if (!order) {
        return res.status(404).json({ error: `Order with id ${orderId} not found` });
      }

      let message = '';
      let notificationType: 'new_order' | 'stale_order' | 'deadline' = 'new_order';

      switch (type) {
        case 'new_order':
          message = `Тестовое уведомление: Новый заказ #${orderId}\n`
            + `Клиент: ${order.name}\n`
            + `Телефон: ${order.phone}\n`
            + `Email: ${order.email || 'не указан'}\n`
            + `Услуга: ${order.message || 'не указана'}\n`
            + `Адрес: ${order.address || 'не указан'}\n`
            + `Сумма: ${order.amount ? `${order.amount} руб.` : 'не указана'}\n\n`
            + `Это тестовое сообщение для проверки работы системы уведомлений.`;
          notificationType = 'new_order';
          break;
        case 'stale_order':
          message = `Тестовое уведомление: Заказ #${orderId} в статусе "Новый" более 24 часов\n`
            + `Клиент: ${order.name}\n`
            + `Телефон: ${order.phone}\n`
            + `Email: ${order.email || 'не указан'}\n`
            + `Создан: ${order.createdAt.toLocaleString('ru-RU')}\n\n`
            + `Это тестовое сообщение для проверки работы системы уведомлений.`;
          notificationType = 'stale_order';
          break;
        case 'deadline':
          const deadlineInfo = order.deadline
            ? `Дедлайн: ${order.deadline.toLocaleString('ru-RU')}`
            : 'Дедлайн: не установлен';
          
          message = `Тестовое уведомление: Напоминание о дедлайне заказа #${orderId}\n`
            + `Клиент: ${order.name}\n`
            + `Телефон: ${order.phone}\n`
            + `${deadlineInfo}\n\n`
            + `Это тестовое сообщение для проверки работы системы уведомлений.`;
          notificationType = 'deadline';
          break;
        default:
          return res.status(400).json({ error: 'Invalid notification type' });
      }

      await notificationService.sendNotification({
        orderId: Number(orderId),
        type: notificationType,
        message,
      });

      res.json({ success: true, message: 'Test notification sent' });
    } catch (error) {
      console.error('Error sending test notification:', error);
      res.status(500).json({ error: 'Failed to send test notification' });
    }
  }

  static async checkStaleOrders(req: Request, res: Response) {
    try {
      await notificationService.checkStaleOrders();
      res.json({ success: true, message: 'Stale orders check completed' });
    } catch (error) {
      console.error('Error checking stale orders:', error);
      res.status(500).json({ error: 'Failed to check stale orders' });
    }
  }

  static async checkDeadlines(req: Request, res: Response) {
    try {
      await notificationService.checkDeadlines();
      res.json({ success: true, message: 'Deadlines check completed' });
    } catch (error) {
      console.error('Error checking deadlines:', error);
      res.status(500).json({ error: 'Failed to check deadlines' });
    }
  }
}

export const notificationController = new NotificationController();