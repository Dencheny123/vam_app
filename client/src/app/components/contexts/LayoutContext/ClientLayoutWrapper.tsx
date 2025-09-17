'use client';

import { usePathname } from 'next/navigation';
import dynamic from 'next/dynamic';
const Feedback = dynamic(
  () =>
    import('@/app/components/contexts/LayoutContext/providers/Feedback').then(
      (mod) => mod.Feedback,
    ),
  { ssr: false },
);
import GoodAppWidget from '@/app/components/contexts/LayoutContext/providers/WhatsappButton';
import YandexMetrika from '@/app/components/contexts/LayoutContext/providers/YandexMetrika';
import { Providers } from './store/Providers';
import { ThemeProvider } from './theme/ThemeContext';
import Header from '../Header/Header';
import Footer from '../Footer/Footer';
import { ThemeToggle } from './theme/ThemeToggle';
import { FileSystemProvider } from '@/app/admin/menu/components/FileSystemProvider';
import { useState } from 'react';

export function ClientLayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdminPath = pathname?.includes('/admin') ?? false;
    const [burger, setBurger] = useState(false);

  return (
    <>
      <Providers>
        <FileSystemProvider burger={burger} setBurger={setBurger}>
          <ThemeProvider>
            {!isAdminPath && <ThemeToggle />}
            <Header burger={burger} setBurger={setBurger}/>
            <main>
              {children}
              {!isAdminPath && <Feedback />}
              <YandexMetrika />
            </main>
            {!isAdminPath && <Footer />}
          </ThemeProvider>
        </FileSystemProvider>
      </Providers>
    </>
  );
}
