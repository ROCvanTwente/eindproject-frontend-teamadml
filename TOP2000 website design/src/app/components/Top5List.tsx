import { Play, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { useEffect, useState } from 'react';
import { fetchTop2000Years, loadTop2000ByYear } from '../data/api';

type SongDisplay = {
  position: number;
  title: string;
  artist: string;
  year: number;
  imageUrl: string;
  change: number | 'new' | 0;
};

const fallbackSongs = [
  {
    id: 1,
    position: 1,
    title: 'Bohemian Rhapsody',
    artist: 'Queen',
    year: 1975,
    imageUrl: 'https://images.unsplash.com/photo-1501612780327-45045538702b?w=400&h=400&fit=crop',
    change: 0
  },
  {
    id: 2,
    position: 2,
    title: 'Hotel California',
    artist: 'Eagles',
    year: 1977,
    imageUrl: 'https://images.unsplash.com/photo-1498038432885-c6f3f1b912ee?w=400&h=400&fit=crop',
    change: 1
  },
  {
    id: 3,
    position: 3,
    title: 'Stairway to Heaven',
    artist: 'Led Zeppelin',
    year: 1971,
    imageUrl: 'https://images.unsplash.com/photo-1507838153414-b4b713384a76?w=400&h=400&fit=crop',
    change: -1
  },
  {
    id: 4,
    position: 4,
    title: 'Imagine',
    artist: 'John Lennon',
    year: 1971,
    imageUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400&h=400&fit=crop',
    change: 1
  },
  {
    id: 5,
    position: 5,
    title: 'Child in Time',
    artist: 'Deep Purple',
    year: 1970,
    imageUrl: 'https://images.unsplash.com/photo-1461783436728-0a9217714694?w=400&h=400&fit=crop',
    change: -1
  }
];

export function Top5List() {
  const [songs, setSongs] = useState<SongDisplay[]>([]);
  const [year, setYear] = useState<number>(2024);
  const [loading, setLoading] = useState(true);

  // Statistics States
  const [selectedStat, setSelectedStat] = useState<'stijgers' | 'dalers' | 'nieuwkomers' | 'verdwenen' | 'alle-edities'>('stijgers');
  const [statSongs, setStatSongs] = useState<any[]>([]);
  const [statsLoading, setStatsLoading] = useState(false);

  const fallbackStijgers = [
    { songId: 1, title: 'Fix You', artistName: 'Coldplay', currentPosition: 2, previousPosition: 5, change: 3 },
    { songId: 2, title: 'Piano Man', artistName: 'Billy Joel', currentPosition: 5, previousPosition: 9, change: 4 },
    { songId: 3, title: 'Roller Coaster', artistName: 'Danny Vera', currentPosition: 4, previousPosition: 6, change: 2 },
    { songId: 4, title: 'Black', artistName: 'Pearl Jam', currentPosition: 12, previousPosition: 20, change: 8 },
    { songId: 5, title: 'Love of My Life', artistName: 'Queen', currentPosition: 11, previousPosition: 18, change: 7 },
    { songId: 6, title: 'Riders on the Storm', artistName: 'The Doors', currentPosition: 35, previousPosition: 45, change: 10 },
    { songId: 7, title: 'Heroes', artistName: 'David Bowie', currentPosition: 19, previousPosition: 27, change: 8 },
    { songId: 8, title: 'Enjoy the Silence', artistName: 'Depeche Mode', currentPosition: 84, previousPosition: 99, change: 15 },
    { songId: 9, title: 'Sultans of Swing', artistName: 'Dire Straits', currentPosition: 41, previousPosition: 52, change: 11 },
    { songId: 10, title: 'One', artistName: 'U2', currentPosition: 25, previousPosition: 31, change: 6 },
  ];

  const fallbackDalers = [
    { songId: 11, title: 'Imagine', artistName: 'John Lennon', currentPosition: 7, previousPosition: 4, change: 3 },
    { songId: 12, title: 'Child in Time', artistName: 'Deep Purple', currentPosition: 8, previousPosition: 3, change: 5 },
    { songId: 13, title: 'A Whiter Shade of Pale', artistName: 'Procol Harum', currentPosition: 18, previousPosition: 10, change: 8 },
    { songId: 14, title: 'Angie', artistName: 'The Rolling Stones', currentPosition: 45, previousPosition: 30, change: 15 },
    { songId: 15, title: 'Hey Jude', artistName: 'The Beatles', currentPosition: 39, previousPosition: 22, change: 17 },
    { songId: 16, title: 'Paradise by the Dashboard Light', artistName: 'Meat Loaf', currentPosition: 14, previousPosition: 5, change: 9 },
    { songId: 17, title: 'Wish You Were Here', artistName: 'Pink Floyd', currentPosition: 15, previousPosition: 11, change: 4 },
    { songId: 18, title: 'Hotel California', artistName: 'Eagles', currentPosition: 3, previousPosition: 2, change: 1 },
    { songId: 19, title: 'Sultans of Swing', artistName: 'Dire Straits', currentPosition: 52, previousPosition: 41, change: 11 },
    { songId: 20, title: 'Losing My Religion', artistName: 'R.E.M.', currentPosition: 67, previousPosition: 49, change: 18 },
  ];

  const fallbackNieuwkomers = [
    { songId: 101, title: 'Birds', artistName: 'Anouk', position: 142 },
    { songId: 102, title: 'Texas Hold \'Em', artistName: 'Beyoncé', position: 284 },
    { songId: 103, title: 'Cruel Summer', artistName: 'Taylor Swift', position: 412 },
    { songId: 104, title: 'Houdini', artistName: 'Dua Lipa', position: 588 },
    { songId: 105, title: 'Beautiful Things', artistName: 'Benson Boone', position: 612 },
    { songId: 106, title: 'Training Season', artistName: 'Dua Lipa', position: 710 },
    { songId: 107, title: 'Lose Control', artistName: 'Teddy Swims', position: 819 },
    { songId: 108, title: 'Selfish', artistName: 'Justin Timberlake', position: 950 },
    { songId: 109, title: 'Too Sweet', artistName: 'Hozier', position: 1025 },
    { songId: 110, title: 'Overcompensate', artistName: 'Twenty One Pilots', position: 1184 },
  ];

  const fallbackVerdwenen = [
    { songId: 201, title: 'Flowers', artistName: 'Miley Cyrus', previousPosition: 890 },
    { songId: 202, title: 'As It Was', artistName: 'Harry Styles', previousPosition: 940 },
    { songId: 203, title: 'Cold Heart', artistName: 'Elton John & Dua Lipa', previousPosition: 1120 },
    { songId: 204, title: 'Bad Habits', artistName: 'Ed Sheeran', previousPosition: 1250 },
    { songId: 205, title: 'Shivers', artistName: 'Ed Sheeran', previousPosition: 1380 },
    { songId: 206, title: 'Stay', artistName: 'The Kid LAROI & Justin Bieber', previousPosition: 1450 },
    { songId: 207, title: 'Easy On Me', artistName: 'Adele', previousPosition: 1520 },
    { songId: 208, title: 'Heat Waves', artistName: 'Glass Animals', previousPosition: 1680 },
    { songId: 209, title: 'Blinding Lights', artistName: 'The Weeknd', previousPosition: 1720 },
    { songId: 210, title: 'Dynamite', artistName: 'BTS', previousPosition: 1890 },
  ];

  const fallbackAlleEdities = [
    { songId: 301, title: 'Bohemian Rhapsody', artistName: 'Queen', position: 1 },
    { songId: 302, title: 'Hotel California', artistName: 'Eagles', position: 3 },
    { songId: 303, title: 'Stairway to Heaven', artistName: 'Led Zeppelin', position: 6 },
    { songId: 304, title: 'Child in Time', artistName: 'Deep Purple', position: 8 },
    { songId: 305, title: 'Imagine', artistName: 'John Lennon', position: 7 },
    { songId: 306, title: 'Angie', artistName: 'The Rolling Stones', position: 45 },
    { songId: 307, title: 'Sultans of Swing', artistName: 'Dire Straits', position: 41 },
    { songId: 308, title: 'Radar Love', artistName: 'Golden Earring', position: 22 },
    { songId: 309, title: 'School', artistName: 'Supertramp', position: 15 },
    { songId: 310, title: 'A Whiter Shade of Pale', artistName: 'Procol Harum', position: 18 },
  ];

  useEffect(() => {
    let isMounted = true;
    const loadData = async () => {
      try {
        const yearsResult = await fetchTop2000Years();
        if (!yearsResult.ok || yearsResult.data.length === 0) {
          throw new Error('Geen jaren gevonden.');
        }

        const latestYear = Math.max(...yearsResult.data);
        if (isMounted) {
          setYear(latestYear);
        }
 main
        const [currentResult, previousResult] = await Promise.all([
          loadTop2000ByYear(latestYear),
          loadTop2000ByYear(latestYear - 1),
        ]);

        if (!currentResult.ok || currentResult.data.length === 0) {
          throw new Error('Geen rankings gevonden.');
        }

        const prevPositionsMap = new Map<number, number>();
        if (previousResult.ok && previousResult.data) {
          previousResult.data.forEach(entry => {
            prevPositionsMap.set(entry.songId, entry.position);
          });
        }

        const premiumAlbumBackdrops = [
          'https://images.unsplash.com/photo-1501612780327-45045538702b?w=400&h=400&fit=crop',
          'https://images.unsplash.com/photo-1498038432885-c6f3f1b912ee?w=400&h=400&fit=crop',
          'https://images.unsplash.com/photo-1507838153414-b4b713384a76?w=400&h=400&fit=crop',
          'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400&h=400&fit=crop',
          'https://images.unsplash.com/photo-1461783436728-0a9217714694?w=400&h=400&fit=crop',
        ];

        const top5 = currentResult.data.slice(0, 5).map((entry, index) => {
          const prevPos = prevPositionsMap.get(entry.songId);
          let change: number | 'new' | 0 = 0;

          if (prevPos === undefined) {
            change = 'new';
          } else {
            change = prevPos - entry.position;
          }

          const img = entry.song.imgUrl || entry.song.albumCover || entry.song.artist?.photo || premiumAlbumBackdrops[index % premiumAlbumBackdrops.length];

          return {
            position: entry.position,
            title: entry.song.title,
            artist: entry.song.artistName || entry.song.artist?.name || 'Onbekende artiest',
            year: entry.song.releaseYear || 0,
            imageUrl: img,
            change
          };
        });

        if (isMounted) {
          setSongs(top5);
          setLoading(false);
        }
      } catch (err) {
        console.warn('Failed to load Top 5 rankings from database, using mock data:', err);
        if (isMounted) {
          setSongs(fallbackSongs as SongDisplay[]);
          setLoading(false);
        }
      }
    };

    void loadData();

    return () => {
      isMounted = false;
    };
  }, []);

  // Fetch statistics lists dynamically or use fallbacks
  useEffect(() => {
    let isMounted = true;
    const fetchStat = async () => {
      setStatsLoading(true);
      try {
        let endpoint = '';
        if (selectedStat === 'stijgers') endpoint = `/api/top2000/statistics/stijgers/${year}`;
        else if (selectedStat === 'dalers') endpoint = `/api/top2000/statistics/dalers/${year}`;
        else if (selectedStat === 'nieuwkomers') endpoint = `/api/top2000/statistics/nieuwkomers/${year}`;
        else if (selectedStat === 'verdwenen') endpoint = `/api/top2000/statistics/verdwenen-nummers/${year}`;
        else if (selectedStat === 'alle-edities') endpoint = `/api/top2000/statistics/in-alle-edities/${year}`;

        const res = await fetch(endpoint);
        if (!res.ok) throw new Error('Query error');
        const data = await res.json();
        
        if (isMounted) {
          setStatSongs(data.slice(0, 10));
        }
      } catch (err) {
        console.warn(`Failed to fetch stats for ${selectedStat}, using local fallbacks`, err);
        if (isMounted) {
          if (selectedStat === 'stijgers') setStatSongs(fallbackStijgers);
          else if (selectedStat === 'dalers') setStatSongs(fallbackDalers);
          else if (selectedStat === 'nieuwkomers') setStatSongs(fallbackNieuwkomers);
          else if (selectedStat === 'verdwenen') setStatSongs(fallbackVerdwenen);
          else if (selectedStat === 'alle-edities') setStatSongs(fallbackAlleEdities);
        }
      } finally {
        if (isMounted) setStatsLoading(false);
      }
    };

    if (!loading) {
      void fetchStat();
    }

    return () => {
      isMounted = false;
    };
  }, [selectedStat, year, loading]);

  const tabOptions = [
    { id: 'stijgers' as const, label: 'Stijgers', icon: TrendingUp },
    { id: 'dalers' as const, label: 'Dalers', icon: TrendingDown },
    { id: 'nieuwkomers' as const, label: 'Nieuwkomers', icon: Star },
    { id: 'verdwenen' as const, label: 'Verdwenen', icon: Minus },
    { id: 'alle-edities' as const, label: 'In alle edities', icon: Award },
  ];

  return (
    <section className="py-16 text-foreground">
      <div className="container mx-auto px-4">
        
        {/* Main Grid Wrapper */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Top 5 List (lg:col-span-5) */}
          <div className="lg:col-span-5 space-y-6">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-2">Top 5 van {year}</h2>
              <p className="text-muted-foreground text-base">De meest geliefde nummers van dit jaar</p>
            </div>

        <div className="max-w-4xl mx-auto space-y-4">
          {top5Songs2024.map((song, index) => {
            const change = song.previousPosition - song.position;

            return (
              <Link
                key={song.position}
                to={`/nummer/${song.id}`}
                className="block"
              >
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-card shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden border border-border group"
                >
                  <div className="flex items-center gap-4 p-4 md:p-6">
                    {/* Position Badge */}
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 md:w-16 md:h-16 bg-primary flex items-center justify-center">
                        <span className="text-white text-2xl md:text-3xl font-bold">
                          {song.position}
                        </span>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}

                    {/* Album Art */}
                    <div className="hidden md:block flex-shrink-0">
                      <img
                        src={song.imageUrl}
                        alt={`${song.title} album art`}
                        className="w-20 h-20 rounded-lg object-cover shadow-md"
                      />
                    </div>

                    {/* Song Info */}
                    <div className="flex-grow min-w-0">
                      <h3 className="text-lg md:text-2xl font-bold truncate group-hover:text-primary transition-colors">
                        {song.title}
                      </h3>
                      <p className="text-muted-foreground text-sm md:text-base">
                        {song.artist} • {song.year}
                      </p>
                    </div>

                    {/* Change Indicator */}
                    <div className="flex items-center gap-3">
                      <div className="text-right hidden sm:block">
                        <div className="flex items-center gap-2">
                          {change > 0 ? (
                            <>
                              <TrendingUp className="w-5 h-5 text-green-600" />
                              <span className="text-green-600 font-semibold text-lg">
                                +{change}
                              </span>
                            </>
                          ) : change < 0 ? (
                            <>
                              <TrendingDown className="w-5 h-5 text-red-600" />
                              <span className="text-red-600 font-semibold text-lg">
                                {change}
                              </span>
                            </>
                          ) : (
                            <>
                              <Minus className="w-5 h-5 text-muted-foreground" />
                              <span className="text-muted-foreground font-semibold">-</span>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Play Button */}
                      <button className="bg-primary text-primary-foreground p-4 rounded-full hover:bg-accent transition-colors shadow-lg hover:shadow-xl hover:scale-110 duration-300 cursor-pointer">
                        <Play className="w-5 h-5 md:w-6 md:h-6 fill-current" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              </Link>
            );
          })}
        </div>

      </div>
    </section>
  );
}
