import { Metadata } from 'next';
import { generateMetadatas } from '@/shared/utils/metadata';
import React from 'react';
import styles from './Oferta.module.css';

export async function generateMetadata(): Promise<Metadata> {
  return generateMetadatas(1);
}

export default function Oferta() {
  return (
    <div className={styles.container}>
      <h1 className={styles.title}>ОФЕРТА</h1>
      <p className={styles.subtitle}>на оказание услуг по монтажу и обслуживанию систем приточной вентиляции</p>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>1. ИСПОЛНИТЕЛЬ</h2>
        <p className={styles.paragraph}>Индивидуальный предприниматель [ФИО]</p>
        <p className={styles.paragraph}>ОГРНИП: [номер] от [дата]</p>
        <p className={styles.paragraph}>ИНН: [номер]</p>
        <p className={styles.paragraph}>Юридический адрес: [адрес]</p>
        <p className={styles.paragraph}>Фактический адрес: [адрес]</p>
        <p className={styles.paragraph}>Телефон: [номер]</p>
        <p className={styles.paragraph}>Email: [адрес]</p>
        <p className={styles.paragraph}>Сайт: [адрес]</p>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>2. ТЕРМИНЫ</h2>
        <ul className={styles.list}>
          <li><strong>ПВУ</strong> – приточная вентиляционная установка</li>
          <li><strong>Объект</strong> – помещение Заказчика, где проводятся работы</li>
          <li><strong>Рабочая документация</strong> – технические схемы, проектные решения</li>
          <li><strong>Акт выполненных работ</strong> – документ о приемке услуг</li>
        </ul>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>3. ПРЕДМЕТ ДОГОВОРА</h2>
        <p className={styles.paragraph}>3.1. Исполнитель оказывает услуги по:</p>
        <ul className={styles.list}>
          <li>Проектированию систем вентиляции</li>
          <li>Поставке оборудования ПВУ</li>
          <li>Монтажу и пусконаладке</li>
          <li>Техническому обслуживанию</li>
        </ul>
        <p className={styles.paragraph}>3.2. Заказчик обязан:</p>
        <ul className={styles.list}>
          <li>Предоставить доступ к объекту</li>
          <li>Оплатить услуги в согласованные сроки</li>
        </ul>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>4. ПОРЯДОК ОКАЗАНИЯ УСЛУГ</h2>
        <p className={styles.paragraph}>4.1. Этапы работ:</p>
        <ol className={styles.orderedList}>
          <li>Выезд специалиста для замера</li>
          <li>Разработка проекта</li>
          <li>Монтаж оборудования</li>
          <li>Пусконаладочные работы</li>
        </ol>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>5. ГАРАНТИИ</h2>
        <p className={styles.paragraph}>5.1. На оборудование – согласно гарантии производителя</p>
        <p className={styles.paragraph}>5.2. На монтажные работы – 24 месяца</p>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>6. ОТВЕТСТВЕННОСТЬ</h2>
        <p className={styles.paragraph}>6.1. За нарушение обязательств стороны несут ответственность согласно законодательству РФ</p>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>7. КОНФИДЕНЦИАЛЬНОСТЬ</h2>
        <p className={styles.paragraph}>7.1. Стороны обязуются не разглашать коммерческую тайну</p>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>8. РЕКВИЗИТЫ</h2>
        <p className={styles.paragraph}>ИП [ФИО]</p>
        <p className={styles.paragraph}>р/с [номер] в [банк]</p>
        <p className={styles.paragraph}>БИК [номер]</p>
        <p className={styles.paragraph}>Корр. счет [номер]</p>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Приложения:</h2>
        <ul className={styles.list}>
          <li>Прайс-лист на оборудование</li>
          <li>Образец договора</li>
        </ul>
      </section>

      <div className={styles.footer}>
        <p>Дата публикации: [число/месяц/год]</p>
        <p className={styles.note}>Примечание: Для акцепта оферты Заказчик должен оформить заявку на сайте или по контактным данным Исполнителя.</p>
      </div>
    </div>
  );
}