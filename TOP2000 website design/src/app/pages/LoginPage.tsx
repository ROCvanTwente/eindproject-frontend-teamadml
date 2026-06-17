import { useState } from 'react';
import { LogIn } from 'lucide-react';

export function LoginPage() {
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: formData.username,
          password: formData.password
        })
      });

      if (response.ok) {
        const data = await response.json();

        // Sla alle benodigde gegevens op!
        localStorage.setItem('token', data.token);
        localStorage.setItem('username', data.username);
        localStorage.setItem('role', data.role); // <--- Dit zorgt voor de Admin check!

        // Stuur terug naar de homepagina zodat de layout herlaadt
        window.location.href = "/"; 
      } else {
        setErrorMessage('Verkeerde gebruikersnaam of wachtwoord ingevuld.');
      }
    } catch (error) {
      console.error("Fout bij inloggen:", error);
      setErrorMessage('Kan de server niet bereiken. Staat je backend aan?');
    }
  };

  return (
    <div className="pb-12">
      {/* Page Header */}
      <section className="relative overflow-hidden py-12 border-b border-zinc-800 bg-gradient-to-r from-red-900 via-red-655 to-red-900 text-white">
        <div className="absolute inset-0 bg-black/15 pointer-events-none" />
        <div className="container mx-auto px-4 relative z-10">
          <h1 className="text-4xl md:text-5xl font-black mb-3 bg-clip-text text-transparent bg-gradient-to-r from-white via-zinc-100 to-zinc-300 leading-tight">
            Inloggen
          </h1>
          <p className="text-red-100 text-lg">
            Log in om toegang te krijgen tot het admin paneel
          </p>
        </div>
      </section>

      <div className="container mx-auto px-4 mt-12">
        <div className="max-w-md mx-auto">
          <div className="bg-card border border-border rounded-lg p-8 shadow-md">
            
            {/* Foutmelding tonen als het inloggen mislukt */}
            {/* Display error message */}
            {errorMessage && (
              <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm">
                {errorMessage}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="username" className="block mb-2">
                  Gebruikersnaam
                </label>
                <input
                  type="text"
                  id="username"
                  required
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-input-background"
                  placeholder="Bijv. admin"
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