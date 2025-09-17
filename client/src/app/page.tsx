import styles from './components/styles/page.module.css';
import {FAQ} from './components/Main/faq/FAQ';
import Slider from '@/app/components/Main/Slider/Slider';
import ContactsPage from './contacts/page';
import HeroSection from '@/app/components/Main/hero/HeroSection';
import { Metadata } from 'next';
import AchievementsSection from './components/Main/achievements/AchievementsSection';
import HomeClient from './components/Main/Effects/HomeClient';
import { generateMetadatas } from '@/shared/utils/metadata';

export async function generateMetadata(): Promise<Metadata> {
  return generateMetadatas(1);
}

export default function Home() {
  return (
    <>
      {/* Прогресс-бар скролла */}
      <div className="scroll-progress" id="scroll-progress"></div>

      <div className={styles.page}>
        <div className="main-content-wrapper">
          <HeroSection />

          <div className="fade-in-up">
            <AchievementsSection />
          </div>

          <div className="section-divider"></div>

          <div
            className="fade-in-up delay-2"
            style={{
              textAlign: 'center',
              margin: '10rem 0 2rem',
              width: '100%',
            }}
          >
            <h2
              style={{
                fontSize: '2.3rem',
                fontWeight: 700,
                color: 'var(--text-on-dark)',
                marginBottom: '1.5rem',
                position: 'relative',
                display: 'inline-block',
                paddingBottom: '1rem',
                width: '100%',
                maxWidth: '1000px',
                margin: '0 auto 1.5rem',
                textAlign: 'center',
                fontFamily:
                  'Inter, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
              }}
            >
              Наши партнеры
              <span
                style={{
                  content: "''",
                  position: 'absolute',
                  bottom: 0,
                  left: '50%',
                  transform: 'translateX(-50%)',
                  width: '100%',
                  maxWidth: '1000px',
                  height: '3px',
                  background: 'var(--gradient-accent)',
                  borderRadius: '2px',
                }}
              ></span>
            </h2>
          </div>

          <div
            className="fade-in-up delay-2"
            style={{
              width: '100%',
              maxWidth: '1150px',
              margin: '0 auto',
              boxSizing: 'border-box',
            }}
          >
            <Slider />
          </div>

          <div className="section-divider"></div>

          <div className="fade-in-up delay-1">
            <ContactsPage />
          </div>
          <HomeClient />

          <div className="section-divider"></div>

          <div className="fade-in-up delay-3">
            <FAQ />
          </div>
        </div>
      </div>
    </>
  );
}
