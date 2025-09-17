import { Request, Response } from 'express';
import { AnalyticsService } from '../services/Analytics.service.js';
import formatResponse from '../utils/formatResponse.js';

export class AnalyticsController {
  static async trackEvent(req: Request, res: Response) {
    try {
      const {
        eventType,
        page,
        referrer,
        url,
        metadata
      } = req.body;

      // Базовые данные из запроса
      const eventData: any = {
        eventType: eventType || 'pageview',
        page: page || req.headers.referer || 'unknown',
        referrer: referrer || req.headers.referer,
        url: url || req.headers.referer || 'unknown',
        userAgent: req.get('User-Agent'),
        ip: req.ip,
        metadata: metadata || {}
      };

      // Добавляем геолокацию, если есть соответствующие заголовки
      const country = req.get('CF-IPCountry') || req.get('X-GeoIP-Country');
      const city = req.get('X-GeoIP-City');
      
      if (country) eventData.country = country;
      if (city) eventData.city = city;

      // Парсим userAgent для получения информации об устройстве и браузере
      const userAgent = eventData.userAgent;
      if (userAgent) {
        // Простой парсинг userAgent (можно заменить на библиотеку ua-parser-js)
        if (userAgent.includes('Mobile')) {
          eventData.device = 'mobile';
        } else if (userAgent.includes('Tablet')) {
          eventData.device = 'tablet';
        } else {
          eventData.device = 'desktop';
        }

        if (userAgent.includes('Chrome')) eventData.browser = 'Chrome';
        else if (userAgent.includes('Firefox')) eventData.browser = 'Firefox';
        else if (userAgent.includes('Safari')) eventData.browser = 'Safari';
        else if (userAgent.includes('Edge')) eventData.browser = 'Edge';
        else if (userAgent.includes('Opera')) eventData.browser = 'Opera';

        if (userAgent.includes('Windows')) eventData.os = 'Windows';
        else if (userAgent.includes('Mac')) eventData.os = 'macOS';
        else if (userAgent.includes('Linux')) eventData.os = 'Linux';
        else if (userAgent.includes('Android')) eventData.os = 'Android';
        else if (userAgent.includes('iOS')) eventData.os = 'iOS';
      }

      // Язык пользователя
      const acceptLanguage = req.get('Accept-Language');
      if (acceptLanguage) {
        eventData.language = acceptLanguage.split(',')[0];
      }

      await AnalyticsService.trackEvent(eventData);

      res.json({ success: true, message: 'Event tracked successfully' });
    } catch (error) {
      console.error('Error tracking analytics event:', error);
      res.status(500).json({ 
        success: false, 
        error: 'Internal server error' 
      });
    }
  }

  static async getStats(req: Request, res: Response) {
    try {
      const { timeRange = 'week' } = req.query;

      const [pageViews, deviceStats, browserStats, totalStats] = await Promise.all([
        AnalyticsService.getPageViews(timeRange as any),
        AnalyticsService.getDeviceStats(timeRange as any),
        AnalyticsService.getBrowserStats(timeRange as any),
        AnalyticsService.getTotalStats()
      ]);

      res.json({
        success: true,
        data: {
          pageViews,
          deviceStats,
          browserStats,
          totalStats
        }
      });
    } catch (error) {
      console.error('Error getting analytics stats:', error);
      res.status(500).json({ 
        success: false, 
        error: 'Internal server error' 
      });
    }
  }

  static async getPageViews(req: Request, res: Response) {
    try {
      const { timeRange = 'week' } = req.query;
      const pageViews = await AnalyticsService.getPageViews(timeRange as any);

      res.json({
        success: true,
        data: pageViews
      });
    } catch (error) {
      console.error('Error getting page views stats:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }

  static async getDeviceStats(req: Request, res: Response) {
    try {
      const { timeRange = 'week' } = req.query;
      const deviceStats = await AnalyticsService.getDeviceStats(timeRange as any);

      res.json({
        success: true,
        data: deviceStats
      });
    } catch (error) {
      console.error('Error getting device stats:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }

  static async getBrowserStats(req: Request, res: Response) {
    try {
      const { timeRange = 'week' } = req.query;
      const browserStats = await AnalyticsService.getBrowserStats(timeRange as any);

      res.json({
        success: true,
        data: browserStats
      });
    } catch (error) {
      console.error('Error getting browser stats:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }

  static async getDevicePages(req: Request, res: Response) {
    try {
      const { timeRange = 'week' } = req.query;
      const devicePages = await AnalyticsService.getPageViewsByDevice(timeRange as any);

      res.json({
        success: true,
        data: devicePages
      });
    } catch (error) {
      console.error('Error getting device pages stats:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }

  static async getHourlyStats(req: Request, res: Response) {
    try {
      const { timeRange = 'week' } = req.query;
      const hourlyStats = await AnalyticsService.getHourlyStats(timeRange as any);

      res.json({
        success: true,
        data: hourlyStats
      });
    } catch (error) {
      console.error('Error getting hourly stats:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }

  static async getDailyStats(req: Request, res: Response) {
    try {
      const { timeRange = 'week' } = req.query;
      const dailyStats = await AnalyticsService.getDailyStats(timeRange as any);

      res.json({
        success: true,
        data: dailyStats
      });
    } catch (error) {
      console.error('Error getting daily stats:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }

  static async getOrderStats(req: Request, res: Response) {
    try {
      const { timeRange = 'week' } = req.query;
      const orderStats = await AnalyticsService.getOrderStats(timeRange as any);

      res.json({
        success: true,
        data: orderStats
      });
    } catch (error) {
      console.error('Error getting order stats:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }

  static async getOrderConversionStats(req: Request, res: Response) {
    try {
      const conversionStats = await AnalyticsService.getOrderConversionStats();

      res.json({
        success: true,
        data: conversionStats
      });
    } catch (error) {
      console.error('Error getting order conversion stats:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }
}