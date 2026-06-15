import React, { useState } from 'react';
import { Play } from 'lucide-react';
import { Button } from './ui/button';
import { SpotifyModal } from './SpotifyPlayer';
import { useSpotify } from '../spotify/SpotifyContext';

interface InlineSongPlayerProps {
  title: string;
  artist: string;
  /** @deprecated YouTube URL is no longer used */
  youtubeUrl?: string;
}

export function InlineSongPlayer({ title, artist }: InlineSongPlayerProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const spotify = useSpotify();

  const handlePlay = async () => {
    setModalOpen(true);
    if (spotify.isConnected && spotify.isReady) {
      await spotify.playTrack(title, artist);
    }
  };

  return (
    <>
      <div className="bg-[#121212] border border-white/10 rounded-xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-lg">
        {/* Spotify branding */}
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-[#1DB954]/20 border border-[#1DB954]/30 flex items-center justify-center flex-shrink-0">
            <svg viewBox="0 0 24 24" className="w-6 h-6 fill-[#1DB954]">
              <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.562 17.322a.748.748 0 0 1-1.03.249c-2.817-1.722-6.363-2.111-10.538-1.157a.748.748 0 1 1-.333-1.459c4.567-1.042 8.483-.595 11.651 1.337a.748.748 0 0 1 .25 1.03zm1.484-3.308a.935.935 0 0 1-1.287.308c-3.224-1.981-8.14-2.555-11.953-1.398a.934.934 0 1 1-.543-1.788c4.358-1.324 9.774-.682 13.475 1.592a.935.935 0 0 1 .308 1.286zm.128-3.445C15.353 8.3 9.39 8.103 5.77 9.232a1.122 1.122 0 1 1-.651-2.147c4.177-1.268 11.122-1.024 15.507 1.602a1.122 1.122 0 0 1-1.452 1.682z"/>
            </svg>
          </div>
          <div>
            <p className="font-bold text-white">{title}</p>
            <p className="text-sm text-white/60">{artist}</p>
          </div>
        </div>

        <Button
          onClick={handlePlay}
          className="inline-flex items-center gap-2 px-6 py-3 bg-[#1DB954] hover:bg-[#1DB954]/80 text-black rounded-full font-bold transition-all hover:scale-105 cursor-pointer"
        >
          <Play className="w-4 h-4 fill-current ml-0.5" />
          Afspelen via Spotify
        </Button>
      </div>

      {modalOpen && (
        <SpotifyModal title={title} artist={artist} onClose={() => setModalOpen(false)} />
      )}
    </>
  );
}
