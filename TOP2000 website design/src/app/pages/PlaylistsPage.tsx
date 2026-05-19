import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Music, Clock, Trash2 } from 'lucide-react';

interface Playlist {
  id: number;
  name: string;
  description: string;
  songCount: number;
  createdAt: string;
}

export function PlaylistsPage() {
  const [playlists, setPlaylists] = useState<Playlist[]>([
    {
      id: 1,
      name: 'Mijn Favorieten',
      description: 'De beste nummers uit de TOP 2000',
      songCount: 25,
      createdAt: '2024-01-15'
    },
    {
      id: 2,
      name: 'Rock Classics',
      description: 'Beste rocknummers aller tijden',
      songCount: 18,
      createdAt: '2024-02-20'
    },
    {
      id: 3,
      name: 'jaren 80',
      description: 'Hits uit de jaren 80',
      songCount: 32,
      createdAt: '2024-03-10'
    }
  ]);

  const handleDelete = (id: number) => {
    if (confirm('Weet je zeker dat je deze playlist wilt verwijderen?')) {
      setPlaylists(playlists.filter(p => p.id !== id));
      alert('Playlist verwijderd!');
    }
  };

  return (
    <div className="pb-12">
      {/* Page Header */}
      <section className="bg-gradient-to-r from-secondary via-white to-secondary py-12 border-b border-border">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Mijn Playlists</h1>
          <p className="text-muted-foreground text-lg">
            Beheer je persoonlijke playlists
          </p>
        </div>
      </section>

      <div className="container mx-auto px-4 mt-12">
        {/* Create Playlist Button */}
        <div className="mb-8">
          <Link
            to="/playlists/new"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-primary to-accent text-white px-6 py-3 rounded-lg hover:shadow-xl transition-all"
          >
            <Plus className="w-5 h-5" />
            Nieuwe Playlist Maken
          </Link>
        </div>

        {/* Playlists Grid */}
        {playlists.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {playlists.map(playlist => (
              <div
                key={playlist.id}
                className="bg-card border border-border rounded-lg shadow-md hover:shadow-xl transition-shadow overflow-hidden"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <Link to={`/playlist/${playlist.id}`}>
                        <h3 className="text-xl font-bold mb-2 hover:text-primary transition-colors">
                          {playlist.name}
                        </h3>
                      </Link>
                      <p className="text-muted-foreground text-sm line-clamp-2">
                        {playlist.description}
                      </p>
                    </div>
                    <button
                      onClick={() => handleDelete(playlist.id)}
                      className="p-2 text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                      title="Verwijderen"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="flex items-center gap-4 text-sm text-muted-foreground mt-4 pt-4 border-t border-border">
                    <div className="flex items-center gap-1">
                      <Music className="w-4 h-4" />
                      <span>{playlist.songCount} nummers</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      <span>{new Date(playlist.createdAt).toLocaleDateString('nl-NL')}</span>
                    </div>
                  </div>

                  <Link
                    to={`/playlist/${playlist.id}`}
                    className="mt-4 block text-center bg-secondary hover:bg-muted text-foreground px-4 py-2 rounded-lg transition-colors"
                  >
                    Bekijk Playlist
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-card border border-border rounded-lg p-12 text-center">
            <Music className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-xl font-bold mb-2">Geen playlists</h3>
            <p className="text-muted-foreground mb-6">
              Je hebt nog geen playlists aangemaakt. Maak je eerste playlist om te beginnen!
            </p>
            <Link
              to="/playlists/new"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-primary to-accent text-white px-6 py-3 rounded-lg hover:shadow-xl transition-all"
            >
              <Plus className="w-5 h-5" />
              Maak je eerste playlist
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
