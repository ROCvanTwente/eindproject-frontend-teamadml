import { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import {
    AlertCircle,
    Check,
    Loader2,
    Music,
    Plus,
    Search
} from 'lucide-react';
import {
    loadSongsCatalog,
    type ApiEndpointDiagnostic,
    type BackendSong
} from '../data/api';

type FetchState = 'idle' | 'loading' | 'success' | 'error';

const isDevelopment =
    typeof window !== 'undefined' &&
    window.location.hostname === 'localhost';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '';

export function SongsPage() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    const playlistId = searchParams.get('playlistId');
    const isAddingToPlaylist = playlistId !== null;

    const [searchTerm, setSearchTerm] = useState('');
    const [songs, setSongs] = useState<BackendSong[]>([]);
    const [fetchState, setFetchState] = useState<FetchState>('idle');
    const [errorMessage, setErrorMessage] = useState('');

    const [addingSongId, setAddingSongId] = useState<number | null>(null);
    const [addedSongIds, setAddedSongIds] = useState<number[]>([]);
    const [addMessage, setAddMessage] = useState('');
    const [addMessageType, setAddMessageType] = useState<
        'success' | 'error' | ''
    >('');

    const [diagnostic, setDiagnostic] = useState<ApiEndpointDiagnostic>({
        url: '/api/songs',
        ok: false,
        detail: 'Nog geen request uitgevoerd.'
    });

    const [loadedAt, setLoadedAt] = useState<string>();

    useEffect(() => {
        let isMounted = true;

        const loadSongs = async () => {
            setFetchState('loading');
            setErrorMessage('');

            const result = await loadSongsCatalog();

            if (!isMounted) {
                return;
            }

            setSongs(result.data);
            setDiagnostic(result.diagnostic);
            setLoadedAt(result.loadedAt);

            if (!result.ok) {
                setFetchState('error');
                setErrorMessage(result.message ?? 'Nummers konden niet worden geladen.');
                return;
            }

            setFetchState('success');
        };

        void loadSongs();

        return () => {
            isMounted = false;
        };
    }, []);

    const handleAddToPlaylist = async (songId: number) => {
        if (!playlistId) {
            return;
        }

        try {
            setAddingSongId(songId);
            setAddMessage('');
            setAddMessageType('');

            const response = await fetch(
                `${API_BASE_URL}/api/playlists/${playlistId}/songs/${songId}`,
                {
                    method: 'POST'
                }
            );

            const responseText = await response.text();

            let backendMessage = '';

            try {
                const responseData = JSON.parse(responseText);
                backendMessage = responseData.message ?? '';
            } catch {
                backendMessage = responseText;
            }

            if (response.status === 409) {
                setAddMessageType('error');
                setAddMessage(
                    backendMessage || 'Dit nummer staat al in deze playlist.'
                );
                return;
            }

            if (!response.ok) {
                setAddMessageType('error');
                setAddMessage(
                    backendMessage ||
                    `Backend gaf foutcode ${response.status} terug.`
                );
                return;
            }

            setAddedSongIds((current) => {
                if (current.includes(songId)) {
                    return current;
                }

                return [...current, songId];
            });

            setAddMessageType('success');
            setAddMessage('Nummer succesvol toegevoegd aan playlist!');
        } catch (err) {
            setAddMessageType('error');
            setAddMessage(
                err instanceof Error
                    ? err.message
                    : 'Er is iets misgegaan.'
            );
        } finally {
            setAddingSongId(null);
        }
    };

    const filteredSongs = [...songs]
        .filter(
            (song) =>
                song.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (song.artistName ?? '')
                    .toLowerCase()
                    .includes(searchTerm.toLowerCase())
        )
        .sort((a, b) => a.title.localeCompare(b.title));

    return (
        <div className="pb-12">
            <section className="py-8">
                <div className="container mx-auto px-4">
                    <h1 className="text-3xl md:text-4xl font-bold mb-2">
                        Nummers
                    </h1>
                    <p className="text-muted-foreground">
                        Alle nummers die ooit in de TOP 2000 hebben gestaan
                    </p>
                </div>
            </section>

            <div className="container mx-auto px-4 mt-8">
                {fetchState === 'loading' && (
                    <div className="bg-card border border-border rounded-lg p-8 flex items-center justify-center gap-3 text-muted-foreground mb-8">
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Nummers worden geladen...
                    </div>
                )}

                {fetchState === 'error' && (
                    <div className="bg-destructive/5 border border-destructive/30 rounded-lg p-6 mb-8">
                        <div className="flex items-center gap-3 text-destructive font-semibold mb-2">
                            <AlertCircle className="w-5 h-5" />
                            Backend data kon niet worden geladen
                        </div>
                        <p className="text-sm text-muted-foreground">
                            {errorMessage}
                        </p>
                    </div>
                )}

                {isAddingToPlaylist && (
                    <div className="max-w-4xl mx-auto mb-6 bg-primary/10 border border-primary/20 rounded-lg p-4 flex items-center justify-between gap-4">
                        <div>
                            <p className="font-semibold">
                                Nummers toevoegen aan playlist
                            </p>

                            <p className="text-sm text-muted-foreground">
                                Klik op &quot;Toevoegen&quot; bij een nummer om het aan je
                                playlist toe te voegen.
                            </p>

                            {addMessage && (
                                <p
                                    className={`mt-3 rounded-lg border px-3 py-2 text-sm font-medium ${addMessageType === 'success'
                                            ? 'border-green-500/30 bg-green-500/10 text-green-700'
                                            : 'border-destructive/30 bg-destructive/10 text-destructive'
                                        }`}
                                >
                                    {addMessage}
                                </p>
                            )}
                        </div>

                        <button
                            type="button"
                            onClick={() => navigate(`/playlist/${playlistId}`)}
                            className="bg-secondary hover:bg-muted text-foreground px-4 py-2 rounded-lg transition-colors"
                        >
                            Terug naar playlist
                        </button>
                    </div>
                )}

                <div className="max-w-2xl mx-auto mb-8">
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />

                        <input
                            type="text"
                            placeholder="Zoek op titel of artiest..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 border border-border rounded-lg bg-input-background focus:outline-none focus:ring-2 focus:ring-primary shadow-sm"
                        />
                    </div>
                </div>

                <div className="mb-6 text-muted-foreground text-center">
                    {filteredSongs.length}{' '}
                    {filteredSongs.length === 1 ? 'nummer' : 'nummers'} gevonden
                </div>

                <div className="max-w-4xl mx-auto space-y-3">
                    {filteredSongs.map((song) => {
                        const isAdded = addedSongIds.includes(song.songId);
                        const isAdding = addingSongId === song.songId;

                        return (
                            <div
                                key={song.songId}
                                className="bg-card border border-border p-4 hover:shadow-sm transition-all group"
                            >
                                <div className="flex items-center gap-4">
                                    <Link
                                        to={`/nummer/${song.songId}`}
                                        className="flex-shrink-0"
                                    >
                                        {song.albumCover ? (
                                            <img
                                                src={song.albumCover}
                                                alt={song.title}
                                                className="w-16 h-16 md:w-20 md:h-20 rounded-lg object-cover"
                                            />
                                        ) : (
                                            <div className="w-16 h-16 md:w-20 md:h-20 bg-muted rounded-lg flex items-center justify-center">
                                                <Music className="w-8 h-8 text-muted-foreground" />
                                            </div>
                                        )}
                                    </Link>

                                    <div className="flex-grow min-w-0">
                                        <Link to={`/nummer/${song.songId}`}>
                                            <h3 className="font-bold text-lg group-hover:text-primary transition-colors truncate">
                                                {song.title}
                                            </h3>
                                        </Link>

                                        <p className="text-muted-foreground">
                                            {song.artistName ?? `Artiest ${song.artistId}`} •{' '}
                                            {song.releaseYear}
                                        </p>

                                        {typeof song.timesListed === 'number' && (
                                            <p className="text-sm text-muted-foreground">
                                                {song.timesListed} keer genoteerd
                                            </p>
                                        )}
                                    </div>

                                    {isAddingToPlaylist && (
                                        <button
                                            type="button"
                                            disabled={isAdding || isAdded}
                                            onClick={() => handleAddToPlaylist(song.songId)}
                                            className="inline-flex items-center gap-2 bg-gradient-to-r from-primary to-accent text-white px-4 py-2 rounded-lg hover:shadow-lg transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                                        >
                                            {isAdded ? (
                                                <>
                                                    <Check className="w-4 h-4" />
                                                    Toegevoegd
                                                </>
                                            ) : isAdding ? (
                                                <>
                                                    <Loader2 className="w-4 h-4 animate-spin" />
                                                    Toevoegen...
                                                </>
                                            ) : (
                                                <>
                                                    <Plus className="w-4 h-4" />
                                                    Toevoegen
                                                </>
                                            )}
                                        </button>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>

                {filteredSongs.length === 0 && (
                    <div className="text-center py-16">
                        <Music className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                        <h3 className="text-xl font-semibold mb-2">
                            Geen nummers gevonden
                        </h3>
                        <p className="text-muted-foreground">
                            Probeer een andere zoekterm
                        </p>
                    </div>
                )}

                {isDevelopment && (
                    <details className="mt-8 rounded-lg border border-dashed border-border bg-card/60 p-4 text-sm text-muted-foreground">
                        <summary className="cursor-pointer font-semibold text-foreground">
                            Debug: /api/songs
                        </summary>

                        <div className="mt-3 space-y-2">
                            <p>
                                <span className="font-medium text-foreground">
                                    Endpoint:
                                </span>{' '}
                                {diagnostic.url}
                            </p>

                            <p>
                                <span className="font-medium text-foreground">
                                    Status:
                                </span>{' '}
                                {diagnostic.ok
                                    ? `OK${diagnostic.status ? ` (${diagnostic.status})` : ''}`
                                    : `Fout${diagnostic.status ? ` (${diagnostic.status})` : ''}`}
                            </p>

                            <p>
                                <span className="font-medium text-foreground">
                                    Detail:
                                </span>{' '}
                                {diagnostic.detail}
                            </p>

                            <p>
                                <span className="font-medium text-foreground">
                                    Items:
                                </span>{' '}
                                {songs.length}
                            </p>

                            {loadedAt && (
                                <p>
                                    <span className="font-medium text-foreground">
                                        Laatst geladen:
                                    </span>{' '}
                                    {new Date(loadedAt).toLocaleString('nl-NL')}
                                </p>
                            )}
                        </div>
                    </details>
                )}
            </div>
        </div>
    );
}