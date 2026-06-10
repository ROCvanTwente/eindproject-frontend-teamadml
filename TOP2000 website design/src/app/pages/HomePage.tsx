import { Carousel } from '../components/Carousel';
import { Top5List } from '../components/Top5List';
import { ChevronDown, ChevronRight, ExternalLink, Play, Pause, SkipForward, Radio } from 'lucide-react';
import { useState, useEffect } from 'react';
import { fetchTop2000Years, fetchSongs } from '../data/api';

const articleData = [
  {
    id: 1,
    title: 'Het verhaal achter Bohemian Rhapsody',
    description: 'Ontdek waarom dit Queen-nummer al jaren de lijst aanvoert',
    image: 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=600&h=400&fit=crop',
    date: '15 december 2026'
  },
  {
    id: 2,
    title: 'De ontwikkeling van de Top 2000 door de jaren heen',
    description: 'Van 1999 tot nu: hoe de lijst is veranderd',
    image: 'https://images.unsplash.com/photo-1516280440614-37939bbacd81?w=600&h=400&fit=crop',
    date: '12 december 2026'
  },
  {
    id: 3,
    title: 'Nieuwkomers in de lijst van 2026',
    description: 'Deze nieuwe nummers maken hun debuut',
    image: 'https://images.unsplash.com/photo-1506157786151-b8491531f063?w=600&h=400&fit=crop',
    date: '10 december 2026'
  }
];

