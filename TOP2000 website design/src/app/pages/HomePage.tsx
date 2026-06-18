import { Carousel } from '../components/Carousel';
import { Top5List } from '../components/Top5List';
import { ChevronDown, ChevronRight, ExternalLink, SkipForward, Radio, BarChart3, Mail, Music, Calendar, ListMusic, Users, Clock } from 'lucide-react';
import { useState, useEffect } from 'react';
import { fetchTop2000Years, fetchSongs } from '../data/api';
import { PlayButton } from '../components/PlayButton';

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
    const targetDate = new Date('December 31, 2026 23:59:59').getTime();
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
          <div className="max-w-4xl mx-auto bg-black/45 backdrop-blur-md border border-white/10 p-4 rounded-2xl shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">

            {/* Live Radio Simulator (Mini Player) */}
            <div className="flex items-center gap-4 flex-grow min-w-0 w-full md:w-auto">
              <div className="relative flex-shrink-0">
                <div className={`w-14 h-14 rounded-full overflow-hidden shadow-md border border-zinc-950 transition-transform relative ${isPlaying ? 'animate-spin-slow' : ''}`}>
                  <img src={currentSong.cover} alt="Song cover" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 m-auto w-3 h-3 bg-zinc-950 rounded-full border border-white/20"></div>
                </div>
                {/* Live badge */}
                <span className="absolute -top-1 -left-1 bg-primary text-white text-[8px] font-extrabold px-1.5 py-0.5 rounded uppercase tracking-wider">
                  Live
                </span>
              </div>

              <div className="min-w-0 flex-grow">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">NPO Radio 2 Live</span>
                  <span className="text-[9px] font-bold text-primary bg-primary/10 px-1.5 py-0.5 rounded">Café</span>
                </div>
                <h4 className="text-sm font-bold text-white truncate mt-1 leading-snug">{currentSong.title}</h4>
                <p className="text-muted-foreground text-xs truncate mt-0.5">{currentSong.artist}</p>
              </div>

              {/* Equalizer & Controls */}
              <div className="flex items-center gap-3.5 flex-shrink-0">
                {/* Equalizer */}
                <div className="flex items-end gap-1 h-4">
                  {[...Array(4)].map((_, i) => (
                    <span
                      key={i}
                      className="bg-primary/95 w-1 rounded-t transition-all"
                      style={isPlaying ? {
                        height: '100%',
                        animation: 'soundEqualizerBar 1.2s ease-in-out infinite alternate',
                        animationDelay: `${i * 0.15}s`
                      } : { height: '2px' }}
                    ></span>
                  ))}
                </div>

                <div className="flex items-center gap-1.5 border-l border-white/10 pl-3.5">
                  {/* Spotify play button – opens the real Spotify modal */}
                  <PlayButton title={currentSong.title} artist={currentSong.artist} variant="icon" />
                  <button
                    onClick={handleSkipSong}
                    className="p-1.5 text-muted-foreground hover:text-white transition-colors cursor-pointer flex items-center justify-center"
                    title="Volgend nummer"
                  >
                    <SkipForward className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Vertical Divider (only on md screens) */}
            <div className="hidden md:block h-10 w-px bg-white/15"></div>

            {/* Countdown Section */}
            <div className="flex items-center gap-4 flex-shrink-0 justify-between md:justify-end w-full md:w-auto">
              <div className="flex flex-col text-left">
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Aftellen</span>
                <span className="text-xs font-semibold text-white/95 leading-tight">Start Top 2000</span>
              </div>

              {/* Countdown Numbers */}
              <div className="flex items-center gap-1.5">
                <div className="bg-white/5 border border-white/5 py-1.5 px-2.5 rounded-xl text-center min-w-[42px]">
                  <div className="text-sm font-extrabold text-primary leading-tight">{timeLeft.days}</div>
                  <div className="text-[8px] text-muted-foreground uppercase tracking-wider font-semibold">d</div>
                </div>
                <div className="text-white/30 text-sm font-bold">:</div>
                <div className="bg-white/5 border border-white/5 py-1.5 px-2.5 rounded-xl text-center min-w-[42px]">
                  <div className="text-sm font-extrabold text-primary leading-tight">{timeLeft.hours}</div>
                  <div className="text-[8px] text-muted-foreground uppercase tracking-wider font-semibold">u</div>
                </div>
                <div className="text-white/30 text-sm font-bold">:</div>
                <div className="bg-white/5 border border-white/5 py-1.5 px-2.5 rounded-xl text-center min-w-[42px]">
                  <div className="text-sm font-extrabold text-primary leading-tight">{timeLeft.minutes}</div>
                  <div className="text-[8px] text-muted-foreground uppercase tracking-wider font-semibold">m</div>
                </div>
                <div className="text-white/30 text-sm font-bold">:</div>
                <div className="bg-white/5 border border-white/5 py-1.5 px-2.5 rounded-xl text-center min-w-[42px]">
                  <div className="text-sm font-extrabold text-primary animate-pulse leading-tight">{timeLeft.seconds}</div>
                  <div className="text-[8px] text-muted-foreground uppercase tracking-wider font-semibold">s</div>
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
        <div className="max-w-4xl mx-auto space-y-4 mb-12">
          {/* Statistics Section */}
          <div className="bg-card/25 backdrop-blur-md border border-white/10 hover:border-primary/20 rounded-2xl overflow-hidden shadow-lg transition-all duration-300 hover:shadow-primary/5 hover:bg-white/5">
            <button
              onClick={() => toggleSection('stats')}
              className="w-full flex items-center justify-between p-5 hover:bg-white/5 transition-all text-left group cursor-pointer"
            >
              <div className="flex items-center gap-4">
                <div className="p-2.5 bg-primary/10 rounded-xl border border-primary/20 text-primary group-hover:bg-primary group-hover:text-white transition-all">
                  <BarChart3 className="w-5 h-5" />
                </div>
                <div>
                  <span className="font-bold text-lg text-white transition-colors">Statistieken en weetjes</span>
                  <p className="text-xs text-muted-foreground mt-0.5">Leuke feiten en cijfers over de catalogus</p>
                </div>
              </div>
              <ChevronDown
                className={`w-5 h-5 text-muted-foreground group-hover:text-white transition-transform duration-300 ${expandedSections['stats'] ? 'rotate-180 text-primary' : ''}`}
              />
            </button>
            {expandedSections['stats'] && (
              <div className="px-6 pb-6 pt-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-start gap-3 p-3.5 bg-white/5 border border-white/5 rounded-xl">
                  <div className="w-2 h-2 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    De Top 2000 bestaat sinds <strong>1999</strong> en is uitgegroeid tot een nationale traditie.
                  </p>
                </div>
                <div className="flex items-start gap-3 p-3.5 bg-white/5 border border-white/5 rounded-xl">
                  <div className="w-2 h-2 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Meer dan <strong>15.000 unieke nummers</strong> zijn genomineerd door de jaren heen.
                  </p>
                </div>
                <div className="flex items-start gap-3 p-3.5 bg-white/5 border border-white/5 rounded-xl">
                  <div className="w-2 h-2 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    <strong>Bohemian Rhapsody</strong> van Queen staat al meer dan 15 jaar op nummer 1.
                  </p>
                </div>
                <div className="flex items-start gap-3 p-3.5 bg-white/5 border border-white/5 rounded-xl">
                  <div className="w-2 h-2 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Jaarlijks brengen meer dan <strong>2 miljoen mensen</strong> hun stemmen uit.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Newsletter Section */}
          <div className="bg-card/25 backdrop-blur-md border border-white/10 hover:border-primary/20 rounded-2xl overflow-hidden shadow-lg transition-all duration-300 hover:shadow-primary/5 hover:bg-white/5">
            <button
              onClick={() => toggleSection('newsletter')}
              className="w-full flex items-center justify-between p-5 hover:bg-white/5 transition-all text-left group cursor-pointer"
            >
              <div className="flex items-center gap-4">
                <div className="p-2.5 bg-primary/10 rounded-xl border border-primary/20 text-primary group-hover:bg-primary group-hover:text-white transition-all">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <span className="font-bold text-lg text-white transition-colors">Blijf op de hoogte</span>
                  <p className="text-xs text-muted-foreground mt-0.5">Ontvang updates over stemmaanden en nieuws</p>
                </div>
              </div>
              <ChevronDown
                className={`w-5 h-5 text-muted-foreground group-hover:text-white transition-transform duration-300 ${expandedSections['newsletter'] ? 'rotate-180 text-primary' : ''}`}
              />
            </button>
            {expandedSections['newsletter'] && (
              <div className="px-6 pb-6 pt-2">
                <p className="text-sm text-muted-foreground mb-4">
                  Meld je aan voor onze nieuwsbrief en ontvang updates over de start van de stemmaand, evenementen en exclusieve Top 2000 content.
                </p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <input
                    type="email"
                    placeholder="Jouw e-mailadres"
                    className="flex-grow pl-4 pr-4 py-3 border border-white/10 rounded-xl focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary bg-white/5 text-white placeholder:text-muted-foreground/60 transition-all text-sm"
                  />
                  <button className="bg-primary hover:bg-primary/90 text-white font-bold px-6 py-3 rounded-xl transition-all shadow-md shadow-primary/20 hover:shadow-lg hover:shadow-primary/30 hover:scale-[1.02] active:scale-[0.98] text-sm cursor-pointer whitespace-nowrap">
                    Aanmelden
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Spotify Playlist Section */}
          <div className="bg-card/25 backdrop-blur-md border border-white/10 hover:border-primary/20 rounded-2xl overflow-hidden shadow-lg transition-all duration-300 hover:shadow-primary/5 hover:bg-white/5">
            <button
              onClick={() => toggleSection('spotify')}
              className="w-full flex items-center justify-between p-5 hover:bg-white/5 transition-all text-left group cursor-pointer"
            >
              <div className="flex items-center gap-4">
                <div className="p-2.5 bg-primary/10 rounded-xl border border-primary/20 text-primary group-hover:bg-primary group-hover:text-white transition-all">
                  <Music className="w-5 h-5" />
                </div>
                <div>
                  <span className="font-bold text-lg text-white transition-colors">Luister de Top 2000 op Spotify</span>
                  <p className="text-xs text-muted-foreground mt-0.5">Volg direct de officiële playlist</p>
                </div>
              </div>
              <ChevronDown
                className={`w-5 h-5 text-muted-foreground group-hover:text-white transition-transform duration-300 ${expandedSections['spotify'] ? 'rotate-180 text-primary' : ''}`}
              />
            </button>
            {expandedSections['spotify'] && (
              <div className="px-6 pb-6 pt-2">
                <p className="text-sm text-muted-foreground mb-4">
                  De volledige Top 2000 catalogus is ook direct beschikbaar als een complete Spotify-afspeellijst. Luister naar al je favoriete klassiekers waar en wanneer je maar wilt!
                </p>
                <a
                  href="https://open.spotify.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-between w-full p-4 bg-emerald-500/10 border border-emerald-500/20 hover:bg-emerald-500/20 text-emerald-400 rounded-xl group transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-emerald-500/20 text-emerald-400 rounded-lg group-hover:scale-105 transition-transform">
                      <Music className="w-5 h-5 fill-current" />
                    </div>
                    <div>
                      <span className="font-bold text-sm block">NPO Radio 2 Top 2000 Playlist</span>
                      <span className="text-xs text-emerald-400/70">Open direct in de Spotify-app of browser</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider bg-emerald-500/20 px-3 py-1.5 rounded-lg border border-emerald-500/10 group-hover:bg-emerald-500 group-hover:text-white transition-all">
                    Luister Nu
                    <ExternalLink className="w-3.5 h-3.5" />
                  </div>
                </a>
              </div>
            )}
          </div>
        </div>

        {/* Articles Section */}
        <div className="max-w-6xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-extrabold mb-8 tracking-tight relative pl-4 border-l-4 border-primary">Verhalen achter de muziek</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {articleData.map(article => (
              <article
                key={article.id}
                className="bg-card/25 backdrop-blur-md border border-white/10 hover:border-primary/30 overflow-hidden hover:shadow-2xl hover:shadow-primary/5 transition-all duration-300 cursor-pointer rounded-2xl flex flex-col hover:-translate-y-1.5 group"
              >
                <div className="aspect-video overflow-hidden relative">
                  <img
                    src={article.image}
                    alt={article.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  {/* Floating Date Badge */}
                  <span className="absolute top-3 left-3 bg-black/60 backdrop-blur-md border border-white/10 text-white text-[10px] font-bold px-2.5 py-1 rounded-lg uppercase tracking-wider shadow-md z-10">
                    {article.date}
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent opacity-80 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>
                <div className="p-6 flex flex-col flex-grow">
                  <h3 className="text-lg font-black text-white group-hover:text-primary transition-colors leading-snug line-clamp-2 mb-2">{article.title}</h3>
                  <p className="text-muted-foreground/80 text-sm mb-6 flex-grow line-clamp-3 leading-relaxed">{article.description}</p>
                  <div className="flex items-center gap-1.5 text-primary font-bold text-xs uppercase tracking-wider group-hover:translate-x-1.5 transition-transform duration-200">
                    Lees het verhaal
                    <ChevronRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-extrabold mb-8 tracking-tight relative pl-4 border-l-4 border-primary">Top 2000 in cijfers</h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">

            {/* Stat 1 */}
            <div className="bg-card/25 backdrop-blur-md border border-white/10 hover:border-primary/20 rounded-2xl p-6 text-center shadow-lg transition-all duration-300 hover:scale-[1.03] hover:shadow-primary/5 hover:bg-white/5 flex flex-col items-center justify-center relative overflow-hidden group">
              <div className="p-3 bg-primary/10 rounded-2xl border border-primary/20 text-primary mb-4 group-hover:bg-primary group-hover:text-white transition-all duration-300">
                <Calendar className="w-6 h-6" />
              </div>
              <div className="text-4xl font-black mb-1 bg-clip-text bg-gradient-to-r from-white via-white to-primary/80 tracking-tight">
                {yearsCount}
              </div>
              <div className="text-xs text-muted-foreground font-bold uppercase tracking-wider">
                Edities
              </div>
            </div>

            {/* Stat 2 */}
            <div className="bg-card/25 backdrop-blur-md border border-white/10 hover:border-primary/20 rounded-2xl p-6 text-center shadow-lg transition-all duration-300 hover:scale-[1.03] hover:shadow-primary/5 hover:bg-white/5 flex flex-col items-center justify-center relative overflow-hidden group">
              <div className="p-3 bg-primary/10 rounded-2xl border border-primary/20 text-primary mb-4 group-hover:bg-primary group-hover:text-white transition-all duration-300">
                <ListMusic className="w-6 h-6" />
              </div>
              <div className="text-4xl font-black mb-1  bg-clip-text bg-gradient-to-r from-white via-white to-primary/80 tracking-tight">
                {songsCount}
              </div>
              <div className="text-xs text-muted-foreground font-bold uppercase tracking-wider">
                Nummers
              </div>
            </div>

            {/* Stat 3 */}
            <div className="bg-card/25 backdrop-blur-md border border-white/10 hover:border-primary/20 rounded-2xl p-6 text-center shadow-lg transition-all duration-300 hover:scale-[1.03] hover:shadow-primary/5 hover:bg-white/5 flex flex-col items-center justify-center relative overflow-hidden group">
              <div className="p-3 bg-primary/10 rounded-2xl border border-primary/20 text-primary mb-4 group-hover:bg-primary group-hover:text-white transition-all duration-300">
                <Users className="w-6 h-6" />
              </div>
              <div className="text-4xl font-black mb-1 bg-clip-text bg-gradient-to-r from-white via-white to-primary/80 tracking-tight">
                2M+
              </div>
              <div className="text-xs text-muted-foreground font-bold uppercase tracking-wider">
                Stemmen
              </div>
            </div>

            {/* Stat 4 */}
            <div className="bg-card/25 backdrop-blur-md border border-white/10 hover:border-primary/20 rounded-2xl p-6 text-center shadow-lg transition-all duration-300 hover:scale-[1.03] hover:shadow-primary/5 hover:bg-white/5 flex flex-col items-center justify-center relative overflow-hidden group">
              <div className="p-3 bg-primary/10 rounded-2xl border border-primary/20 text-primary mb-4 group-hover:bg-primary group-hover:text-white transition-all duration-300">
                <Clock className="w-6 h-6" />
              </div>
              <div className="text-4xl font-black mb-1 bg-clip-text bg-gradient-to-r from-white via-white to-primary/80 tracking-tight">
                7
              </div>
              <div className="text-xs text-muted-foreground font-bold uppercase tracking-wider">
                Dagen Live
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
