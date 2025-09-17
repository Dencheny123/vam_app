import * as z from 'zod';

// Схема валидации
export const metaDataSchema = z.object({
  id: z.number().optional(),
  title: z.string().min(1, 'Заголовок обязателен'),
  description: z.string().min(1, 'Описание обязательно'),
  keywords: z.string().min(1, 'Ключевые слова обязательны'),
  author_name: z.string().min(1, 'Имя автора обязательно'),
  author_url: z.string().url('Некорректный URL автора'),
  metadataBase: z.string().url('Некорректный базовый URL'),
  alternates: z.string().min(1, 'Альтернативный URL обязателен'),
  openGraph_title: z.string().min(1, 'OG заголовок обязателен'),
  openGraph_description: z.string().min(1, 'OG описание обязательно'),
  openGraph_url: z.string().url('Некорректный OG URL'),
  openGraph_siteName: z.string().min(1, 'Название сайта обязательно'),
  themeColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Некорректный HEX цвет'),
  other_geo_position: z.string().min(1, 'Позиция обязательна'),
  other_ICBM: z.string().min(1, 'ICBM обязательно'),
  icons_icon: z.string().optional(),
  icons_shortcut: z.string().optional(),
  icons_apple: z.string().optional(),
  other_geo_region: z.string().min(1, 'Регион обязателен'),
  other_geo_placename: z.string().min(1, 'Название места обязательно'),
});
