import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Search,
  ChevronDown,
  Play,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  Music,
  Users,
  Calendar,
  Trophy,
  Star,
  Loader2,
  BarChart3,
  ArrowRight,
  Mic2,
} from 'lucide-react';
import {
  fetchTop2000Years,
  loadTop2000ByYear,
  loadArtistsCatalog,
  loadSongsCatalog,
  type BackendTop2000Entry,
  type BackendArtist,
  type BackendSong,
} from '../data/api';
import { PlayButton } from '../components/PlayButton';

export function ListPage() {
  // ── Lijst state ────────────────────────────────────────────────────────────
  const [selectedYear, setSelectedYear] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [positionFilter, setPositionFilter] = useState('top10');
  const [visibleCount, setVisibleCount] = useState(10);
  const [years, setYears] = useState<string[]>([]);
  const [entries, setEntries] = useState<BackendTop2000Entry[]>([]);
  const [previousEntriesMap, setPreviousEntriesMap] = useState<Map<number, number>>(new Map());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [fallbackNotice, setFallbackNotice] = useState('');
  const [sentinel, setSentinel] = useState<HTMLDivElement | null>(null);

  // ── Overview state ─────────────────────────────────────────────────────────
  const [artists, setArtists] = useState<BackendArtist[]>([]);
  const [songs, setSongs] = useState<BackendSong[]>([]);
  const [top10, setTop10] = useState<BackendTop2000Entry[]>([]);
  const [overviewLoading, setOverviewLoading] = useState(true);

  // ── Fetch years + overview data ────────────────────────────────────────────
  useEffect(() => {
    let isMounted = true;

    const loadInitial = async () => {
      try {
        const yearsRes = await fetchTop2000Years();
        if (!yearsRes.ok || !yearsRes.data || yearsRes.data.length === 0) return;

        const sorted = [...yearsRes.data].sort((a, b) => b - a);
        const displayYears = sorted.map(String);

        if (!displayYears.includes('2026')) displayYears.unshift('2026');
        if (!displayYears.includes('2025')) displayYears.unshift('2025');

        if (isMounted) {
          setYears(displayYears);
          const latestDb = Math.max(...yearsRes.data);
          setSelectedYear(latestDb.toString());
        }

        setOverviewLoading(true);
        const [artistsRes, songsRes, top10Res] = await Promise.all([
          loadArtistsCatalog(),
          loadSongsCatalog(),
          loadTop2000ByYear(Math.max(...yearsRes.data)),
        ]);

        if (isMounted) {
          if (artistsRes.ok) setArtists(artistsRes.data);
          if (songsRes.ok) setSongs(songsRes.data);
          if (top10Res.ok) setTop10(top10Res.data.slice(0, 10));
          setOverviewLoading(false);
        }
      } catch (err) {
        console.error('Failed to load initial overview details:', err);
        if (isMounted) setOverviewLoading(false);
      }
    };

    void loadInitial();
    return () => { isMounted = false; };
  }, []);

  // ── Fetch entries for selected list year ───────────────────────────────────
  useEffect(() => {
    if (!selectedYear) return;
    let isMounted = true;

    const loadEntries = async () => {
      setLoading(true);
      setError('');
      try {
        const yearInt = parseInt(selectedYear, 10);
        const yearsResult = await fetchTop2000Years();
        let dbLatestYear = 2024;
        if (yearsResult.ok && yearsResult.data && yearsResult.data.length > 0) {
          dbLatestYear = Math.max(...yearsResult.data);
        }

        let queryYear = yearInt;
        let showNotice = '';

        if (yearInt > dbLatestYear) {
          queryYear = dbLatestYear;
          showNotice = `Editie ${selectedYear} is nog niet gestart. We tonen de meest recente lijst van ${dbLatestYear}.`;
        }

        const [currentRes, prevRes] = await Promise.all([
          loadTop2000ByYear(queryYear),
          loadTop2000ByYear(queryYear - 1),
        ]);

        if (!currentRes.ok) {
          throw new Error(currentRes.message || 'Kon de muzieklijst niet ophalen.');
        }

        const prevMap = new Map<number, number>();
        if (prevRes.ok && prevRes.data) {
          prevRes.data.forEach(entry => {
            prevMap.set(entry.songId, entry.position);
          });
        }

        if (isMounted) {
          setEntries(currentRes.data);
          setPreviousEntriesMap(prevMap);
          setFallbackNotice(showNotice);
          setLoading(false);
        }
      } catch (err: any) {
        if (isMounted) {
          setError(err.message || 'Fout bij het laden van data.');
          setLoading(false);
        }
      }
    };

    void loadEntries();
    return () => { isMounted = false; };
  }, [selectedYear]);

  // Start with 30 visible items and load more on scroll/filter change
  useEffect(() => {
    setVisibleCount(30);
  }, [positionFilter, searchTerm, selectedYear]);

  // ── Derived: filtered list (optimized with useMemo to avoid lag) ───────────
  const filteredSongs = useMemo(() => {
    return entries
      .map(entry => {
        const prevPos = previousEntriesMap.get(entry.songId);
        let change: number | 'new' | 0 = 0;
        if (prevPos === undefined) change = 'new';
        else change = prevPos - entry.position;
        return {
          position: entry.position,
          title: entry.song.title,
          artist: entry.song.artistName || entry.song.artist?.name || 'Onbekende artiest',
          year: entry.song.releaseYear || 0,
          change,
        };
      })
      .filter(song => {
        const matchesSearch =
          song.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          song.artist.toLowerCase().includes(searchTerm.toLowerCase());
        if (!matchesSearch) return false;
        if (positionFilter === 'top10') return song.position <= 10;
        if (positionFilter === 'top50') return song.position <= 50;
        if (positionFilter === 'top100') return song.position <= 100;
        if (positionFilter === 'top500') return song.position <= 500;
        if (positionFilter === 'top2000') return song.position <= 2000;
        return true;
      });
  }, [entries, searchTerm, positionFilter, previousEntriesMap]);

  // Intersection Observer for Infinite Scroll
  useEffect(() => {
    if (!sentinel) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setVisibleCount(prev => Math.min(prev + 30, filteredSongs.length));
        }
      },
      { threshold: 0.1, rootMargin: '200px' }
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [sentinel, filteredSongs.length]);

  // ── Derived: top artists ───────────────────────────────────────────────────
  const artistSongCount: Record<number, { artist: BackendArtist; count: number }> = {};
  songs.forEach(song => {
    if (!song.artistId) return;
    if (!artistSongCount[song.artistId]) {
      const artist = artists.find(a => a.artistId === song.artistId);
      if (artist) artistSongCount[song.artistId] = { artist, count: 0 };
    }
    if (artistSongCount[song.artistId]) artistSongCount[song.artistId].count += 1;
  });
  const topArtists = Object.values(artistSongCount).sort((a, b) => b.count - a.count).slice(0, 5);
  const latestYear = years.find(y => parseInt(y) <= 2024) ?? years[0] ?? '–';
  const firstYear = years[years.length - 1] ?? '–';

  // ── Stat cards ────────────────────────────────────────────────────────────
  const statCards = [
    {
      label: 'Nummers',
      value: overviewLoading ? '…' : songs.length.toLocaleString('nl-NL'),
      sub: 'In de database',
      icon: <Music className="w-5 h-5" />,
      color: 'from-red-500/25 to-rose-600/5 border-red-500/30',
    },
    {
      label: 'Artiesten',
      value: overviewLoading ? '…' : artists.length.toLocaleString('nl-NL'),
      sub: 'Unieke artiesten',
      icon: <Users className="w-5 h-5" />,
      color: 'from-orange-500/25 to-amber-600/5 border-orange-500/30',
    },
    {
      label: 'Edities',
      value: overviewLoading ? '…' : years.filter(y => parseInt(y) <= 2024).length,
      sub: `${firstYear} – ${latestYear}`,
      icon: <Calendar className="w-5 h-5" />,
      color: 'from-emerald-500/25 to-green-600/5 border-emerald-500/30',
    },
    {
      label: 'Laatste editie',
      value: overviewLoading ? '…' : latestYear,
      sub: `Top ${top10.length} geladen`,
      icon: <Trophy className="w-5 h-5" />,
      color: 'from-yellow-500/25 to-yellow-600/5 border-yellow-500/30',
    },
  ];

  return (
    <div className="pb-12">

      {/* ── Page Header ────────────────────────────────────────────────────── */}
      <section className="py-8">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">De Top 2000</h1>
          <p className="text-muted-foreground">
            Overzicht, statistieken en de volledige lijst van alle 2000 nummers
          </p>
        </div>
      </section>

      <div className="container mx-auto px-4">

        {/* ── OVERVIEW SECTIE ─────────────────────────────────────────────── */}
        <div className="mb-12 space-y-8">

          {/* Stat cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {statCards.map(card => (
              <div
                key={card.label}
                className={`relative overflow-hidden rounded-2xl border bg-gradient-to-br ${card.color} p-5 backdrop-blur-sm`}
              >
                <div className="flex items-center gap-2 mb-3 text-white/70">
                  {card.icon}
                  <span className="text-xs font-semibold uppercase tracking-wider">{card.label}</span>
                </div>
                <div className="text-3xl font-bold text-white">{card.value}</div>
                {card.sub && <div className="text-xs text-white/50 mt-1">{card.sub}</div>}
              </div>
            ))}
          </div>

          {/* Top 10 + Top Artiesten */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

            {/* Top 10 */}
            <div className="bg-card border border-border rounded-2xl overflow-hidden">
              <div className="flex items-center justify-between p-5 border-b border-border">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-yellow-500/20 border border-yellow-500/30">
                    <Trophy className="w-4 h-4 text-yellow-400" />
                  </div>
                  <div>
                    <h2 className="font-bold">Top 10 van {latestYear}</h2>
                    <p className="text-xs text-muted-foreground">De allerbeste nummers</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setSelectedYear(latestYear);
                    setPositionFilter('top10');
                    window.scrollTo({
                      top: document.getElementById('lijst-sectie')?.offsetTop ?? 600,
                      behavior: 'smooth',
                    });
                  }}
                  className="text-xs font-semibold text-primary hover:underline flex items-center gap-1 cursor-pointer"
                >
                  Volledige lijst <ArrowRight className="w-3 h-3" />
                </button>
              </div>

              <div className="divide-y divide-border">
                {overviewLoading ? (
                  <div className="flex items-center justify-center gap-3 py-10 text-muted-foreground">
                    <Loader2 className="w-4 h-4 animate-spin" /> Laden…
                  </div>
                ) : (
                  top10.map((entry, idx) => (
                    <div key={entry.songId} className="flex items-center gap-3 px-5 py-3">
                      <div
                        className={`flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold
                        ${
                          idx === 0
                            ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/40'
                            : idx === 1
                            ? 'bg-slate-400/20 text-slate-300 border border-slate-400/40'
                            : idx === 2
                            ? 'bg-orange-700/20 text-orange-400 border border-orange-700/40'
                            : 'bg-muted text-muted-foreground'
                        }`}
                      >
                        {entry.position}
                      </div>
                      {entry.song?.imgUrl || entry.song?.albumCover ? (
                        <img
                          src={entry.song.imgUrl ?? entry.song.albumCover}
                          alt={entry.song.title}
                          className="w-8 h-8 rounded object-cover flex-shrink-0"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded bg-muted flex items-center justify-center flex-shrink-0">
                          <Music className="w-3 h-3 text-muted-foreground" />
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-sm truncate">{entry.song?.title ?? '–'}</p>
                        <p className="text-xs text-muted-foreground truncate">
                          {entry.song?.artistName ?? entry.song?.artist?.name ?? '–'}
                        </p>
                      </div>
                      {idx === 0 && <Star className="w-4 h-4 text-yellow-400 flex-shrink-0" />}
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Top Artiesten */}
            <div className="bg-card border border-border rounded-2xl overflow-hidden">
              <div className="flex items-center justify-between p-5 border-b border-border">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-orange-500/20 border border-orange-500/30">
                    <Mic2 className="w-4 h-4 text-orange-400" />
                  </div>
                  <div>
                    <h2 className="font-bold">Top artiesten</h2>
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

              <div className="p-5 space-y-4">
                {overviewLoading ? (
                  <div className="flex items-center justify-center gap-3 py-8 text-muted-foreground">
                    <Loader2 className="w-4 h-4 animate-spin" /> Laden…
                  </div>
                ) : (
                  topArtists.map(({ artist, count }, idx) => {
                    const maxCount = topArtists[0]?.count ?? 1;
                    const pct = Math.round((count / maxCount) * 100);
                    return (
                      <Link
                        key={artist.artistId}
                        to={`/artiest/${artist.artistId}`}
                        className="flex items-center gap-3 group"
                      >
                        <div className="w-5 text-center text-xs font-bold text-muted-foreground flex-shrink-0">
                          {idx + 1}
                        </div>
                        {artist.photoUrl || artist.photo ? (
                          <img
                            src={artist.photoUrl ?? artist.photo}
                            alt={artist.name}
                            className="w-10 h-10 rounded-full object-cover flex-shrink-0 border-2 border-border group-hover:border-primary transition-colors"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center flex-shrink-0 border-2 border-border">
                            <Users className="w-4 h-4 text-muted-foreground" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-semibold text-sm truncate group-hover:text-primary transition-colors">
                              {artist.name}
                            </span>
                            <span className="text-xs text-muted-foreground flex-shrink-0 ml-2">
                              {count} nrs
                            </span>
                          </div>
                          <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                            <div
                              className="h-full rounded-full bg-gradient-to-r from-primary to-rose-400 transition-all"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        </div>
                      </Link>
                    );
                  })
                )}
              </div>

              {/* Extra stats onderaan */}
              <div className="border-t border-border p-5 grid grid-cols-2 gap-3">
                <Link
                  to="/statistieken"
                  className="flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-primary transition-colors"
                >
                  <BarChart3 className="w-4 h-4" /> Statistieken
                </Link>
                <Link
                  to="/geschiedenis"
                  className="flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-primary transition-colors"
                >
                  <Calendar className="w-4 h-4" /> Geschiedenis
                </Link>
              </div>
            </div>
          </div>

        </div>

        {/* ── LIJST SECTIE ────────────────────────────────────────────────── */}
        <div id="lijst-sectie">
          <div className="flex items-center gap-3 mb-5">
            <div className="p-2 rounded-lg bg-primary/20 border border-primary/30">
              <Music className="w-4 h-4 text-primary" />
            </div>
            <h2 className="text-xl font-bold">De volledige lijst</h2>
          </div>

          {/* Filters */}
          <div className="bg-zinc-900/30 backdrop-blur-md border border-zinc-800/80 p-6 mb-6 rounded-xl shadow-lg">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Year Selector */}
              <div>
                <label className="block text-sm mb-2 text-zinc-300 font-semibold">Jaar</label>
                <div className="relative">
                  <select
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(e.target.value)}
                    disabled={years.length === 0}
                    className="w-full px-4 py-2 border border-zinc-800 rounded-lg appearance-none bg-zinc-950/60 text-white focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary/50 pr-10 disabled:opacity-55"
                  >
                    {years.map(year => (
                      <option key={year} value={year}>{year}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500 pointer-events-none" />
                </div>
              </div>

              {/* Position Filter */}
              <div>
                <label className="block text-sm mb-2 text-zinc-300 font-semibold">Positie</label>
                <div className="relative">
                  <select
                    value={positionFilter}
                    onChange={(e) => setPositionFilter(e.target.value)}
                    className="w-full px-4 py-2 border border-zinc-800 rounded-lg appearance-none bg-zinc-950/60 text-white focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary/50 pr-10"
                  >
                    <option value="all">Alle posities</option>
                    <option value="top10">Top 10</option>
                    <option value="top50">Top 50</option>
                    <option value="top100">Top 100</option>
                    <option value="top500">Top 500</option>
                    <option value="top2000">Top 2000</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500 pointer-events-none" />
                </div>
              </div>

              {/* Search */}
              <div>
                <label className="block text-sm mb-2 text-zinc-300 font-semibold">Zoeken</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
                  <input
                    type="text"
                    placeholder="Zoek op titel of artiest..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-zinc-800 rounded-lg bg-zinc-950/60 text-white focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary/50"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Fallback notice */}
          {fallbackNotice && !loading && (
            <div className="bg-primary/10 border border-primary/25 text-foreground px-4 py-3 rounded-lg mb-6 flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-primary flex-shrink-0" />
              <span className="text-sm font-medium">{fallbackNotice}</span>
            </div>
          )}

          {/* Results summary */}
          <div className="mb-4 text-muted-foreground text-sm">
            {loading ? 'Laden...' : `${filteredSongs.length} ${filteredSongs.length === 1 ? 'nummer' : 'nummers'} gevonden`}
          </div>

          {/* Loading / Error / List */}
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                <div key={i} className="bg-zinc-900/30 border border-zinc-800/60 p-4 rounded-xl animate-pulse flex items-center gap-4">
                  <div className="w-8 h-8 bg-zinc-800 rounded-lg flex-shrink-0" />
                  <div className="flex-grow space-y-2">
                    <div className="h-5 bg-zinc-800 rounded w-1/4" />
                    <div className="h-3 bg-zinc-800 rounded w-1/5" />
                  </div>
                  <div className="w-10 h-10 bg-zinc-800 rounded-full flex-shrink-0" />
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="bg-destructive/5 border border-destructive/30 rounded-lg p-6 mb-8 text-center">
              <AlertCircle className="w-10 h-10 text-destructive mx-auto mb-3" />
              <h3 className="text-lg font-semibold text-destructive mb-1">Muzieklijst kon niet worden geladen</h3>
              <p className="text-muted-foreground text-sm">{error}</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredSongs.slice(0, visibleCount).map((song, index) => {
                const isTop3 = song.position <= 3;
                const rankBadgeClass = isTop3
                  ? song.position === 1
                    ? 'bg-amber-400 text-black shadow-lg shadow-amber-400/20'
                    : song.position === 2
                      ? 'bg-slate-300 text-black shadow-lg shadow-slate-300/20'
                      : 'bg-amber-700 text-white shadow-lg shadow-amber-700/20'
                  : 'bg-zinc-800 text-zinc-300 border border-zinc-700';

                return (
                  <div 
                    key={index} 
                    className="group bg-zinc-900/40 backdrop-blur-md border border-zinc-800/80 hover:border-primary/45 hover:bg-zinc-800/30 p-4 rounded-xl hover:shadow-lg transition-all duration-300"
                  >
                    <div className="flex items-center gap-4">
                      {/* Position */}
                      <div className="flex-shrink-0 w-12 flex justify-center">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-extrabold text-sm ${rankBadgeClass}`}>
                          {song.position}
                        </div>
                      </div>

                      {/* Song Info */}
                      <div className="flex-grow min-w-0">
                        <h3 className="font-bold text-base md:text-lg text-white group-hover:text-primary transition-colors truncate">
                          {song.title}
                        </h3>
                        <p className="text-muted-foreground text-xs md:text-sm truncate mt-0.5">
                          {song.artist}{song.year > 0 && ` • ${song.year}`}
                        </p>
                      </div>

                      {/* Change Indicator */}
                      <div className="hidden sm:flex items-center gap-2 text-sm flex-shrink-0">
                        {song.change === 'new' ? (
                          <span className="text-primary font-bold text-[10px] bg-primary/15 px-2 py-0.5 border border-primary/30 rounded-full uppercase tracking-wider">
                            Nieuw
                          </span>
                        ) : typeof song.change === 'number' && song.change > 0 ? (
                          <span className="inline-flex items-center gap-1 text-xs font-bold text-green-500 bg-green-500/10 px-2 py-0.5 border border-green-500/20 rounded-full">
                            <TrendingUp className="w-3.5 h-3.5" />
                            +{song.change}
                          </span>
                        ) : typeof song.change === 'number' && song.change < 0 ? (
                          <span className="inline-flex items-center gap-1 text-xs font-bold text-primary bg-primary/10 px-2 py-0.5 border border-primary/25 rounded-full">
                            <TrendingDown className="w-3.5 h-3.5" />
                            {song.change}
                          </span>
                        ) : (
                          <span className="text-zinc-600 font-bold text-xs">-</span>
                        )}
                      </div>

                      {/* Play Button */}
                      <div className="flex-shrink-0 group-hover:scale-105 transition-transform duration-200">
                        <PlayButton title={song.title} artist={song.artist} variant="icon" />
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* Infinite Scroll Sentinel */}
              {visibleCount < filteredSongs.length && (
                <div ref={setSentinel} className="flex items-center justify-center py-10 text-muted-foreground gap-2">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Meer nummers laden…
                </div>
              )}

              {filteredSongs.length === 0 && (
                <div className="text-center py-16">
                  <h3 className="text-xl font-semibold mb-2">Geen nummers gevonden</h3>
                  <p className="text-muted-foreground">Probeer een andere filter of zoekterm</p>
                </div>
              )}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
