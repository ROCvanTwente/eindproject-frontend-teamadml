import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Play, Trash2, Plus, Music } from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '';

interface PlaylistSong {
    songId: number;
    title: string;
    artistId: number;
    artistName: string;
    year: number | null;
    youtubeUrl: string | null;
    addedAt: string;
}

interface PlaylistDetail {
    id: number;
    name: string;
    description: string;
    songCount: number;
    createdAt: string;
    songs: PlaylistSong[];
}

export function PlaylistDetailPage() {
    const { id } = useParams();

    const [playlist, setPlaylist] = useState<PlaylistDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const loadPlaylist = async () => {
        if (!id) {
            setError('Geen playlist id gevonden.');
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            setError('');

            const response = await fetch(`${API_BASE_URL}/api/playlists/${id}`);

            if (!response.ok) {
                throw new Error('Playlist kon niet worden opgehaald.');
            }

            const data: PlaylistDetail = await response.json();
            setPlaylist(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Er is iets misgegaan.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadPlaylist();
    }, [id]);

    const handleRemoveSong = async (songId: number) => {
        if (!id) {
            return;
        }

        if (!confirm('Weet je zeker dat je dit nummer wilt verwijderen uit de playlist?')) {
            return;
        }

        try {
            const response = await fetch(`${API_BASE_URL}/api/playlists/${id}/songs/${songId}`, {
                method: 'DELETE'
            });

            if (!response.ok) {
                throw new Error('Nummer kon niet worden verwijderd uit de playlist.');
            }

            setPlaylist((currentPlaylist) => {
                if (!currentPlaylist) {
                    return currentPlaylist;
                }

                const updatedSongs = currentPlaylist.songs.filter((song) => song.songId !== songId);

                return {
                    ...currentPlaylist,
                    songs: updatedSongs,
                    songCount: updatedSongs.length
                };
            });
        } catch (err) {
            alert(err instanceof Error ? err.message : 'Er is iets misgegaan.');
        }
    };

    if (loading) {
        return (
            <div className="pb-12">
                <section className="bg-gradient-to-r from-secondary via-white to-secondary py-12 border-b border-border">
                    <div className="container mx-auto px-4">
                        <h1 className="text-4xl md:text-5xl font-bold mb-4">Playlist laden...</h1>
                        <p className="text-muted-foreground text-lg">
                            Even geduld terwijl de playlist wordt opgehaald.
                        </p>
                    </div>
                </section>
            </div>
        );
    }

    if (error || !playlist) {
        return (
            <div className="pb-12">
                <section className="bg-gradient-to-r from-secondary via-white to-secondary py-12 border-b border-border">
                    <div className="container mx-auto px-4">
                        <h1 className="text-4xl md:text-5xl font-bold mb-4">Playlist niet gevonden</h1>
                        <p className="text-muted-foreground text-lg">
                            {error || 'Deze playlist bestaat niet.'}
                        </p>
                    </div>
                </section>

                <div className="container mx-auto px-4 mt-12">
                    <Link
                        to="/playlists"
                        className="inline-flex items-center gap-2 bg-gradient-to-r from-primary to-accent text-white px-6 py-3 rounded-lg hover:shadow-xl transition-all"
                    >
                        Terug naar playlists
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="pb-12">
            <section className="bg-gradient-to-r from-secondary via-white to-secondary py-12 border-b border-border">
                <div className="container mx-auto px-4">
                    <h1 className="text-4xl md:text-5xl font-bold mb-4">{playlist.name}</h1>

                    <p className="text-muted-foreground text-lg mb-2">
                        {playlist.description || 'Geen beschrijving'}
                    </p>

                    <p className="text-sm text-muted-foreground">
                        {playlist.songs.length} nummers • Aangemaakt op{' '}
                        {new Date(playlist.createdAt).toLocaleDateString('nl-NL')}
                    </p>
                </div>
            </section>

            <div className="container mx-auto px-4 mt-12">
                <div className="mb-6 flex gap-3">
                    <Link
                        to="/nummers"
                        className="inline-flex items-center gap-2 bg-gradient-to-r from-primary to-accent text-white px-6 py-3 rounded-lg hover:shadow-xl transition-all"
                    >
                        <Plus className="w-5 h-5" />
                        Nummers Toevoegen
                    </Link>

                    <Link
                        to="/playlists"
                        className="inline-flex items-center gap-2 bg-secondary hover:bg-muted text-foreground px-6 py-3 rounded-lg transition-all"
                    >
                        Terug naar playlists
                    </Link>
                </div>

                {playlist.songs.length > 0 ? (
                    <div className="bg-card border border-border rounded-lg shadow-md overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-secondary">
                                    <tr>
                                        <th className="px-4 py-3 text-left w-12">#</th>
                                        <th className="px-4 py-3 text-left">Titel</th>
                                        <th className="px-4 py-3 text-left">Artiest</th>
                                        <th className="px-4 py-3 text-left">Jaar</th>
                                        <th className="px-4 py-3 text-right">Acties</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {playlist.songs.map((song, index) => (
                                        <tr
                                            key={song.songId}
                                            className={index % 2 === 0 ? 'bg-secondary/30' : ''}
                                        >
                                            <td className="px-4 py-3 text-muted-foreground">
                                                {index + 1}
                                            </td>

                                            <td className="px-4 py-3">
                                                <Link
                                                    to={`/nummer/${song.songId}`}
                                                    className="font-semibold hover:text-primary transition-colors"
                                                >
                                                    {song.title}
                                                </Link>
                                            </td>

                                            <td className="px-4 py-3">
                                                <Link
                                                    to={`/artiest/${song.artistId}`}
                                                    className="hover:text-primary transition-colors"
                                                >
                                                    {song.artistName}
                                                </Link>
                                            </td>

                                            <td className="px-4 py-3">
                                                {song.year ?? 'Onbekend'}
                                            </td>

                                            <td className="px-4 py-3">
                                                <div className="flex gap-2 justify-end">
                                                    {song.youtubeUrl && (
                                                        <a
                                                            href={song.youtubeUrl}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="p-2 text-primary hover:bg-primary/10 rounded-lg transition-colors"
                                                            title="Afspelen op YouTube"
                                                        >
                                                            <Play className="w-4 h-4" />
                                                        </a>
                                                    )}

                                                    <button
                                                        onClick={() => handleRemoveSong(song.songId)}
                                                        className="p-2 text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                                                        title="Verwijderen uit playlist"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                ) : (
                    <div className="bg-card border border-border rounded-lg p-12 text-center">
                        <Music className="w-16 h-16 mx-auto text-muted-foreground mb-4" />

                        <h3 className="text-xl font-bold mb-2">Geen nummers in deze playlist</h3>

                        <p className="text-muted-foreground mb-6">
                            Voeg nummers toe aan je playlist om te beginnen!
                        </p>

                        <Link
                            to="/nummers"
                            className="inline-flex items-center gap-2 bg-gradient-to-r from-primary to-accent text-white px-6 py-3 rounded-lg hover:shadow-xl transition-all"
                        >
                            <Plus className="w-5 h-5" />
                            Nummers Toevoegen
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
}