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
    console.log('[Spotify Debug] useEffect fired. isSpotifyConnected():', isSpotifyConnected());
    if (!isSpotifyConnected()) { console.log('[Spotify Debug] Not connected, skipping SDK init.'); return; }

    // The SDK calls this global callback when it's ready
    (window as any).onSpotifyWebPlaybackSDKReady = async () => {
      console.log('[Spotify Debug] onSpotifyWebPlaybackSDKReady fired!');
      const token = await getValidToken();
      console.log('[Spotify Debug] Token obtained:', token ? token.substring(0, 15) + '...' : 'NULL');
      if (!token) { console.error('[Spotify Debug] No valid token, aborting SDK init.'); patch({ isConnected: false }); return; }

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
        console.log('[Spotify Debug] Player READY! Device ID:', device_id);
        deviceIdRef.current = device_id;
        patch({ isReady: true, error: null });
      });

      player.addListener('not_ready', () => {
        console.warn('[Spotify Debug] Player NOT_READY');
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

      player.addListener('authentication_error', (e: any) => {
        console.error('[Spotify Debug] AUTHENTICATION_ERROR:', e);
        patch({ error: 'Spotify authenticatie mislukt. Probeer opnieuw in te loggen.', isConnected: false });
        clearSpotifyTokens();
      });

      player.addListener('account_error', (e: any) => {
        console.error('[Spotify Debug] ACCOUNT_ERROR (Premium required?):', e);
        patch({ error: 'Spotify Premium vereist voor afspelen.' });
      });

      player.addListener('playback_error', ({ message }: { message: string }) => {
        console.error('[Spotify Debug] PLAYBACK_ERROR:', message);
        patch({ error: `Afspelen mislukt: ${message}`, isLoading: false });
      });

      console.log('[Spotify Debug] Calling player.connect()...');
      const connected = await player.connect();
      console.log('[Spotify Debug] player.connect() result:', connected);
      playerRef.current = player;
    };

    // Inject SDK script if not yet loaded
    if (!document.getElementById('spotify-sdk-script')) {
      console.log('[Spotify Debug] Injecting SDK script...');
      const script = document.createElement('script');
      script.id = 'spotify-sdk-script';
      script.src = 'https://sdk.scdn.co/spotify-player.js';
      script.async = true;
      document.body.appendChild(script);
    } else if ((window as any).Spotify) {
      console.log('[Spotify Debug] SDK already loaded, calling init manually...');
      (window as any).onSpotifyWebPlaybackSDKReady();
    } else {
      console.warn('[Spotify Debug] SDK script tag exists but Spotify global not yet available.');
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
    console.log('[Spotify Debug] playTrack called:', { title, artist, isConnected: state.isConnected, deviceId: deviceIdRef.current });
    if (!state.isConnected) {
      console.log('[Spotify Debug] Not connected, redirecting to Spotify login...');
      redirectToSpotifyLogin(window.location.pathname);
      return;
    }
    if (!deviceIdRef.current) {
      console.error('[Spotify Debug] No device ID! Player not ready.');
      patch({ error: 'Spotify speler is nog niet klaar. Probeer opnieuw.' });
      return;
    }

    patch({ isLoading: true, error: null });

    const token = await getValidToken();
    console.log('[Spotify Debug] playTrack token:', token ? token.substring(0, 15) + '...' : 'NULL');
    if (!token) {
      console.error('[Spotify Debug] Token expired/missing during playTrack.');
      patch({ isLoading: false, error: 'Spotify-sessie is verlopen. Log opnieuw in.', isConnected: false });
      clearSpotifyTokens();
      return;
    }

    const track = await searchTrack(title, artist, token);
    console.log('[Spotify Debug] searchTrack result:', track ? { id: track.id, uri: track.uri, name: track.name } : 'NULL');
    if (!track) {
      // Check if failure was due to rate limiting
      const isRateLimited = Date.now() < (globalThis as any).__spotifyRateLimitResetAt;
      patch({ 
        isLoading: false, 
        error: isRateLimited 
          ? 'Spotify is tijdelijk overbelast. Wacht een paar seconden en probeer opnieuw.'
          : `"${title}" kon niet worden gevonden op Spotify.`
      });
      return;
    }

    const playUrl = `https://api.spotify.com/v1/me/player/play?device_id=${deviceIdRef.current}`;
    console.log('[Spotify Debug] Calling play API:', playUrl);
    const res = await fetch(
      playUrl,
      {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ uris: [track.uri] }),
      }
    );

    console.log('[Spotify Debug] Play API response:', res.status, res.statusText);
    if (!res.ok && res.status !== 204) {
      const errorBody = await res.text().catch(() => '');
      console.error('[Spotify Debug] Play API FAILED:', res.status, errorBody);
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
