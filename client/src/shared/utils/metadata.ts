import { IMetaData } from '@/entities/metaData/model/metaDataTypes';
import { Metadata } from 'next';

export async function generateMetadatas(
  index: number,
  title: string = '',
): Promise<Metadata> {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_DOCKER_API_URL}/metadata/${index}`,
      {
        next: { revalidate: 3600 * 3 },
      },
    );

    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }

    const metaDatas = await res.json();
    const meta = metaDatas.data as IMetaData;
    const currentYear = new Date().getFullYear();

    return {
      title:
        title + meta?.title ||
        'ВентСтройМонтаж | Профессиональный монтаж вентиляции и кондиционеров ',
      description:
        meta?.description ||
        'Установка и обслуживание систем вентиляции, кондиционирования и очистки воздуха в Москве и области. Гарантия качества, индивидуальные решения.',
      keywords:
        meta?.keywords?.split(',').join(', ') ||
        'ремонт, отделка, строительство, дизайн интерьера',
      metadataBase: new URL(
        process.env.NEXT_PUBLIC_API_URL
          ? process.env.NEXT_PUBLIC_API_URL
          : 'http://localhost:3001/api',
      ),
      alternates: {
        canonical: process.env.NEXT_PUBLIC_API_URL
          ? process.env.NEXT_PUBLIC_API_URL
          : 'http://localhost:3001/api',
      },
      applicationName: 'ВентСтройМонтаж',
      authors: [
        {
          name: 'Колчин Александр, Садиков Денис, Азамат Болатчиев, Кирилл Панов, Николай Володин, Владислав Бурихин',
        },
        {
          name: 'ВентСтройМонтаж',
          url: process.env.NEXT_PUBLIC_API_URL
            ? process.env.NEXT_PUBLIC_API_URL
            : 'http://localhost:3001/api',
        },
      ],
      creator: 'Команда ВентСтройМонтаж',
      generator: 'Next.js',
      publisher: 'ВентСтройМонтаж',
      referrer: 'strict-origin-when-cross-origin',
      formatDetection: {
        email: false,
        address: false,
        telephone: false,
      },

      openGraph: {
        title: meta?.openGraph_title || meta?.title || 'ВентСтройМонтаж',
        description:
          meta?.openGraph_description ||
          meta?.description ||
          'Профессиональные услуги по ремонту и отделке помещений',
        url:
          meta?.openGraph_url || process.env.NEXT_PUBLIC_API_URL
            ? process.env.NEXT_PUBLIC_API_URL
            : 'http://localhost:3001/api',
        siteName: meta?.openGraph_siteName || 'ВентСтройМонтаж',
        locale: 'ru_RU',
        type: 'website',
        images: [
          {
            url: 'http://localhost:4000/background.webp',
            width: 1920,
            height: 1080,
            alt: meta?.openGraph_title || 'ВентСтройМонтаж',
          },
        ],
      },
      twitter: {
        card: 'summary_large_image',
        title: meta?.openGraph_title || meta?.title || 'ВентСтройМонтаж',
        description:
          meta?.openGraph_description ||
          meta?.description ||
          'Профессиональные услуги кондиционированию и вентиляции помещений',
        images: [
          {
            url: 'http://localhost:4000/background.webp',
            width: 1920,
            height: 1080,
            alt: meta?.openGraph_title || 'ВентСтройМонтаж',
          },
        ],
      },
      facebook: {
        appId: `${meta?.id}` || '',
      },
      pinterest: {
        richPin: true,
      },

      appleWebApp: {
        capable: true,
        statusBarStyle: 'default',
        title: meta?.title || 'ВентСтройМонтаж',
      },
      itunes: {
        appId: `${meta?.id}` || '',
        appArgument:
          'Профессиональные услуги по установке и обслуживанию систем вентиляции и кондиционирования в Москве и области',
      },
      abstract: 'Сайт компании ВентСтройМонтаж',

      appLinks: {
        ios: {
          app_store_id: `${meta?.id}` || '',
          url: process.env.NEXT_PUBLIC_API_URL
            ? process.env.NEXT_PUBLIC_API_URL
            : 'http://localhost:3001/api',
        },
        android: {
          package: meta?.title || '',
          url: process.env.NEXT_PUBLIC_API_URL
            ? process.env.NEXT_PUBLIC_API_URL
            : 'http://localhost:3001/api',
        },
      },
      archives: [
        process.env.NEXT_PUBLIC_API_URL
          ? process.env.NEXT_PUBLIC_API_URL
          : 'http://localhost:3001/api',
      ],
      assets: [
        process.env.NEXT_PUBLIC_API_URL
          ? process.env.NEXT_PUBLIC_API_URL + '/uploads/'
          : 'http://localhost:3001/api' + '/uploads/',
      ],
      bookmarks: [
        process.env.NEXT_PUBLIC_API_URL
          ? process.env.NEXT_PUBLIC_API_URL
          : 'http://localhost:3001/api',
      ],
      pagination: {
        previous: process.env.NEXT_PUBLIC_API_URL
          ? process.env.NEXT_PUBLIC_API_URL + '/services'
          : 'http://localhost:3001/api' + '/services',
        next: process.env.NEXT_PUBLIC_API_URL
          ? process.env.NEXT_PUBLIC_API_URL + '/portfolio'
          : 'http://localhost:3001/api' + '/portfolio',
      }, // Комментарий: Настройка пагинации для SEO

      // Категории и классификация
      category: 'Строительство и ремонт', // Комментарий: Категория сайта
      classification: 'Услуги по вентиляции и кондиционированию', // Комментарий: Классификация контента

      // Иконы и манифест
      robots: {
        index: true,
        follow: true,
        googleBot: {
          index: true,
          follow: true,
          'max-video-preview': -1,
          'max-image-preview': 'large',
          'max-snippet': -1,
        },
      },
      icons: {
        icon: [
          {
            url: `${process.env.NEXT_PUBLIC_URL}${meta?.icons_icon[0]}`,
            type: 'image/x-icon',
          },
          {
            url: `${process.env.NEXT_PUBLIC_URL}${meta?.icons_icon[1]}`,
            sizes: '32x32',
            type: 'image/png',
          },
          {
            url: `${process.env.NEXT_PUBLIC_URL}${meta?.icons_icon[2]}`,
            sizes: '16x16',
            type: 'image/png',
          },
        ],
        shortcut: [
          // Основная иконка для мобильных устройств
          `${process.env.NEXT_PUBLIC_URL || 'http://localhost:3001'}${
            meta?.icons_shortcut[0]
          }`,
          // Иконка для манифеста веб-приложения
          {
            url: `${process.env.NEXT_PUBLIC_URL || 'http://localhost:3001'}${
              meta?.icons_shortcut[1]
            }`,
            sizes: '192x192',
            type: 'image/png',
          },
          {
            url: `${process.env.NEXT_PUBLIC_URL || 'http://localhost:3001'}${
              meta?.icons_shortcut[2]
            }`,
            sizes: '512x512',
            type: 'image/png',
          },
        ],
        apple: [
          // Основная иконка для Apple devices
          {
            url: `${
              process.env.NEXT_PUBLIC_URL || 'http://localhost:3001'
            }${meta?.icons_apple[0]}`,
            sizes: '180x180',
            type: 'image/png',
          },
          // Дополнительные размеры для разных устройств Apple
          {
            url: `${
              process.env.NEXT_PUBLIC_URL || 'http://localhost:3001'
            }${meta?.icons_apple[1]}`,
            sizes: '152x152',
            type: 'image/png',
          },
          {
            url: `${
              process.env.NEXT_PUBLIC_URL || 'http://localhost:3001'
            }${meta?.icons_apple[2]}`,
            sizes: '167x167',
            type: 'image/png',
          },
          {
            url: `${
              process.env.NEXT_PUBLIC_URL || 'http://localhost:3001'
            }${meta?.icons_apple[3]}`,
            sizes: '120x120',
            type: 'image/png',
          },
        ],
        other: [
          {
            rel: 'mask-icon',
            url: '/icon_oktogon.png',
            color: '#5bbad5',
          },
          // Манифест веб-приложения
          {
            rel: 'manifest',
            url: '/manifest.json',
          },
        ],
      },
      manifest: '/site.webmanifest',

      // Дополнительные метаданные
      other: {
        'application-name': 'ВентСтройМонтаж',
        'msapplication-TileColor': '#da532c',
        'msapplication-config': '/browserconfig.xml',
        'theme-color': '#ffffff',
        copyright: `© ${currentYear} ВентСтройМонтаж. Все права защищены.`,
        'geo.region': meta?.other_geo_region || 'RU',
        'geo.placename': meta?.other_geo_placename || 'Москва',
        'geo.position': meta?.other_geo_position || '55.7558,37.6173',
        ICBM: meta?.other_ICBM || '55.7558, 37.6173',
      },
    };
  } catch (error) {
    console.error('Error generating metadata:', error);
    return {
      title: 'ВентСтройМонтаж',
      description:
        'Установка и обслуживание систем вентиляции, кондиционирования и очистки воздуха в Москве и области. Гарантия качества, индивидуальные решения.',
      icons: {
        icon: [
          {
            url: `${
              process.env.NEXT_PUBLIC_URL
                ? process.env.NEXT_PUBLIC_URL
                : 'http://localhost:3001'
            }/uploads/icons_icon.ico`,
          },
          new URL(
            `${
              process.env.NEXT_PUBLIC_URL
                ? process.env.NEXT_PUBLIC_URL
                : 'http://localhost:3001'
            }/uploads/icons_icon.ico`,
          ),
        ],
        shortcut: [
          `${
            process.env.NEXT_PUBLIC_URL
              ? process.env.NEXT_PUBLIC_URL
              : 'http://localhost:3001'
          }/uploads/icons_icon.ico`,
        ],
        apple: [
          {
            url: `${
              process.env.NEXT_PUBLIC_URL
                ? process.env.NEXT_PUBLIC_URL
                : 'http://localhost:3001'
            }/uploads/icons_icon.png`,
          },
          {
            url: `${
              process.env.NEXT_PUBLIC_URL
                ? process.env.NEXT_PUBLIC_URL
                : 'http://localhost:3001'
            }/uploads/icons_icon.png`,
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
            }/uploads/icons_icon.ico`,
            color: '#000000',
          },
        ],
      },
    };
  }
}
