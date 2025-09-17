'use client';

import Link from 'next/link';
import { useEffect } from 'react';
import styles from './components/styles/NotFoundPage.module.css';

export default function NotFoundPage() {
  useEffect(() => {
    const content = document.querySelector(`.${styles.content}`);
    content?.classList.add(styles.fadeIn);
  }, []);

  return (
    <div className={styles.container}>
      <div className={styles.background}></div>
      <div className={styles.content}>
        <div className={styles.errorCode}>404</div>
        <h1 className={styles.title}>Страница не найдена</h1>
        <p className={styles.message}>
          Кажется, мы не можем найти нужную страницу. Возможно, она улетела с потоком воздуха!
        </p>
        <div className={styles.ventIcon}></div>
        <Link href="/" className={styles.homeButton}>
          Вернуться домой
        </Link>
      </div>
    </div>
  );
}