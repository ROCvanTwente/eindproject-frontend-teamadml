import { useState } from 'react';
import { Plus, Edit, Trash2, Save, X } from 'lucide-react';
import { mockArtists, Artist } from '../data/mockData';

export function AdminArtistsPage() {
  const [artists, setArtists] = useState<Artist[]>(mockArtists);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState<Partial<Artist>>({
    name: '',
    bio: '',
    photoUrl: '',
    website: '',
    wikiUrl: '',
    numberOfSongs: 0
  });

  const handleEdit = (artist: Artist) => {
    setEditingId(artist.id);
    setFormData(artist);
    setIsAdding(false);
  };

  const handleDelete = (id: number) => {
    if (confirm('Weet je zeker dat je deze artiest wilt verwijderen?')) {
      setArtists(artists.filter(a => a.id !== id));
      alert('Artiest verwijderd!');
    }
  };

  const handleSave = () => {
    if (!formData.name) {
      alert('Naam is verplicht!');
      return;
    }

    if (isAdding) {
      const newArtist: Artist = {
        id: Math.max(...artists.map(a => a.id)) + 1,
        name: formData.name!,
        bio: formData.bio,
        photoUrl: formData.photoUrl,
        website: formData.website,
        wikiUrl: formData.wikiUrl,
        numberOfSongs: formData.numberOfSongs || 0
      };
      setArtists([...artists, newArtist]);
      alert('Artiest toegevoegd!');
    } else if (editingId) {
      setArtists(artists.map(a =>
        a.id === editingId ? { ...a, ...formData as Artist } : a
      ));
      alert('Artiest bijgewerkt!');
    }

    handleCancel();
  };

  const handleCancel = () => {
    setEditingId(null);
    setIsAdding(false);
    setFormData({
      name: '',
      bio: '',
      photoUrl: '',
      website: '',
      wikiUrl: '',
      numberOfSongs: 0
    });
  };

  const handleAdd = () => {
    setIsAdding(true);
    setEditingId(null);
    setFormData({
      name: '',
      bio: '',
      photoUrl: '',
      website: '',
      wikiUrl: '',
      numberOfSongs: 0
    });
  };

  return (
    <div className="pb-12">
      {/* Page Header */}
      <section className="bg-gradient-to-r from-destructive/10 via-white to-destructive/10 py-12 border-b border-border">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Admin: Artiesten Beheer</h1>
          <p className="text-muted-foreground text-lg">
            Beheer alle artiesten in de database
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
            Nieuwe Artiest Toevoegen
          </button>
        </div>

        {/* Add/Edit Form */}
        {(isAdding || editingId) && (
          <div className="bg-card border-2 border-primary rounded-lg p-6 mb-8 shadow-lg">
            <h2 className="text-2xl font-bold mb-6">
              {isAdding ? 'Nieuwe Artiest Toevoegen' : 'Artiest Bewerken'}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="name" className="block mb-2">
                  Naam *
                </label>
                <input
                  type="text"
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-input-background"
                  placeholder="Artiest naam"
                />
              </div>

              <div>
                <label htmlFor="numberOfSongs" className="block mb-2">
                  Aantal Nummers
                </label>
                <input
                  type="number"
                  id="numberOfSongs"
                  value={formData.numberOfSongs}
                  onChange={(e) => setFormData({ ...formData, numberOfSongs: parseInt(e.target.value) || 0 })}
                  className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-input-background"
                  placeholder="0"
                />
              </div>

              <div className="md:col-span-2">
                <label htmlFor="bio" className="block mb-2">
                  Biografie
                </label>
                <textarea
                  id="bio"
                  rows={4}
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-input-background resize-none"
                  placeholder="Biografie van de artiest..."
                />
              </div>

              <div>
                <label htmlFor="photoUrl" className="block mb-2">
                  Foto URL
                </label>
                <input
                  type="url"
                  id="photoUrl"
                  value={formData.photoUrl}
                  onChange={(e) => setFormData({ ...formData, photoUrl: e.target.value })}
                  className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-input-background"
                  placeholder="https://..."
                />
              </div>

              <div>
                <label htmlFor="website" className="block mb-2">
                  Website
                </label>
                <input
                  type="url"
                  id="website"
                  value={formData.website}
                  onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                  className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-input-background"
                  placeholder="https://..."
                />
              </div>

              <div>
                <label htmlFor="wikiUrl" className="block mb-2">
                  Wikipedia URL
                </label>
                <input
                  type="url"
                  id="wikiUrl"
                  value={formData.wikiUrl}
                  onChange={(e) => setFormData({ ...formData, wikiUrl: e.target.value })}
                  className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-input-background"
                  placeholder="https://nl.wikipedia.org/wiki/..."
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

        {/* Artists List */}
        <div className="bg-card border border-border rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-secondary">
                <tr>
                  <th className="px-4 py-3 text-left">ID</th>
                  <th className="px-4 py-3 text-left">Naam</th>
                  <th className="px-4 py-3 text-left">Aantal Nummers</th>
                  <th className="px-4 py-3 text-left">Website</th>
                  <th className="px-4 py-3 text-left">Wikipedia</th>
                  <th className="px-4 py-3 text-right">Acties</th>
                </tr>
              </thead>
              <tbody>
                {artists.map((artist, index) => (
                  <tr key={artist.id} className={index % 2 === 0 ? 'bg-secondary/30' : ''}>
                    <td className="px-4 py-3">{artist.id}</td>
                    <td className="px-4 py-3 font-semibold">{artist.name}</td>
                    <td className="px-4 py-3">{artist.numberOfSongs}</td>
                    <td className="px-4 py-3">
                      {artist.website ? (
                        <a href={artist.website} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline text-sm">
                          Link
                        </a>
                      ) : (
                        <span className="text-muted-foreground text-sm">-</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {artist.wikiUrl ? (
                        <a href={artist.wikiUrl} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline text-sm">
                          Wiki
                        </a>
                      ) : (
                        <span className="text-muted-foreground text-sm">-</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2 justify-end">
                        <button
                          onClick={() => handleEdit(artist)}
                          className="p-2 text-primary hover:bg-primary/10 rounded-lg transition-colors"
                          title="Bewerken"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(artist.id)}
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
