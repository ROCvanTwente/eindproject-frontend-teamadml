import { useState } from 'react';
import { Play, Pause, Volume2, VolumeX, X } from 'lucide-react';

interface MusicPlayerProps {
  youtubeUrl?: string;
  title: string;
  artist: string;
}

export function MusicPlayer({ youtubeUrl, title, artist }: MusicPlayerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(70);

  if (!youtubeUrl) {
    return null;
  }

  // Extract video ID from YouTube URL
  const getYoutubeId = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11 ? match[2] : null;
  };

  const videoId = getYoutubeId(youtubeUrl);

  if (!videoId) {
    return null;
  }

  const embedUrl = `https://www.youtube.com/embed/${videoId}?autoplay=${isPlaying ? 1 : 0}`;

  return (
    <>
      {/* Play Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg hover:from-red-700 hover:to-red-800 transition-all font-bold shadow-lg"
      >
        <Play className="w-5 h-5" />
        Nu afspelen
      </button>

      {/* Player Modal */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card border border-border rounded-lg shadow-2xl max-w-2xl w-full">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-border">
              <div className="flex-grow min-w-0">
                <h3 className="font-bold text-lg truncate">{title}</h3>
                <p className="text-sm text-muted-foreground truncate">{artist}</p>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="ml-4 p-2 hover:bg-muted rounded-lg transition-colors flex-shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Video Player */}
            <div className="aspect-video bg-black overflow-hidden">
              <iframe
                width="100%"
                height="100%"
                src={embedUrl}
                title={title}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full h-full"
              />
            </div>

            {/* Controls */}
            <div className="p-6 border-t border-border space-y-4">
              {/* Play Controls */}
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="p-3 bg-primary text-white rounded-full hover:bg-primary/90 transition-colors"
                  title={isPlaying ? 'Pauze' : 'Afspelen'}
                >
                  {isPlaying ? (
                    <Pause className="w-6 h-6" />
                  ) : (
                    <Play className="w-6 h-6" />
                  )}
                </button>

                {/* Volume Control */}
                <div className="flex items-center gap-3 flex-grow">
                  {volume === 0 ? (
                    <VolumeX className="w-5 h-5 text-muted-foreground" />
                  ) : (
                    <Volume2 className="w-5 h-5 text-muted-foreground" />
                  )}
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={volume}
                    onChange={(e) => setVolume(parseInt(e.target.value))}
                    className="flex-grow h-2 bg-secondary rounded-lg appearance-none cursor-pointer"
                    title="Volume"
                  />
                  <span className="text-sm text-muted-foreground w-8 text-right">
                    {volume}%
                  </span>
                </div>
              </div>

              {/* Info */}
              <div className="text-sm text-muted-foreground bg-secondary/50 rounded p-3">
                <p>🎵 Afspelen via YouTube</p>
              </div>

              {/* Close Button */}
              <button
                onClick={() => setIsOpen(false)}
                className="w-full px-4 py-2 bg-secondary text-foreground rounded-lg hover:bg-secondary/80 transition-colors"
              >
                Sluiten
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
