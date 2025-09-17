import { Router } from 'express';
import { NotificationController } from '../controllers/Notification.controller.js';

const router = Router();

// Получение настроек уведомлений
router.get('/settings', NotificationController.getSettings);

// Обновление настроек уведомлений
router.put('/settings', NotificationController.updateSettings);

// Получение истории уведомлений
router.get('/history', NotificationController.getNotificationHistory);

// Тестовая отправка уведомления
router.post('/test', NotificationController.testNotification);

// Проверка зависших заказов (ручной запуск)
router.post('/check-stale-orders', NotificationController.checkStaleOrders);

// Проверка дедлайнов (ручной запуск)
router.post('/check-deadlines', NotificationController.checkDeadlines);

export default router;