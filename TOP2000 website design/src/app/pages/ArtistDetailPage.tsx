import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ExternalLink, Music, Globe, Edit, AlertCircle, Loader2 } from 'lucide-react';
import {
  fetchArtistForDetail,
  fetchSongsByArtist,
  type BackendArtist,
  type BackendSong,
} from '../data/api';
import { PlayButton } from '../components/PlayButton';

type FetchState = 'idle' | 'loading' | 'success' | 'error';

export function ArtistDetailPage() {
  const { id } = useParams<{ id: string }>();
  const artistId = parseInt(id || '0', 10);

  const [artist, setArtist] = useState<BackendArtist | null>(null);
  const [songs, setSongs] = useState<BackendSong[]>([]);
  const [fetchState, setFetchState] = useState<FetchState>('loading');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    let isMounted = true;

    const loadArtistData = async () => {
      if (!artistId || Number.isNaN(artistId)) {
        setFetchState('error');
        setErrorMessage('Ongeldig artiest-ID.');
        return;
      }

      try {
        setFetchState('loading');
        setErrorMessage('');

        const artistResult = await fetchArtistForDetail(artistId);
        if (!isMounted) {
          return;
        }

        if (!artistResult.ok) {
          setFetchState('error');
          setErrorMessage('Artiest kon niet worden geladen uit de database.');
          return;
        }

        const loadedArtist = artistResult.data;
        const artistSongs = await fetchSongsByArtist(artistId, loadedArtist.name);

        if (!isMounted) {
          return;
        }

        setArtist({
          ...loadedArtist,
          numberOfSongs: artistSongs.length,
        });
        setSongs(artistSongs);
        setFetchState('success');
      } catch {
        if (isMounted) {
          setFetchState('error');
          setErrorMessage('Er is een fout opgetreden bij het laden van de artiest.');
        }
      }
    };

    void loadArtistData();

    return () => {
      isMounted = false;
    };
  }, [artistId]);

  if (fetchState === 'loading') {
    return (
      <div className="container mx-auto px-4 py-16 flex items-center justify-center gap-3">
        <Loader2 className="w-5 h-5 animate-spin" />
        <span>Artiest wordt geladen...</span>
      </div>
    );
  }

  if (fetchState === 'error' || !artist) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <div className="flex items-center justify-center gap-3 mb-4">
          <AlertCircle className="w-6 h-6 text-destructive" />
          <h1 className="text-3xl font-bold">Artiest niet gevonden</h1>
        </div>
        {errorMessage && <p className="text-muted-foreground mb-4">{errorMessage}</p>}
        <Link to="/artiesten" className="text-primary hover:underline">
          Terug naar artiesten
        </Link>
      </div>
    );
  }

  return (
    <div className="pb-12">
      <section className="bg-gradient-to-r from-red-700 via-red-500 to-red-700 py-12 border-b border-border">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="md:col-span-1">
                <div className="aspect-square rounded-xl overflow-hidden shadow-lg border border-border">
                  {artist.photoUrl ? (
                    <img
                      src={artist.photoUrl}
                      alt={artist.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-muted flex items-center justify-center">
                      <Music className="w-24 h-24 text-muted-foreground" />
                    </div>
                  )}
                </div>
              </div>

              <div className="md:col-span-2 flex flex-col justify-center">
                <h1 className="text-4xl md:text-5xl font-bold mb-4">{artist.name}</h1>
                <div className="flex flex-wrap gap-4 mb-6">
                  <div className="bg-gradient-to-r from-primary to-accent text-white px-4 py-2 rounded-lg">
                    <span className="font-bold">{songs.length}</span> nummers in TOP 2000
                  </div>
                </div>

                <div className="flex flex-wrap gap-3">
                  {artist.wikiUrl && (
                    <a
                      href={artist.wikiUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2 bg-card border border-border rounded-lg hover:bg-muted transition-colors"
                    >
                      <ExternalLink className="w-4 h-4" />
                      Wikipedia
                    </a>
                  )}
                  {artist.website && (
                    <a
                      href={artist.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2 bg-card border border-border rounded-lg hover:bg-muted transition-colors"
                    >
                      <Globe className="w-4 h-4" />
                      Officiële website
                    </a>
                  )}
                  <Link
                    to={`/admin/artiest/${artist.artistId}`}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-card border border-border rounded-lg hover:bg-muted transition-colors"
                  >
                    <Edit className="w-4 h-4" />
                    Bewerken (Admin)
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {artist.bio && (
        <section className="py-12 bg-background">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold mb-6">Biografie</h2>
              <div className="bg-card border border-border rounded-lg p-8 shadow-md">
                <p className="text-lg leading-relaxed text-muted-foreground">
                  {artist.bio}
                </p>
              </div>
            </div>
          </div>
        </section>
      )}

      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold mb-6">
              Nummers in de TOP 2000 ({songs.length})
            </h2>

            {songs.length === 0 ? (
              <div className="bg-card border border-border rounded-lg p-8 text-center text-muted-foreground">
                Geen nummers gevonden voor deze artiest.
              </div>
            ) : (
              <div className="space-y-3">
                {songs.map((song) => (
                  <div
                    key={song.songId}
                    className="block bg-card border border-border rounded-lg p-4 hover:shadow-lg hover:border-primary/30 transition-all group"
                  >
                    <div className="flex items-center gap-4">
                      {song.albumCover ? (
                        <img
                          src={song.albumCover}
                          alt={song.title}
                          className="w-16 h-16 rounded-lg object-cover"
                        />
                      ) : (
                        <div className="w-16 h-16 rounded-lg bg-muted flex items-center justify-center shrink-0">
                          <Music className="w-6 h-6 text-muted-foreground" />
                        </div>
                      )}
                      <div className="flex-grow min-w-0">
                        <Link
                          to={`/nummer/${song.songId}`}
                          className="hover:text-primary transition-colors"
                        >
                          <h3 className="font-bold text-lg group-hover:text-primary transition-colors truncate">
                            {song.title}
                          </h3>
                        </Link>
                        <p className="text-muted-foreground text-sm">
                          {song.releaseYear}
                          {typeof song.timesListed === 'number' && song.timesListed > 0
                            ? ` • ${song.timesListed}x in de lijst`
                            : ''}
                        </p>
                      </div>
                      <div className="flex gap-2 flex-shrink-0">
                        <PlayButton
                          youtubeUrl={song.youtube}
                          title={song.title}
                          artist={song.artistName ?? artist.name}
                          variant="icon"
                        />
                        <Link
                          to={`/nummer/${song.songId}`}
                          className="inline-flex items-center justify-center w-10 h-10 bg-card border border-border rounded-lg hover:bg-muted transition-colors"
                          title="Details bekijken"
                        >
                          <Music className="w-5 h-5" />
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
