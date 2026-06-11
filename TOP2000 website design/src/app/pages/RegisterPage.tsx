import { useState } from 'react';
import { UserPlus } from 'lucide-react';
import { Link } from 'react-router-dom';

export function RegisterPage() {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    confirmPassword: ''
  });

  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (formData.password !== formData.confirmPassword) {
      setErrorMessage('Wachtwoorden komen niet overeen!');
      return;
    }

    try {
      const response = await fetch('/api/auth/register', {
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
        setSuccessMessage('Account succesvol aangemaakt! Je wordt doorgestuurd naar inloggen...');
        setTimeout(() => {
          window.location.href = '/login';
        }, 2000);
      } else {
        setErrorMessage('Er ging iets mis. Bestaat deze gebruikersnaam misschien al?');
      }
    } catch (error) {
      console.error("Fout bij registreren:", error);
      setErrorMessage('Kan de server niet bereiken. Staat je backend aan?');
    }
  };

  return (
    <div className="pb-12">
      {/* Page Header */}
      <section className="bg-gradient-to-r from-secondary via-white to-secondary py-12 border-b border-border">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Account aanmaken</h1>
          <p className="text-muted-foreground text-lg">
            Maak een account aan om toegang te krijgen
          </p>
        </div>
      </section>

      <div className="container mx-auto px-4 mt-12">
        <div className="max-w-md mx-auto">
          <div className="bg-card border border-border rounded-lg p-8 shadow-md">
            
            {/* Meldingen tonen */}
            {/* Display status messages */}
            {errorMessage && (
              <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm">
                {errorMessage}
              </div>
            )}
            {successMessage && (
              <div className="mb-6 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg text-sm">
                {successMessage}
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
                  placeholder="Kies een gebruikersnaam"
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
        </div>
      </div>
    </div>
  );
}