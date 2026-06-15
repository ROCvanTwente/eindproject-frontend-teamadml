import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Music,
  Users,
  BarChart3,
  List,
  TrendingUp,
  Star,
  Calendar,
  ArrowRight,
  Trophy,
  Mic2,
  Radio,
  Headphones,
  History,
  Newspaper,
  HelpCircle,
  Mail,
  ListMusic,
  Loader2,
} from 'lucide-react';
import {
  loadArtistsCatalog,
  loadSongsCatalog,
  fetchTop2000Years,
  fetchTop2000ByYear,
  type BackendArtist,
  type BackendSong,
  type BackendTop2000Entry,
} from '../data/api';

// ─── Types ───────────────────────────────────────────────────────────────────
interface StatCard {
  label: string;
  value: string | number;
  sub?: string;
  icon: React.ReactNode;
  color: string;
}

interface QuickLink {
  label: string;
  description: string;
  to: string;
  icon: React.ReactNode;
  color: string;
}

// ─── Quick Links data ─────────────────────────────────────────────────────────
const quickLinks: QuickLink[] = [
  {
    label: 'De Lijst',
    description: 'Bekijk de complete Top 2000',
    to: '/lijst',
    icon: <List className="w-6 h-6" />,
    color: 'from-red-500/20 to-rose-600/10 border-red-500/30 hover:border-red-400/60',
  },
  {
    label: 'Artiesten',
    description: 'Ontdek alle artiesten',
    to: '/artiesten',
    icon: <Users className="w-6 h-6" />,
    color: 'from-orange-500/20 to-amber-600/10 border-orange-500/30 hover:border-orange-400/60',
  },
  {
    label: 'Nummers',
    description: 'Doorzoek alle nummers',
    to: '/nummers',
    icon: <Music className="w-6 h-6" />,
    color: 'from-yellow-500/20 to-yellow-600/10 border-yellow-500/30 hover:border-yellow-400/60',
  },
  {
    label: 'Statistieken',
    description: 'Stijgers, dalers & meer',
    to: '/statistieken',
    icon: <BarChart3 className="w-6 h-6" />,
    color: 'from-emerald-500/20 to-green-600/10 border-emerald-500/30 hover:border-emerald-400/60',
  },
  {
    label: 'Geschiedenis',
    description: 'De geschiedenis van de Top 2000',
    to: '/geschiedenis',
    icon: <History className="w-6 h-6" />,
    color: 'from-cyan-500/20 to-sky-600/10 border-cyan-500/30 hover:border-cyan-400/60',
  },
  {
    label: 'Nieuws',
    description: 'Laatste nieuws & updates',
    to: '/nieuws',
    icon: <Newspaper className="w-6 h-6" />,
    color: 'from-violet-500/20 to-purple-600/10 border-violet-500/30 hover:border-violet-400/60',
  },
  {
    label: 'Playlists',
    description: 'Maak je eigen playlist',
    to: '/playlists',
    icon: <ListMusic className="w-6 h-6" />,
    color: 'from-pink-500/20 to-rose-600/10 border-pink-500/30 hover:border-pink-400/60',
  },
  {
    label: 'FAQ',
    description: 'Veelgestelde vragen',
    to: '/faq',
    icon: <HelpCircle className="w-6 h-6" />,
    color: 'from-slate-500/20 to-slate-600/10 border-slate-500/30 hover:border-slate-400/60',
  },
  {
    label: 'Contact',
    description: 'Neem contact op',
    to: '/contact',
    icon: <Mail className="w-6 h-6" />,
    color: 'from-teal-500/20 to-teal-600/10 border-teal-500/30 hover:border-teal-400/60',
  },
];