export function HomePage() {
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});
  const [yearsCount, setYearsCount] = useState<number>(26);
  const [songsCount, setSongsCount] = useState<number>(2000);

  // Countdown timer state
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  // Live Broadcast Simulator state
  const [isPlaying, setIsPlaying] = useState(true);
  const [songsList, setSongsList] = useState<any[]>([]);
  const [currentSong, setCurrentSong] = useState({
    title: 'Bohemian Rhapsody',
    artist: 'Queen',
    cover: 'https://i.scdn.co/image/ab67616d0000b273e319baafd16e84f0408af2a0'
  });

  // Calculate Christmas Countdown
  useEffect(() => {
    const targetDate = new Date('December 25, 2026 00:00:00').getTime();
    const interval = setInterval(() => {
      const now = new Date().getTime();
      const difference = targetDate - now;

      if (difference <= 0) {
        clearInterval(interval);
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      } else {
        const d = Math.floor(difference / (1000 * 60 * 60 * 24));
        const h = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const m = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const s = Math.floor((difference % (1000 * 60)) / 1000);
        setTimeLeft({ days: d, hours: h, minutes: m, seconds: s });
      }
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Load stats and database songs
  useEffect(() => {
    let isMounted = true;
    const loadStats = async () => {
      try {
        const [yearsRes, songsRes] = await Promise.all([
          fetchTop2000Years(),
          fetchSongs()
        ]);
        if (isMounted) {
          if (yearsRes.ok && yearsRes.data) {
            setYearsCount(yearsRes.data.length);
          }
          if (songsRes.ok && songsRes.data) {
            setSongsCount(songsRes.data.length);
            setSongsList(songsRes.data);

            // Set initial song for live simulation
            const validSongs = songsRes.data.filter(s => s.title);
            if (validSongs.length > 0) {
              const randomIdx = Math.floor(Math.random() * validSongs.length);
              const selected = validSongs[randomIdx];
              setCurrentSong({
                title: selected.title,
                artist: selected.artistName || selected.artist?.name || 'Onbekende artiest',
                cover: selected.imgUrl || selected.albumCover || 'https://images.unsplash.com/photo-1501612780327-45045538702b?w=400&h=400&fit=crop'
              });
            }
          }
        }
      } catch (err) {
        console.warn('Failed to load homepage stats from database, using mock defaults:', err);
      }
    };
    void loadStats();
    return () => {
      isMounted = false;
    };
  }, []);

  // Pick a random song to skip
  const handleSkipSong = () => {
    if (songsList.length === 0) return;
    const validSongs = songsList.filter(s => s.title);
    if (validSongs.length === 0) return;
    const randomIdx = Math.floor(Math.random() * validSongs.length);
    const selected = validSongs[randomIdx];
    setCurrentSong({
      title: selected.title,
      artist: selected.artistName || selected.artist?.name || 'Onbekende artiest',
      cover: selected.imgUrl || selected.albumCover || 'https://images.unsplash.com/photo-1501612780327-45045538702b?w=400&h=400&fit=crop'
    });
    // Brief rotate state reset for skip feel
    setIsPlaying(false);
    setTimeout(() => setIsPlaying(true), 120);
  };

  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }));
  };

  return (
    <div className="pb-12">
      {/* Carousel */}
      <Carousel />

      {/* Dynamic Event Dashboard (Countdown + Live Radio) */}
      <section className="relative -mt-6 md:-mt-8 z-20 text-foreground">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto bg-black/40 backdrop-blur-md border border-white/10 p-3 rounded-2xl shadow-xl flex flex-col md:flex-row items-center justify-between gap-4">
            
            {/* Live Radio Simulator (Mini Player) */}
            <div className="flex items-center gap-3 flex-grow min-w-0 w-full md:w-auto">
              <div className="relative flex-shrink-0">
                <div className={`w-11 h-11 rounded-full overflow-hidden shadow-md border border-zinc-950 transition-transform relative ${isPlaying ? 'animate-spin-slow' : ''}`}>
                  <img src={currentSong.cover} alt="Song cover" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 m-auto w-2.5 h-2.5 bg-zinc-950 rounded-full border border-white/20"></div>
                </div>
                {/* Micro live badge */}
                <span className="absolute -top-1 -left-1 bg-primary text-white text-[7px] font-extrabold px-1 rounded-sm uppercase tracking-wider scale-90">
                  Live
                </span>
              </div>

              <div className="min-w-0 flex-grow">
                <div className="flex items-center gap-1.5">
                  <span className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground">NPO Radio 2 Live</span>
                  <span className="text-[8px] font-bold text-primary bg-primary/10 px-1 rounded">Café</span>
                </div>
                <h4 className="text-xs font-bold text-white truncate leading-tight mt-0.5">{currentSong.title}</h4>
                <p className="text-muted-foreground text-[10px] truncate">{currentSong.artist}</p>
              </div>

              {/* Tiny Equalizer & Controls */}
              <div className="flex items-center gap-2.5 flex-shrink-0">
                {/* Equalizer */}
                <div className="flex items-end gap-0.5 h-2.5">
                  {[...Array(4)].map((_, i) => (
                    <span
                      key={i}
                      className="bg-primary/90 w-0.5 rounded-t transition-all"
                      style={isPlaying ? {
                        height: '100%',
                        animation: 'soundEqualizerBar 1.2s ease-in-out infinite alternate',
                        animationDelay: `${i * 0.15}s`
                      } : { height: '2px' }}
                    ></span>
                  ))}
                </div>

                <div className="flex items-center gap-1 border-l border-white/10 pl-2">
                  <button
                    onClick={() => setIsPlaying(!isPlaying)}
                    className="p-1 bg-white/5 hover:bg-primary text-white rounded-md transition-all cursor-pointer flex items-center justify-center"
                    title={isPlaying ? 'Pauze' : 'Speel'}
                  >
                    {isPlaying ? <Pause className="w-3 h-3 fill-current" /> : <Play className="w-3 h-3 fill-current" />}
                  </button>
                  <button
                    onClick={handleSkipSong}
                    className="p-1 text-muted-foreground hover:text-white transition-colors cursor-pointer flex items-center justify-center"
                    title="Volgend nummer"
                  >
                    <SkipForward className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>

            {/* Vertical Divider (only on md screens) */}
            <div className="hidden md:block h-8 w-px bg-white/15"></div>

            {/* Countdown Section */}
            <div className="flex items-center gap-3 flex-shrink-0 justify-between md:justify-end w-full md:w-auto">
              <div className="flex flex-col text-left">
                <span className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground">Aftellen</span>
                <span className="text-[10px] font-semibold text-white/95 leading-tight">Start Top 2000</span>
              </div>

              {/* Countdown Numbers */}
              <div className="flex items-center gap-1">
                <div className="bg-white/5 border border-white/5 py-1 px-2 rounded-lg text-center min-w-[36px]">
                  <div className="text-xs font-bold text-primary leading-tight">{timeLeft.days}</div>
                  <div className="text-[6px] text-muted-foreground uppercase tracking-widest font-semibold">d</div>
                </div>
                <div className="text-white/30 text-xs font-bold">:</div>
                <div className="bg-white/5 border border-white/5 py-1 px-2 rounded-lg text-center min-w-[36px]">
                  <div className="text-xs font-bold text-primary leading-tight">{timeLeft.hours}</div>
                  <div className="text-[6px] text-muted-foreground uppercase tracking-widest font-semibold">u</div>
                </div>
                <div className="text-white/30 text-xs font-bold">:</div>
                <div className="bg-white/5 border border-white/5 py-1 px-2 rounded-lg text-center min-w-[36px]">
                  <div className="text-xs font-bold text-primary leading-tight">{timeLeft.minutes}</div>
                  <div className="text-[6px] text-muted-foreground uppercase tracking-widest font-semibold">m</div>
                </div>
                <div className="text-white/30 text-xs font-bold">:</div>
                <div className="bg-white/5 border border-white/5 py-1 px-2 rounded-lg text-center min-w-[36px]">
                  <div className="text-xs font-bold text-primary animate-pulse leading-tight">{timeLeft.seconds}</div>
                  <div className="text-[6px] text-muted-foreground uppercase tracking-widest font-semibold">s</div>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Local embedded custom styles for animations */}
        <style>{`
          @keyframes spin-slow {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
          .animate-spin-slow {
            animation: spin-slow 22s linear infinite;
          }
          @keyframes soundEqualizerBar {
            0% { height: 15%; }
            100% { height: 100%; }
          }
        `}</style>
      </section>

      {/* Top 5 List */}
      <Top5List />

      <div className="container mx-auto px-4 mt-16">
        {/* Collapsible Sections */}
        <div className="max-w-4xl mx-auto space-y-3 mb-12">
          {/* Statistics Section */}
          <div className="bg-card border border-border overflow-hidden shadow-sm">
            <button
              onClick={() => toggleSection('stats')}
              className="w-full flex items-center justify-between p-5 hover:bg-secondary transition-colors"
            >
              <span className="font-semibold text-lg">Statistieken en weetjes</span>
              <ChevronDown
                className={`w-5 h-5 transition-transform ${expandedSections['stats'] ? 'rotate-180' : ''}`}
              />
            </button>
            {expandedSections['stats'] && (
              <div className="px-6 pb-6 space-y-3 text-muted-foreground">
                <p>• De Top 2000 bestaat sinds 1999</p>
                <p>• Meer dan 15.000 nummers zijn genomineerd door de jaren heen</p>
                <p>• Bohemian Rhapsody van Queen staat al meer dan 15 jaar op nummer 1</p>
                <p>• Jaarlijks stemmen meer dan 2 miljoen mensen</p>
              </div>
            )}
          </div>

          {/* Newsletter Section */}
          <div className="bg-card border border-border overflow-hidden shadow-sm">
            <button
              onClick={() => toggleSection('newsletter')}
              className="w-full flex items-center justify-between p-5 hover:bg-secondary transition-colors"
            >
              <span className="font-semibold text-lg">Blijf op de hoogte</span>
              <ChevronDown
                className={`w-5 h-5 transition-transform ${expandedSections['newsletter'] ? 'rotate-180' : ''}`}
              />
            </button>
            {expandedSections['newsletter'] && (
              <div className="px-6 pb-6">
                <p className="text-muted-foreground mb-4">
                  Ontvang updates over de Top 2000, stem-mogelijkheden en exclusieve content.
                </p>
                <div className="flex gap-2">
                  <input
                    type="email"
                    placeholder="Jouw e-mailadres"
                    className="flex-grow px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-input-background"
                  />
                  <button className="bg-primary text-primary-foreground px-6 py-2 rounded-lg hover:bg-primary/90 transition-colors">
                    Aanmelden
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Spotify Playlist Section */}
          <div className="bg-card border border-border overflow-hidden shadow-sm">
            <button
              onClick={() => toggleSection('spotify')}
              className="w-full flex items-center justify-between p-5 hover:bg-secondary transition-colors"
            >
              <span className="font-semibold text-lg">Luister de Top 2000 op Spotify</span>
              <ChevronDown
                className={`w-5 h-5 transition-transform ${expandedSections['spotify'] ? 'rotate-180' : ''}`}
              />
            </button>
            {expandedSections['spotify'] && (
              <div className="px-6 pb-6">
                <p className="text-muted-foreground mb-4">
                  De volledige Top 2000 is ook beschikbaar als Spotify playlist. Luister je favoriete nummers wanneer je maar wilt!
                </p>
                <a
                  href="#"
                  className="inline-flex items-center gap-2 text-primary hover:underline"
                >
                  Open Spotify playlist
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            )}
          </div>
        </div>

        {/* Articles Section */}
        <div className="max-w-6xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Verhalen achter de muziek</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {articleData.map(article => (
              <article
                key={article.id}
                className="bg-card border border-border/50 hover:border-primary/50 overflow-hidden hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 cursor-pointer rounded-2xl flex flex-col hover:-translate-y-1 group"
              >
                <div className="aspect-video overflow-hidden relative">
                  <img
                    src={article.image}
                    alt={article.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>
                <div className="p-6 flex flex-col flex-grow">
                  <div className="text-xs font-semibold text-primary uppercase tracking-wider mb-2">{article.date}</div>
                  <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors line-clamp-2 leading-snug">{article.title}</h3>
                  <p className="text-muted-foreground text-sm mb-6 flex-grow line-clamp-3 leading-relaxed">{article.description}</p>
                  <div className="flex items-center gap-1 text-primary font-bold text-sm tracking-wide group-hover:translate-x-1 transition-transform">
                    Lees het verhaal
                    <ChevronRight className="w-4 h-4" />
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Top 2000 in cijfers</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-primary text-white p-6 text-center">
              <div className="text-4xl font-bold mb-1">{yearsCount}</div>
              <div className="text-sm opacity-90">Jaren Top 2000</div>
            </div>
            <div className="bg-primary text-white p-6 text-center">
              <div className="text-4xl font-bold mb-1">{songsCount}</div>
              <div className="text-sm opacity-90">Nummers</div>
            </div>
            <div className="bg-primary text-white p-6 text-center">
              <div className="text-4xl font-bold mb-1">2M+</div>
              <div className="text-sm opacity-90">Stemmen</div>
            </div>
            <div className="bg-primary text-white p-6 text-center">
              <div className="text-4xl font-bold mb-1">7</div>
              <div className="text-sm opacity-90">Dagen</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
