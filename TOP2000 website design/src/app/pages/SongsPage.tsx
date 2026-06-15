import { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { AlertCircle, Loader2, Music, Search, X, ChevronDown } from 'lucide-react';
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
  const [songs, setSongs] = useState<BackendSong[]>([]);
  const [artists, setArtists] = useState<BackendArtist[]>([]);
  const [fetchState, setFetchState] = useState<FetchState>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [pageSize, setPageSize] = useState<PageSize>(50);
  const [visibleCount, setVisibleCount] = useState(50);

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

  // Unique artist names for the dropdown (sorted A-Z)
  const artistOptions = useMemo(() => {
    const names = new Set<string>();
    songs.forEach(s => {
      const name = s.artistName?.trim();
      if (name) names.add(name);
    });
    return [...names].sort((a, b) => a.localeCompare(b, 'nl'));
  }, [songs]);

  // Filtered + sorted list
  const filteredSongs = useMemo(() =>
    songs
      .filter(song => {
        const matchTitle = song.title.toLowerCase().includes(titleSearch.toLowerCase());
        const matchArtist = artistFilter === ''
          || (song.artistName ?? '').toLowerCase().includes(artistFilter.toLowerCase());
        return matchTitle && matchArtist;
      })
      .sort((a, b) => a.title.localeCompare(b.title, 'nl')),
    [songs, titleSearch, artistFilter]
  );

  // Reset visible count when filter or page size changes
  useEffect(() => {
    setVisibleCount(pageSize === 'all' ? filteredSongs.length : pageSize);
  }, [pageSize, filteredSongs.length, titleSearch, artistFilter]);

  const visibleSongs = filteredSongs.slice(0, visibleCount);
  const hasMore = visibleCount < filteredSongs.length;

  const hasActiveFilter = titleSearch !== '' || artistFilter !== '';

  const handleReset = () => {
    setTitleSearch('');
    setArtistFilter('');
  };

  return (
    <div className="pb-12">
      {/* Header */}
      <section className="py-8">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">Nummers</h1>
          <p className="text-muted-foreground">
            Alle nummers die ooit in de TOP 2000 hebben gestaan
          </p>
        </div>
      </section>

      <div className="container mx-auto px-4">

        {/* Loading */}
        {fetchState === 'loading' && (
          <div className="flex items-center justify-center gap-3 text-muted-foreground py-16">
            <Loader2 className="w-5 h-5 animate-spin" />
            Nummers worden geladen…
          </div>
        )}

        {/* Error */}
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
            {/* Filter bar */}
            <div className="bg-card border border-border rounded-xl p-4 mb-6 space-y-4">
              <div className="flex flex-col sm:flex-row gap-3">

                {/* Title search */}
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Zoek op titelnaam…"
                    value={titleSearch}
                    onChange={e => setTitleSearch(e.target.value)}
                    className="w-full pl-9 pr-9 py-2.5 border border-border rounded-lg bg-input-background focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                  />
                  {titleSearch && (
                    <button
                      onClick={() => setTitleSearch('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {/* Artist filter — dropdown */}
                <div className="relative sm:w-64">
                  <select
                    value={artistFilter}
                    onChange={e => setArtistFilter(e.target.value)}
                    className="w-full px-3 py-2.5 border border-border rounded-lg bg-input-background focus:outline-none focus:ring-2 focus:ring-primary text-sm appearance-none pr-8"
                  >
                    <option value="">Alle artiesten</option>
                    {artistOptions.map(name => (
                      <option key={name} value={name}>{name}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                </div>
              </div>

              {/* Bottom row: page size + reset */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">Toon per keer:</span>
                  <div className="flex rounded-lg border border-border overflow-hidden">
                    {PAGE_SIZE_OPTIONS.map(opt => (
                      <button
                        key={opt.label}
                        onClick={() => setPageSize(opt.value)}
                        className={`px-3 py-1.5 text-xs font-medium transition-colors cursor-pointer
                          ${pageSize === opt.value
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-card text-muted-foreground hover:bg-muted'
                          }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                {hasActiveFilter && (
                  <button
                    onClick={handleReset}
                    className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors cursor-pointer"
                  >
                    <X className="w-3 h-3" />
                    Filters wissen
                  </button>
                )}
              </div>
            </div>

            {/* Results count */}
            <div className="mb-5 flex items-center justify-between text-sm text-muted-foreground">
              <span>
                {hasActiveFilter
                  ? <><strong className="text-foreground">{filteredSongs.length}</strong> nummers gevonden</>
                  : <><strong className="text-foreground">{filteredSongs.length}</strong> nummers totaal</>
                }
                {artistFilter && <> voor <em className="text-foreground">"{artistFilter}"</em></>}
              </span>
              <span>Toon {Math.min(visibleCount, filteredSongs.length)} van {filteredSongs.length}</span>
            </div>

            {/* No results */}
            {filteredSongs.length === 0 ? (
              <div className="text-center py-16">
                <Music className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">Geen nummers gevonden</h3>
                {artistFilter
                  ? <p className="text-muted-foreground mb-4">De artiest <strong>"{artistFilter}"</strong> staat niet in de database.</p>
                  : <p className="text-muted-foreground mb-4">Geen nummers gevonden voor "<strong>{titleSearch}</strong>"</p>
                }
                <button
                  onClick={handleReset}
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors cursor-pointer"
                >
                  Filters wissen
                </button>
              </div>
            ) : (
              <>
                {/* Songs list */}
                <div className="max-w-4xl mx-auto space-y-2">
                  {visibleSongs.map(song => (
                    <Link
                      key={song.songId}
                      to={`/nummer/${song.songId}`}
                      className="flex items-center gap-4 bg-card border border-border rounded-xl p-3 hover:shadow-sm hover:border-primary/30 transition-all group"
                    >
                      {/* Album cover */}
                      {song.albumCover ? (
                        <img
                          src={song.albumCover}
                          alt={song.title}
                          className="w-14 h-14 rounded-lg object-cover flex-shrink-0"
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-14 h-14 bg-muted rounded-lg flex items-center justify-center flex-shrink-0">
                          <Music className="w-6 h-6 text-muted-foreground" />
                        </div>
                      )}

                      {/* Info */}
                      <div className="flex-grow min-w-0">
                        <p className="font-semibold truncate group-hover:text-primary transition-colors">
                          {song.title}
                        </p>
                        <p className="text-sm text-muted-foreground truncate">
                          {song.artistName ?? `Artiest ${song.artistId}`}
                          {song.releaseYear ? ` • ${song.releaseYear}` : ''}
                        </p>
                      </div>

                      {/* Times listed */}
                      {typeof song.timesListed === 'number' && song.timesListed > 0 && (
                        <span className="flex-shrink-0 text-xs text-muted-foreground bg-muted px-2 py-1 rounded-full hidden sm:block">
                          {song.timesListed}× genoteerd
                        </span>
                      )}
                    </Link>
                  ))}
                </div>

                {/* Load more */}
                {hasMore && (
                  <div className="text-center mt-8">
                    <button
                      onClick={() => setVisibleCount(prev => prev + (typeof pageSize === 'number' ? pageSize : filteredSongs.length))}
                      className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-xl font-medium hover:bg-primary/90 transition-colors cursor-pointer"
                    >
                      <ChevronDown className="w-4 h-4" />
                      Laad meer nummers ({filteredSongs.length - visibleCount} nog te laden)
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
