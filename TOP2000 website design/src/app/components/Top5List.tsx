import { Play, TrendingUp, TrendingDown, Minus, Star, Award, Loader2 } from 'lucide-react';
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
  },
  {
    position: 6,
    title: 'Love of My Life',
    artist: 'Queen',
    year: 1975,
    imageUrl: 'https://images.unsplash.com/photo-1487180142328-054b783fc471?w=400&h=400&fit=crop',
    change: 2
  },
  {
    position: 7,
    title: 'Heroes',
    artist: 'David Bowie',
    year: 1977,
    imageUrl: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=400&fit=crop',
    change: 1
  },
  {
    position: 8,
    title: 'Sultans of Swing',
    artist: 'Dire Straits',
    year: 1978,
    imageUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400&h=400&fit=crop',
    change: -1
  },
  {
    position: 9,
    title: 'Piano Man',
    artist: 'Billy Joel',
    year: 1973,
    imageUrl: 'https://images.unsplash.com/photo-1511192336575-5a79af67a629?w=400&h=400&fit=crop',
    change: 3
  },
  {
    position: 10,
    title: 'Wish You Were Here',
    artist: 'Pink Floyd',
    year: 1975,
    imageUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400&h=400&fit=crop',
    change: 0
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

        const top10 = currentResult.data.slice(0, 10).map((entry, index) => {
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
          setSongs(top10);
          setLoading(false);
        }
      } catch (err) {
        console.warn('Failed to load Top 10 rankings from database, using mock data:', err);
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
    { id: 'alle-edities' as const, label: 'Alle Edities', icon: Award },
  ];

  return (
    <section className="py-16 text-foreground">
      <div className="container mx-auto px-4">
        
        {/* Symmetrical Grid Wrapper for Both Top 10 Lists */}
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          
          {/* Left Column: Top 10 List Widget (lg:col-span-6) */}
          <div className="lg:col-span-6 bg-card/30 backdrop-blur-sm border border-white/10 rounded-2xl p-6 shadow-xl flex flex-col justify-between min-h-[640px]">
            <div className="space-y-5">
              {/* Widget Header */}
              <div>
                <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight">Top 10 van {year}</h2>
                <p className="text-muted-foreground text-sm mt-1">De meest geliefde nummers van dit jaar</p>
              </div>

              {loading ? (
                <div className="flex flex-col items-center justify-center py-20 gap-3 text-muted-foreground">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                  <span className="text-sm font-semibold">Top 10 laden...</span>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* #1 Featured Hero Card */}
                  {songs.length > 0 && (() => {
                    const song = songs[0];
                    const change = song.change;
                    return (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.4 }}
                        className="relative overflow-hidden rounded-xl bg-gradient-to-br from-primary/25 to-card/60 border border-primary/20 p-4 flex items-center gap-4 group/hero"
                      >
                        {/* Gold-themed Badge */}
                        <div className="absolute top-0 right-0 bg-primary text-white font-extrabold text-[10px] px-2.5 py-1 rounded-bl-lg shadow-md uppercase tracking-wider">
                          Nr. 1
                        </div>

                        {/* Image with Play overlay */}
                        <div className="relative flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden shadow-md border border-white/10">
                          <img
                            src={song.imageUrl}
                            alt={`${song.title} album art`}
                            className="w-full h-full object-cover group-hover/hero:scale-105 transition-transform duration-300"
                          />
                          <div className="absolute inset-0 bg-black/45 flex items-center justify-center opacity-0 group-hover/hero:opacity-100 transition-opacity">
                            <Play className="w-6 h-6 text-white fill-current" />
                          </div>
                        </div>

                        {/* Info */}
                        <div className="min-w-0 flex-grow pr-8">
                          <span className="text-[9px] font-bold text-primary uppercase tracking-wider">Top Favoriet</span>
                          <h3 className="text-base font-black text-white truncate group-hover/hero:text-primary transition-colors mt-0.5">
                            {song.title}
                          </h3>
                          <p className="text-muted-foreground text-xs truncate mt-0.5">
                            {song.artist} {song.year > 0 && `• ${song.year}`}
                          </p>
                          <div className="flex items-center gap-2 mt-2">
                            {change === 'new' ? (
                              <span className="text-primary font-semibold text-[9px] bg-primary/10 px-1.5 py-0.5 border border-primary/25 rounded uppercase tracking-wider">
                                Nieuw
                              </span>
                            ) : typeof change === 'number' && change > 0 ? (
                              <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-green-500 bg-green-500/10 px-1.5 py-0.5 border border-green-500/20 rounded">
                                <TrendingUp className="w-3 h-3" />
                                +{change}
                              </span>
                            ) : typeof change === 'number' && change < 0 ? (
                              <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-primary bg-primary/10 px-1.5 py-0.5 border border-primary/25 rounded">
                                <TrendingDown className="w-3 h-3" />
                                {change}
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-muted-foreground bg-white/5 px-1.5 py-0.5 border border-white/10 rounded">
                                <Minus className="w-3 h-3" />
                                Gelijk
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Play Action button */}
                        <button className="bg-primary text-primary-foreground p-3 rounded-full hover:bg-accent transition-colors shadow-md hover:scale-105 duration-200 cursor-pointer flex-shrink-0 mr-1">
                          <Play className="w-4 h-4 fill-current" />
                        </button>
                      </motion.div>
                    );
                  })()}

                  {/* Remaining Top Songs */}
                  <div className="divide-y divide-white/5">
                    {songs.slice(1).map((song, index) => {
                      const change = song.change;
                      return (
                        <motion.div
                          key={song.position}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: (index + 1) * 0.05 }}
                          className="flex items-center justify-between py-2.5 px-2 hover:bg-white/5 rounded-xl transition-all group"
                        >
                          <div className="flex items-center gap-3 min-w-0 flex-grow">
                            {/* Position Badge */}
                            <div className="flex-shrink-0">
                              <div className="w-8 h-8 bg-white/5 border border-white/10 flex items-center justify-center rounded-lg">
                                <span className="text-white text-sm font-bold">
                                  {song.position}
                                </span>
                              </div>
                            </div>

                            {/* Album Art */}
                            <div className="hidden sm:block flex-shrink-0">
                              <img
                                src={song.imageUrl}
                                alt={`${song.title} album art`}
                                className="w-10 h-10 rounded-lg object-cover shadow-sm"
                              />
                            </div>

                            {/* Song Info */}
                            <div className="min-w-0 flex-grow">
                              <h4 className="text-xs md:text-sm font-bold text-white group-hover:text-primary transition-colors truncate">
                                {song.title}
                              </h4>
                              <p className="text-muted-foreground text-[10px] truncate mt-0.5">
                                {song.artist} {song.year > 0 && `• ${song.year}`}
                              </p>
                            </div>
                          </div>

                          {/* Change & Play Action */}
                          <div className="flex items-center gap-2.5 flex-shrink-0 pl-3">
                            <div className="text-right hidden sm:block">
                              <div className="flex items-center gap-1">
                                {change === 'new' ? (
                                  <span className="text-primary font-semibold text-[8px] bg-primary/10 px-1.5 py-0.5 border border-primary/25 rounded uppercase tracking-wider">
                                    Nieuw
                                  </span>
                                ) : typeof change === 'number' && change > 0 ? (
                                  <>
                                    <TrendingUp className="w-3 h-3 text-green-500" />
                                    <span className="text-green-500 font-semibold text-[10px]">
                                      +{change}
                                    </span>
                                  </>
                                ) : typeof change === 'number' && change < 0 ? (
                                  <>
                                    <TrendingDown className="w-3 h-3 text-primary" />
                                    <span className="text-primary font-semibold text-[10px]">
                                      {change}
                                    </span>
                                  </>
                                ) : (
                                  <>
                                    <Minus className="w-3 h-3 text-muted-foreground" />
                                  </>
                                )}
                              </div>
                            </div>

                            {/* Play Button */}
                            <button className="bg-primary/20 hover:bg-primary text-white p-2 rounded-full transition-colors cursor-pointer">
                              <Play className="w-3 h-3 fill-current" />
                            </button>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Widget Footer */}
            <div className="mt-6 pt-4 border-t border-white/10 text-left">
              <a
                href="/lijst"
                className="inline-block bg-primary text-white px-5 py-3 hover:bg-primary/90 transition-all font-semibold uppercase tracking-wide text-xs cursor-pointer shadow-md hover:shadow-lg rounded-lg"
              >
                Bekijk de volledige TOP 2000
              </a>
            </div>
          </div>

          {/* Right Column: Statistics Interactive Panel Widget (lg:col-span-6) */}
          <div className="lg:col-span-6 bg-card/30 backdrop-blur-sm border border-white/10 rounded-2xl p-6 shadow-xl flex flex-col justify-between min-h-[640px]">
            <div className="space-y-5">
              {/* Widget Header */}
              <div>
                <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight">TOP 10 Statistieken ({year})</h2>
                <p className="text-muted-foreground text-sm mt-1">Ontdek trends en uitschieters in de catalogus van dit jaar</p>
              </div>

              {/* Tabs Buttons - More Compact for Sizing Fit */}
              <div className="flex gap-1.5 overflow-x-auto pb-3 border-b border-white/15 scrollbar-thin scrollbar-thumb-white/10">
                {tabOptions.map(tab => {
                  const Icon = tab.icon;
                  const isSelected = selectedStat === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setSelectedStat(tab.id)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-bold transition-all border whitespace-nowrap cursor-pointer ${
                        isSelected
                          ? 'bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/20 scale-[1.01]'
                          : 'bg-white/5 hover:bg-white/10 text-muted-foreground hover:text-foreground border-white/5'
                      }`}
                    >
                      <Icon className="w-3 h-3" />
                      {tab.label}
                    </button>
                  );
                })}
              </div>

              {/* Stats list view */}
              <div className="flex-grow flex flex-col justify-between">
                {statsLoading ? (
                  <div className="flex flex-col items-center justify-center flex-grow py-20 gap-3 text-muted-foreground">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                    <span className="text-sm font-semibold">Statistieken laden...</span>
                  </div>
                ) : statSongs.length === 0 ? (
                  <div className="flex items-center justify-center flex-grow py-20 text-muted-foreground text-sm">
                    Geen data gevonden voor dit jaar.
                  </div>
                ) : (
                  <div className="divide-y divide-white/5">
                    {statSongs.map((song, index) => {
                      return (
                        <motion.div
                          key={song.songId || index}
                          initial={{ opacity: 0, x: 10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.03 }}
                          className="flex items-center justify-between py-2 px-2 hover:bg-white/5 rounded-xl transition-all group"
                        >
                          <div className="flex items-center gap-3 min-w-0 flex-grow">
                            {/* Top index */}
                            <span className="text-xs font-black text-white/30 w-5 text-right flex-shrink-0">
                              {index + 1}
                            </span>
                            
                            <div className="min-w-0 flex-grow">
                              <h4 className="text-xs md:text-sm font-bold text-white group-hover:text-primary transition-colors truncate">
                                {song.title}
                              </h4>
                              <p className="text-muted-foreground text-[10px] truncate mt-0.5">
                                {song.artistName}
                              </p>
                            </div>
                          </div>

                          {/* Indicators for statistics */}
                          <div className="flex items-center gap-3 flex-shrink-0 pl-4">
                            {selectedStat === 'stijgers' && (
                              <div className="flex flex-col items-end">
                                <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-green-500 bg-green-500/10 px-2 py-0.5 border border-green-500/20 rounded-md">
                                  <TrendingUp className="w-3 h-3" />
                                  +{song.change}
                                </span>
                                <span className="text-[9px] text-muted-foreground/60 mt-0.5">
                                  Pos: {song.currentPosition} (was {song.previousPosition})
                                </span>
                              </div>
                            )}

                            {selectedStat === 'dalers' && (
                              <div className="flex flex-col items-end">
                                <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 border border-primary/25 rounded-md">
                                  <TrendingDown className="w-3 h-3" />
                                  -{song.change}
                                </span>
                                <span className="text-[9px] text-muted-foreground/60 mt-0.5">
                                  Pos: {song.currentPosition} (was {song.previousPosition})
                                </span>
                              </div>
                            )}

                            {selectedStat === 'nieuwkomers' && (
                              <div className="flex flex-col items-end">
                                <span className="text-[9px] font-semibold text-accent bg-accent/10 px-2 py-0.5 border border-accent/25 rounded uppercase tracking-wider">
                                  Nieuw
                                </span>
                                <span className="text-[9px] text-muted-foreground/60 mt-0.5">
                                  Binnen op: {song.position}
                                </span>
                              </div>
                            )}

                            {selectedStat === 'verdwenen' && (
                              <div className="flex flex-col items-end">
                                <span className="text-[9px] font-semibold text-muted-foreground/80 bg-white/5 px-2 py-0.5 border border-white/10 rounded uppercase tracking-wider">
                                  Uit lijst
                                </span>
                                <span className="text-[9px] text-muted-foreground/60 mt-0.5">
                                  Stond op: {song.previousPosition}
                                </span>
                              </div>
                            )}

                            {selectedStat === 'alle-edities' && (
                              <div className="flex flex-col items-end">
                                <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-amber-400 bg-amber-400/10 px-2 py-0.5 border border-amber-400/20 rounded-md">
                                  <Award className="w-3 h-3" />
                                  Klassieker
                                </span>
                                <span className="text-[9px] text-muted-foreground/60 mt-0.5">
                                  Huidige Pos: {song.position}
                                </span>
                              </div>
                            )}
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Widget Footer */}
            <div className="mt-6 pt-4 border-t border-white/10 text-left">
              <a
                href="/statistieken"
                className="inline-block bg-primary text-white px-5 py-3 hover:bg-primary/90 transition-all font-semibold uppercase tracking-wide text-xs cursor-pointer shadow-md hover:shadow-lg rounded-lg"
              >
                Bekijk uitgebreide statistieken
              </a>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
