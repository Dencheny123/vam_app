import { Router } from 'express';
import { AnalyticsController } from '../controllers/analytics.controller.js';

const analyticsRouter = Router();

// Трек analytics событий
analyticsRouter.post('/', AnalyticsController.trackEvent);

// Получение общей статистики
analyticsRouter.get('/stats', AnalyticsController.getStats);

// Получение статистики по просмотрам страниц
analyticsRouter.get('/stats/pageviews', AnalyticsController.getPageViews);

// Получение статистики по устройствам
analyticsRouter.get('/stats/devices', AnalyticsController.getDeviceStats);

// Получение статистики по браузерам
analyticsRouter.get('/stats/browsers', AnalyticsController.getBrowserStats);

// Получение статистики по страницам с группировкой по устройствам
analyticsRouter.get('/stats/device-pages', AnalyticsController.getDevicePages);

// Получение почасовой статистики
analyticsRouter.get('/stats/hourly', AnalyticsController.getHourlyStats);

// Получение ежедневной статистики
analyticsRouter.get('/stats/daily', AnalyticsController.getDailyStats);

// Получение статистики заказов
analyticsRouter.get('/stats/orders', AnalyticsController.getOrderStats);

// Получение статистики конверсии заказов
analyticsRouter.get('/stats/orders/conversion', AnalyticsController.getOrderConversionStats);

export default analyticsRouter;