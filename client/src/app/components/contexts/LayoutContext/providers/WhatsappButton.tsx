import Script from 'next/script';
import { useEffect } from 'react';

const GoodAppWidget = () => {
  useEffect(() => {
    const widget = document.createElement('script');
    widget.defer = true;
    widget.dataset.pfId = 'a598c526-2e49-49db-9de6-7478e691d6b0';
    widget.src = `${
      process.env.NEXT_PUBLIC_API_URL || 'api'
    }/proxy/goodapp-widget.js?now=${Date.now()}`;

    document.head.appendChild(widget);

    return () => {
      document.head.removeChild(widget);
    };
  }, []);

  useEffect(() => {
    try {
      const theme = localStorage.getItem('theme');
      const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (theme === 'dark' || (!theme && systemPrefersDark)) {
        document.documentElement.classList.add('dark');
      }
    } catch {}
  }, []);
  return (
    <>
      <Script
        dangerouslySetInnerHTML={{
          __html: `
      (function() {
        try {
          const theme = localStorage.getItem('theme');
          const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
          if (theme === 'dark' || (!theme && systemPrefersDark)) {
            document.documentElement.classList.add('dark');
          }
        } catch (_) {}
      })();
    `,
        }}
      />
    </>
  );
};

export default GoodAppWidget;
