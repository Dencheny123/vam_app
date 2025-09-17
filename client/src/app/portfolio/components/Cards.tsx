'use client';

import React from 'react';
import Link from 'next/link';
import { transliterate } from '@/shared/utils/translater';
import styles from './styles/WorksSlider.module.css';
import { MyWork } from '@/entities/my-work/model';
import { Image } from 'antd/es';

export default function Cards({work, handleCardClick}: {work: MyWork, handleCardClick?: () => void}) {
  return (
    <div className={styles.card} onClick={handleCardClick}>
      {work.image ? (
        <Image
          alt={work.title || 'Work image'}
          src={`${process.env.NEXT_PUBLIC_URL}${work.image[0]}`}
          className={styles.cardImage}
          width={360}
          height={240}
          onError={() =>
            console.error(`Failed to load image for ${work.title}: ${work.image[0]}`)
          }
        />
      ) : (
        <div className={styles.placeholder}>No Image</div>
      )}
      <div className={styles.cardContent}>
        <h3 className={styles.cardTitle}>{work.title}</h3>
        <Link
          href={`/portfolio/${transliterate(work.title || '')}-${work.id}`}
          className={styles.cardButton}
          onClick={(e) => e.stopPropagation()}
        >
          Подробнее
        </Link>
      </div>
    </div>
  );
}
