import { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { AlertCircle, Loader2, Search, Users, X, ChevronDown } from 'lucide-react';
import { loadArtistsCatalog, type BackendArtist } from '../data/api';

type FetchState = 'idle' | 'loading' | 'success' | 'error';
type PageSize = 10 | 50 | 100 | 'all';

const PAGE_SIZE_OPTIONS: { label: string; value: PageSize }[] = [
  { label: '10', value: 10 },
  { label: '50', value: 50 },
  { label: '100', value: 100 },
  { label: 'Alle', value: 'all' },
];

export function ArtistsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [allArtists, setAllArtists] = useState<BackendArtist[]>([]);
  const [fetchState, setFetchState] = useState<FetchState>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [pageSize, setPageSize] = useState<PageSize>(50);
  const [visibleCount, setVisibleCount] = useState(50);

  const [sentinel, setSentinel] = useState<HTMLDivElement | null>(null);

  // Load all artists once
  useEffect(() => {
    let isMounted = true;
    const load = async () => {
      setFetchState('loading');
      const result = await loadArtistsCatalog();
      if (!isMounted) return;
      if (!result.ok) {
        setErrorMessage(result.message ?? 'Artiesten konden niet worden geladen.');
        setFetchState('error');
        return;
      }
      // Deduplicate by name (case-insensitive) — keep first occurrence
      const seen = new Set<string>();
      const unique = result.data.filter(a => {
        const key = a.name.trim().toLowerCase();
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });
      setAllArtists(unique);
      setFetchState('success');
    };
    void load();
    return () => { isMounted = false; };
  }, []);

  // Filtered + sorted list (memoised for performance)
  const filteredArtists = useMemo(() =>
    allArtists
      .filter(a => a.name.toLowerCase().includes(searchTerm.toLowerCase()))
      .sort((a, b) => a.name.localeCompare(b.name, 'nl')),
    [allArtists, searchTerm]
  );

  // Reset visible count when filter or page size changes
  useEffect(() => {
    setVisibleCount(pageSize === 'all' ? filteredArtists.length : pageSize);
  }, [pageSize, filteredArtists.length]);

  // When search changes, also reset visible count
  useEffect(() => {
    setVisibleCount(pageSize === 'all' ? filteredArtists.length : pageSize);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm]);

  // Intersection Observer for Infinite Scroll
  useEffect(() => {
    if (!sentinel) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setVisibleCount(prev => {
            const increment = typeof pageSize === 'number' ? pageSize : 50;
            return Math.min(prev + increment, filteredArtists.length);
          });
        }
      },
      { threshold: 0.1, rootMargin: '200px' }
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [sentinel, filteredArtists.length, pageSize]);

  const visibleArtists = filteredArtists.slice(0, visibleCount);
  const hasMore = visibleCount < filteredArtists.length;

  const handleClearSearch = () => setSearchTerm('');

  return (
    <div className="pb-12">
      {/* Header */}
      <section className="py-12 bg-gradient-to-b from-zinc-950 to-transparent">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl md:text-5xl font-extrabold mb-3 bg-clip-text text-transparent bg-gradient-to-r from-white via-zinc-200 to-zinc-400">
            Artiesten
          </h1>
          <p className="text-zinc-400 text-lg">
            Ontdek alle artiesten die ooit in de TOP 2000 lijst hebben geschitterd
          </p>
        </div>
      </section>

      <div className="container mx-auto px-4">

        {/* Loading */}
        {fetchState === 'loading' && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="bg-zinc-900/30 border border-zinc-800/40 rounded-xl overflow-hidden animate-pulse flex flex-col h-full">
                <div className="aspect-square bg-zinc-950/60" />
                <div className="p-4 space-y-2 flex-grow">
                  <div className="h-4 bg-zinc-800 rounded w-3/4" />
                  <div className="h-3 bg-zinc-800 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Error */}
        {fetchState === 'error' && (
          <div className="bg-destructive/5 border border-destructive/30 rounded-xl p-6 mb-8 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-destructive">Artiesten konden niet worden geladen</p>
              <p className="text-sm text-muted-foreground mt-1">{errorMessage}</p>
            </div>
          </div>
        )}

        {fetchState === 'success' && (
          <>
            {/* Controls bar */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">

              {/* Search */}
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                <input
                  type="text"
                  placeholder="Zoek een artiest…"
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-10 py-2.5 border border-zinc-800 rounded-xl bg-zinc-950/60 text-white focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary/50 text-sm placeholder:text-zinc-500"
                />
                {searchTerm && (
                  <button
                    onClick={handleClearSearch}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white transition-colors cursor-pointer"
                    title="Filter wissen"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Page size picker */}
              <div className="flex items-center gap-2">
                <span className="text-sm text-zinc-400 whitespace-nowrap">Toon:</span>
                <div className="flex rounded-xl border border-zinc-850 overflow-hidden bg-zinc-950/40">
                  {PAGE_SIZE_OPTIONS.map(opt => (
                    <button
                      key={opt.label}
                      onClick={() => setPageSize(opt.value)}
                      className={`px-3 py-2 text-sm font-semibold transition-all duration-200 cursor-pointer
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
            </div>

            {/* Results count */}
            <div className="mb-5 flex items-center justify-between text-sm text-zinc-400">
              <span>
                {searchTerm
                  ? <><strong className="text-white">{filteredArtists.length}</strong> artiesten gevonden voor "<em>{searchTerm}</em>"</>
                  : <><strong className="text-white">{filteredArtists.length}</strong> artiesten in totaal</>
                }
              </span>
              <span>Toon {Math.min(visibleCount, filteredArtists.length)} van {filteredArtists.length}</span>
            </div>

            {/* No results */}
            {filteredArtists.length === 0 ? (
              <div className="text-center py-16 bg-zinc-900/10 border border-zinc-900 rounded-2xl p-6">
                <Users className="w-16 h-16 text-zinc-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2 text-white">Geen artiesten gevonden</h3>
                <p className="text-zinc-400 mb-4">Er is geen artiest gevonden met "<strong>{searchTerm}</strong>"</p>
                <button
                  onClick={handleClearSearch}
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors cursor-pointer"
                >
                  Filter wissen
                </button>
              </div>
            ) : (
              <>
                {/* Artists grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                  {visibleArtists.map(artist => (
                    <Link
                      key={artist.artistId}
                      to={`/artiest/${artist.artistId}`}
                      className="group bg-zinc-900/40 backdrop-blur-md border border-zinc-850 hover:border-primary/45 rounded-xl overflow-hidden hover:shadow-2xl hover:-translate-y-0.5 transition-all duration-300 flex flex-col"
                    >
                      {/* Photo Container */}
                      <div className="aspect-square overflow-hidden bg-zinc-950 relative">
                        {artist.photoUrl || artist.photo ? (
                          <img
                            src={artist.photoUrl ?? artist.photo}
                            alt={artist.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            loading="lazy"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-zinc-900">
                            <Users className="w-12 h-12 text-zinc-700 group-hover:text-primary/60 transition-colors" />
                          </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/80 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity"></div>
                      </div>
                      
                      {/* Name & Stats */}
                      <div className="p-4 flex-grow flex flex-col justify-between">
                        <p className="font-bold text-sm md:text-base text-zinc-100 group-hover:text-primary transition-colors truncate">
                          {artist.name}
                        </p>
                        {typeof artist.numberOfSongs === 'number' && (
                          <p className="text-xs text-zinc-400 mt-2 font-medium">
                            <span className="inline-block px-1.5 py-0.5 bg-zinc-800/80 rounded border border-zinc-700/50 text-zinc-300">
                              {artist.numberOfSongs} {artist.numberOfSongs === 1 ? 'nummer' : 'nummers'}
                            </span>
                          </p>
                        )}
                      </div>
                    </Link>
                  ))}
                </div>

                {/* Infinite Scroll Sentinel */}
                {hasMore && (
                  <div ref={setSentinel} className="flex items-center justify-center py-10 text-muted-foreground gap-2">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Meer artiesten laden…
                  </div>
                )}
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}
