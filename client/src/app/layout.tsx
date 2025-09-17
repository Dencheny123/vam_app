export const dynamic = 'force-dynamic';
import type { Metadata } from 'next';
import './components/styles/globals.css';
import { ClientLayoutWrapper } from './components/contexts/LayoutContext/ClientLayoutWrapper';
import Head from 'next/head';
import Script from 'next/script';
import { generateMetadatas } from '@/shared/utils/metadata';
import AnalyticsMiddleware from './components/AnalyticsMiddleware';

export const viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#1f2937' },
  ],
};

export async function generateMetadata(): Promise<Metadata> {
  return generateMetadatas(1);
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
      <Head>
        <Script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </Head>
      <body className="wind-effect">
        <AnalyticsMiddleware />
        <ClientLayoutWrapper>{children}</ClientLayoutWrapper>
      </body>
    </html>
  );
}
