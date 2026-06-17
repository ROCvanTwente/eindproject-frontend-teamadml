import { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { 
  AlertCircle, 
  Loader2, 
  Music, 
  Search, 
  X, 
  ChevronDown,
  LayoutGrid, 
  List, 
  ArrowUp, 
  Calendar, 
  TrendingUp, 
  Sparkles, 
  Award 
} from 'lucide-react';
import { loadSongsCatalog, loadArtistsCatalog, type BackendSong, type BackendArtist } from '../data/api';

type FetchState = 'idle' | 'loading' | 'success' | 'error';
type PageSize = 10 | 50 | 100 | 'all';

const PAGE_SIZE_OPTIONS: { label: string; value: PageSize }[] = [
  { label: '10', value: 10 },
  { label: '50', value: 50 },
  { label: '100', value: 100 },
  { label: 'Alle', value: 'all' },
];

export function SongsPage() {
  const [titleSearch, setTitleSearch] = useState('');
  const [artistFilter, setArtistFilter] = useState('');
  const [decadeFilter, setDecadeFilter] = useState('');
  const [sortBy, setSortBy] = useState<'title' | 'year-asc' | 'year-desc' | 'times-desc'>('title');
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [showScrollTop, setShowScrollTop] = useState(false);

  const [songs, setSongs] = useState<BackendSong[]>([]);
  const [artists, setArtists] = useState<BackendArtist[]>([]);
  const [fetchState, setFetchState] = useState<FetchState>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [pageSize, setPageSize] = useState<PageSize>(50);
  const [visibleCount, setVisibleCount] = useState(50);
  const [sentinel, setSentinel] = useState<HTMLDivElement | null>(null);

  // Load songs + artists in parallel
  useEffect(() => {
    let isMounted = true;
    const load = async () => {
      setFetchState('loading');
      const [songsRes, artistsRes] = await Promise.all([
        loadSongsCatalog(),
        loadArtistsCatalog(),
      ]);
      if (!isMounted) return;
      if (!songsRes.ok) {
        setErrorMessage(songsRes.message ?? 'Nummers konden niet worden geladen.');
        setFetchState('error');
        return;
      }
      setSongs(songsRes.data);
      setArtists(artistsRes.data);
      setFetchState('success');
    };
    void load();
    return () => { isMounted = false; };
  }, []);

  // Back to top button scroll listener
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 400) {
        setShowScrollTop(true);
      } else {
        setShowScrollTop(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Dynamic stats calculated from ALL loaded songs
  const stats = useMemo(() => {
    if (songs.length === 0) return null;

    let oldestYear = Infinity;
    let newestYear = -Infinity;
    const artistNames = new Set<string>();
    let spotlightSong: BackendSong | null = null;
    let maxListings = -1;

    songs.forEach(s => {
      if (s.releaseYear) {
        if (s.releaseYear < oldestYear) oldestYear = s.releaseYear;
        if (s.releaseYear > newestYear) newestYear = s.releaseYear;
      }
      const aName = s.artistName?.trim();
      if (aName) artistNames.add(aName);

      if (typeof s.timesListed === 'number' && s.timesListed > maxListings) {
        maxListings = s.timesListed;
        spotlightSong = s;
      }
    });

    return {
      totalSongs: songs.length,
      uniqueArtists: artistNames.size,
      oldestYear: oldestYear === Infinity ? null : oldestYear,
      newestYear: newestYear === -Infinity ? null : newestYear,
      spotlightSong
    };
  }, [songs]);

  // Unique artist names for the dropdown (sorted A-Z)
  const artistOptions = useMemo(() => {
    const names = new Set<string>();
    songs.forEach(s => {
      const name = s.artistName?.trim();
      if (name) names.add(name);
    });
    return [...names].sort((a, b) => a.localeCompare(b, 'nl'));
  }, [songs]);

  // Unique release decades sorted
  const decadeOptions = useMemo(() => {
    const decades = new Set<number>();
    songs.forEach(s => {
      if (s.releaseYear) {
        const dec = Math.floor(s.releaseYear / 10) * 10;
        decades.add(dec);
      }
    });
    return [...decades].sort((a, b) => a - b);
  }, [songs]);

  // Filtered + sorted list
  const filteredSongs = useMemo(() => {
    let result = songs.filter(song => {
      const matchTitle = song.title.toLowerCase().includes(titleSearch.toLowerCase());
      const matchArtist = artistFilter === ''
        || (song.artistName ?? '').toLowerCase().includes(artistFilter.toLowerCase());
      
      let matchDecade = true;
      if (decadeFilter) {
        const dec = Math.floor((song.releaseYear || 0) / 10) * 10;
        matchDecade = dec.toString() === decadeFilter;
      }
      
      return matchTitle && matchArtist && matchDecade;
    });

    // Sorting logic
    result.sort((a, b) => {
      if (sortBy === 'title') {
        return a.title.localeCompare(b.title, 'nl');
      } else if (sortBy === 'year-asc') {
        return (a.releaseYear || 0) - (b.releaseYear || 0);
      } else if (sortBy === 'year-desc') {
        return (b.releaseYear || 0) - (a.releaseYear || 0);
      } else if (sortBy === 'times-desc') {
        return (b.timesListed || 0) - (a.timesListed || 0);
      }
      return 0;
    });

    return result;
  }, [songs, titleSearch, artistFilter, decadeFilter, sortBy]);

  // Reset visible count when filters, sorting, or page size changes
  useEffect(() => {
    setVisibleCount(pageSize === 'all' ? filteredSongs.length : pageSize);
  }, [pageSize, filteredSongs.length, titleSearch, artistFilter, decadeFilter, sortBy]);

  // Intersection Observer for Infinite Scroll
  useEffect(() => {
    if (!sentinel) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setVisibleCount(prev => {
            const increment = typeof pageSize === 'number' ? pageSize : 50;
            return Math.min(prev + increment, filteredSongs.length);
          });
        }
      },
      { threshold: 0.1, rootMargin: '200px' }
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [sentinel, filteredSongs.length, pageSize]);

  const visibleSongs = filteredSongs.slice(0, visibleCount);
  const hasMore = visibleCount < filteredSongs.length;

  const hasActiveFilter = titleSearch !== '' || artistFilter !== '' || decadeFilter !== '' || sortBy !== 'title';

  const handleReset = () => {
    setTitleSearch('');
    setArtistFilter('');
    setDecadeFilter('');
    setSortBy('title');
  };

  return (
    <div className="pb-12 relative">
      {/* Header */}
      <section className="py-12 bg-gradient-to-b from-zinc-950 to-transparent">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl md:text-5xl font-extrabold mb-3 bg-clip-text text-transparent bg-gradient-to-r from-white via-zinc-200 to-zinc-400">
            Nummers
          </h1>
          <p className="text-zinc-400 text-lg">
            Verken de rijke geschiedenis van alle nummers uit de TOP 2000
          </p>
        </div>
      </section>

      <div className="container mx-auto px-4">

        {/* Loading skeletons */}
        {fetchState === 'loading' && (
          viewMode === 'grid' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                <div key={i} className="bg-zinc-900/30 border border-zinc-800/40 rounded-2xl overflow-hidden animate-pulse flex flex-col h-full">
                  <div className="aspect-square bg-zinc-950/60" />
                  <div className="p-4 space-y-3 flex-grow">
                    <div className="h-5 bg-zinc-800 rounded w-3/4" />
                    <div className="h-4 bg-zinc-800 rounded w-1/2" />
                    <div className="h-6 bg-zinc-800 rounded-full w-20 mt-4" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="max-w-4xl mx-auto space-y-3">
              {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                <div key={i} className="bg-zinc-900/30 border border-zinc-800/40 rounded-xl p-3 animate-pulse flex items-center gap-4">
                  <div className="w-14 h-14 bg-zinc-950/60 rounded-lg flex-shrink-0" />
                  <div className="flex-grow space-y-2">
                    <div className="h-5 bg-zinc-800 rounded w-1/3" />
                    <div className="h-3.5 bg-zinc-800 rounded w-1/4" />
                  </div>
                  <div className="w-24 h-6 bg-zinc-800 rounded-full flex-shrink-0 hidden sm:block" />
                </div>
              ))}
            </div>
          )
        )}

        {/* Error state */}
        {fetchState === 'error' && (
          <div className="bg-destructive/5 border border-destructive/30 rounded-xl p-6 mb-8 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-destructive">Nummers konden niet worden geladen</p>
              <p className="text-sm text-muted-foreground mt-1">{errorMessage}</p>
            </div>
          </div>
        )}

        {fetchState === 'success' && (
          <>
            {/* Spotlight Song & Statistics Dashboard */}
            {stats && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                {/* Stats indicators */}
                <div className="lg:col-span-2 grid grid-cols-2 gap-4">
                  <div className="bg-zinc-900/30 backdrop-blur-md border border-zinc-800/80 rounded-2xl p-5 shadow-lg flex flex-col justify-between hover:border-zinc-700/50 transition-colors">
                    <div>
                      <span className="text-xs text-zinc-400 font-semibold uppercase tracking-wider">Totaal Nummers</span>
                      <h3 className="text-3xl font-black mt-2 bg-clip-text text-transparent bg-gradient-to-r from-primary via-orange-400 to-amber-300">
                        {stats.totalSongs}
                      </h3>
                    </div>
                    <p className="text-xs text-zinc-500 mt-4">Klassiekers en moderne favorieten</p>
                  </div>

                  <div className="bg-zinc-900/30 backdrop-blur-md border border-zinc-800/80 rounded-2xl p-5 shadow-lg flex flex-col justify-between hover:border-zinc-700/50 transition-colors">
                    <div>
                      <span className="text-xs text-zinc-400 font-semibold uppercase tracking-wider">Unieke Artiesten</span>
                      <h3 className="text-3xl font-black mt-2 text-white">
                        {stats.uniqueArtists}
                      </h3>
                    </div>
                    <p className="text-xs text-zinc-500 mt-4">Talentvolle makers door de jaren heen</p>
                  </div>

                  <div className="bg-zinc-900/30 backdrop-blur-md border border-zinc-800/80 rounded-2xl p-5 shadow-lg flex flex-col justify-between hover:border-zinc-700/50 transition-colors">
                    <div>
                      <span className="text-xs text-zinc-400 font-semibold uppercase tracking-wider">Tijdperk</span>
                      <h3 className="text-xl font-bold mt-2 text-zinc-100 flex items-center gap-1.5">
                        <Calendar className="w-5 h-5 text-primary" />
                        {stats.oldestYear} <span className="text-zinc-500 text-xs font-normal">tot</span> {stats.newestYear}
                      </h3>
                    </div>
                    <p className="text-xs text-zinc-500 mt-4">Van klassiek vinyl tot streaming</p>
                  </div>

                  <div className="bg-zinc-900/30 backdrop-blur-md border border-zinc-800/80 rounded-2xl p-5 shadow-lg flex flex-col justify-between hover:border-zinc-700/50 transition-colors">
                    <div>
                      <span className="text-xs text-zinc-400 font-semibold uppercase tracking-wider">Gemiddeld Releasejaar</span>
                      <h3 className="text-xl font-bold mt-2 text-zinc-100 flex items-center gap-1.5">
                        <TrendingUp className="w-5 h-5 text-orange-400" />
                        {Math.round(songs.reduce((acc, curr) => acc + (curr.releaseYear || 0), 0) / songs.length)}
                      </h3>
                    </div>
                    <p className="text-xs text-zinc-500 mt-4">Gemiddeld releasejaar van alle tracks</p>
                  </div>
                </div>

                {/* Spotlight Song Card */}
                {stats.spotlightSong && (
                  <div className="bg-gradient-to-br from-zinc-900/40 via-zinc-950/50 to-zinc-900/30 backdrop-blur-md border border-primary/25 rounded-2xl p-6 shadow-2xl relative overflow-hidden group hover:border-primary/55 transition-all flex flex-col justify-between">
                    {/* Glow backdrop decorative */}
                    <div className="absolute -right-20 -top-20 w-48 h-48 bg-primary/10 rounded-full blur-3xl pointer-events-none group-hover:bg-primary/20 transition-all duration-500" />
                    
                    <div>
                      <div className="flex justify-between items-center mb-4">
                        <span className="text-xs text-zinc-400 font-semibold uppercase tracking-wider block">Meest Genoteerd</span>
                        <div className="flex items-center gap-1 bg-primary/20 border border-primary/30 px-2 py-0.5 rounded-full text-[10px] text-primary font-bold uppercase tracking-wider">
                          <Sparkles className="w-3 h-3" /> Spotlight
                        </div>
                      </div>

                      <div className="flex gap-4 items-center">
                        <div className="w-20 h-20 rounded-xl overflow-hidden bg-zinc-900 relative shadow-md flex-shrink-0">
                          {stats.spotlightSong.albumCover ? (
                            <img
                              src={stats.spotlightSong.albumCover}
                              alt={stats.spotlightSong.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-zinc-900">
                              <Music className="w-8 h-8 text-zinc-700" />
                            </div>
                          )}
                        </div>
                        
                        <div className="min-w-0 flex-grow">
                          <Link 
                            to={`/nummer/${stats.spotlightSong.songId}`}
                            className="font-bold text-base md:text-lg text-white hover:text-primary transition-colors block truncate"
                          >
                            {stats.spotlightSong.title}
                          </Link>
                          <p className="text-sm text-zinc-400 truncate mt-1">
                            {stats.spotlightSong.artistName}
                          </p>
                          <div className="flex items-center gap-2 mt-2">
                            <span className="inline-block px-2 py-0.5 bg-zinc-800 text-zinc-300 text-xs rounded border border-zinc-700/50">
                              {stats.spotlightSong.releaseYear}
                            </span>
                            <span className="text-xs text-primary font-bold flex items-center gap-1">
                              <Award className="w-3.5 h-3.5" /> {stats.spotlightSong.timesListed}×
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 pt-4 border-t border-zinc-800/60 flex items-center justify-between text-xs">
                      <span className="text-zinc-500">Ontdek details & charts</span>
                      <Link 
                        to={`/nummer/${stats.spotlightSong.songId}`}
                        className="text-primary hover:text-white font-medium flex items-center gap-1 group/btn"
                      >
                        Bekijk Nummer <span className="group-hover:translate-x-1 transition-transform">→</span>
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Filter & Controls bar */}
            <div className="bg-zinc-900/30 backdrop-blur-md border border-zinc-850 rounded-2xl p-5 mb-6 space-y-4 shadow-xl">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
                
                {/* Title search (md:col-span-4) */}
                <div className="relative md:col-span-4">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                  <input
                    type="text"
                    placeholder="Zoek op titelnaam…"
                    value={titleSearch}
                    onChange={e => setTitleSearch(e.target.value)}
                    className="w-full pl-10 pr-9 py-2.5 border border-zinc-800 rounded-xl bg-zinc-950/60 text-white focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary/50 text-sm placeholder:text-zinc-500"
                  />
                  {titleSearch && (
                    <button
                      onClick={() => setTitleSearch('')}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {/* Artist filter dropdown (md:col-span-3) */}
                <div className="relative md:col-span-3">
                  <select
                    value={artistFilter}
                    onChange={e => setArtistFilter(e.target.value)}
                    className="w-full px-3.5 py-2.5 border border-zinc-800 rounded-xl bg-zinc-950/60 text-white focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary/50 text-sm appearance-none pr-8 cursor-pointer"
                  >
                    <option value="">Alle artiesten</option>
                    {artistOptions.map(name => (
                      <option key={name} value={name}>{name}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 pointer-events-none" />
                </div>

                {/* Decade filter dropdown (md:col-span-2) */}
                <div className="relative md:col-span-2">
                  <select
                    value={decadeFilter}
                    onChange={e => setDecadeFilter(e.target.value)}
                    className="w-full px-3.5 py-2.5 border border-zinc-800 rounded-xl bg-zinc-950/60 text-white focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary/50 text-sm appearance-none pr-8 cursor-pointer"
                  >
                    <option value="">Alle decennia</option>
                    {decadeOptions.map(dec => (
                      <option key={dec} value={dec.toString()}>{dec}s</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 pointer-events-none" />
                </div>

                {/* Sort dropdown (md:col-span-3) */}
                <div className="relative md:col-span-3">
                  <select
                    value={sortBy}
                    onChange={e => setSortBy(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 border border-zinc-800 rounded-xl bg-zinc-950/60 text-white focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary/50 text-sm appearance-none pr-8 cursor-pointer"
                  >
                    <option value="title">Titel (A-Z)</option>
                    <option value="year-desc">Jaar (Nieuw → Oud)</option>
                    <option value="year-asc">Jaar (Oud → Nieuw)</option>
                    <option value="times-desc">Noteringen (Meest → Minst)</option>
                  </select>
                  <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 pointer-events-none" />
                </div>

              </div>

              {/* Bottom control items: views, pagination count, and clear filters */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-4 border-t border-zinc-800/40">
                <div className="flex flex-wrap items-center gap-4">
                  {/* Page size buttons */}
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-zinc-400 font-medium">Toon:</span>
                    <div className="flex rounded-xl border border-zinc-850 overflow-hidden bg-zinc-950/40">
                      {PAGE_SIZE_OPTIONS.map(opt => (
                        <button
                          key={opt.label}
                          onClick={() => setPageSize(opt.value)}
                          className={`px-3 py-1.5 text-xs font-semibold transition-all duration-200 cursor-pointer
                            ${pageSize === opt.value
                              ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20 scale-[1.02]'
                              : 'text-zinc-400 hover:bg-zinc-800/40 hover:text-white'
                            }`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* View layout mode switchers */}
                  <div className="flex items-center gap-2 border-l border-zinc-800 pl-4">
                    <span className="text-xs text-zinc-400 font-medium">Weergave:</span>
                    <div className="flex rounded-xl border border-zinc-850 overflow-hidden bg-zinc-950/40">
                      <button
                        onClick={() => setViewMode('list')}
                        title="Lijstweergave"
                        className={`p-1.5 text-xs font-semibold transition-all duration-200 cursor-pointer
                          ${viewMode === 'list'
                            ? 'bg-primary text-primary-foreground scale-[1.02]'
                            : 'text-zinc-400 hover:bg-zinc-800/40 hover:text-white'
                          }`}
                      >
                        <List className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setViewMode('grid')}
                        title="Rasterweergave"
                        className={`p-1.5 text-xs font-semibold transition-all duration-200 cursor-pointer
                          ${viewMode === 'grid'
                            ? 'bg-primary text-primary-foreground scale-[1.02]'
                            : 'text-zinc-400 hover:bg-zinc-800/40 hover:text-white'
                          }`}
                      >
                        <LayoutGrid className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>

                {hasActiveFilter && (
                  <button
                    onClick={handleReset}
                    className="flex items-center gap-1.5 text-xs text-zinc-400 hover:text-primary transition-colors cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                    Filters wissen
                  </button>
                )}
              </div>
            </div>

            {/* Results count text */}
            <div className="mb-5 flex items-center justify-between text-sm text-zinc-400">
              <span>
                {hasActiveFilter
                  ? <><strong className="text-white">{filteredSongs.length}</strong> nummers gevonden</>
                  : <><strong className="text-white">{filteredSongs.length}</strong> nummers in totaal</>
                }
                {artistFilter && <> voor <em className="text-white">"{artistFilter}"</em></>}
                {decadeFilter && <> uit de <em className="text-white">{decadeFilter}s</em></>}
              </span>
              <span>Toon {Math.min(visibleCount, filteredSongs.length)} van {filteredSongs.length}</span>
            </div>

            {/* Empty check */}
            {filteredSongs.length === 0 ? (
              <div className="text-center py-16 bg-zinc-900/10 border border-zinc-900 rounded-2xl p-6">
                <Music className="w-16 h-16 text-zinc-650 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2 text-white">Geen nummers gevonden</h3>
                <p className="text-zinc-400 mb-4">Er zijn geen nummers die overeenkomen met de geselecteerde filters.</p>
                <button
                  onClick={handleReset}
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors cursor-pointer"
                >
                  Filters wissen
                </button>
              </div>
            ) : (
              <>
                {/* Songs rendering based on list vs grid layout */}
                {viewMode === 'grid' ? (
                  /* Grid view mode */
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {visibleSongs.map(song => (
                      <Link
                        key={song.songId}
                        to={`/nummer/${song.songId}`}
                        className="group bg-zinc-900/40 backdrop-blur-md border border-zinc-850 hover:border-primary/45 rounded-2xl overflow-hidden hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 flex flex-col h-full"
                      >
                        {/* Cover image art */}
                        <div className="aspect-square overflow-hidden bg-zinc-950 relative shadow-inner">
                          {song.albumCover ? (
                            <img
                              src={song.albumCover}
                              alt={song.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                              loading="lazy"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-zinc-900">
                              <Music className="w-16 h-16 text-zinc-700 group-hover:text-primary/65 transition-colors" />
                            </div>
                          )}
                          <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/80 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />
                          
                          {/* Decade/Year badge overlay */}
                          {song.releaseYear && (
                            <div className="absolute top-3 right-3 bg-zinc-950/85 backdrop-blur border border-zinc-800/80 px-2 py-0.5 rounded text-xs text-zinc-300 font-semibold shadow">
                              {song.releaseYear}
                            </div>
                          )}
                        </div>

                        {/* Card body content */}
                        <div className="p-4 flex-grow flex flex-col justify-between">
                          <div>
                            <h4 className="font-bold text-base text-zinc-100 group-hover:text-primary transition-colors line-clamp-1 mb-1">
                              {song.title}
                            </h4>
                            <p className="text-xs text-zinc-400 truncate">
                              {song.artistName ?? `Artiest ${song.artistId}`}
                            </p>
                          </div>

                          <div className="mt-4 flex items-center justify-between text-xs border-t border-zinc-800/40 pt-3">
                            <span className="text-zinc-500">Top 2000</span>
                            {typeof song.timesListed === 'number' && song.timesListed > 0 ? (
                              <span className="font-bold text-primary flex items-center gap-0.5">
                                <Award className="w-3.5 h-3.5" /> {song.timesListed}×
                              </span>
                            ) : (
                              <span className="text-zinc-500 font-medium">0×</span>
                            )}
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  /* List view mode */
                  <div className="max-w-4xl mx-auto space-y-3">
                    {visibleSongs.map((song, index) => (
                      <Link
                        key={song.songId}
                        to={`/nummer/${song.songId}`}
                        className="flex items-center gap-4 bg-zinc-900/40 backdrop-blur-md border border-zinc-850 hover:border-primary/45 hover:bg-zinc-800/30 rounded-xl p-3 shadow-md transition-all group"
                      >
                        {/* Index numbers */}
                        <span className="text-zinc-500 text-xs font-semibold w-5 text-right hidden sm:block group-hover:text-primary group-hover:hidden">
                          {index + 1}
                        </span>
                        <Music className="w-5 h-5 text-primary/75 hidden group-hover:block flex-shrink-0 text-right" />

                        {/* Cover thumbnail */}
                        <div className="w-14 h-14 rounded-lg overflow-hidden bg-zinc-950 relative flex-shrink-0 shadow">
                          {song.albumCover ? (
                            <img
                              src={song.albumCover}
                              alt={song.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              loading="lazy"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-zinc-900">
                              <Music className="w-6 h-6 text-zinc-700 group-hover:text-primary/60 transition-colors" />
                            </div>
                          )}
                        </div>

                        {/* Title and artist details */}
                        <div className="flex-grow min-w-0">
                          <p className="font-bold text-base md:text-lg text-white group-hover:text-primary transition-colors truncate">
                            {song.title}
                          </p>
                          <p className="text-xs md:text-sm text-zinc-400 truncate mt-0.5">
                            {song.artistName ?? `Artiest ${song.artistId}`}
                          </p>
                        </div>

                        {/* Year info */}
                        {song.releaseYear && (
                          <span className="flex-shrink-0 text-xs text-zinc-400 bg-zinc-850/50 border border-zinc-800 px-2 py-0.5 rounded font-medium">
                            {song.releaseYear}
                          </span>
                        )}

                        {/* Listed times count */}
                        {typeof song.timesListed === 'number' && song.timesListed > 0 ? (
                          <span className="flex-shrink-0 text-xs text-zinc-300 bg-zinc-800/80 border border-zinc-700/50 px-2.5 py-1 rounded-full hidden sm:block font-semibold">
                            {song.timesListed}× genoteerd
                          </span>
                        ) : (
                          <span className="flex-shrink-0 text-xs text-zinc-550 bg-zinc-900/40 border border-zinc-850 px-2.5 py-1 rounded-full hidden sm:block">
                            0× genoteerd
                          </span>
                        )}
                      </Link>
                    ))}
                  </div>
                )}

                {/* Infinite scroll load target */}
                {hasMore && (
                  <div ref={setSentinel} className="flex items-center justify-center py-10 text-muted-foreground gap-2">
                    <Loader2 className="w-5 h-5 animate-spin text-primary" />
                    Meer nummers laden…
                  </div>
                )}
              </>
            )}
          </>
        )}
      </div>

      {/* Floating Back to Top Button */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 p-3 rounded-full bg-primary text-primary-foreground shadow-2xl hover:bg-primary/90 hover:scale-105 active:scale-95 transition-all duration-300 z-50 cursor-pointer border border-primary/20"
          title="Terug naar boven"
        >
          <ArrowUp className="w-5 h-5 animate-pulse" />
        </button>
      )}
    </div>
  );
}
