'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useAppDispatch } from '@/shared/Hooks/useAppDispatch';
import { useAppSelector } from '@/shared/Hooks/useAppSelector';
import { getProfileThunk, refreshTokenThunk } from '@/entities/user/api/userThunkApi';
import { MenuOutlined, CloseOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import styles from '../../styles/Header.module.css';
import { useRouter } from 'next/navigation';
import { FileSystemTree } from '@/app/admin/menu/components/FileSystemTree';
import { useFileSystem } from '@/app/admin/menu/components/FileSystemProvider';

export default function Header({ burger, setBurger }: { burger: boolean; setBurger: (value: boolean) => void }) {
  const [isScrolled, setIsScrolled] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { urlStructure } = useFileSystem();
  const isAdminPath = pathname?.includes('/admin') ?? false;

  const dispatch = useAppDispatch();

  const { user, isInitialized } = useAppSelector((state) => state.user);
  const isAdmin = user?.role === 'ADMIN';

  useEffect(() => {
    if (!isInitialized) {
      dispatch(refreshTokenThunk()).then((result) => {
        if (refreshTokenThunk.fulfilled.match(result)) {
          dispatch(getProfileThunk());
        }
      });
    }
  }, [dispatch, isInitialized]);

  if (!isInitialized) {
    return null;
  }

  const baseNavItems = [
    { href: '/services', label: 'Услуги' },
    { href: '/portfolio', label: 'Наши работы' },
    { href: '/contacts', label: 'Контакты' },
  ];

  const navItems = isAdmin
    ? [...baseNavItems, { href: '/admin/menu', label: 'Админ' }]
    : baseNavItems;

  return (
    <>
      {!burger && (
        <div className={styles.mobile_main_logoImage}>
          <Link href="/">
            <Image
              src={'/logo_oktogon.png'}
              alt="oktogon Logo"
              width={110}
              height={50}
              style={
                pathname === '/'
                  ? { objectFit: 'contain' }
                  : { filter: 'var(--logo-filter)', objectFit: 'contain' }
              }
              priority
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
              }}
            />
          </Link>
        </div>
      )}
      <header
        className={`${styles.header} ${isScrolled ? styles.headerScrolled : ''}`}
        style={isAdminPath ? { background: 'transparent', backdropFilter: 'blur(0px)' } : {}}
      >
        {!isAdminPath && (
          <div className={styles.container}>
            <nav className={styles.nav}>
              <Link href="/" className={styles.logo}>
                <div className={styles.logoContainer}>
                  <div className={styles.logoImage}>
                    <Image
                      src="/logo_oktogon.png"
                      alt="oktogon Logo"
                      width={110}
                      height={50}
                      style={{ objectFit: 'contain' }}
                      priority
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                      }}
                    />
                  </div>
                </div>
              </Link>

              <ul className={styles.navLinks}>
                {navItems.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={`${styles.navLink} ${
                        pathname === item.href ? styles.active : ''
                      }`}
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        )}

        <div className={styles.mobile}>
          <div
            className={styles.backButton}
            onClick={() => router.back()}
            aria-label="Назад"
            role="button"
          >
            <ArrowLeftOutlined style={{ fontSize: '24px', color: 'white' }} />
          </div>
          <div
            className={styles.burgerMenu}
            role="button"
            onClick={() => setBurger(!burger)}
          >
            {!burger ? (
              <MenuOutlined style={{ fontSize: '24px', color: 'white' }} />
            ) : (
              <CloseOutlined style={{ fontSize: '24px', color: 'white' }} />
            )}
          </div>
          {burger && (
            <div className={styles.mobile_container}>
              {!isAdmin && (
                <nav className={styles.mobile_nav}>
                  <ul className={styles.mobile_navLinks}>
                    <li>
                      <Link
                        href="/"
                        className={styles.mobile_navLink}
                        onClick={() => setBurger(!burger)}
                      >
                        <Image
                          src={'/logo_oktogon.png'}
                          alt="oktogon Logo"
                          width={110}
                          height={50}
                          style={{ objectFit: 'contain' }}
                          priority
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                          }}
                        />
                      </Link>
                    </li>
                    {navItems.map((item) => (
                      <li key={item.href}>
                        <Link
                          href={item.href}
                          className={`${styles.mobile_navLink} ${
                            pathname === item.href ? styles.mobile_active : ''
                          }`}
                          onClick={() => setBurger(!burger)}
                        >
                          {item.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </nav>
              )}
              {isAdmin && (
                <div style={{ marginLeft: '20px' }}>
                  <nav className={styles.mobile_nav}>
                    <ul className={styles.mobile_navLinks}>
                      <li>
                        <Link
                          href="/"
                          className={styles.mobile_navLink}
                          onClick={() => setBurger(!burger)}
                        >
                          <Image
                            src={'/logo_oktogon.png'}
                            alt="oktogon Logo"
                            width={110}
                            height={50}
                            style={{ objectFit: 'contain' }}
                            priority
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.style.display = 'none';
                            }}
                          />
                        </Link>
                      </li>
                      <li className={styles.mobile_navLink}>
                        <FileSystemTree />
                      </li>
                    </ul>
                  </nav>
                </div>
              )}
            </div>
          )}
        </div>
      </header>
    </>
  );
}
