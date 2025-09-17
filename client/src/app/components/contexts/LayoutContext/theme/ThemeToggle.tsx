'use client';

import { useTheme } from '@/app/components/contexts/LayoutContext/theme/ThemeContext';
import { useEffect, useState } from 'react';
import styles from '../../../styles/ThemeToggle.module.css';

const ThemeIcon = ({ theme }: { theme: any }) => {
  const isLight = theme === 'light';

  return (
    <svg
      width="32"
      height="32"
      viewBox="0 0 24 24"
      fill="none"
      stroke="#f59e0b"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`${styles.icon} ${isLight ? styles.flipMoon : styles.flipSun}`}
    >
      {/* Sun */}
      <g className={styles.sun} style={{ opacity: isLight ? 0 : 1 }}>
        <circle cx="12" cy="12" r="5" fill="none" />
        <line x1="12" y1="1" x2="12" y2="3" />
        <line x1="12" y1="21" x2="12" y2="23" />
        <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
        <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
        <line x1="1" y1="12" x2="3" y2="12" />
        <line x1="21" y1="12" x2="23" y2="12" />
        <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
        <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
        <radialGradient id="sunGradient">
          <stop offset="0%" stopColor="#ffd700" />
          <stop offset="100%" stopColor="#ffec8b" />
        </radialGradient>
        <circle cx="12" cy="12" r="5" fill="url(#sunGradient)" opacity="0.4" />
      </g>
      {/* Moon */}
      <g className={styles.moon} style={{ opacity: isLight ? 1 : 0 }}>
        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" fill="none" />
        <linearGradient id="moonGradient">
          <stop offset="0%" stopColor="#f4a261" />
          <stop offset="100%" stopColor="#e76f51" />
        </linearGradient>
        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" fill="url(#moonGradient)" opacity="0.3" />
      </g>
    </svg>
  );
};

export const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();
  const [hovered, setHovered] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [flipping, setFlipping] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleToggle = () => {
    setFlipping(true);
    setTimeout(() => {
      toggleTheme();
      setFlipping(false);
    }, 250); // Half of the flip duration
  };

  if (!mounted) {
    return (
      <button
        className="w-12 h-12 flex items-center justify-center"
        aria-label="Toggle theme"
      />
    );
  }

  return (
    <div className={styles.toggleContainer}>
      <div
        onClick={handleToggle}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        className={`${styles.toggleButton} ${hovered ? styles.hovered : ''} ${flipping ? styles.flipping : ''}`}
        aria-label={
          theme === 'light' ? 'Переключить на темную тему' : 'Переключить на светлую тему'
        }
        role="button"
      >
        <ThemeIcon theme={theme} />
      </div>
    </div>
  );
};