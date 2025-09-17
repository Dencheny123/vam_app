import Link from 'next/link';
import CarouselClient from './components/CarouselClient';
import styles from './components/styles/WorksSlider.module.css';
import { MyWork } from '@/entities/my-work/model';
import { generateMetadatas } from '@/shared/utils/metadata';
import { Metadata } from 'next';

export const dynamic = 'force-dynamic';

// Генерация метаданных
export async function generateMetadata(): Promise<Metadata> {
  return generateMetadatas(2);
}

// Компонент страницы
export default async function WorksSlider() {
  // Внутренняя функция для получения данных
  async function fetchWorks(): Promise<MyWork[]> {
    const res = await fetch(`${process.env.NEXT_PUBLIC_DOCKER_API_URL}/my-work`, {
      next: { revalidate: 3600 * 3 },
    });

    if (!res.ok) throw new Error('Failed to fetch works');
    const { data } = await res.json();
    return (Array.isArray(data) ? data : []).map((work: MyWork) => ({
      ...work,
    }));
  }

  // Получение данных
  const data = await fetchWorks();
  const works = data;

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Наши работы</h1>
      <CarouselClient works={works} />
      <div className={styles.viewAll}>
        <Link href="/portfolio/all-works" className={styles.viewAllButton}>
          Все работы
        </Link>
      </div>
    </div>
  );
}