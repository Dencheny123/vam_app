export const dynamic = 'force-dynamic';
import styles from '../components/styles/WorkDetails.module.css';
import ImageCarousel from '../components/ImageCarousel';
import { notFound } from 'next/navigation';
import { generateMetadatas } from '@/shared/utils/metadata';
import { Metadata } from 'next';
import { MyWork } from '@/entities/my-work/model';
export interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const id = resolvedParams.slug.split('-').pop();
  if (!id || isNaN(Number(id))) return notFound();
  async function fetchWork(id: string): Promise<MyWork | null> {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_DOCKER_API_URL}/my-work/${id}`, {
        next: { revalidate: 3600 * 3 },
      });
      if (!res.ok) return null;
      const { data } = await res.json();
      return data;
    } catch (error) {
      console.error(`Failed to fetch work with id ${id}:`, error);
      return null;
    }
  }

  const work = await fetchWork(id);
  return generateMetadatas(5, `${work?.title}${' '}`);
}

export default async function WorkDetails({ params }: PageProps) {
  const resolvedParams = await params;
  const id = resolvedParams.slug.split('-').pop();
  if (!id || isNaN(Number(id))) return notFound();

  async function fetchWork(id: string): Promise<MyWork | null> {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_DOCKER_API_URL}/my-work/${id}`, {
        next: { revalidate: 3600 * 3 },
      });
      if (!res.ok) return null;
      const { data } = await res.json();
      return data;
    } catch (error) {
      console.error(`Failed to fetch work with id ${id}:`, error);
      return null;
    }
  }

  const work = await fetchWork(id);
  if (!work) return notFound();

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>{work.title}</h1>
      <div className={styles.content}>
        <ImageCarousel images={work.image} title={work.title} />
        <div className={styles.details}>
          <div className={styles.detailItem}>
            <strong>Площадь:</strong> {work.square}
          </div>
          <div className={styles.detailItem}>
            <strong>Количество:</strong> {work.quantity}
          </div>
          <div className={styles.detailItem}>
            <strong>Время выполнения:</strong> {work.time}
          </div>
          <div className={styles.resultContainer}>
            <h3 className={styles.resultTitle}>Результат:</h3>
            <ul className={styles.resultList}>
              {(Array.isArray(work.success_work) ? work.success_work : []).map(
                (item: string, index: number) => (
                  <li key={index} className={styles.resultItem}>
                    {item}
                  </li>
                ),
              )}
            </ul>
          </div>
        </div>
      </div>
      <div className={styles.back}></div>
    </div>
  );
}
