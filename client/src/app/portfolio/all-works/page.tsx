export const dynamic = 'force-dynamic';
import { generateMetadatas } from '@/shared/utils/metadata';
import Cards from '../components/Cards';
import styles from '../components/styles/WorksList.module.css';
import { Metadata } from 'next';
import { MyWork } from '@/entities/my-work/model';

export async function generateMetadata(): Promise<Metadata> {
  return generateMetadatas(4);
}

export default async function WorksList() {
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

  const data = await fetchWorks();
  const works = data;

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Все работы</h1>
      <div className={styles.cards}>
        {works.map((work: MyWork) => (
          <Cards key={work.id} work={work} />
        ))}
      </div>
      <div className={styles.viewAll}></div>
    </div>
  );
}
