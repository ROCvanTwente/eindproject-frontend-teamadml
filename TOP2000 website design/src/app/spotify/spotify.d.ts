// Global type declarations for Spotify Web Playback SDK
// See: https://developer.spotify.com/documentation/web-playback-sdk

interface Window {
  onSpotifyWebPlaybackSDKReady: () => void;
  Spotify: typeof Spotify;
}

declare namespace Spotify {
  interface Player {
    connect(): Promise<boolean>;
    disconnect(): void;
    addListener(event: string, cb: (data: any) => void): void;
    removeListener(event: string, cb?: (data: any) => void): void;
    getCurrentState(): Promise<PlaybackState | null>;
    setVolume(volume: number): Promise<void>;
    pause(): Promise<void>;
    resume(): Promise<void>;
    togglePlay(): Promise<void>;
    seek(positionMs: number): Promise<void>;
    previousTrack(): Promise<void>;
    nextTrack(): Promise<void>;
  }

  interface PlayerConstructorOptions {
    name: string;
    getOAuthToken(cb: (token: string) => void): void;
    volume?: number;
  }

  const Player: {
    new (options: PlayerConstructorOptions): Player;
  };

  interface PlaybackState {
    paused: boolean;
    position: number;
    duration: number;
    track_window: {
      current_track: WebPlaybackTrack;
      previous_tracks: WebPlaybackTrack[];
      next_tracks: WebPlaybackTrack[];
    };
  }

  interface WebPlaybackTrack {
    id: string | null;
    uri: string;
    name: string;
    type: string;
    artists: { name: string; uri: string }[];
    album: {
      name: string;
      uri: string;
      images: { url: string }[];
    };
  }
}