// ─── Component ────────────────────────────────────────────────────────────────
export function OverviewPage() {
  const [artists, setArtists] = useState<BackendArtist[]>([]);
  const [songs, setSongs] = useState<BackendSong[]>([]);
  const [years, setYears] = useState<number[]>([]);
  const [latestEntries, setLatestEntries] = useState<BackendTop2000Entry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const load = async () => {
      setLoading(true);

      const [artistsRes, songsRes, yearsRes] = await Promise.all([
        loadArtistsCatalog(),
        loadSongsCatalog(),
        fetchTop2000Years(),
      ]);

      if (!isMounted) return;

      const loadedArtists = artistsRes.data;
      const loadedSongs = songsRes.data;
      const loadedYears = yearsRes.ok && Array.isArray(yearsRes.data) ? (yearsRes.data as number[]).sort((a, b) => b - a) : [];

      setArtists(loadedArtists);
      setSongs(loadedSongs);
      setYears(loadedYears);

      // Load top 10 of the latest year
      if (loadedYears.length > 0) {
        const latestYear = loadedYears[0];
        const listRes = await fetchTop2000ByYear(latestYear);
        if (isMounted && listRes.ok && Array.isArray(listRes.data)) {
          const sorted = [...listRes.data].sort((a, b) => a.position - b.position).slice(0, 10);
          setLatestEntries(sorted);
        }
      }

      if (isMounted) setLoading(false);
    };

    void load();
    return () => { isMounted = false; };
  }, []);

  // ── Derived stats ──────────────────────────────────────────────────────────
  const latestYear = years[0] ?? '–';
  const earliestYear = years[years.length - 1] ?? '–';

  // Top 5 artists by song count
  const artistSongCount: Record<number, { artist: BackendArtist; count: number }> = {};
  songs.forEach(song => {
    if (song.artistId) {
      if (!artistSongCount[song.artistId]) {
        const artist = artists.find(a => a.artistId === song.artistId);
        if (artist) artistSongCount[song.artistId] = { artist, count: 0 };
      }
      if (artistSongCount[song.artistId]) {
        artistSongCount[song.artistId].count += 1;
      }
    }
  });

  const topArtists = Object.values(artistSongCount)
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  const statCards: StatCard[] = [
    {
      label: 'Nummers',
      value: loading ? '…' : songs.length.toLocaleString('nl-NL'),
      sub: 'In de database',
      icon: <Music className="w-6 h-6" />,
      color: 'from-red-500/30 to-rose-600/10 border-red-500/40',
    },
    {
      label: 'Artiesten',
      value: loading ? '…' : artists.length.toLocaleString('nl-NL'),
      sub: 'Unieke artiesten',
      icon: <Users className="w-6 h-6" />,
      color: 'from-orange-500/30 to-amber-600/10 border-orange-500/40',
    },
    {
      label: 'Edities',
      value: loading ? '…' : years.length,
      sub: `${earliestYear} – ${latestYear}`,
      icon: <Calendar className="w-6 h-6" />,
      color: 'from-emerald-500/30 to-green-600/10 border-emerald-500/40',
    },
    {
      label: 'Laatste editie',
      value: loading ? '…' : latestYear,
      sub: `${latestEntries.length} top nummers geladen`,
      icon: <Trophy className="w-6 h-6" />,
      color: 'from-yellow-500/30 to-yellow-600/10 border-yellow-500/40',
    },
  ];

  return (
    <div className="pb-16">
      {/* ── Page Header ────────────────────────────────────────────────────── */}
      <section className="py-10">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-primary/20 border border-primary/30">
              <Radio className="w-6 h-6 text-primary" />
            </div>
            <span className="text-sm font-semibold text-primary uppercase tracking-widest">Dashboard</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-3">Overzicht</h1>
          <p className="text-muted-foreground text-lg max-w-xl">
            Alles over de Top 2000 in één oogopslag — statistieken, topnummers en snelle links.
          </p>
        </div>
      </section>

      <div className="container mx-auto px-4 space-y-12">

        {/* ── Stat Cards ──────────────────────────────────────────────────── */}
        <section>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {statCards.map((card) => (
              <div
                key={card.label}
                className={`relative overflow-hidden rounded-2xl border bg-gradient-to-br ${card.color} p-6 backdrop-blur-sm`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="p-2 rounded-lg bg-white/10 text-white">
                    {card.icon}
                  </div>
                </div>
                <div className="text-3xl font-bold text-white mb-1">
                  {card.value}
                </div>
                <div className="text-sm font-semibold text-white/80">{card.label}</div>
                {card.sub && (
                  <div className="text-xs text-white/50 mt-1">{card.sub}</div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* ── Top 10 + Top Artiesten ──────────────────────────────────────── */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-8">

          {/* Top 10 latest year */}
          <div className="bg-card border border-border rounded-2xl overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-border">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-yellow-500/20 border border-yellow-500/30">
                  <Trophy className="w-5 h-5 text-yellow-400" />
                </div>
                <div>
                  <h2 className="text-lg font-bold">Top 10 van {latestYear}</h2>
                  <p className="text-xs text-muted-foreground">Beste nummers van het jaar</p>
                </div>
              </div>
              <Link
                to="/lijst"
                className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
              >
                Volledige lijst <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            <div className="divide-y divide-border">
              {loading ? (
                <div className="flex items-center justify-center gap-3 py-12 text-muted-foreground">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Laden…
                </div>
              ) : latestEntries.length === 0 ? (
                <div className="py-12 text-center text-muted-foreground text-sm">
                  Geen data beschikbaar
                </div>
              ) : (
                latestEntries.map((entry, idx) => (
                  <Link
                    key={entry.songId}
                    to={`/nummer/${entry.songId}`}
                    className="flex items-center gap-4 px-6 py-3 hover:bg-muted/50 transition-colors group"
                  >
                    {/* Position badge */}
                    <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold
                      ${idx === 0 ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/40' :
                        idx === 1 ? 'bg-slate-400/20 text-slate-300 border border-slate-400/40' :
                        idx === 2 ? 'bg-orange-700/20 text-orange-400 border border-orange-700/40' :
                        'bg-muted text-muted-foreground'}`}
                    >
                      {entry.position}
                    </div>

                    {/* Album cover */}
                    {entry.song?.imgUrl || entry.song?.albumCover ? (
                      <img
                        src={entry.song.imgUrl ?? entry.song.albumCover}
                        alt={entry.song.title}
                        className="w-9 h-9 rounded object-cover flex-shrink-0"
                      />
                    ) : (
                      <div className="w-9 h-9 rounded bg-muted flex items-center justify-center flex-shrink-0">
                        <Music className="w-4 h-4 text-muted-foreground" />
                      </div>
                    )}

                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-sm truncate group-hover:text-primary transition-colors">
                        {entry.song?.title ?? 'Onbekend'}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {entry.song?.artistName ?? entry.song?.artist?.name ?? '–'}
                      </p>
                    </div>

                    {idx === 0 && (
                      <Star className="w-4 h-4 text-yellow-400 flex-shrink-0" />
                    )}
                  </Link>
                ))
              )}
            </div>
          </div>

          {/* Top Artiesten */}
          <div className="bg-card border border-border rounded-2xl overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-border">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-orange-500/20 border border-orange-500/30">
                  <Mic2 className="w-5 h-5 text-orange-400" />
                </div>
                <div>
                  <h2 className="text-lg font-bold">Top artiesten</h2>
                  <p className="text-xs text-muted-foreground">Meeste nummers in de database</p>
                </div>
              </div>
              <Link
                to="/artiesten"
                className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
              >
                Alle artiesten <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            <div className="p-6 space-y-4">
              {loading ? (
                <div className="flex items-center justify-center gap-3 py-8 text-muted-foreground">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Laden…
                </div>
              ) : topArtists.length === 0 ? (
                <div className="py-8 text-center text-muted-foreground text-sm">
                  Geen data beschikbaar
                </div>
              ) : (
                topArtists.map(({ artist, count }, idx) => {
                  const maxCount = topArtists[0]?.count ?? 1;
                  const pct = Math.round((count / maxCount) * 100);
                  return (
                    <Link
                      key={artist.artistId}
                      to={`/artiest/${artist.artistId}`}
                      className="flex items-center gap-4 group"
                    >
                      {/* Rank */}
                      <div className="w-6 text-center text-sm font-bold text-muted-foreground flex-shrink-0">
                        {idx + 1}
                      </div>

                      {/* Photo */}
                      {artist.photoUrl || artist.photo ? (
                        <img
                          src={artist.photoUrl ?? artist.photo}
                          alt={artist.name}
                          className="w-11 h-11 rounded-full object-cover flex-shrink-0 border-2 border-border group-hover:border-primary transition-colors"
                        />
                      ) : (
                        <div className="w-11 h-11 rounded-full bg-muted flex items-center justify-center flex-shrink-0 border-2 border-border">
                          <Users className="w-5 h-5 text-muted-foreground" />
                        </div>
                      )}

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-semibold text-sm truncate group-hover:text-primary transition-colors">
                            {artist.name}
                          </span>
                          <span className="text-xs text-muted-foreground flex-shrink-0 ml-2">
                            {count} nummers
                          </span>
                        </div>
                        {/* Progress bar */}
                        <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-primary to-rose-400 transition-all duration-700"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    </Link>
                  );
                })
              )}
            </div>

            {/* Extra stats */}
            <div className="border-t border-border p-6 grid grid-cols-2 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">
                  {loading ? '…' : years.length}
                </div>
                <div className="text-xs text-muted-foreground mt-1">Edities</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-400">
                  {loading ? '…' : `${earliestYear}`}
                </div>
                <div className="text-xs text-muted-foreground mt-1">Eerste editie</div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Jaren tijdlijn ──────────────────────────────────────────────── */}
        {!loading && years.length > 0 && (
          <section className="bg-card border border-border rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-5">
              <div className="p-2 rounded-lg bg-cyan-500/20 border border-cyan-500/30">
                <TrendingUp className="w-5 h-5 text-cyan-400" />
              </div>
              <div>
                <h2 className="text-lg font-bold">Alle edities</h2>
                <p className="text-xs text-muted-foreground">Klik op een jaar om de lijst te bekijken</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {years.map(year => (
                <Link
                  key={year}
                  to={`/lijst?jaar=${year}`}
                  className={`px-3 py-1.5 rounded-lg text-sm font-semibold border transition-all
                    ${year === latestYear
                      ? 'bg-primary/20 border-primary/50 text-primary hover:bg-primary/30'
                      : 'bg-muted/50 border-border text-muted-foreground hover:bg-muted hover:text-foreground hover:border-primary/40'
                    }`}
                >
                  {year}
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* ── Snelle links ────────────────────────────────────────────────── */}
        <section>
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-lg bg-violet-500/20 border border-violet-500/30">
              <Headphones className="w-5 h-5 text-violet-400" />
            </div>
            <div>
              <h2 className="text-lg font-bold">Snelle links</h2>
              <p className="text-xs text-muted-foreground">Navigeer snel naar elke sectie</p>
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-3 gap-4 max-w-3xl">
            {quickLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`group relative flex flex-col gap-3 p-5 rounded-2xl border bg-gradient-to-br ${link.color} transition-all duration-200 hover:scale-[1.02] hover:shadow-lg`}
              >
                <div className="text-white/80 group-hover:text-white transition-colors">
                  {link.icon}
                </div>
                <div>
                  <div className="font-bold text-white text-sm">{link.label}</div>
                  <div className="text-xs text-white/50 mt-0.5">{link.description}</div>
                </div>
                <ArrowRight className="absolute bottom-4 right-4 w-4 h-4 text-white/30 group-hover:text-white/70 group-hover:translate-x-0.5 transition-all" />
              </Link>
            ))}
          </div>
        </section>

      </div>
    </div>
  );
}
