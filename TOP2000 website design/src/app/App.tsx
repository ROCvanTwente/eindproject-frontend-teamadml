import { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import { HomePage } from './pages/HomePage';
import { ListPage } from './pages/ListPage';
import { NewsPage } from './pages/NewsPage';
import { HistoryPage } from './pages/HistoryPage';
import { ProgramPage } from './pages/ProgramPage';
import { FAQPage } from './pages/FAQPage';
import { ContactPage } from './pages/ContactPage';
import { ArtistsPage } from './pages/ArtistsPage';
import { ArtistDetailPage } from './pages/ArtistDetailPage';
import { SongsPage } from './pages/SongsPage';
import { SongDetailPage } from './pages/SongDetailPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { StatisticsPage } from './pages/StatisticsPage';
import { AdminArtistsPage } from './pages/AdminArtistsPage';
import { AdminSongsPage } from './pages/AdminSongsPage';
import { PlaylistsPage } from './pages/PlaylistsPage';
import { CreatePlaylistPage } from './pages/CreatePlaylistPage';
import { PlaylistDetailPage } from './pages/PlaylistDetailPage';
import { PrivacyPage } from './pages/PrivacyPage';
import { TermsPage } from './pages/TermsPage';

const BACKEND_URL = 'https://top2000teamadml.runasp.net';
const ALLOWED_FRONTEND_ORIGIN = 'https://eindproject-frontend-teamadml.vercel.app';
const TOP2000_YEAR = 2024;
const BACKEND_ENDPOINTS = [
  { label: 'GET /api/artists', url: `${BACKEND_URL}/api/artists` },
  { label: 'GET /api/artists/search?name=queen', url: `${BACKEND_URL}/api/artists/search?name=queen` },
  { label: 'GET /api/songs', url: `${BACKEND_URL}/api/songs` },
  { label: `GET /api/top2000/${TOP2000_YEAR}`, url: `${BACKEND_URL}/api/top2000/${TOP2000_YEAR}` },
];

export default function App() {
  useEffect(() => {
    const controller = new AbortController();

    const checkBackendConnection = async () => {
      const currentOrigin = window.location.origin;

      const fetchEndpoint = async (label: string, url: string) => {
        try {
          const response = await fetch(url, {
            method: 'GET',
            cache: 'no-store',
            signal: controller.signal,
          });

          if (!response.ok) {
            const message = `${label} failed with ${response.status} ${response.statusText}`.trim();
            console.error(message, {
              endpoint: label,
              url,
              status: response.status,
              statusText: response.statusText,
              frontendOrigin: currentOrigin,
            });
            return {
              ok: false,
              label,
              url,
              message,
              data: undefined as unknown,
            };
          }

          const data = await response.json();
          const sample = Array.isArray(data) ? data[0] : data;

          console.info(`${label} succeeded`, {
            url,
            sample,
          });

          if (sample !== undefined) {
            console.log(`${label} sample data:`, sample);
          }

          const countText = Array.isArray(data)
            ? `returned ${data.length} item(s)`
            : 'returned an object';

          return {
            ok: true,
            label,
            url,
            message: `${label} succeeded and ${countText}`,
            data,
          };
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          const message = `${label} failed: ${errorMessage}`;
          console.error(message, error, {
            endpoint: label,
            url,
            frontendOrigin: currentOrigin,
          });
          return {
            ok: false,
            label,
            url,
            message,
            data: undefined as unknown,
          };
        }
      };

      try {
        const results = await Promise.all(
          BACKEND_ENDPOINTS.map(({ label, url }) => fetchEndpoint(label, url))
        );

        const message = results.map(result => result.message).join('\n');
        window.alert(message);
      } catch (error) {
        const originHint = currentOrigin !== ALLOWED_FRONTEND_ORIGIN
          ? `Likely CORS issue: backend currently allows ${ALLOWED_FRONTEND_ORIGIN}, but this app is running from ${currentOrigin}.`
          : 'The frontend origin matches the configured CORS origin, so the backend may be unreachable or rejecting the request.';
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        const message = `Backend check failed: ${errorMessage}. ${originHint}`;
        console.error(message, error, {
          backendUrl: BACKEND_URL,
          frontendOrigin: currentOrigin,
          allowedFrontendOrigin: ALLOWED_FRONTEND_ORIGIN,
        });
        window.alert(message);
      }
    };

    void checkBackendConnection();

    return () => {
      controller.abort();
    };
  }, []);

  return (
    <BrowserRouter
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true,
      }}
    >
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route path="lijst" element={<ListPage />} />
          <Route path="artiesten" element={<ArtistsPage />} />
          <Route path="artiest/:id" element={<ArtistDetailPage />} />
          <Route path="nummers" element={<SongsPage />} />
          <Route path="nummer/:id" element={<SongDetailPage />} />
          <Route path="nieuws" element={<NewsPage />} />
          <Route path="geschiedenis" element={<HistoryPage />} />
          <Route path="programma" element={<ProgramPage />} />
          <Route path="faq" element={<FAQPage />} />
          <Route path="contact" element={<ContactPage />} />
          <Route path="statistieken" element={<StatisticsPage />} />
          <Route path="privacy" element={<PrivacyPage />} />
          <Route path="voorwaarden" element={<TermsPage />} />
          <Route path="playlists" element={<PlaylistsPage />} />
          <Route path="playlists/new" element={<CreatePlaylistPage />} />
          <Route path="playlist/:id" element={<PlaylistDetailPage />} />
          <Route path="admin/artiesten" element={<AdminArtistsPage />} />
          <Route path="admin/nummers" element={<AdminSongsPage />} />
          <Route path="login" element={<LoginPage />} />
          <Route path="register" element={<RegisterPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}