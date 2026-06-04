import { useEffect, useRef, useState } from 'react';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';

const carouselImages = [
  {
    url: 'https://images.unsplash.com/photo-1501612780327-45045538702b?w=1600&h=600&fit=crop',
    title: 'TOP 2000 Live',
    description: 'Beleef de magie van de TOP 2000'
  },
  {
    url: 'https://images.unsplash.com/photo-1461783436728-0a9217714694?w=1600&h=600&fit=crop',
    title: 'De Beste Muziek',
    description: 'Van 25 december tot en met 31 december'
  },
  {
    url: 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=1600&h=600&fit=crop',
    title: 'Stem Nu!',
    description: 'Bepaal mee welke nummers in de lijst komen'
  }
];

export function Carousel() {
  const settings = {
    dots: true,
    infinite: true,
    speed: 800,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
      autoplaySpeed: 5000,
      pauseOnHover: false,
    arrows: true,
    fade: true,
  };

  return (
    <section className="relative overflow-hidden bg-black">
      <Slider {...settings}>
        {carouselImages.map((image, index) => (
          <div key={index} className="outline-none">
            <div className="relative h-[350px] md:h-[450px] lg:h-[550px]">
              <div
                className="absolute inset-0 bg-cover bg-center"
                style={{ backgroundImage: `url(${image.url})` }}
              >
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-black/30"></div>
              </div>
              <div className="relative h-full flex items-center">
                <div className="container mx-auto px-4 text-white">
                  <h2 className="text-3xl md:text-5xl lg:text-6xl font-bold mb-3 tracking-tight">
                    {image.title}
                  </h2>
                  <p className="text-lg md:text-xl opacity-90 max-w-2xl">
                    {image.description}
                  </p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </Slider>
    </section>
  );
}
