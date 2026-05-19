import { useState } from 'react';
import { LogIn } from 'lucide-react';

export function LoginPage() {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert('Login functionaliteit wordt binnenkort toegevoegd!');
  };

  return (
    <div className="pb-12">
      {/* Page Header */}
      <section className="bg-gradient-to-r from-secondary via-white to-secondary py-12 border-b border-border">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Inloggen</h1>
          <p className="text-muted-foreground text-lg">
            Log in om toegang te krijgen tot je persoonlijke playlists
          </p>
        </div>
      </section>

      <div className="container mx-auto px-4 mt-12">
        <div className="max-w-md mx-auto">
          <div className="bg-card border border-border rounded-lg p-8 shadow-md">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="email" className="block mb-2">
                  E-mailadres
                </label>
                <input
                  type="email"
                  id="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-input-background"
                  placeholder="jouw@email.nl"
                />
              </div>

              <div>
                <label htmlFor="password" className="block mb-2">
                  Wachtwoord
                </label>
                <input
                  type="password"
                  id="password"
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-input-background"
                  placeholder="••••••••"
                />
              </div>

              <div className="flex items-center justify-between">
                <label className="flex items-center">
                  <input type="checkbox" className="mr-2" />
                  <span className="text-sm">Onthoud mij</span>
                </label>
                <a href="#" className="text-sm text-primary hover:underline">
                  Wachtwoord vergeten?
                </a>
              </div>

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-primary to-accent text-white px-6 py-4 rounded-lg hover:shadow-xl transition-all font-semibold flex items-center justify-center gap-2"
              >
                <LogIn className="w-5 h-5" />
                Inloggen
              </button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-muted-foreground">
                Nog geen account?{' '}
                <a href="/register" className="text-primary hover:underline font-semibold">
                  Meld je aan
                </a>
              </p>
            </div>
          </div>

          <div className="mt-8 bg-gradient-to-br from-primary/10 to-accent/10 border border-primary/20 rounded-lg p-6">
            <h3 className="font-semibold mb-2">Waarom inloggen?</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>• Maak je eigen playlists met TOP 2000 nummers</li>
              <li>• Bewaar je favoriete artiesten</li>
              <li>• Stem op jouw favoriete nummers</li>
              <li>• Ontvang persoonlijke aanbevelingen</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
