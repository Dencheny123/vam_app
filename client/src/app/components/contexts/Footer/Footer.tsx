'use client';

import React from 'react';
import styles from '../../styles/Footer.module.css';
import Link from 'next/link';
import Image from 'next/image';

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <div className={styles.contentWrapper}>
          <div className={styles.textBlock}>
            <nav className={styles.navLinks}>
              <Link href="/privacy-policy" className={styles.link}>
                Политика конфиденциальности
              </Link>
              <Link href="/oferta" className={styles.link}>
                Оферта
              </Link>
            </nav>
            <div className={styles.legal}>
              <p className={styles.legalText}>ВентСтройМонтаж</p>
              <p className={styles.legalText}>ИНН 272113806532</p>
              <p className={styles.legalText}>ОГРН 1122721008024 </p>
            </div>
          </div>

          <div className={styles.logoFooter}>
            <Link href="/">
              <Image
                src={'/logo_oktogon.png'}
                alt="Логотип"
                width={120}
                height={80}
                style={{ height: 'auto' }}
                priority
              />
            </Link>
          </div>

          <div className={styles.iconsContainer}>
            <div className={styles.iconsBlock}>
              <a
                href="https://wa.me/+79163108899"
                target="_blank"
                rel="noopener noreferrer"
                className={styles.iconLink}
                aria-label="WhatsApp"
              >
                <svg
                  className={styles.icon}
                  width="28"
                  height="28"
                  viewBox="0 0 90 90"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M90,43.8c0,24.2-19.8,43.8-44.2,43.8c-7.7,0-15-2-21.4-5.5L0,90l8-23.5c-4-6.6-6.3-14.4-6.3-22.6C1.6,19.6,21.4,0,45.8,0C70.2,0,90,19.6,90,43.8z M45.8,7C25.3,7,8.7,23.5,8.7,43.8c0,8.1,2.6,15.5,7.1,21.6l-4.6,13.7l14.3-4.5c5.9,3.9,12.9,6.1,20.4,6.1C66.3,80.7,83,64.2,83,43.8S66.3,7,45.8,7z M68.1,53.9c-0.3-0.4-1-0.7-2.1-1.3c-1.1-0.5-6.4-3.1-7.4-3.5c-1-0.4-1.7-0.5-2.4,0.5c-0.7,1.1-2.8,3.5-3.4,4.2c-0.6,0.7-1.3,0.8-2.3,0.3c-1.1-0.5-4.6-1.7-8.7-5.3c-3.2-2.8-5.4-6.4-6-7.4c-0.6-1.1-0.1-1.7,0.5-2.2c0.5-0.5,1.1-1.3,1.6-1.9c0.5-0.6,0.7-1.1,1.1-1.8c0.4-0.7,0.2-1.3-0.1-1.9c-0.3-0.5-2.4-5.8-3.3-8c-0.9-2.1-1.8-1.8-2.4-1.8c-0.6,0-1.4-0.1-2.1-0.1s-1.9,0.3-2.9,1.3c-1,1.1-3.8,3.7-3.8,9c0,5.3,3.9,10.4,4.4,11.1c0.5,0.7,7.5,11.9,18.5,16.2c11,4.3,11,2.9,13,2.7c2-0.2,6.4-2.6,7.3-5.1C68.4,56.5,68.4,54.4,68.1,53.9z"
                    fill="#fff"
                  />
                </svg>
              </a>

              <a href="tel:+74959717698" className={styles.iconLink} aria-label="Телефон">
                <svg
                  className={styles.icon}
                  width="28"
                  height="28"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M20.487 17.14l-4.065-3.696a1.001 1.001 0 0 0-1.391.043l-2.393 2.461c-.576-.11-1.734-.471-2.926-1.66-1.192-1.193-1.553-2.354-1.66-2.926l2.459-2.394a1 1 0 0 0 .043-1.391L6.859 3.513a1 1 0 0 0-1.391-.087l-3.15 2.489a.998.998 0 0 0-.291.649c-.015.25-.301 6.172 4.291 10.766C11.305 20.707 16.323 21 17.705 21c.202 0 .326-.006.359-.008a.992.992 0 0 0 .648-.291l2.49-3.15a.997.997 0 0 0-.085-1.411z"
                    fill="#fff"
                  />
                </svg>
              </a>

              <a
                href="https://t.me/#"
                target="_blank"
                rel="noopener noreferrer"
                className={styles.iconLink}
                aria-label="Telegram"
              >
                <svg
                  className={styles.icon}
                  width="28"
                  height="28"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.446 1.394c-.14.14-.26.26-.429.26-.107 0-.34-.066-.34-.341v-2.59l5.18-4.68c.205-.185-.045-.286-.317-.104l-6.41 4.06-2.76-.917c-.64-.203-.658-.64.135-.953l10.71-4.12c.525-.196 1.002.13.832.942z"
                    fill="#fff"
                  />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
