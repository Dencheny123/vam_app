import { PrismaClient } from '../generated/prisma/index.js';
const prisma = new PrismaClient();

export interface AnalyticsEventData {
  eventType: string;
  page: string;
  referrer?: string;
  url: string;
  userAgent?: string;
  ip?: string;
  country?: string;
  city?: string;
  device?: string;
  browser?: string;
  os?: string;
  language?: string;
  screen?: string;
  userId?: string;
  metadata?: any;
}

export class AnalyticsService {
  static async trackEvent(eventData: AnalyticsEventData) {
    try {
      return await prisma.analyticsEvent.create({
        data: eventData
      });
    } catch (error) {
      console.error('Error tracking analytics event:', error);
      throw error;
    }
  }

  static async getPageViews(timeRange: 'today' | 'week' | 'month' | 'all') {
    const where = this.getTimeRangeWhere(timeRange);
    
    return await prisma.analyticsEvent.groupBy({
      by: ['page'],
      where: {
        ...where,
        eventType: 'pageview',
        page: {
          not: {
            contains: 'admin'
          }
        }
      },
      _count: {
        id: true
      },
      orderBy: {
        _count: {
          id: 'desc'
        }
      }
    });
  }

  static async getPageViewsByDevice(timeRange: 'today' | 'week' | 'month' | 'all') {
    const where = this.getTimeRangeWhere(timeRange);
    
    const devicePages = await prisma.analyticsEvent.groupBy({
      by: ['device', 'page'],
      where: {
        ...where,
        eventType: 'pageview',
        page: {
          not: {
            contains: 'admin'
          }
        }
      },
      _count: {
        id: true
      },
      orderBy: {
        device: 'asc'
      }
    });

    // Group pages by device
    const groupedByDevice: Record<string, { pages: string[], totalViews: number }> = {};
    
    devicePages.forEach(item => {
      if (!item.device) return;
      
      if (!groupedByDevice[item.device]) {
        groupedByDevice[item.device] = {
          pages: [],
          totalViews: 0
        };
      }
      
      if (!groupedByDevice[item.device].pages.includes(item.page)) {
        groupedByDevice[item.device].pages.push(item.page);
      }
      groupedByDevice[item.device].totalViews += item._count.id;
    });

    return Object.entries(groupedByDevice).map(([device, data]) => ({
      device,
      pages: data.pages.join(', '),
      totalViews: data.totalViews
    }));
  }

  static async getDeviceStats(timeRange: 'today' | 'week' | 'month' | 'all') {
    const where = this.getTimeRangeWhere(timeRange);
    
    return await prisma.analyticsEvent.groupBy({
      by: ['device'],
      where: {
        ...where,
        eventType: 'pageview'
      },
      _count: {
        id: true
      },
      orderBy: {
        _count: {
          id: 'desc'
        }
      }
    });
  }

  static async getBrowserStats(timeRange: 'today' | 'week' | 'month' | 'all') {
    const where = this.getTimeRangeWhere(timeRange);
    
    return await prisma.analyticsEvent.groupBy({
      by: ['browser'],
      where: {
        ...where,
        eventType: 'pageview'
      },
      _count: {
        id: true
      },
      orderBy: {
        _count: {
          id: 'desc'
        }
      }
    });
  }

  static async getHourlyStats(timeRange: 'today' | 'week' | 'month' | 'all') {
    const where = this.getTimeRangeWhere(timeRange);
    
    const events = await prisma.analyticsEvent.findMany({
      where: {
        ...where,
        eventType: 'pageview',
        page: {
          not: {
            contains: 'admin'
          }
        }
      },
      select: {
        createdAt: true
      },
      orderBy: {
        createdAt: 'asc'
      }
    });

    // Group by hour
    const hourlyStats: Record<string, number> = {};
    
    events.forEach(event => {
      const hour = new Date(event.createdAt).getHours();
      const hourKey = `${hour}:00-${hour + 1}:00`;
      
      if (!hourlyStats[hourKey]) {
        hourlyStats[hourKey] = 0;
      }
      hourlyStats[hourKey]++;
    });

    return Object.entries(hourlyStats).map(([hour, count]) => ({
      hour,
      count
    }));
  }

