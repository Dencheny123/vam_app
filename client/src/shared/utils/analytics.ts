// Клиентская библиотека для аналитики
export interface AnalyticsEvent {
  eventType: string;
  page?: string;
  referrer?: string;
  url?: string;
  metadata?: Record<string, any>;
}

class Analytics {
  private static instance: Analytics;
  private baseUrl: string;

  private constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_URL || 'http://localhost:3001';
  }

  public static getInstance(): Analytics {
    if (!Analytics.instance) {
      Analytics.instance = new Analytics();
    }
    return Analytics.instance;
  }

  // Отправка события аналитики
  async track(eventData: AnalyticsEvent): Promise<boolean> {
    try {
      const data: AnalyticsEvent = {
        eventType: eventData.eventType,
        page: eventData.page || window.location.pathname,
        referrer: eventData.referrer || document.referrer,
        url: eventData.url || window.location.href,
        metadata: eventData.metadata || {}
      };

      const response = await fetch(`${this.baseUrl}/api/analytics`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      return response.ok;
    } catch (error) {
      console.error('Analytics tracking error:', error);
      return false;
    }
  }

  // Отслеживание просмотра страницы
  trackPageView(metadata?: Record<string, any>): Promise<boolean> {
    return this.track({
      eventType: 'pageview',
      metadata
    });
  }

  // Отслеживание кликов
  trackClick(element: string, metadata?: Record<string, any>): Promise<boolean> {
    return this.track({
      eventType: 'click',
      metadata: {
        element,
        ...metadata
      }
    });
  }

  // Отслеживание отправки форм
  trackFormSubmit(formId: string, metadata?: Record<string, any>): Promise<boolean> {
    return this.track({
      eventType: 'form_submit',
      metadata: {
        formId,
        ...metadata
      }
    });
  }

  // Отслеживание кастомных событий
  trackCustomEvent(eventName: string, metadata?: Record<string, any>): Promise<boolean> {
    return this.track({
      eventType: 'custom_event',
      metadata: {
        eventName,
        ...metadata
      }
    });
  }

  // Отслеживание ошибок
  trackError(error: Error, context?: string): Promise<boolean> {
    return this.track({
      eventType: 'error',
      metadata: {
        errorMessage: error.message,
        errorName: error.name,
        context,
        stack: error.stack
      }
    });
  }
}

// Создаем глобальный экземпляр
export const analytics = Analytics.getInstance();

// Хук для использования аналитики в React компонентах
export const useAnalytics = () => {
  return analytics;
};

// Автоматическое отслеживание изменений маршрута в Next.js
export const initRouteTracking = () => {
  if (typeof window !== 'undefined') {
    // Отслеживаем первоначальную загрузку страницы
    analytics.trackPageView();

    // Отслеживаем изменения маршрута (для SPA)
    const originalPushState = history.pushState;
    const originalReplaceState = history.replaceState;

    history.pushState = function (...args) {
      originalPushState.apply(this, args);
      window.dispatchEvent(new Event('pushstate'));
      window.dispatchEvent(new Event('locationchange'));
    };

    history.replaceState = function (...args) {
      originalReplaceState.apply(this, args);
      window.dispatchEvent(new Event('replacestate'));
      window.dispatchEvent(new Event('locationchange'));
    };

    window.addEventListener('popstate', () => {
      window.dispatchEvent(new Event('locationchange'));
    });

    window.addEventListener('locationchange', () => {
      analytics.trackPageView();
    });
  }
};

// Утилиты для быстрого доступа
export const trackPageView = (metadata?: Record<string, any>) => 
  analytics.trackPageView(metadata);

export const trackClick = (element: string, metadata?: Record<string, any>) => 
  analytics.trackClick(element, metadata);

export const trackFormSubmit = (formId: string, metadata?: Record<string, any>) => 
  analytics.trackFormSubmit(formId, metadata);

export const trackCustomEvent = (eventName: string, metadata?: Record<string, any>) => 
  analytics.trackCustomEvent(eventName, metadata);

export const trackError = (error: Error, context?: string) => 
  analytics.trackError(error, context);