import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { exchangeCodeForToken } from '../spotify/spotifyAuth';
import { Loader2, CheckCircle, AlertCircle } from 'lucide-react';

type Status = 'loading' | 'success' | 'error';

export function SpotifyCallbackPage() {
  const navigate = useNavigate();
  const [status, setStatus] = useState<Status>('loading');
  const [message, setMessage] = useState('Verbinding maken met Spotify…');

  useEffect(() => {
    const handleCallback = async () => {
      const params = new URLSearchParams(window.location.search);
      const code = params.get('code');
      const error = params.get('error');

      if (error || !code) {
        setStatus('error');
        setMessage(error === 'access_denied'
          ? 'Je hebt de Spotify-toegang geweigerd.'
          : 'Er ging iets mis bij het verbinden met Spotify.');
        setTimeout(() => navigate('/'), 3000);
        return;
      }

      const token = await exchangeCodeForToken(code);
      if (!token) {
        setStatus('error');
        setMessage('Token ophalen mislukt. Probeer opnieuw.');
        setTimeout(() => navigate('/'), 3000);
        return;
      }

      setStatus('success');
      setMessage('Verbonden met Spotify! Je wordt teruggestuurd…');

      const returnPath = sessionStorage.getItem('spotify_return_path') ?? '/';
      sessionStorage.removeItem('spotify_return_path');

      // Reload so SpotifyProvider reinitialises with the new token
      setTimeout(() => {
        window.location.href = returnPath;
      }, 1500);
    };

    void handleCallback();
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="bg-card border border-border rounded-2xl p-10 max-w-sm w-full text-center shadow-2xl">
        {/* Spotify logo */}
        <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-[#1DB954]/20 border border-[#1DB954]/30 flex items-center justify-center">
          <svg viewBox="0 0 24 24" className="w-8 h-8 fill-[#1DB954]">
            <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.562 17.322a.748.748 0 0 1-1.03.249c-2.817-1.722-6.363-2.111-10.538-1.157a.748.748 0 1 1-.333-1.459c4.567-1.042 8.483-.595 11.651 1.337a.748.748 0 0 1 .25 1.03zm1.484-3.308a.935.935 0 0 1-1.287.308c-3.224-1.981-8.14-2.555-11.953-1.398a.934.934 0 1 1-.543-1.788c4.358-1.324 9.774-.682 13.475 1.592a.935.935 0 0 1 .308 1.286zm.128-3.445C15.353 8.3 9.39 8.103 5.77 9.232a1.122 1.122 0 1 1-.651-2.147c4.177-1.268 11.122-1.024 15.507 1.602a1.122 1.122 0 0 1-1.452 1.682z"/>
          </svg>
        </div>

        {status === 'loading' && (
          <>
            <Loader2 className="w-8 h-8 animate-spin text-[#1DB954] mx-auto mb-4" />
            <h1 className="text-xl font-bold mb-2">Spotify verbinden</h1>
            <p className="text-muted-foreground text-sm">{message}</p>
          </>
        )}

        {status === 'success' && (
          <>
            <CheckCircle className="w-8 h-8 text-[#1DB954] mx-auto mb-4" />
            <h1 className="text-xl font-bold mb-2 text-[#1DB954]">Verbonden!</h1>
            <p className="text-muted-foreground text-sm">{message}</p>
          </>
        )}

        {status === 'error' && (
          <>
            <AlertCircle className="w-8 h-8 text-destructive mx-auto mb-4" />
            <h1 className="text-xl font-bold mb-2 text-destructive">Verbinding mislukt</h1>
            <p className="text-muted-foreground text-sm">{message}</p>
          </>
        )}
      </div>
    </div>
  );
}