  static async getDailyStats(timeRange: 'week' | 'month' | 'all') {
    const where = this.getTimeRangeWhere(timeRange);
    
    const events = await prisma.analyticsEvent.findMany({
      where: {
        ...where,
        eventType: 'pageview',
        page: {
          not: {
            contains: 'admin'
          }
        }
      },
      select: {
        createdAt: true
      },
      orderBy: {
        createdAt: 'asc'
      }
    });

    // Group by day
    const dailyStats: Record<string, number> = {};
    
    events.forEach(event => {
      const date = new Date(event.createdAt).toLocaleDateString('ru-RU');
      
      if (!dailyStats[date]) {
        dailyStats[date] = 0;
      }
      dailyStats[date]++;
    });

    return Object.entries(dailyStats).map(([date, count]) => ({
      date,
      count
    }));
  }

  private static getTimeRangeWhere(timeRange: string) {
    const now = new Date();
    let startDate: Date;

    switch (timeRange) {
      case 'today':
        startDate = new Date(now.setHours(0, 0, 0, 0));
        break;
      case 'week':
        startDate = new Date(now.setDate(now.getDate() - 7));
        break;
      case 'month':
        startDate = new Date(now.setMonth(now.getMonth() - 1));
        break;
      default:
        return {};
    }

    return {
      createdAt: {
        gte: startDate
      }
    };
  }

  static async getTotalStats() {
    const [totalPageviews, totalEvents, uniqueVisitors] = await Promise.all([
      prisma.analyticsEvent.count({
        where: { eventType: 'pageview' }
      }),
      prisma.analyticsEvent.count(),
      prisma.analyticsEvent.groupBy({
        by: ['ip'],
        where: { eventType: 'pageview' },
        _count: { id: true }
      })
    ]);

    return {
      totalPageviews,
      totalEvents,
      uniqueVisitors: uniqueVisitors.length
    };
  }

  static async getOrderStats(timeRange: 'today' | 'week' | 'month' | 'all') {
    const where = this.getTimeRangeWhere(timeRange);
    
    const [totalOrders, statusStats, dailyOrders, totalAmount] = await Promise.all([
      // Общее количество заказов
      prisma.order.count({
        where: {
          createdAt: where.createdAt
        }
      }),
      
      // Статистика по статусам
      prisma.order.groupBy({
        by: ['status'],
        where: {
          createdAt: where.createdAt
        },
        _count: {
          id: true
        }
      }),
      
      // Ежедневная статистика заказов
      prisma.order.groupBy({
        by: ['createdAt'],
        where: {
          createdAt: where.createdAt
        },
        _count: {
          id: true
        },
        orderBy: {
          createdAt: 'asc'
        }
      }),
      
      // Общая сумма заказов
      prisma.order.aggregate({
        where: {
          createdAt: where.createdAt,
          status: 'COMPLETED'
        },
        _sum: {
          amount: true
        }
      })
    ]);

    // Преобразуем ежедневную статистику в формат для графиков
    const dailyOrderStats = dailyOrders.map(item => ({
      date: new Date(item.createdAt).toLocaleDateString('ru-RU'),
      count: item._count.id
    }));

    return {
      totalOrders,
      statusStats,
      dailyOrderStats,
      totalAmount: totalAmount._sum.amount || 0
    };
  }

  static async getOrderConversionStats() {
    const [totalOrders, completedOrders, inProgressOrders, newOrders] = await Promise.all([
      prisma.order.count(),
      prisma.order.count({
        where: { status: 'COMPLETED' }
      }),
      prisma.order.count({
        where: { status: 'IN_PROGRESS' }
      }),
      prisma.order.count({
        where: { status: 'NEW' }
      })
    ]);

    const conversionRate = totalOrders > 0 ? (completedOrders / totalOrders) * 100 : 0;

    return {
      totalOrders,
      completedOrders,
      inProgressOrders,
      newOrders,
      conversionRate: Math.round(conversionRate * 100) / 100
    };
  }
}