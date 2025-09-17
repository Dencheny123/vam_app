'use client';

import { useState } from 'react';
import { Carousel } from 'antd/es';
import Cards from './Cards';
import { MyWork } from '@/entities/my-work/model';

interface CarouselClientProps {
  works: MyWork[];
}

export default function CarouselClient({ works }: CarouselClientProps) {
  const [isPaused, setIsPaused] = useState(false);
  const works1 = works.slice(0, 10);
  const works2 = works.slice(10, 20);

  const handleCardClick = () => setIsPaused((prev) => !prev);

  return (
    <div>
      <Carousel
        autoplay={!isPaused}
        autoplaySpeed={3000}
        slidesToShow={3}
        slidesToScroll={1}
        infinite
        dots={false}
        responsive={[
          {
            breakpoint: 1025,
            settings: {
              slidesToShow: 2,
            },
          },
          {
            breakpoint: 635,
            settings: {
              slidesToShow: 1,
            },
          },
        ]}
      >
        {works1.map((work) => (
          <div key={work.id}>
            <Cards work={work} handleCardClick={handleCardClick} />
          </div>
        ))}
      </Carousel>
      <br />
      <br />
      <Carousel
        autoplay={!isPaused}
        autoplaySpeed={3000}
        slidesToShow={3}
        slidesToScroll={1}
        infinite
        rtl={true}
        dots={false}
        responsive={[
          {
            breakpoint: 1025,
            settings: {
              slidesToShow: 2,
            },
          },
          {
            breakpoint: 635,
            settings: {
              slidesToShow: 1,
            },
          },
        ]}
      >
        {works2.map((work) => (
          <div key={work.id}>
            <Cards work={work} handleCardClick={handleCardClick} />
          </div>
        ))}
      </Carousel>
    </div>
  );
}
