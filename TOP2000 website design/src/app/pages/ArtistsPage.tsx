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
<<<<<<< Updated upstream
  const [diagnostic, setDiagnostic] = useState<ApiEndpointDiagnostic>({
    url: '/api/artists',
    ok: false,
    detail: 'Nog geen request uitgevoerd.',
  });
  const [visibleCount, setVisibleCount] = useState(24);
  const [loadedAt, setLoadedAt] = useState<string>();
=======
  const [pageSize, setPageSize] = useState<PageSize>(50);
  const [visibleCount, setVisibleCount] = useState(50);
>>>>>>> Stashed changes

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

<<<<<<< Updated upstream
  const filteredArtists = useMemo(() => {
    return artists
      .filter(artist =>
        artist.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [artists, searchTerm]);
=======
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

  const visibleArtists = filteredArtists.slice(0, visibleCount);
  const hasMore = visibleCount < filteredArtists.length;

  const handleClearSearch = () => setSearchTerm('');
>>>>>>> Stashed changes

  return (
    <div className="pb-12">
      {/* Header */}
      <section className="py-8">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">Artiesten</h1>
          <p className="text-muted-foreground">
            Alle artiesten die ooit in de TOP 2000 hebben gestaan
          </p>
        </div>
      </section>

      <div className="container mx-auto px-4">

        {/* Loading */}
        {fetchState === 'loading' && (
          <div className="flex items-center justify-center gap-3 text-muted-foreground py-16">
            <Loader2 className="w-5 h-5 animate-spin" />
            Artiesten worden geladen…
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

<<<<<<< Updated upstream
        {/* Search */}
        <div className="max-w-2xl mx-auto mb-8">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Zoek een artiest..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setVisibleCount(24);
              }}
              className="w-full pl-12 pr-4 py-3 border border-border rounded-lg bg-input-background focus:outline-none focus:ring-2 focus:ring-primary shadow-sm"
            />
          </div>
        </div>
=======
        {fetchState === 'success' && (
          <>
            {/* Controls bar */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
>>>>>>> Stashed changes

              {/* Search */}
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Zoek een artiest…"
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-10 py-2.5 border border-border rounded-xl bg-input-background focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                />
                {searchTerm && (
                  <button
                    onClick={handleClearSearch}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                    title="Filter wissen"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

<<<<<<< Updated upstream
        {/* Artists Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 max-w-7xl mx-auto">
          {filteredArtists.slice(0, visibleCount).map(artist => (
            <div
              key={artist.artistId}
              className="bg-card border border-border overflow-hidden hover:shadow-md transition-all group"
            >
              <Link to={`/artiest/${artist.artistId}`}>
                <div className="aspect-square overflow-hidden bg-muted">
                  {artist.photoUrl ? (
                    <img
                      src={artist.photoUrl}
                      alt={artist.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Users className="w-24 h-24 text-muted-foreground" />
                    </div>
                  )}
                </div>
              </Link>
              <div className="p-4">
                <Link to={`/artiest/${artist.artistId}`}>
                  <h3 className="font-bold text-lg mb-2 group-hover:text-primary transition-colors truncate cursor-pointer">
                    {artist.name}
                  </h3>
                </Link>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">
                    {typeof artist.numberOfSongs === 'number'
                      ? `${artist.numberOfSongs} ${artist.numberOfSongs === 1 ? 'nummer' : 'nummers'}`
                      : 'Aantal nummers onbekend'}
                  </span>
                  <span className="text-primary hover:underline cursor-pointer">
                    Bekijk alle
                  </span>
=======
              {/* Page size picker */}
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground whitespace-nowrap">Toon:</span>
                <div className="flex rounded-xl border border-border overflow-hidden">
                  {PAGE_SIZE_OPTIONS.map(opt => (
                    <button
                      key={opt.label}
                      onClick={() => setPageSize(opt.value)}
                      className={`px-3 py-2 text-sm font-medium transition-colors cursor-pointer
                        ${pageSize === opt.value
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-card text-muted-foreground hover:bg-muted'
                        }`}
                    >
                      {opt.label}
                    </button>
                  ))}
>>>>>>> Stashed changes
                </div>
              </div>
            </div>

<<<<<<< Updated upstream
        {/* Load More */}
        {visibleCount < filteredArtists.length && (
          <div className="text-center mt-8">
            <button
              onClick={() => setVisibleCount(prev => prev + 24)}
              className="bg-primary text-primary-foreground px-8 py-3 rounded-lg hover:bg-primary/90 transition-colors cursor-pointer font-semibold"
            >
              Laad meer artiesten
            </button>
          </div>
        )}

        {filteredArtists.length === 0 && (
          <div className="text-center py-16">
            <Users className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Geen artiesten gevonden</h3>
            <p className="text-muted-foreground">
              Probeer een andere zoekterm
            </p>
          </div>
        )}

        {isDevelopment && (
          <details className="mt-8 rounded-lg border border-dashed border-border bg-card/60 p-4 text-sm text-muted-foreground">
            <summary className="cursor-pointer font-semibold text-foreground">
              Debug: /api/artists
            </summary>
            <div className="mt-3 space-y-2">
              <p><span className="font-medium text-foreground">Endpoint:</span> {diagnostic.url}</p>
              <p><span className="font-medium text-foreground">Status:</span> {diagnostic.ok ? `OK${diagnostic.status ? ` (${diagnostic.status})` : ''}` : `Fout${diagnostic.status ? ` (${diagnostic.status})` : ''}`}</p>
              <p><span className="font-medium text-foreground">Detail:</span> {diagnostic.detail}</p>
              <p><span className="font-medium text-foreground">Items:</span> {artists.length}</p>
              {loadedAt && (
                <p><span className="font-medium text-foreground">Laatst geladen:</span> {new Date(loadedAt).toLocaleString('nl-NL')}</p>
              )}
=======
            {/* Results count */}
            <div className="mb-5 flex items-center justify-between text-sm text-muted-foreground">
              <span>
                {searchTerm
                  ? <><strong className="text-foreground">{filteredArtists.length}</strong> artiesten gevonden voor "<em>{searchTerm}</em>"</>
                  : <><strong className="text-foreground">{filteredArtists.length}</strong> artiesten totaal</>
                }
              </span>
              <span>Toon {Math.min(visibleCount, filteredArtists.length)} van {filteredArtists.length}</span>
>>>>>>> Stashed changes
            </div>

            {/* No results */}
            {filteredArtists.length === 0 ? (
              <div className="text-center py-16">
                <Users className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">Geen artiesten gevonden</h3>
                <p className="text-muted-foreground mb-4">Er is geen artiest gevonden met "<strong>{searchTerm}</strong>"</p>
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
                      className="group bg-card border border-border rounded-xl overflow-hidden hover:shadow-lg hover:border-primary/30 transition-all"
                    >
                      {/* Photo */}
                      <div className="aspect-square overflow-hidden bg-muted">
                        {artist.photoUrl || artist.photo ? (
                          <img
                            src={artist.photoUrl ?? artist.photo}
                            alt={artist.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            loading="lazy"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Users className="w-10 h-10 text-muted-foreground" />
                          </div>
                        )}
                      </div>
                      {/* Name */}
                      <div className="p-3">
                        <p className="font-semibold text-sm truncate group-hover:text-primary transition-colors">
                          {artist.name}
                        </p>
                        {typeof artist.numberOfSongs === 'number' && (
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {artist.numberOfSongs} {artist.numberOfSongs === 1 ? 'nummer' : 'nummers'}
                          </p>
                        )}
                      </div>
                    </Link>
                  ))}
                </div>

                {/* Load more */}
                {hasMore && (
                  <div className="text-center mt-8 space-y-2">
                    <button
                      onClick={() => setVisibleCount(prev => prev + (pageSize === 'all' ? filteredArtists.length : pageSize))}
                      className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-xl font-medium hover:bg-primary/90 transition-colors cursor-pointer"
                    >
                      <ChevronDown className="w-4 h-4" />
                      Laad meer artiesten ({filteredArtists.length - visibleCount} nog te laden)
                    </button>
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
