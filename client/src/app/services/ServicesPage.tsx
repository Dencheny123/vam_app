"use client";

import { useEffect } from 'react';
import { useAppDispatch } from '@/shared/Hooks/useAppDispatch';
import { useAppSelector } from '@/shared/Hooks/useAppSelector';
import { RootState } from '@/app/components/contexts/LayoutContext/store/store';
import { getAllServices } from '@/entities/service/api/serviceThunkApi';
import styles from './services-page.module.css';
import { Image } from 'antd/es';

export default function ServicesPage() {
  const dispatch = useAppDispatch();
  const { services, loading, error } = useAppSelector((state: RootState) => state.service);

  useEffect(() => {
    dispatch(getAllServices());
  }, [dispatch]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!services || services.length === 0) {
    return <p className={styles.noServices}>Нет доступных услуг</p>;
  }

  return (
    <div className={styles['services-page-container']}>
      <div className={styles['services-header']}>
        <h1 className={styles['services-title']}>Наши услуги</h1>
        <h2 className={styles['services-subtitle']}>
          Профессиональные строительные услуги высочайшего качества
        </h2>
      </div>
      <div className={styles['services-content']}>
        <div className={styles.servicesList}>
          {services.map((service: any) => {
            let descriptionItems: string[] = [];
            try {
              descriptionItems = JSON.parse(service.description || '[]');
            } catch (e) {
              console.error('Error parsing description:', e);
              descriptionItems = [service.description || ''];
            }
            const imageClass = `${styles.serviceImage} ${
              descriptionItems.length > 5
                ? styles.largeImage
                : descriptionItems.length > 3
                ? styles.mediumImage
                : styles.baseImage
            }`;

            return (
              <div key={service.id} className={styles.serviceItem}>
                <Image
                  src={`${process.env.NEXT_PUBLIC_URL ? process.env.NEXT_PUBLIC_URL : 'http://localhost:3001'}${service.image}`}
                  alt={`Изображение услуги: ${service.service}`}
                  className={imageClass}
                  fetchPriority="high"
                  width={500}
                  height={500}
                  preview={false}
                />
                <div className={styles.serviceContent}>
                  <h2 className={styles.serviceTitle}>{service.service}</h2>
                  <div className={styles.serviceDescription}>
                    <ul>
                      {descriptionItems.map((item, index) => (
                        <li key={index}>{item}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
