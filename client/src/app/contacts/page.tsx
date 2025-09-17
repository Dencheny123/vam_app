export const dynamic = 'force-dynamic';
import { Contacts } from './components/main/Contacts&Form/contacts';
import { RecordingForm } from '@/app/contacts/components/main/Contacts&Form/RecordingForm';
import styles from './components/styles/ContactsPage.module.css';
import React from 'react';
import { Metadata } from 'next';
import { generateMetadatas } from '@/shared/utils/metadata';

export async function generateMetadata(): Promise<Metadata> {
  return generateMetadatas(6);
}

export default function ContactsPage() {
  return (
    <>
      <div className={styles.pageContainer}>
        <h1 className={styles.pageTitle}>Контакты</h1>
        <h2 className={styles.sectionTitle}>С нами можно связаться</h2>
        <div className={styles.contentWrapper}>
          <div className={styles.leftCol}>
            <h3 className={styles.sectionTitle}>Контактные данные</h3>
            <Contacts />
          </div>
          <div className={styles.rightCol}>
            <h3 className={styles.sectionTitle}>Оставьте заявку</h3>
            <RecordingForm />
          </div>
        </div>
      </div>
    </>
  );
}
