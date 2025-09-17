import { Metadata } from 'next';
export const dynamic = 'force-dynamic';
import styles from './services-page.module.css';
import { Image } from 'antd/es';
import { generateMetadatas } from '@/shared/utils/metadata';

export async function generateMetadata(): Promise<Metadata> {
  return generateMetadatas(3);
}

interface Service {
  id: number;
  service: string;
  description: string;
  image: string;
}

export default async function ServicesPage() {
  let services: Service[] = [];

  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_DOCKER_API_URL}/service`, {
      next: { revalidate: 3600 * 5 },
    });
    if (!response.ok) throw new Error('Failed to fetch services');
    const { data } = await response.json();
    services = data || [];
    if (!services || services.length === 0) {
      return <p className={styles.noServices}>Нет доступных услуг</p>;
    }
  } catch (error) {
    console.error('Error fetching services:', error);
    return <p className={styles.noServices}>Произошла ошибка</p>;
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
          {services.map((service) => {
            let descriptionItems: string[] = [];
            try {
              descriptionItems = JSON.parse(service.description);
            } catch (e) {
              console.error('Error parsing description:', e);
              descriptionItems = [service.description];
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
