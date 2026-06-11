import { useEffect, useState, useRef } from 'react';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { fetchTop2000Years, loadTop2000ByYear } from '../data/api';

const fallbackSlides = [
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
  const [slides, setSlides] = useState<{ url: string; title: string; description: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const sliderRef = useRef<Slider>(null);

  useEffect(() => {
    let isMounted = true;
    const loadData = async () => {
      try {
        const yearsResult = await fetchTop2000Years();
        if (!yearsResult.ok || yearsResult.data.length === 0) {
          throw new Error('Geen jaren gevonden in de database.');
        }

        const latestYear = Math.max(...yearsResult.data);
        const entriesResult = await loadTop2000ByYear(latestYear);
        if (!entriesResult.ok || entriesResult.data.length === 0) {
          throw new Error('Geen rankings gevonden voor het laatste jaar.');
        }

        const top5 = entriesResult.data.slice(0, 5);
        const premiumBackdrops = [
          'https://images.unsplash.com/photo-1501612780327-45045538702b?w=1600&h=600&fit=crop',
          'https://images.unsplash.com/photo-1461783436728-0a9217714694?w=1600&h=600&fit=crop',
          'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=1600&h=600&fit=crop',
          'https://images.unsplash.com/photo-1516280440614-37939bbacd81?w=1600&h=600&fit=crop',
          'https://images.unsplash.com/photo-1506157786151-b8491531f063?w=1600&h=600&fit=crop',
        ];

        const mappedSlides = top5.map((entry, index) => {
          const img = entry.song.imgUrl || entry.song.albumCover || entry.song.artist?.photo || premiumBackdrops[index % premiumBackdrops.length];
          return {
            url: img,
            title: `#${entry.position}: ${entry.song.title}`,
            description: `${entry.song.artistName || entry.song.artist?.name || 'Onbekende artiest'} (${entry.song.releaseYear || 'Onbekend jaar'})`
          };
        });

        if (isMounted) {
          setSlides(mappedSlides);
          setLoading(false);
        }
      } catch (err) {
        console.warn('Failed to load dynamic database carousel slides, using static backups:', err);
        if (isMounted) {
          setSlides(fallbackSlides);
          setLoading(false);
        }
      }
    };

    void loadData();

    return () => {
      isMounted = false;
    };
  }, []);

  const settings = {
    dots: true,
    infinite: true,
    speed: 800,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
      autoplaySpeed: 5000,
      pauseOnHover: false,
    arrows: false,
    fade: true,
  };

  if (loading) {
    return (
      <section className="relative overflow-hidden bg-black h-[350px] md:h-[450px] lg:h-[550px] flex items-center justify-center">
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-black/30 animate-pulse"></div>
        <div className="container mx-auto px-4 text-white space-y-4">
          <div className="h-12 bg-zinc-800 rounded w-1/2 animate-pulse"></div>
          <div className="h-6 bg-zinc-800 rounded w-1/3 animate-pulse"></div>
        </div>
      </section>
    );
  }

  return (
    <section className="relative overflow-hidden bg-black group/carousel">
      {/* Custom Left Navigation Arrow */}
      <button
        onClick={() => sliderRef.current?.slickPrev()}
        className="absolute left-4 top-1/2 z-20 hover:bg-primary text-white p-3 rounded-full transition-all duration-300 opacity-0 group-hover/carousel:opacity-100 hidden md:flex items-center justify-center cursor-pointer shadow-lg hover:scale-110"
        aria-label="Vorige slide"
      >
        <ChevronLeft className="w-6 h-6" />
      </button>

      {/* Custom Right Navigation Arrow */}
      <button
        onClick={() => sliderRef.current?.slickNext()}
        className="absolute right-4 top-1/2 z-20 hover:bg-primary text-white p-3 rounded-full transition-all duration-300 opacity-0 group-hover/carousel:opacity-100 hidden md:flex items-center justify-center cursor-pointer shadow-lg hover:scale-110"
        aria-label="Volgende slide"
      >
        <ChevronRight className="w-6 h-6" />
      </button>

      <Slider ref={sliderRef} {...settings}>
        {slides.map((image, index) => (
          <div key={index} className="outline-none">
            <div className="relative h-[350px] md:h-[450px] lg:h-[550px]">
              <div
                className="absolute inset-0 bg-cover bg-center animate-fade-in duration-700"
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

      {/* Custom style overrides for slick-carousel dots (bubbles) */}
      <style>{`
        .slick-dots {
          bottom: 40px !important;
          z-index: 20;
        }
        .slick-dots li {
          margin: 0 6px !important;
          width: 12px !important;
          height: 12px !important;
          border-radius: 60% !important;
          background: rgba(255, 255, 255, 0.3) !important;
        }
        .slick-dots li button {
          width: 12px !important;
          height: 12px !important;
          padding: 0 !important;
          border-radius: 60% !important;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
        }
        .slick-dots li button:before {
          display: none !important;
        }
        .slick-dots li.slick-active button {
          background: #e11d48 !important; /* primary theme red/crimson */
          transform: scale(1.25) !important;
          box-shadow: 0 0 8px rgba(225, 29, 72, 0.6);
        }
        .slick-dots li:hover button {
          background: rgba(255, 0, 0, 1) !important;
          transform: scale(1.25) !important;
        }
      `}</style>
    </section>
  );
}
