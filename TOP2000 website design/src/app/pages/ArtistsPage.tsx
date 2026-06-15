import { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { AlertCircle, Loader2, Search, Users } from 'lucide-react';
import { loadArtistsCatalog, type ApiEndpointDiagnostic, type BackendArtist } from '../data/api';

type FetchState = 'idle' | 'loading' | 'success' | 'error';
const isDevelopment = typeof window !== 'undefined' && window.location.hostname === 'localhost';

export function ArtistsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [artists, setArtists] = useState<BackendArtist[]>([]);
  const [fetchState, setFetchState] = useState<FetchState>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [diagnostic, setDiagnostic] = useState<ApiEndpointDiagnostic>({
    url: '/api/artists',
    ok: false,
    detail: 'Nog geen request uitgevoerd.',
  });
  const [visibleCount, setVisibleCount] = useState(24);
  const [loadedAt, setLoadedAt] = useState<string>();

  useEffect(() => {
    let isMounted = true;

    const loadArtists = async () => {
      setFetchState('loading');
      setErrorMessage('');

      const result = await loadArtistsCatalog();

      if (!isMounted) {
        return;
      }

      setArtists(result.data);
      setDiagnostic(result.diagnostic);
      setLoadedAt(result.loadedAt);

      if (!result.ok) {
        setFetchState('error');
        setErrorMessage(result.message ?? 'Artiesten konden niet worden geladen.');
        return;
      }

      setFetchState('success');
    };

    void loadArtists();

    return () => {
      isMounted = false;
    };
  }, []);

  const filteredArtists = useMemo(() => {
    return artists
      .filter(artist =>
        artist.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [artists, searchTerm]);

  return (
    <div className="pb-12">
      {/* Page Header */}
      <section className="py-8">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">Artiesten</h1>
          <p className="text-muted-foreground">
            Alle artiesten die ooit in de TOP 2000 hebben gestaan
          </p>
        </div>
      </section>

      <div className="container mx-auto px-4 mt-8">
        {fetchState === 'loading' && (
          <div className="bg-card border border-border rounded-lg p-8 flex items-center justify-center gap-3 text-muted-foreground mb-8">
            <Loader2 className="w-5 h-5 animate-spin" />
            Artiesten worden geladen...
          </div>
        )}

        {fetchState === 'error' && (
          <div className="bg-destructive/5 border border-destructive/30 rounded-lg p-6 mb-8">
            <div className="flex items-center gap-3 text-destructive font-semibold mb-2">
              <AlertCircle className="w-5 h-5" />
              Backend data kon niet worden geladen
            </div>
            <p className="text-sm text-muted-foreground">{errorMessage}</p>
          </div>
        )}

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

        {/* Results Summary */}
        <div className="mb-6 text-muted-foreground text-center">
          {filteredArtists.length} {filteredArtists.length === 1 ? 'artiest' : 'artiesten'} gevonden
        </div>

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
                </div>
              </div>
            </div>
          ))}
        </div>

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
            </div>
          </details>
        )}
      </div>
    </div>
  );
}
