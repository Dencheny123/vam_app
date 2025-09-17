"use client";

import { useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useAppDispatch } from '@/shared/Hooks/useAppDispatch';
import { useAppSelector } from '@/shared/Hooks/useAppSelector';
import { RootState } from '@/app/components/contexts/LayoutContext/store/store';
import { getMyWorkById } from '@/entities/my-work/api/portfolio';
import styles from '../components/styles/WorkDetails.module.css';
import ImageCarousel from '../components/ImageCarousel';

export default function WorkDetails() {
  const params = useParams();
  const dispatch = useAppDispatch();
  const { currentWork, loading, error } = useAppSelector((state: RootState) => state.myWork);
  const id = params.slug?.toString().split('-').pop();

  useEffect(() => {
    if (id && !isNaN(Number(id))) {
      dispatch(getMyWorkById(Number(id)));
    }
  }, [dispatch, id]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!currentWork) return <div>Work not found</div>;

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>{currentWork.title}</h1>
      <div className={styles.content}>
        <ImageCarousel images={currentWork.image} title={currentWork.title} />
        <div className={styles.details}>
          <div className={styles.detailItem}>
            <strong>Площадь:</strong> {currentWork.square}
          </div>
          <div className={styles.detailItem}>
            <strong>Количество:</strong> {currentWork.quantity}
          </div>
          <div className={styles.detailItem}>
            <strong>Время выполнения:</strong> {currentWork.time}
          </div>
          <div className={styles.resultContainer}>
            <h3 className={styles.resultTitle}>Результат:</h3>
            <ul className={styles.resultList}>
              {(Array.isArray(currentWork.success_work) ? currentWork.success_work : []).map(
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
