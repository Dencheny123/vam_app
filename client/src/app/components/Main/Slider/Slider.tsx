'use client';

import { Carousel } from 'antd/es';
import Image from 'next/image';
import styles from '../../styles/Slider.module.css';

interface Brand {
  name: string;
  logoBaseName: string;
}

export default function Slider() {
  const brands: Brand[] = [
    { name: 'Electrolux', logoBaseName: 'electrolux-logo-240' },
    { name: 'Samsung', logoBaseName: 'samsung-logo-240' },
    { name: 'mitsubishi-logo-480', logoBaseName: 'mitsubishi-logo-240' },
    { name: 'LG', logoBaseName: 'lg-logo-240' },
    { name: 'Sony', logoBaseName: 'sony-logo-240' },
    { name: 'Panasonic', logoBaseName: 'panasonic-logo-240' },
  ];

  return (
    <div className={styles.sliderContainer}>
      <Carousel
        autoplay
        dots={false}
        autoplaySpeed={3000}
        slidesToShow={3}
        slidesToScroll={1}
        className={styles.sliderViewport}
      >
        {brands.map((brand, index) => (
          <div key={index} className={styles.slide}>
            <Image
              src={`/${brand.logoBaseName}.webp`}
              alt={brand.name}
              width={200}
              height={40}
              className={styles.logo}
              loading="lazy"
            />
          </div>
        ))}
      </Carousel>
    </div>
  );
}