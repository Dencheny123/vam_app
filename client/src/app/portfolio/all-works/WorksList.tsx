'use client';
import Cards from '../components/Cards';
import styles from '../components/styles/WorksList.module.css';
import { useEffect } from 'react';
import { useAppDispatch } from '@/shared/Hooks/useAppDispatch';
import { useAppSelector } from '@/shared/Hooks/useAppSelector';
import { RootState } from '@/app/components/contexts/LayoutContext/store/store';
import { getAllMyWorks } from '@/entities/my-work/api/portfolio';

export default function WorksList() {
  const dispatch = useAppDispatch();
  const { works, loading, error } = useAppSelector((state: RootState) => state.myWork);

  useEffect(() => {
    dispatch(getAllMyWorks());
  }, [dispatch]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Все работы</h1>
      <div className={styles.cards}>
        {works.map((work: any) => (
          <Cards key={work.id} work={work} />
        ))}
      </div>
      <div className={styles.viewAll}></div>
    </div>
  );
}
