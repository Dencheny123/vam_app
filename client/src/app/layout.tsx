export const dynamic = 'force-dynamic';
import type { Metadata } from 'next';
import './components/styles/globals.css';
import { ClientLayoutWrapper } from './components/contexts/LayoutContext/ClientLayoutWrapper';
import AnalyticsMiddleware from './components/AnalyticsMiddleware';

export const viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#1f2937' },
  ],
};

export function generateMetadata(): Metadata {
  return {
    title: 'ВентСтройМонтаж | Профессиональный монтаж вентиляции и кондиционеров ',
    description:
      'Установка и обслуживание систем вентиляции, кондиционирования и очистки воздуха в Москве и области. Гарантия качества, индивидуальные решения.',
    icons: {
      icon: [
        {
          url: `${
            process.env.NEXT_PUBLIC_URL
              ? process.env.NEXT_PUBLIC_URL
              : 'http://localhost:3001'
          }/uploads/icon_oktogon.ico`,
        },
        new URL(
          `${
            process.env.NEXT_PUBLIC_URL
              ? process.env.NEXT_PUBLIC_URL
              : 'http://localhost:3001'
          }/uploads/icon_oktogon.ico`,
        ),
      ],
      shortcut: [
        `${
          process.env.NEXT_PUBLIC_URL
            ? process.env.NEXT_PUBLIC_URL
            : 'http://localhost:3001'
        }/uploads/icon_oktogon.ico`,
      ],
      apple: [
        {
          url: `${
            process.env.NEXT_PUBLIC_URL
              ? process.env.NEXT_PUBLIC_URL
              : 'http://localhost:3001'
          }/uploads/icon_oktogon.png`,
        },
        {
          url: `${
            process.env.NEXT_PUBLIC_URL
              ? process.env.NEXT_PUBLIC_URL
              : 'http://localhost:3001'
          }/uploads/icon_oktogon.png`,
          sizes: '180x180',
          type: 'image/png',
        },
      ],
      other: [
        {
          rel: 'mask-icon',
          url: `${
            process.env.NEXT_PUBLIC_URL
              ? process.env.NEXT_PUBLIC_URL
              : 'http://localhost:3001'
          }/uploads/icon_oktogon.ico`,
          color: '#000000',
        },
      ],
    },
  };
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'ВентСтройМонтаж',
    legalName: 'ООО ВентСтройМонтаж',
    url: 'https://vsmtech.ru/',
    logo: 'https://vsmtech.ru/logo_oktogon.png',
    image: 'https://vsmtech.ru/logo_oktogon.png',
    description:
      'Профессиональные услуги по кондиционированию и вентиляции помещений в Москве и России.',
    foundingDate: '2010',
    founders: [
      {
        '@type': 'Person',
        name: 'Колчин Александр',
      },
      {
        '@type': 'Person',
        name: 'Садиков Денис',
      },
    ],
    contactPoint: [
      {
        '@type': 'ContactPoint',
        telephone: '+7-495-123-45-67',
        contactType: 'customer service',
        areaServed: 'RU',
        availableLanguage: ['Russian'],
      },
      {
        '@type': 'ContactPoint',
        telephone: '+7-495-765-43-21',
        contactType: 'technical support',
        areaServed: 'RU',
        availableLanguage: ['Russian'],
      },
    ],
    email: 'info@vsmtech.ru',
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'ул. Примерная, д. 10',
      addressLocality: 'Москва',
      postalCode: '101000',
      addressCountry: 'RU',
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: 55.7558,
      longitude: 37.6173,
    },
    hasMap: 'https://yandex.ru/maps/?ll=37.6173%2C55.7558&z=10',
    openingHoursSpecification: [
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        opens: '09:00',
        closes: '18:00',
      },
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Saturday'],
        opens: '10:00',
        closes: '14:00',
      },
    ],
    sameAs: [
      'https://www.facebook.com/vsmtech',
      'https://twitter.com/vsmtech',
      'https://www.instagram.com/vsmtech',
      'https://www.linkedin.com/company/vsmtech',
    ],
    taxID: '7701234567',
    vatID: 'RU7701234567',
    slogan: 'Ваш надежный партнер в создании комфортного микроклимата',
    foundingLocation: {
      '@type': 'Place',
      name: 'Москва',
    },
    knowsLanguage: ['Russian', 'English'],
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': 'https://vsmtech.ru/',
    },
    potentialAction: {
      '@type': 'SearchAction',
      target: 'https://vsmtech.ru/search?q={search_term_string}',
      'query-input': 'required name=search_term_string',
    },
  };

  return (
    <html lang="ru" suppressHydrationWarning>
      <body className="wind-effect">
        <AnalyticsMiddleware />
        <ClientLayoutWrapper>{children}</ClientLayoutWrapper>
      </body>
    </html>
  );
}
