import { useState } from 'react';
import { UserPlus } from 'lucide-react';
import { Link } from 'react-router-dom';

export function RegisterPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      alert('Wachtwoorden komen niet overeen!');
      return;
    }
    alert('Registratie succesvol! Je kunt nu inloggen.');
    window.location.href = '/login';
  };

  return (
    <div className="pb-12">
      {/* Page Header */}
      <section className="bg-gradient-to-r from-secondary via-white to-secondary py-12 border-b border-border">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Account aanmaken</h1>
          <p className="text-muted-foreground text-lg">
            Maak een account aan om je eigen playlists te maken
          </p>
        </div>
      </section>

      <div className="container mx-auto px-4 mt-12">
        <div className="max-w-md mx-auto">
          <div className="bg-card border border-border rounded-lg p-8 shadow-md">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="name" className="block mb-2">
                  Naam
                </label>
                <input
                  type="text"
                  id="name"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-input-background"
                  placeholder="Jouw naam"
                />
              </div>

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
                  minLength={6}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-input-background"
                  placeholder="Minimaal 6 karakters"
                />
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block mb-2">
                  Bevestig wachtwoord
                </label>
                <input
                  type="password"
                  id="confirmPassword"
                  required
                  minLength={6}
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-input-background"
                  placeholder="Herhaal je wachtwoord"
                />
              </div>

              <div className="flex items-start">
                <input type="checkbox" id="terms" required className="mt-1 mr-2" />
                <label htmlFor="terms" className="text-sm text-muted-foreground">
                  Ik ga akkoord met de{' '}
                  <a href="#" className="text-primary hover:underline">
                    algemene voorwaarden
                  </a>{' '}
                  en het{' '}
                  <a href="#" className="text-primary hover:underline">
                    privacybeleid
                  </a>
                </label>
              </div>

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-primary to-accent text-white px-6 py-4 rounded-lg hover:shadow-xl transition-all font-semibold flex items-center justify-center gap-2"
              >
                <UserPlus className="w-5 h-5" />
                Account aanmaken
              </button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-muted-foreground">
                Heb je al een account?{' '}
                <Link to="/login" className="text-primary hover:underline font-semibold">
                  Log in
                </Link>
              </p>
            </div>
          </div>

          <div className="mt-8 bg-gradient-to-br from-primary/10 to-accent/10 border border-primary/20 rounded-lg p-6">
            <h3 className="font-semibold mb-2">Met een account krijg je:</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>• Onbeperkt persoonlijke playlists maken</li>
              <li>• Je favoriete nummers en artiesten bewaren</li>
              <li>• Stemmen op de TOP 2000</li>
              <li>• Gepersonaliseerde muziekaanbevelingen</li>
              <li>• Toegang tot exclusieve content</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
