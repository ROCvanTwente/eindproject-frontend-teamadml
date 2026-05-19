import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Save, X } from 'lucide-react';

export function CreatePlaylistPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    description: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) {
      alert('Naam is verplicht!');
      return;
    }

    alert('Playlist aangemaakt! (In een echte app zou dit worden opgeslagen)');
    navigate('/playlists');
  };

  return (
    <div className="pb-12">
      {/* Page Header */}
      <section className="bg-gradient-to-r from-secondary via-white to-secondary py-12 border-b border-border">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Nieuwe Playlist Maken</h1>
          <p className="text-muted-foreground text-lg">
            Maak een nieuwe playlist voor je favoriete nummers
          </p>
        </div>
      </section>

      <div className="container mx-auto px-4 mt-12">
        <div className="max-w-2xl mx-auto">
          <div className="bg-card border border-border rounded-lg p-8 shadow-md">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="name" className="block mb-2">
                  Playlist Naam *
                </label>
                <input
                  type="text"
                  id="name"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-input-background"
                  placeholder="Bijv. Mijn Favorieten"
                />
              </div>

              <div>
                <label htmlFor="description" className="block mb-2">
                  Beschrijving
                </label>
                <textarea
                  id="description"
                  rows={4}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-input-background resize-none"
                  placeholder="Beschrijf je playlist..."
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-primary to-accent text-white px-6 py-4 rounded-lg hover:shadow-xl transition-all flex items-center justify-center gap-2"
                >
                  <Save className="w-5 h-5" />
                  Playlist Aanmaken
                </button>
                <button
                  type="button"
                  onClick={() => navigate('/playlists')}
                  className="px-6 py-4 bg-muted text-foreground rounded-lg hover:bg-secondary transition-all flex items-center gap-2"
                >
                  <X className="w-5 h-5" />
                  Annuleren
                </button>
              </div>
            </form>
          </div>

          <div className="mt-8 bg-gradient-to-br from-primary/10 to-accent/10 border border-primary/20 rounded-lg p-6">
            <h3 className="font-semibold mb-2">💡 Tip</h3>
            <p className="text-sm text-muted-foreground">
              Na het aanmaken van je playlist kun je nummers toevoegen door naar de nummerpagina te gaan en op "Toevoegen aan playlist" te klikken.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
