import React, { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react';
import {
  getValidToken,
  clearSpotifyTokens,
  isSpotifyConnected,
  redirectToSpotifyLogin,
  type SpotifyTrack,
  searchTrack,
} from './spotifyAuth';

// ─── Types ─────────────────────────────────────────────────────────────────────
export interface SpotifyPlayerState {
  isConnected: boolean;
  isReady: boolean;
  isPlaying: boolean;
  currentTrack: SpotifyTrack | null;
  position: number;       // ms
  duration: number;       // ms
  volume: number;         // 0-1
  isLoading: boolean;
  error: string | null;
}

interface SpotifyContextValue extends SpotifyPlayerState {
  playTrack: (title: string, artist: string) => Promise<void>;
  togglePlayPause: () => void;
  seek: (positionMs: number) => void;
  setVolume: (v: number) => void;
  disconnect: () => void;
  connect: (returnPath?: string) => void;
}

// ─── Context ───────────────────────────────────────────────────────────────────
const SpotifyContext = createContext<SpotifyContextValue | null>(null);

export function useSpotify(): SpotifyContextValue {
  const ctx = useContext(SpotifyContext);
  if (!ctx) throw new Error('useSpotify must be used inside SpotifyProvider');
  return ctx;
}

// ─── Provider ──────────────────────────────────────────────────────────────────
export function SpotifyProvider({ children }: { children: React.ReactNode }) {
  const playerRef = useRef<Spotify.Player | null>(null);
  const deviceIdRef = useRef<string | null>(null);

  const [state, setState] = useState<SpotifyPlayerState>({
    isConnected: isSpotifyConnected(),
    isReady: false,
    isPlaying: false,
    currentTrack: null,
    position: 0,
    duration: 0,
    volume: 0.5,
    isLoading: false,
    error: null,
  });

  // Helper to patch state
  const patch = useCallback((partial: Partial<SpotifyPlayerState>) => {
    setState(prev => ({ ...prev, ...partial }));
  }, []);

  // ── Load Spotify SDK & initialise player ────────────────────────────────────
  useEffect(() => {
    if (!isSpotifyConnected()) return;

    // The SDK calls this global callback when it's ready
    (window as any).onSpotifyWebPlaybackSDKReady = async () => {
      const token = await getValidToken();
      if (!token) { patch({ isConnected: false }); return; }

      const player = new window.Spotify.Player({
        name: 'Top 2000 Player',
        volume: state.volume,
        getOAuthToken: async (cb: (t: string) => void) => {
          const t = await getValidToken();
          if (t) cb(t);
        },
      });

      // Events
      player.addListener('ready', ({ device_id }: { device_id: string }) => {
        deviceIdRef.current = device_id;
        patch({ isReady: true, error: null });
      });

      player.addListener('not_ready', () => {
        patch({ isReady: false });
      });

      player.addListener('player_state_changed', (s: Spotify.PlaybackState | null) => {
        if (!s) { patch({ isPlaying: false }); return; }
        const item = s.track_window?.current_track;
        patch({
          isPlaying: !s.paused,
          position: s.position,
          duration: s.duration,
          currentTrack: item
            ? {
                id: item.id ?? '',
                uri: item.uri,
                name: item.name,
                artists: item.artists,
                album: {
                  name: item.album.name,
                  images: item.album.images,
                },
                duration_ms: s.duration,
                preview_url: null,
              }
            : state.currentTrack,
        });
      });

      player.addListener('authentication_error', () => {
        patch({ error: 'Spotify authenticatie mislukt. Probeer opnieuw in te loggen.', isConnected: false });
        clearSpotifyTokens();
      });

      player.addListener('account_error', () => {
        patch({ error: 'Spotify Premium vereist voor afspelen.' });
      });

      player.addListener('playback_error', ({ message }: { message: string }) => {
        patch({ error: `Afspelen mislukt: ${message}`, isLoading: false });
      });

      await player.connect();
      playerRef.current = player;
    };

    // Inject SDK script if not yet loaded
    if (!document.getElementById('spotify-sdk-script')) {
      const script = document.createElement('script');
      script.id = 'spotify-sdk-script';
      script.src = 'https://sdk.scdn.co/spotify-player.js';
      script.async = true;
      document.body.appendChild(script);
    } else if ((window as any).Spotify) {
      // SDK already loaded — call init manually
      (window as any).onSpotifyWebPlaybackSDKReady();
    }

    return () => {
      playerRef.current?.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.isConnected]);

  // ── Seek timer ─────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!state.isPlaying) return;
    const id = setInterval(() => {
      setState(prev => ({ ...prev, position: Math.min(prev.position + 1000, prev.duration) }));
    }, 1000);
    return () => clearInterval(id);
  }, [state.isPlaying]);

  // ── Actions ────────────────────────────────────────────────────────────────
  const playTrack = useCallback(async (title: string, artist: string) => {
    if (!state.isConnected) {
      redirectToSpotifyLogin(window.location.pathname);
      return;
    }
    if (!deviceIdRef.current) {
      patch({ error: 'Spotify speler is nog niet klaar. Probeer opnieuw.' });
      return;
    }

    patch({ isLoading: true, error: null });

    const token = await getValidToken();
    if (!token) {
      patch({ isLoading: false, error: 'Spotify-sessie is verlopen. Log opnieuw in.', isConnected: false });
      clearSpotifyTokens();
      return;
    }

    const track = await searchTrack(title, artist, token);
    if (!track) {
      patch({ isLoading: false, error: `"${title}" kon niet worden gevonden op Spotify.` });
      return;
    }

    const res = await fetch(
      `https://api.spotify.com/v1/me/player/play?device_id=${deviceIdRef.current}`,
      {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ uris: [track.uri] }),
      }
    );

    if (!res.ok && res.status !== 204) {
      patch({ isLoading: false, error: 'Afspelen mislukt. Is Spotify Premium actief?' });
      return;
    }

    patch({ isLoading: false, currentTrack: track, isPlaying: true, position: 0, duration: track.duration_ms });
  }, [state.isConnected, patch]);

  const togglePlayPause = useCallback(() => {
    playerRef.current?.togglePlay();
  }, []);

  const seek = useCallback((positionMs: number) => {
    playerRef.current?.seek(positionMs);
    patch({ position: positionMs });
  }, [patch]);

  const setVolume = useCallback((v: number) => {
    playerRef.current?.setVolume(v);
    patch({ volume: v });
  }, [patch]);

  const disconnect = useCallback(() => {
    playerRef.current?.disconnect();
    clearSpotifyTokens();
    patch({ isConnected: false, isReady: false, isPlaying: false, currentTrack: null });
  }, [patch]);

  const connect = useCallback((returnPath?: string) => {
    redirectToSpotifyLogin(returnPath ?? window.location.pathname);
  }, []);

  return (
    <SpotifyContext.Provider value={{ ...state, playTrack, togglePlayPause, seek, setVolume, disconnect, connect }}>
      {children}
    </SpotifyContext.Provider>
  );
}
