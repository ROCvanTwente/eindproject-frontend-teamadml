import { Play, TrendingUp, TrendingDown, Minus } from 'lucide-react';
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
    position: 1,
    title: 'Bohemian Rhapsody',
    artist: 'Queen',
    year: 1975,
    imageUrl: 'https://images.unsplash.com/photo-1501612780327-45045538702b?w=400&h=400&fit=crop',
    change: 0
  },
  {
    position: 2,
    title: 'Hotel California',
    artist: 'Eagles',
    year: 1977,
    imageUrl: 'https://images.unsplash.com/photo-1498038432885-c6f3f1b912ee?w=400&h=400&fit=crop',
    change: 1
  },
  {
    position: 3,
    title: 'Stairway to Heaven',
    artist: 'Led Zeppelin',
    year: 1971,
    imageUrl: 'https://images.unsplash.com/photo-1507838153414-b4b713384a76?w=400&h=400&fit=crop',
    change: -1
  },
  {
    position: 4,
    title: 'Imagine',
    artist: 'John Lennon',
    year: 1971,
    imageUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400&h=400&fit=crop',
    change: 1
  },
  {
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

  useEffect(() => {
    let isMounted = true;
    const loadData = async () => {
      try {
        const yearsResult = await fetchTop2000Years();
        if (!yearsResult.ok || yearsResult.data.length === 0) {
          throw new Error('Geen jaren gevonden.');
        }

        const latestYear = Math.max(...yearsResult.data);

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

  return (
    <section className="py-16 text-foreground">
      <div className="container mx-auto px-4">
        <div className="mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-2">Top 5 van {year}</h2>
          <p className="text-muted-foreground text-base">De meest geliefde nummers van dit jaar</p>
        </div>

        {loading ? (
          <div className="max-w-4xl mx-auto space-y-4">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="bg-card border border-border p-4 md:p-6 flex items-center gap-4 animate-pulse">
                <div className="w-12 h-12 md:w-16 md:h-16 bg-zinc-800 rounded"></div>
                <div className="hidden md:block w-20 h-20 bg-zinc-800 rounded-lg"></div>
                <div className="flex-grow space-y-2">
                  <div className="h-6 bg-zinc-800 rounded w-1/3"></div>
                  <div className="h-4 bg-zinc-800 rounded w-1/4"></div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="max-w-4xl mx-auto space-y-4">
            {songs.map((song, index) => {
              const change = song.change;

              return (
                <motion.div
                  key={song.position}
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
                    </div>

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
                        {song.artist} {song.year > 0 && `• ${song.year}`}
                      </p>
                    </div>

                    {/* Change Indicator */}
                    <div className="flex items-center gap-3">
                      <div className="text-right hidden sm:block">
                        <div className="flex items-center gap-2">
                          {change === 'new' ? (
                            <span className="text-primary font-semibold text-sm bg-primary/10 px-2.5 py-1 border border-primary/25 rounded">
                              Nieuw
                            </span>
                          ) : typeof change === 'number' && change > 0 ? (
                            <>
                              <TrendingUp className="w-5 h-5 text-green-600" />
                              <span className="text-green-600 font-semibold text-lg">
                                +{change}
                              </span>
                            </>
                          ) : typeof change === 'number' && change < 0 ? (
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
              );
            })}
          </div>
        )}

        <div className="text-center mt-8">
          <a
            href="/lijst"
            className="inline-block bg-primary text-white px-8 py-3 hover:bg-primary/90 transition-colors font-semibold uppercase tracking-wide text-sm cursor-pointer"
          >
            Bekijk de volledige TOP 2000
          </a>
        </div>
      </div>
    </section>
  );
}
