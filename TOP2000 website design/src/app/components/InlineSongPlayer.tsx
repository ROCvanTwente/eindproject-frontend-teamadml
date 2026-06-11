import { useEffect, useRef, useState } from 'react';
import { Loader2, Pause, Play, Volume2 } from 'lucide-react';
import { resolvePlaybackSource, type PlaybackSource } from '../utils/songPlayback';

interface InlineSongPlayerProps {
  title: string;
  artist: string;
  youtubeUrl?: string;
}

export function InlineSongPlayer({ title, artist, youtubeUrl }: InlineSongPlayerProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [source, setSource] = useState<PlaybackSource | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const loadSource = async () => {
      setIsLoading(true);
      setLoadError(false);
      setIsPlaying(false);
      setSource(null);

      const resolved = await resolvePlaybackSource(title, artist, youtubeUrl);

      if (!isMounted) {
        return;
      }

      if (!resolved) {
        setLoadError(true);
      } else {
        setSource(resolved);
      }

      setIsLoading(false);
    };

    void loadSource();

    return () => {
      isMounted = false;
      audioRef.current?.pause();
    };
  }, [title, artist, youtubeUrl]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) {
      return;
    }

    if (isPlaying) {
      void audio.play().catch(() => setIsPlaying(false));
    } else {
      audio.pause();
    }
  }, [isPlaying, source]);

  const togglePlayback = () => {
    if (!source || loadError) {
      return;
    }

    setIsPlaying((current) => !current);
  };

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 text-muted-foreground text-sm">
        <Loader2 className="w-4 h-4 animate-spin" />
        Player wordt geladen...
      </div>
    );
  }

  if (loadError || !source) {
    return (
      <p className="text-sm text-muted-foreground">
        Voor dit nummer is nog geen afspeelbron beschikbaar.
      </p>
    );
  }

  return (
    <div className="w-full max-w-xl space-y-4 rounded-xl border border-border bg-card p-4 shadow-md">
      <div className="flex items-center justify-between gap-4">
        <div className="min-w-0">
          <p className="font-semibold truncate">{title}</p>
          <p className="text-sm text-muted-foreground truncate">{artist}</p>
        </div>
        <button
          type="button"
          onClick={togglePlayback}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-primary to-accent text-white rounded-lg hover:opacity-90 transition-opacity font-semibold shrink-0"
        >
          {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
          {isPlaying ? 'Pauzeren' : 'Afspelen'}
        </button>
      </div>

      {source.type === 'youtube' ? (
        <div className="aspect-video rounded-lg overflow-hidden bg-black">
          <iframe
            title={title}
            src={`https://www.youtube-nocookie.com/embed/${source.videoId}?autoplay=${isPlaying ? 1 : 0}&rel=0`}
            className="w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      ) : (
        <>
          <audio
            ref={audioRef}
            src={source.previewUrl}
            onEnded={() => setIsPlaying(false)}
            preload="metadata"
          />
          <div className="flex items-center gap-3 rounded-lg bg-secondary/60 px-4 py-3">
            <Volume2 className="w-5 h-5 text-primary shrink-0" />
            <p className="text-sm text-muted-foreground">
              30 seconden preview — speelt direct op deze pagina af
            </p>
          </div>
        </>
      )}
    </div>
  );
}
