import { useSpotify } from '../spotify/SpotifyContext';
import {
  Play, Pause, Volume2, VolumeX, X, Music, Loader2, ExternalLink, AlertTriangle,
} from 'lucide-react';

// ─── Persistent mini-player (fixed bottom bar) ────────────────────────────────
export function SpotifyMiniPlayer() {
  const spotify = useSpotify();

  if (!spotify.isConnected || !spotify.currentTrack) return null;

  const track = spotify.currentTrack;
  const cover = track.album.images[0]?.url;
  const progressPct = spotify.duration > 0 ? (spotify.position / spotify.duration) * 100 : 0;

  const fmt = (ms: number) => {
    const s = Math.floor(ms / 1000);
    return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-black/90 backdrop-blur-xl border-t border-white/10 px-4 py-3 flex items-center gap-4">
      {/* Progress bar (top edge) */}
      <div className="absolute top-0 left-0 right-0 h-0.5 bg-white/10">
        <div
          className="h-full bg-[#1DB954] transition-all duration-1000"
          style={{ width: `${progressPct}%` }}
        />
      </div>

      {/* Album cover */}
      {cover ? (
        <img src={cover} alt={track.name} className="w-12 h-12 rounded-lg object-cover flex-shrink-0 shadow-lg" />
      ) : (
        <div className="w-12 h-12 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0">
          <Music className="w-5 h-5 text-white/50" />
        </div>
      )}

      {/* Track info */}
      <div className="flex-1 min-w-0">
        <p className="font-bold text-sm text-white truncate">{track.name}</p>
        <p className="text-xs text-white/60 truncate">{track.artists.map(a => a.name).join(', ')}</p>
      </div>

      {/* Time */}
      <span className="text-xs text-white/50 hidden sm:block flex-shrink-0">
        {fmt(spotify.position)} / {fmt(spotify.duration)}
      </span>

      {/* Play / Pause */}
      <button
        onClick={spotify.togglePlayPause}
        className="w-10 h-10 rounded-full bg-[#1DB954] hover:bg-[#1DB954]/80 flex items-center justify-center transition-colors flex-shrink-0 cursor-pointer"
      >
        {spotify.isLoading ? (
          <Loader2 className="w-4 h-4 text-black animate-spin" />
        ) : spotify.isPlaying ? (
          <Pause className="w-4 h-4 text-black fill-current" />
        ) : (
          <Play className="w-4 h-4 text-black fill-current" />
        )}
      </button>

      {/* Volume */}
      <div className="hidden md:flex items-center gap-2 flex-shrink-0">
        <button onClick={() => spotify.setVolume(spotify.volume === 0 ? 0.5 : 0)} className="text-white/60 hover:text-white transition-colors cursor-pointer">
          {spotify.volume === 0 ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
        </button>
        <input
          type="range"
          min={0}
          max={1}
          step={0.01}
          value={spotify.volume}
          onChange={e => spotify.setVolume(Number(e.target.value))}
          className="w-20 accent-[#1DB954] cursor-pointer"
        />
      </div>

      {/* Disconnect */}
      <button
        onClick={spotify.disconnect}
        title="Spotify loskoppelen"
        className="text-white/40 hover:text-white/80 transition-colors flex-shrink-0 cursor-pointer"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}

// ─── Modal popup ──────────────────────────────────────────────────────────────
interface SpotifyModalProps {
  title: string;
  artist: string;
  onClose: () => void;
}

export function SpotifyModal({ title, artist, onClose }: SpotifyModalProps) {
  const spotify = useSpotify();

  const track = spotify.currentTrack;
  const cover = track?.album.images[0]?.url;
  const progressPct = spotify.duration > 0 ? (spotify.position / spotify.duration) * 100 : 0;

  const fmt = (ms: number) => {
    const s = Math.floor(ms / 1000);
    return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
  };

  // Trigger play on mount if not already playing this track
  const isCurrentTrack = track?.name.toLowerCase() === title.toLowerCase();

  return (
    <div
      className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-sm p-4"
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="w-full max-w-sm bg-[#121212] rounded-2xl overflow-hidden shadow-2xl border border-white/10 animate-in slide-in-from-bottom-4 duration-300">

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
          <div className="flex items-center gap-2">
            <svg viewBox="0 0 24 24" className="w-5 h-5 fill-[#1DB954]">
              <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.562 17.322a.748.748 0 0 1-1.03.249c-2.817-1.722-6.363-2.111-10.538-1.157a.748.748 0 1 1-.333-1.459c4.567-1.042 8.483-.595 11.651 1.337a.748.748 0 0 1 .25 1.03zm1.484-3.308a.935.935 0 0 1-1.287.308c-3.224-1.981-8.14-2.555-11.953-1.398a.934.934 0 1 1-.543-1.788c4.358-1.324 9.774-.682 13.475 1.592a.935.935 0 0 1 .308 1.286zm.128-3.445C15.353 8.3 9.39 8.103 5.77 9.232a1.122 1.122 0 1 1-.651-2.147c4.177-1.268 11.122-1.024 15.507 1.602a1.122 1.122 0 0 1-1.452 1.682z"/>
            </svg>
            <span className="text-sm font-semibold text-white">Spotify</span>
          </div>
          <button onClick={onClose} className="text-white/50 hover:text-white transition-colors cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {!spotify.isConnected ? (
            /* ── Not connected ── */
            <div className="text-center py-4">
              <svg viewBox="0 0 24 24" className="w-16 h-16 fill-[#1DB954] mx-auto mb-4">
                <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.562 17.322a.748.748 0 0 1-1.03.249c-2.817-1.722-6.363-2.111-10.538-1.157a.748.748 0 1 1-.333-1.459c4.567-1.042 8.483-.595 11.651 1.337a.748.748 0 0 1 .25 1.03zm1.484-3.308a.935.935 0 0 1-1.287.308c-3.224-1.981-8.14-2.555-11.953-1.398a.934.934 0 1 1-.543-1.788c4.358-1.324 9.774-.682 13.475 1.592a.935.935 0 0 1 .308 1.286zm.128-3.445C15.353 8.3 9.39 8.103 5.77 9.232a1.122 1.122 0 1 1-.651-2.147c4.177-1.268 11.122-1.024 15.507 1.602a1.122 1.122 0 0 1-1.452 1.682z"/>
              </svg>
              <h2 className="text-white font-bold text-xl mb-2">Verbind met Spotify</h2>
              <p className="text-white/60 text-sm mb-2">
                <strong className="text-white">{title}</strong> — {artist}
              </p>
              <p className="text-white/40 text-xs mb-6">Vereist Spotify Premium</p>
              <button
                onClick={() => spotify.connect(window.location.pathname)}
                className="w-full py-3 rounded-full bg-[#1DB954] hover:bg-[#1DB954]/80 text-black font-bold text-sm transition-colors cursor-pointer"
              >
                Inloggen met Spotify
              </button>
            </div>
          ) : !spotify.isReady ? (
            /* ── Player loading ── */
            <div className="text-center py-8">
              <Loader2 className="w-10 h-10 text-[#1DB954] animate-spin mx-auto mb-4" />
              <p className="text-white/60 text-sm">Spotify speler opstarten…</p>
            </div>
          ) : spotify.error ? (
            /* ── Error ── */
            <div className="text-center py-4">
              <AlertTriangle className="w-10 h-10 text-yellow-400 mx-auto mb-3" />
              <p className="text-white font-semibold mb-2">Afspelen mislukt</p>
              <p className="text-white/60 text-sm mb-5">{spotify.error}</p>
              <button
                onClick={() => spotify.playTrack(title, artist)}
                className="px-6 py-2 rounded-full bg-[#1DB954] text-black font-bold text-sm hover:bg-[#1DB954]/80 transition-colors cursor-pointer"
              >
                Opnieuw proberen
              </button>
            </div>
          ) : (
            /* ── Player UI ── */
            <>
              {/* Album cover */}
              <div className="aspect-square w-full max-w-[220px] mx-auto mb-6 rounded-xl overflow-hidden shadow-2xl bg-white/5">
                {cover ? (
                  <img src={cover} alt={track?.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Music className="w-16 h-16 text-white/20" />
                  </div>
                )}
              </div>

              {/* Track name */}
              <div className="text-center mb-5">
                <p className="text-white font-bold text-lg truncate">
                  {isCurrentTrack ? track?.name : title}
                </p>
                <p className="text-white/60 text-sm truncate">
                  {isCurrentTrack ? track?.artists.map(a => a.name).join(', ') : artist}
                </p>
              </div>

              {/* Loading overlay */}
              {spotify.isLoading && (
                <div className="flex items-center justify-center gap-2 text-white/60 text-sm mb-4">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Nummer zoeken op Spotify…
                </div>
              )}

              {/* Progress bar */}
              <div className="mb-2">
                <input
                  type="range"
                  min={0}
                  max={spotify.duration || 1}
                  value={spotify.position}
                  onChange={e => spotify.seek(Number(e.target.value))}
                  className="w-full accent-[#1DB954] cursor-pointer"
                />
                <div className="flex justify-between text-xs text-white/40 mt-1">
                  <span>{fmt(spotify.position)}</span>
                  <span>{fmt(spotify.duration)}</span>
                </div>
              </div>

              {/* Controls */}
              <div className="flex items-center justify-center gap-4 mb-5">
                <button
                  onClick={spotify.togglePlayPause}
                  disabled={spotify.isLoading}
                  className="w-14 h-14 rounded-full bg-white hover:scale-105 flex items-center justify-center transition-all cursor-pointer disabled:opacity-50"
                >
                  {spotify.isLoading ? (
                    <Loader2 className="w-6 h-6 text-black animate-spin" />
                  ) : spotify.isPlaying ? (
                    <Pause className="w-6 h-6 text-black fill-current" />
                  ) : (
                    <Play className="w-6 h-6 text-black fill-current ml-0.5" />
                  )}
                </button>
              </div>

              {/* Volume */}
              <div className="flex items-center gap-3">
                <button onClick={() => spotify.setVolume(spotify.volume === 0 ? 0.5 : 0)} className="text-white/50 hover:text-white transition-colors cursor-pointer">
                  {spotify.volume === 0 ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                </button>
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.01}
                  value={spotify.volume}
                  onChange={e => spotify.setVolume(Number(e.target.value))}
                  className="flex-1 accent-[#1DB954] cursor-pointer"
                />
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        {spotify.isConnected && (
          <div className="px-6 pb-5 flex items-center justify-between">
            <button
              onClick={spotify.disconnect}
              className="text-xs text-white/30 hover:text-white/60 transition-colors cursor-pointer"
            >
              Loskoppelen
            </button>
            {track && (
              <a
                href={`https://open.spotify.com/track/${track.id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-xs text-white/30 hover:text-[#1DB954] transition-colors"
              >
                Open in Spotify <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
