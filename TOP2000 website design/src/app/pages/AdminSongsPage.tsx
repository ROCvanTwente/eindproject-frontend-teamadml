import { useState } from 'react';
import { Plus, Edit, Trash2, Save, X } from 'lucide-react';
import { mockSongs, mockArtists, Song } from '../data/mockData';

export function AdminSongsPage() {
  const [songs, setSongs] = useState<Song[]>(mockSongs);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState<Partial<Song>>({
    title: '',
    artistId: 1,
    artistName: '',
    year: new Date().getFullYear(),
    albumCover: '',
    youtubeUrl: '',
    lyricsPreview: '',
    timesListed: 0
  });

  const handleEdit = (song: Song) => {
    setEditingId(song.id);
    setFormData(song);
    setIsAdding(false);
  };

  const handleDelete = (id: number) => {
    if (confirm('Weet je zeker dat je dit nummer wilt verwijderen?')) {
      setSongs(songs.filter(s => s.id !== id));
      alert('Nummer verwijderd!');
    }
  };

  const handleSave = () => {
    if (!formData.title || !formData.artistId) {
      alert('Titel en artiest zijn verplicht!');
      return;
    }

    const artist = mockArtists.find(a => a.id === formData.artistId);
    if (!artist) {
      alert('Artiest niet gevonden!');
      return;
    }

    if (isAdding) {
      const newSong: Song = {
        id: Math.max(...songs.map(s => s.id)) + 1,
        title: formData.title!,
        artistId: formData.artistId!,
        artistName: artist.name,
        year: formData.year || new Date().getFullYear(),
        albumCover: formData.albumCover,
        youtubeUrl: formData.youtubeUrl,
        lyricsPreview: formData.lyricsPreview,
        timesListed: formData.timesListed || 0
      };
      setSongs([...songs, newSong]);
      alert('Nummer toegevoegd!');
    } else if (editingId) {
      setSongs(songs.map(s =>
        s.id === editingId ? { ...s, ...formData, artistName: artist.name } as Song : s
      ));
      alert('Nummer bijgewerkt!');
    }

    handleCancel();
  };

  const handleCancel = () => {
    setEditingId(null);
    setIsAdding(false);
    setFormData({
      title: '',
      artistId: 1,
      artistName: '',
      year: new Date().getFullYear(),
      albumCover: '',
      youtubeUrl: '',
      lyricsPreview: '',
      timesListed: 0
    });
  };

  const handleAdd = () => {
    setIsAdding(true);
    setEditingId(null);
    setFormData({
      title: '',
      artistId: 1,
      artistName: '',
      year: new Date().getFullYear(),
      albumCover: '',
      youtubeUrl: '',
      lyricsPreview: '',
      timesListed: 0
    });
  };

  return (
    <div className="pb-12">
      {/* Page Header */}
      <section className="bg-gradient-to-r from-destructive/10 via-white to-destructive/10 py-12 border-b border-border">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Admin: Nummers Beheer</h1>
          <p className="text-muted-foreground text-lg">
            Beheer alle nummers in de database
          </p>
        </div>
      </section>

      <div className="container mx-auto px-4 mt-12">
        {/* Add Button */}
        <div className="mb-6">
          <button
            onClick={handleAdd}
            className="bg-gradient-to-r from-primary to-accent text-white px-6 py-3 rounded-lg hover:shadow-xl transition-all flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Nieuw Nummer Toevoegen
          </button>
        </div>

        {/* Add/Edit Form */}
        {(isAdding || editingId) && (
          <div className="bg-card border-2 border-primary rounded-lg p-6 mb-8 shadow-lg">
            <h2 className="text-2xl font-bold mb-6">
              {isAdding ? 'Nieuw Nummer Toevoegen' : 'Nummer Bewerken'}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="title" className="block mb-2">
                  Titel *
                </label>
                <input
                  type="text"
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-input-background"
                  placeholder="Nummer titel"
                />
              </div>

              <div>
                <label htmlFor="artistId" className="block mb-2">
                  Artiest *
                </label>
                <select
                  id="artistId"
                  value={formData.artistId}
                  onChange={(e) => setFormData({ ...formData, artistId: parseInt(e.target.value) })}
                  className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-input-background"
                >
                  {mockArtists.map(artist => (
                    <option key={artist.id} value={artist.id}>
                      {artist.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="year" className="block mb-2">
                  Jaar
                </label>
                <input
                  type="number"
                  id="year"
                  value={formData.year}
                  onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) || new Date().getFullYear() })}
                  className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-input-background"
                  placeholder="1975"
                />
              </div>

              <div>
                <label htmlFor="timesListed" className="block mb-2">
                  Keer in lijst
                </label>
                <input
                  type="number"
                  id="timesListed"
                  value={formData.timesListed}
                  onChange={(e) => setFormData({ ...formData, timesListed: parseInt(e.target.value) || 0 })}
                  className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-input-background"
                  placeholder="0"
                />
              </div>

              <div>
                <label htmlFor="albumCover" className="block mb-2">
                  Album Cover URL
                </label>
                <input
                  type="url"
                  id="albumCover"
                  value={formData.albumCover}
                  onChange={(e) => setFormData({ ...formData, albumCover: e.target.value })}
                  className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-input-background"
                  placeholder="https://..."
                />
              </div>

              <div>
                <label htmlFor="youtubeUrl" className="block mb-2">
                  YouTube URL
                </label>
                <input
                  type="url"
                  id="youtubeUrl"
                  value={formData.youtubeUrl}
                  onChange={(e) => setFormData({ ...formData, youtubeUrl: e.target.value })}
                  className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-input-background"
                  placeholder="https://www.youtube.com/watch?v=..."
                />
              </div>

              <div className="md:col-span-2">
                <label htmlFor="lyricsPreview" className="block mb-2">
                  Lyrics Preview
                </label>
                <textarea
                  id="lyricsPreview"
                  rows={3}
                  value={formData.lyricsPreview}
                  onChange={(e) => setFormData({ ...formData, lyricsPreview: e.target.value })}
                  className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-input-background resize-none"
                  placeholder="Eerste regels van de tekst..."
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={handleSave}
                className="bg-gradient-to-r from-primary to-accent text-white px-6 py-3 rounded-lg hover:shadow-xl transition-all flex items-center gap-2"
              >
                <Save className="w-5 h-5" />
                Opslaan
              </button>
              <button
                onClick={handleCancel}
                className="bg-muted text-foreground px-6 py-3 rounded-lg hover:bg-secondary transition-all flex items-center gap-2"
              >
                <X className="w-5 h-5" />
                Annuleren
              </button>
            </div>
          </div>
        )}

        {/* Songs List */}
        <div className="bg-card border border-border rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-secondary">
                <tr>
                  <th className="px-4 py-3 text-left">ID</th>
                  <th className="px-4 py-3 text-left">Titel</th>
                  <th className="px-4 py-3 text-left">Artiest</th>
                  <th className="px-4 py-3 text-left">Jaar</th>
                  <th className="px-4 py-3 text-left">Keer in lijst</th>
                  <th className="px-4 py-3 text-left">YouTube</th>
                  <th className="px-4 py-3 text-right">Acties</th>
                </tr>
              </thead>
              <tbody>
                {songs.map((song, index) => (
                  <tr key={song.id} className={index % 2 === 0 ? 'bg-secondary/30' : ''}>
                    <td className="px-4 py-3">{song.id}</td>
                    <td className="px-4 py-3 font-semibold">{song.title}</td>
                    <td className="px-4 py-3">{song.artistName}</td>
                    <td className="px-4 py-3">{song.year}</td>
                    <td className="px-4 py-3">{song.timesListed}</td>
                    <td className="px-4 py-3">
                      {song.youtubeUrl ? (
                        <a href={song.youtubeUrl} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline text-sm">
                          Link
                        </a>
                      ) : (
                        <span className="text-muted-foreground text-sm">-</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2 justify-end">
                        <button
                          onClick={() => handleEdit(song)}
                          className="p-2 text-primary hover:bg-primary/10 rounded-lg transition-colors"
                          title="Bewerken"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(song.id)}
                          className="p-2 text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                          title="Verwijderen"
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
      </div>
    </div>
  );
}
