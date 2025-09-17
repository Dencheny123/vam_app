'use client';

import { useEffect } from 'react';
import { useAppDispatch } from '@/shared/Hooks/useAppDispatch';
import { useAppSelector } from '@/shared/Hooks/useAppSelector';
import { getAllContactsThunk } from '@/entities/contacts/api/ContactsApi';
import styles from '../../styles/Contacts.module.css';
import Image from 'next/image';
import Link from 'next/link';
import { trackClick } from '@/shared/utils/analytics';

// Функция для форматирования телефонного номера
export const formatPhoneNumber = (phone: string): string => {
  // Удаляем все нецифровые символы
  const cleaned = phone.replace(/\D/g, '');

  // Проверяем длину номера и форматируем соответствующим образом
  if (cleaned.length === 11) {
    // Для российских номеров (11 цифр, начинающихся с 8 или 7)
    return `+7 (${cleaned.substring(1, 4)}) ${cleaned.substring(
      4,
      7,
    )}-${cleaned.substring(7, 9)}-${cleaned.substring(9)}`;
  } else if (cleaned.length === 10) {
    // Для номеров без кода страны (предполагаем российский номер)
    return `+7 (${cleaned.substring(0, 3)}) ${cleaned.substring(
      3,
      6,
    )}-${cleaned.substring(6, 8)}-${cleaned.substring(8)}`;
  } else if (cleaned.length > 0) {
    // Для международных номеров (просто добавляем + в начале)
    return `+${cleaned}`;
  }

  // Возвращаем исходное значение, если не удалось отформатировать
  return phone;
};

export const Contacts = () => {
  const dispatch = useAppDispatch();
  const { contacts, isLoading, error } = useAppSelector((state) => state.contacts);

  useEffect(() => {
    dispatch(getAllContactsThunk());
    console.log(process.env.NEXT_PUBLIC_API_URL);
    console.log(process.env.NEXT_PUBLIC_URL);
    console.log(process.env.NEXT_PUBLIC_UPLOADS_URL);
  }, [dispatch]);

  if (isLoading) {
    return <div className={styles.loading}>Загрузка контактов...</div>;
  }

  if (error) {
    return <div className={styles.error}>Ошибка загрузки контактов: {error}</div>;
  }

  if (!contacts || contacts.length === 0) {
    return <div className={styles.empty}>Контакты не найдены</div>;
  }

  const contact = contacts[0];

  return (
    <div className={`${styles.contactsContainer} glass-card`}>
      <div className={styles.contactInfo}>
        {contact.tel && (
          <div className={styles.contactItem}>
            <a
              href={`tel:${contact.tel.replace(/\D/g, '')}`}
              className={styles.value}
              onClick={() => trackClick('phone-link', { category: 'contact', label: formatPhoneNumber(contact.tel || '') })}
            >
              {formatPhoneNumber(contact.tel)}
            </a>
          </div>
        )}

        {contact.email && (
          <div className={styles.contactItem}>
            <a
              href={`mailto:${contact.email}`}
              className={styles.value}
              onClick={() => trackClick('email-link', { category: 'contact', label: contact.email || '' })}
            >
              {contact.email}
            </a>
          </div>
        )}

        {contact.address && (
          <div className={styles.contactItem}>
            <a
              href={`https://yandex.ru/maps/?text=${encodeURIComponent(contact.address || '')}`}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.value}
              onClick={() => trackClick('address-link', { category: 'contact', label: contact.address || '' })}
            >
              {contact.address}
            </a>
          </div>
        )}
      </div>

      <div className={styles.socialLinks}>
        {contact.whatsapp && (
          <a
            href={`https://wa.me/${contact.whatsapp
              .replace(/^8/, '7')
              .replace(/\D/g, '')}`}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.socialLink}
            onClick={() => trackClick('whatsapp-link', { category: 'social', label: contact.whatsapp || '' })}
          >
            <Image
              src="/whatsapp-icon.svg"
              alt="WhatsApp"
              width={40}
              height={40}
              className={styles.socialIcon}
            />
          </a>
        )}

        {contact.telegram && (
          <a
            href={`https://t.me/${contact.telegram.replace('@', '')}`}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.socialLink}
            onClick={() => trackClick('telegram-link', { category: 'social', label: contact.telegram || '' })}
          >
            <Image
              src="/telegram-icon.svg"
              alt="Telegram"
              width={40}
              height={40}
              className={styles.socialIcon}
            />
          </a>
        )}
      </div>
      <br />
      <div className={styles.textBlock}>
        <div className={styles.legal}>
          <p className={styles.legalText}>OOO "ВентСтройМонтаж"</p>
          <p className={styles.legalText}>ИНН 272113806532</p>
          <p className={styles.legalText}>ОГРН 1122721008024</p>
        </div>
        <div className={styles.legal}>
          <Link
            href="/privacy-policy"
            className={styles.legalText}
            style={{ textDecoration: 'underline' }}
          >
            Политика конфиденциальности
          </Link>
          <br/>
          <Link
            href="/oferta"
            className={styles.legalText}
            style={{ textDecoration: 'underline' }}
          >
            Оферта
          </Link>
        </div>
      </div>
    </div>
  );
};
