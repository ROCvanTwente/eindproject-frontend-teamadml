import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { Save, X } from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '';

export function CreatePlaylistPage() {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        name: '',
        description: ''
    });

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError('');

        const name = formData.name.trim();

        if (!name) {
            setError('Naam is verplicht!');
            return;
        }

        try {
            setIsSubmitting(true);

            const response = await fetch(`${API_BASE_URL}/api/playlists`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    name,
                    description: formData.description.trim()
                })
            });

            if (!response.ok) {
                const message = await response.text();
                throw new Error(message || 'Playlist kon niet worden aangemaakt.');
            }

            navigate('/playlists');
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Er is iets misgegaan.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="pb-12">
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
                            {error && (
                                <div className="bg-destructive/10 text-destructive border border-destructive/20 rounded-lg p-4">
                                    {error}
                                </div>
                            )}

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
                                    disabled={isSubmitting}
                                    className="flex-1 bg-gradient-to-r from-primary to-accent text-white px-6 py-4 rounded-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                                >
                                    <Save className="w-5 h-5" />
                                    {isSubmitting ? 'Aanmaken...' : 'Playlist Aanmaken'}
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