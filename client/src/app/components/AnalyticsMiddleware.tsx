'use client';

import { useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { initRouteTracking, trackPageView } from '@/shared/utils/analytics';

export default function AnalyticsMiddleware() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Инициализируем отслеживание маршрутов
    initRouteTracking();
  }, []);

  useEffect(() => {
    // Отслеживаем изменение страницы
    if (pathname) {
      const url = searchParams ? `${pathname}?${searchParams}` : pathname;
      trackPageView({
        path: pathname,
        search: searchParams?.toString(),
        url
      });
    }
  }, [pathname, searchParams]);

  return null;
}