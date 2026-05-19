import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Play, Trash2, Plus, Music } from 'lucide-react';
import { mockSongs } from '../data/mockData';

export function PlaylistDetailPage() {
  const { id } = useParams();

  // Mock playlist data
  const playlist = {
    id: parseInt(id || '1'),
    name: 'Mijn Favorieten',
    description: 'De beste nummers uit de TOP 2000',
    createdAt: '2024-01-15'
  };

  // Mock songs in playlist (first 5 songs from mockSongs)
  const [playlistSongs, setPlaylistSongs] = useState(mockSongs.slice(0, 5));

  const handleRemoveSong = (songId: number) => {
    if (confirm('Weet je zeker dat je dit nummer wilt verwijderen uit de playlist?')) {
      setPlaylistSongs(playlistSongs.filter(s => s.id !== songId));
      alert('Nummer verwijderd uit playlist!');
    }
  };

  return (
    <div className="pb-12">
      {/* Page Header */}
      <section className="bg-gradient-to-r from-secondary via-white to-secondary py-12 border-b border-border">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">{playlist.name}</h1>
          <p className="text-muted-foreground text-lg mb-2">
            {playlist.description}
          </p>
          <p className="text-sm text-muted-foreground">
            {playlistSongs.length} nummers • Aangemaakt op {new Date(playlist.createdAt).toLocaleDateString('nl-NL')}
          </p>
        </div>
      </section>

      <div className="container mx-auto px-4 mt-12">
        {/* Add Songs Button */}
        <div className="mb-6">
          <Link
            to="/nummers"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-primary to-accent text-white px-6 py-3 rounded-lg hover:shadow-xl transition-all"
          >
            <Plus className="w-5 h-5" />
            Nummers Toevoegen
          </Link>
        </div>

        {/* Songs List */}
        {playlistSongs.length > 0 ? (
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
                  {playlistSongs.map((song, index) => (
                    <tr key={song.id} className={index % 2 === 0 ? 'bg-secondary/30' : ''}>
                      <td className="px-4 py-3 text-muted-foreground">{index + 1}</td>
                      <td className="px-4 py-3">
                        <Link to={`/nummer/${song.id}`} className="font-semibold hover:text-primary transition-colors">
                          {song.title}
                        </Link>
                      </td>
                      <td className="px-4 py-3">
                        <Link to={`/artiest/${song.artistId}`} className="hover:text-primary transition-colors">
                          {song.artistName}
                        </Link>
                      </td>
                      <td className="px-4 py-3">{song.year}</td>
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
                            onClick={() => handleRemoveSong(song.id)}
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
