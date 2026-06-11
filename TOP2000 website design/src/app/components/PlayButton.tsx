import { useEffect, useRef, useState } from 'react';
import { Play, Pause, Loader2 } from 'lucide-react';
import { resolvePlaybackSource, type PlaybackSource } from '../utils/songPlayback';

interface PlayButtonProps {
  youtubeUrl?: string;
  title: string;
  artist: string;
  variant?: 'icon' | 'button';
}

export function PlayButton({ youtubeUrl, title, artist, variant = 'icon' }: PlayButtonProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [source, setSource] = useState<PlaybackSource | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || source?.type !== 'audio') {
      return;
    }

    if (isPlaying) {
      void audio.play().catch(() => setIsPlaying(false));
    } else {
      audio.pause();
    }
  }, [isPlaying, source]);

  const handlePlayClick = async () => {
    if (source && !loadError) {
      setIsExpanded(true);
      setIsPlaying((current) => !current);
      return;
    }

    setIsLoading(true);
    setLoadError(false);

    const resolved = await resolvePlaybackSource(title, artist, youtubeUrl);

    setIsLoading(false);

    if (!resolved) {
      setLoadError(true);
      return;
    }

    setSource(resolved);
    setIsExpanded(true);
    setIsPlaying(true);
  };

  return (
    <div className={variant === 'icon' ? 'inline-flex flex-col items-end gap-2' : 'flex flex-col gap-3'}>
      <button
        type="button"
        onClick={() => void handlePlayClick()}
        disabled={isLoading || loadError}
        className={
          variant === 'icon'
            ? 'inline-flex items-center justify-center w-10 h-10 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50'
            : 'inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg hover:from-red-700 hover:to-red-800 transition-all font-bold shadow-lg disabled:opacity-50'
        }
        title={loadError ? 'Geen afspeelbron beschikbaar' : isPlaying ? 'Pauzeren' : 'Afspelen'}
      >
        {isLoading ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : isPlaying ? (
          <Pause className="w-5 h-5" />
        ) : (
          <Play className="w-5 h-5" />
        )}
        {variant === 'button' && (isPlaying ? 'Pauzeren' : 'Nu afspelen')}
      </button>

      {isExpanded && source && !loadError && (
        <div className={variant === 'icon' ? 'w-72' : 'w-full max-w-md'}>
          {source.type === 'youtube' ? (
            <div className="aspect-video rounded-lg overflow-hidden bg-black border border-border">
              <iframe
                title={title}
                src={`https://www.youtube-nocookie.com/embed/${source.videoId}?autoplay=${isPlaying ? 1 : 0}&rel=0`}
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          ) : (
            <div className="rounded-lg border border-border bg-card p-3 space-y-2">
              <audio
                ref={audioRef}
                src={source.previewUrl}
                onEnded={() => setIsPlaying(false)}
                controls
                className="w-full"
              />
              <p className="text-xs text-muted-foreground">Preview op deze pagina</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
