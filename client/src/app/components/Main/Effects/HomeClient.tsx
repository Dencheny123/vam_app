'use client';

import { useEffect } from 'react';

export default function HomeClient() {
  useEffect(() => {
    const updateScrollProgress = () => {
      const scrollTop = window.pageYOffset;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrollPercent = (scrollTop / docHeight) * 100;

      const progressBar = document.getElementById('scroll-progress');
      if (progressBar) {
        progressBar.style.width = scrollPercent + '%';
      }
    };

    const animateCounters = () => {
      const counters = document.querySelectorAll('.animated-counter');
      counters.forEach((counter) => {
        const target = parseInt(counter.getAttribute('data-target') || '0');
        const current = parseInt(counter.textContent || '0');
        const increment = target / 100;

        if (current < target) {
          counter.textContent = Math.ceil(current + increment).toString();
          counter.classList.add('counting');
          setTimeout(() => counter.classList.remove('counting'), 300);
        }
      });
    };

    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px',
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('fade-in-up');
          if (entry.target.querySelector('.animated-counter')) {
            animateCounters();
          }
        }
      });
    }, observerOptions);

    const sections = document.querySelectorAll('.fade-in-up');
    sections.forEach((section) => observer.observe(section));

    window.addEventListener('scroll', updateScrollProgress);

    return () => {
      window.removeEventListener('scroll', updateScrollProgress);
      observer.disconnect();
    };
  }, []);

  return null;
}
