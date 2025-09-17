import React from 'react';
import Image from 'next/image';
import styles from '../../styles/AchievementsSection.module.css';

const AchievementsSection: React.FC = () => {
  return (
    <section className={styles.achievementsSection}>
      <div className={styles.container}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>НАШИ ДОСТИЖЕНИЯ</h2>
        </div>
        <div className={styles.statsGrid}>
          <div className={styles.statItem}>
            <div className={styles.statNumber}>6</div>
            <div className={styles.statLine}></div>
            <div className={styles.statDescription}>лет работы в сфере климата</div>
          </div>
          <div className={styles.statItem}>
            <div className={styles.statNumber}>450+</div>
            <div className={styles.statLine}></div>
            <div className={styles.statDescription}>успешных проектов</div>
          </div>
          <div className={styles.statItem}>
            <div className={styles.statNumber}>91%</div>
            <div className={styles.statLine}></div>
            <div className={styles.statDescription}>
              наших клиентов обращаются к нам повторно
            </div>
          </div>
        </div>
        <div className={styles.advantagesGrid}>
          <div className={styles.advantageItem}>
            <div className={styles.advantageIcon}>
              <Image
                src="/1vi.png" 
                alt="Высокая квалификация специалистов"
                width={60}
                height={60}
                style={{ width: 'auto', height: 'auto' }}
                priority
              />
            </div>
            <div className={styles.advantageContent}>
              <h3 className={styles.advantageTitle}>Высокая квалификация специалистов</h3>
              <p className={styles.advantageDescription}>
                наша компания имеет профильное образование и долголетний опыт работы в
                данной сфере, что гарантирует высокий уровень выполненных работ
              </p>
            </div>
          </div>

          <div className={styles.advantageItem}>
            <div className={styles.advantageIcon}>
              <Image
                src="/3so.png"
                alt="Гарантия качества"
                width={60}
                height={60}
                style={{ width: 'auto', height: 'auto' }}
                priority
              />
            </div>
            <div className={styles.advantageContent}>
              <h3 className={styles.advantageTitle}>Гарантия качества</h3>
              <p className={styles.advantageDescription}>
                мы предоставляем гарантию на все выполненные работы и
                установленное оборудование
              </p>
            </div>
          </div>

          <div className={styles.advantageItem}>
            <div className={styles.advantageIcon}>
              <Image
                src="/2in.png"
                alt="Индивидуальный подход"
                width={60}
                height={60}
                style={{ width: 'auto', height: 'auto' }}
                priority
              />
            </div>
            <div className={styles.advantageContent}>
              <h3 className={styles.advantageTitle}>Индивидуальный подход</h3>
              <p className={styles.advantageDescription}>
                мы учитываем все пожелания клиента и предлагаем оптимальное
                решение для каждого конкретного случая
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AchievementsSection;
