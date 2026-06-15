import React, { useState } from 'react';
import { Play, PlayCircle } from 'lucide-react';
import { Button } from './ui/button';
import { SpotifyModal } from './SpotifyPlayer';
import { useSpotify } from '../spotify/SpotifyContext';

interface PlayButtonProps {
  title: string;
  artist: string;
  variant?: 'default' | 'icon';
  /** @deprecated YouTube URL is no longer used — Spotify is used instead */
  youtubeUrl?: string;
}

export function PlayButton({ title, artist, variant = 'default' }: PlayButtonProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const spotify = useSpotify();

  const handlePlay = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setModalOpen(true);
    // If already connected and ready, start playing immediately
    if (spotify.isConnected && spotify.isReady) {
      await spotify.playTrack(title, artist);
    }
  };

  if (variant === 'icon') {
    return (
      <>
        <button
          id={`play-btn-${title.replace(/\s+/g, '-').toLowerCase()}`}
          onClick={handlePlay}
          className="inline-flex items-center justify-center w-10 h-10 bg-[#1DB954] text-black hover:bg-[#1DB954]/80 rounded-full shadow-md hover:scale-105 transition-all cursor-pointer"
          title={`Speel ${title} af via Spotify`}
        >
          <Play className="w-4 h-4 fill-current ml-0.5" />
        </button>

        {modalOpen && (
          <SpotifyModal title={title} artist={artist} onClose={() => setModalOpen(false)} />
        )}
      </>
    );
  }

  return (
    <>
      <Button
        id={`play-btn-${title.replace(/\s+/g, '-').toLowerCase()}`}
        onClick={handlePlay}
        className="inline-flex items-center gap-2 px-6 py-3 bg-[#1DB954] hover:bg-[#1DB954]/80 text-black rounded-full font-bold cursor-pointer transition-all hover:scale-105"
      >
        <PlayCircle className="w-5 h-5" />
        Afspelen via Spotify
      </Button>

      {modalOpen && (
        <SpotifyModal title={title} artist={artist} onClose={() => setModalOpen(false)} />
      )}
    </>
  );
}
