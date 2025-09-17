import { notificationService } from '../services/Notification.service.js';

export class NotificationScheduler {
  private static staleOrdersInterval: NodeJS.Timeout | null = null;
  private static deadlinesInterval: NodeJS.Timeout | null = null;

  static start() {
    // Проверка зависших заказов каждые 30 минут (1800000 мс)
    this.staleOrdersInterval = setInterval(async () => {
      try {
        console.log('Проверка зависших заказов...');
        await notificationService.checkStaleOrders();
        console.log('Проверка зависших заказов завершена');
      } catch (error) {
        console.error('Ошибка при проверке зависших заказов:', error);
      }
    }, 30 * 60 * 1000); // 30 минут

    // Проверка дедлайнов каждые 10 минут (600000 мс)
    this.deadlinesInterval = setInterval(async () => {
      try {
        console.log('Проверка дедлайнов...');
        await notificationService.checkDeadlines();
        console.log('Проверка дедлайнов завершена');
      } catch (error) {
        console.error('Ошибка при проверке дедлайнов:', error);
      }
    }, 10 * 60 * 1000); // 10 минут

    console.log('Планировщик уведомлений запущен');
  }

  static stop() {
    if (this.staleOrdersInterval) {
      clearInterval(this.staleOrdersInterval);
      this.staleOrdersInterval = null;
    }
    if (this.deadlinesInterval) {
      clearInterval(this.deadlinesInterval);
      this.deadlinesInterval = null;
    }
    console.log('Планировщик уведомлений остановлен');
  }
}