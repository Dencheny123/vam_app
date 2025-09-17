'use client'
import Link from 'next/link';
import CarouselClient from './components/CarouselClient';
import styles from './components/styles/WorksSlider.module.css';
import { useEffect } from 'react';
import { useAppDispatch } from '@/shared/Hooks/useAppDispatch';
import { useAppSelector } from '@/shared/Hooks/useAppSelector';
import { RootState } from '@/app/components/contexts/LayoutContext/store/store';
import { getAllMyWorks } from '@/entities/my-work/api/portfolio';

export default function PortfolioPage() {
  const dispatch = useAppDispatch();
  const { works, loading, error } = useAppSelector((state: RootState) => state.myWork);

  useEffect(() => {
    dispatch(getAllMyWorks());
  }, [dispatch]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

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
