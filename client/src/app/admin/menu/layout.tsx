'use client';

import { FileSystem } from './components/FileSistem';
import { useAppSelector } from '@/shared/Hooks/useAppSelector';
import { notFound } from 'next/navigation';
import style from './page.module.css'

export default function AdminLayout({ children }: { children: React.ReactNode }) {

  const { user } = useAppSelector((state) => state.user);
  const isAdmin = user?.role === 'ADMIN';

  if (isAdmin) {
    return (
      <div className={style.menu}>
        <FileSystem />
        {children}
      </div>
    );
  }
  return notFound();
}
