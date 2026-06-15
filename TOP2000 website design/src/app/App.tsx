import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import { Layout } from './components/Layout';
import { HomePage } from './pages/HomePage';
import { ListPage } from './pages/ListPage';
import { NewsPage } from './pages/NewsPage';
import { HistoryPage } from './pages/HistoryPage';
import { FAQPage } from './pages/FAQPage';
import { ContactPage } from './pages/ContactPage';
import { VotingPage } from './pages/VotingPage';
import { ArtistsPage } from './pages/ArtistsPage';
import { ArtistDetailPage } from './pages/ArtistDetailPage';
import { SongsPage } from './pages/SongsPage';
import { SongDetailPage } from './pages/SongDetailPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { StatisticsPage } from './pages/StatisticsPage';
import { AdminPanel } from './pages/AdminPanel';
import { PlaylistsPage } from './pages/PlaylistsPage';
import { CreatePlaylistPage } from './pages/CreatePlaylistPage';
import { PlaylistDetailPage } from './pages/PlaylistDetailPage';
import { PrivacyPage } from './pages/PrivacyPage';
import { TermsPage } from './pages/TermsPage';
import { SettingsPage } from './pages/SettingsPage';
import { SettingsProvider } from './context/SettingsContext';
import { Toaster } from './components/ui/sonner';
import { SpotifyProvider } from './spotify/SpotifyContext';
import { SpotifyMiniPlayer } from './components/SpotifyPlayer';
import { SpotifyCallbackPage } from './pages/SpotifyCallbackPage';

const BACKEND_ENDPOINTS = [
  { label: 'GET /api/artists', url: '/api/artists' },
  { label: 'GET /api/songs', url: '/api/songs' },
  { label: 'GET /api/top2000', url: '/api/top2000' },
];

const AdminRoute = () => {
  const token = localStorage.getItem('token');

  if (!token) {
    return <Navigate to="/" replace />;
  }

  try {
    const decoded: any = jwtDecode(token);
    const role = decoded.role || decoded['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'];

    if (role !== 'Admin') {
      return <Navigate to="/" replace />;
    }

    return <Outlet />;
  } catch (error) {
    return <Navigate to="/" replace />;
  }
};

export default function App() {
  return (
<<<<<<< Updated upstream
    <SettingsProvider>
      <BrowserRouter
        future={{
          v7_startTransition: true,
          v7_relativeSplatPath: true,
        }}
      >
      <Routes>
        <Route path="/" element={<Layout />}>
=======
    <BrowserRouter
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true,
      }}
    >
      <SpotifyProvider>
        <SpotifyMiniPlayer />
        <Routes>
          {/* Spotify OAuth callback — outside of Layout so no nav is shown */}
          <Route path="/spotify" element={<SpotifyCallbackPage />} />

          <Route path="/" element={<Layout />}>
>>>>>>> Stashed changes
          {/* VRIJE TOEGANG VOOR IEDEREEN */}
          <Route index element={<HomePage />} />
          <Route path="lijst" element={<ListPage />} />
          <Route path="artiesten" element={<ArtistsPage />} />
          <Route path="artiest/:id" element={<ArtistDetailPage />} />
          <Route path="nummers" element={<SongsPage />} />
          <Route path="nummer/:id" element={<SongDetailPage />} />
          <Route path="nieuws" element={<NewsPage />} />
          <Route path="geschiedenis" element={<HistoryPage />} />
          <Route path="stemmen" element={<VotingPage />} />
          <Route path="faq" element={<FAQPage />} />
          <Route path="contact" element={<ContactPage />} />
          <Route path="statistieken" element={<StatisticsPage />} />
          <Route path="privacy" element={<PrivacyPage />} />
          <Route path="voorwaarden" element={<TermsPage />} />
          <Route path="instellingen" element={<SettingsPage />} />
          <Route path="settings" element={<Navigate to="/instellingen" replace />} />
          <Route path="playlists" element={<PlaylistsPage />} />
          <Route path="playlists/new" element={<CreatePlaylistPage />} />
          <Route path="playlist/:id" element={<PlaylistDetailPage />} />
          <Route path="login" element={<LoginPage />} />
          <Route path="register" element={<RegisterPage />} />

          {/* 🔒 BEVEILIGDE ADMIN ROUTES */}
          <Route element={<AdminRoute />}>
            <Route path="admin" element={<AdminPanel />} />
            <Route path="admin/artiesten" element={<AdminPanel />} />
            <Route path="admin/nummers" element={<AdminPanel />} />
            <Route path="admin/logboek" element={<AdminPanel />} />
            <Route path="admin/gebruikers" element={<AdminPanel />} />
          </Route>
<<<<<<< Updated upstream

        </Route>
      </Routes>
      <Toaster />
=======
          
          </Route>
        </Routes>
        <Toaster />
      </SpotifyProvider>
>>>>>>> Stashed changes
    </BrowserRouter>
    </SettingsProvider>
  );
}