import React, { createContext, useContext, useState, useEffect } from 'react';
import { loadSongsCatalog, loadArtistsCatalog, clearApiCaches, type BackendSong, type BackendArtist } from '../data/api';

type CatalogContextType = {
  songs: BackendSong[];
  artists: BackendArtist[];
  isLoading: boolean;
  error: string | null;
  refreshCatalog: () => Promise<void>;
};

const CatalogContext = createContext<CatalogContextType | undefined>(undefined);

export function CatalogProvider({ children }: { children: React.ReactNode }) {
  const [songs, setSongs] = useState<BackendSong[]>([]);
  const [artists, setArtists] = useState<BackendArtist[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCatalog = async () => {
    setIsLoading(true);
    setError(null);
    clearApiCaches();
    try {
      const [songsRes, artistsRes] = await Promise.all([
        loadSongsCatalog(),
        loadArtistsCatalog(),
      ]);

      if (!songsRes.ok) {
        throw new Error(songsRes.message ?? 'Fout bij het laden van nummers catalogus.');
      }
      if (!artistsRes.ok) {
        throw new Error(artistsRes.message ?? 'Fout bij het laden van artiesten catalogus.');
      }

      // Deduplicate artists by name (case-insensitive) to match the logic in ArtistsPage.tsx
      const seen = new Set<string>();
      const uniqueArtists = artistsRes.data.filter(a => {
        const key = a.name.trim().toLowerCase();
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });

      setSongs(songsRes.data);
      setArtists(uniqueArtists);
    } catch (err) {
      console.error('Failed to load catalog:', err);
      setError(err instanceof Error ? err.message : 'Er is een onbekende fout opgetreden.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void fetchCatalog();
  }, []);

  return (
    <CatalogContext.Provider value={{ songs, artists, isLoading, error, refreshCatalog: fetchCatalog }}>
      {children}
    </CatalogContext.Provider>
  );
}

export function useCatalog() {
  const context = useContext(CatalogContext);
  if (context === undefined) {
    throw new Error('useCatalog must be used within a CatalogProvider');
  }
  return context;
}
