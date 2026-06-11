export type PlaybackSource =
  | { type: 'youtube'; videoId: string }
  | { type: 'audio'; previewUrl: string };

export function extractYoutubeVideoId(url: string): string | null {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return match && match[2].length === 11 ? match[2] : null;
}

export async function resolvePlaybackSource(
  title: string,
  artist: string,
  youtubeUrl?: string,
): Promise<PlaybackSource | null> {
  if (youtubeUrl) {
    const videoId = extractYoutubeVideoId(youtubeUrl);
    if (videoId) {
      return { type: 'youtube', videoId };
    }
  }

  try {
    const query = encodeURIComponent(`${artist} ${title}`.trim());
    const response = await fetch(`https://api.deezer.com/search?q=${query}&limit=1`);

    if (!response.ok) {
      return null;
    }

    const payload = await response.json() as {
      data?: Array<{ preview?: string }>;
    };

    const previewUrl = payload.data?.[0]?.preview;
    if (previewUrl) {
      return { type: 'audio', previewUrl };
    }
  } catch {
    return null;
  }

  return null;
}
