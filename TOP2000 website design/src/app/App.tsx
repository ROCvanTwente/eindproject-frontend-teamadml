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
import { Toaster } from './components/ui/sonner';

const BACKEND_ENDPOINTS = [
  { label: 'GET /api/artists', url: '/api/artists' },
  { label: 'GET /api/songs', url: '/api/songs' },
  { label: 'GET /api/top2000', url: '/api/top2000' },
];

export default function App() {
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
          <Route path="stemmen" element={<VotingPage />} />
          <Route path="faq" element={<FAQPage />} />
          <Route path="contact" element={<ContactPage />} />
          <Route path="statistieken" element={<StatisticsPage />} />
          <Route path="privacy" element={<PrivacyPage />} />
          <Route path="voorwaarden" element={<TermsPage />} />
          <Route path="playlists" element={<PlaylistsPage />} />
          <Route path="playlists/new" element={<CreatePlaylistPage />} />
          <Route path="playlist/:id" element={<PlaylistDetailPage />} />
          <Route path="admin" element={<AdminPanel />} />
          <Route path="admin/artiesten" element={<AdminPanel />} />
          <Route path="admin/nummers" element={<AdminPanel />} />
          <Route path="admin/logboek" element={<AdminPanel />} />
          <Route path="admin/gebruikers" element={<AdminPanel />} />
          <Route path="login" element={<LoginPage />} />
          <Route path="register" element={<RegisterPage />} />
        </Route>
      </Routes>
      <Toaster />
    </BrowserRouter>
  );
}