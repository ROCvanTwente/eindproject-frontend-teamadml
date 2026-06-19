// ─── Spotify PKCE Auth helpers ────────────────────────────────────────────────
// PKCE = Proof Key for Code Exchange — safe for SPAs (no client secret needed)

export const SPOTIFY_CLIENT_ID = 'c06806b27a6d490fafb1e0d4d4b104e5';

// !! These URIs must be added EXACTLY as shown in the Spotify Dashboard under "Redirect URIs" !!
// Localhost:  http://localhost:5174/spotify
// Production: https://eindproject-frontend-teamadml.vercel.app/spotify
const REDIRECT_MAP: Record<string, string> = {
  'http://localhost:5173': 'http://localhost:5173/spotify',
  'http://localhost:5174': 'http://localhost:5174/spotify',
  'http://localhost:5175': 'http://localhost:5175/spotify',
  'https://eindproject-frontend-teamadml.vercel.app': 'https://eindproject-frontend-teamadml.vercel.app/spotify',
};

export const SPOTIFY_REDIRECT_URI: string =
  (typeof window !== 'undefined' && REDIRECT_MAP[window.location.origin])
  ?? 'https://eindproject-frontend-teamadml.vercel.app/spotify';


export const SPOTIFY_SCOPES = [
  'streaming',
  'user-read-email',
  'user-read-private',
  'user-read-playback-state',
  'user-modify-playback-state',
].join(' ');

// ── Crypto helpers ─────────────────────────────────────────────────────────────
function randomBytes(length: number): Uint8Array {
  return crypto.getRandomValues(new Uint8Array(length));
}

function base64UrlEncode(buffer: Uint8Array): string {
  return btoa(String.fromCharCode(...buffer))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

export function generateCodeVerifier(): string {
  return base64UrlEncode(randomBytes(32));
}

export async function generateCodeChallenge(verifier: string): Promise<string> {
  const data = new TextEncoder().encode(verifier);
  const digest = await crypto.subtle.digest('SHA-256', data);
  return base64UrlEncode(new Uint8Array(digest));
}

// ── Auth flow ─────────────────────────────────────────────────────────────────
export async function redirectToSpotifyLogin(returnPath = '/'): Promise<void> {
  const verifier = generateCodeVerifier();
  const challenge = await generateCodeChallenge(verifier);

  sessionStorage.setItem('spotify_code_verifier', verifier);
  sessionStorage.setItem('spotify_return_path', returnPath);

  const params = new URLSearchParams({
    client_id: SPOTIFY_CLIENT_ID,
    response_type: 'code',
    redirect_uri: SPOTIFY_REDIRECT_URI,
    code_challenge_method: 'S256',
    code_challenge: challenge,
    scope: SPOTIFY_SCOPES,
  });

  window.location.href = `https://accounts.spotify.com/authorize?${params.toString()}`;
}

export async function exchangeCodeForToken(code: string): Promise<string | null> {
  const verifier = sessionStorage.getItem('spotify_code_verifier');
  if (!verifier) return null;

  const body = new URLSearchParams({
    client_id: SPOTIFY_CLIENT_ID,
    grant_type: 'authorization_code',
    code,
    redirect_uri: SPOTIFY_REDIRECT_URI,
    code_verifier: verifier,
  });

  const response = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: body.toString(),
  });

  if (!response.ok) return null;

  const data = await response.json();
  const { access_token, refresh_token, expires_in } = data;

  const expiresAt = Date.now() + expires_in * 1000;
  localStorage.setItem('spotify_access_token', access_token);
  localStorage.setItem('spotify_refresh_token', refresh_token ?? '');
  localStorage.setItem('spotify_expires_at', String(expiresAt));
  sessionStorage.removeItem('spotify_code_verifier');

  return access_token;
}

export async function refreshAccessToken(): Promise<string | null> {
  const refreshToken = localStorage.getItem('spotify_refresh_token');
  if (!refreshToken) return null;

  const body = new URLSearchParams({
    client_id: SPOTIFY_CLIENT_ID,
    grant_type: 'refresh_token',
    refresh_token: refreshToken,
  });

  const response = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: body.toString(),
  });

  if (!response.ok) { clearSpotifyTokens(); return null; }

  const data = await response.json();
  const { access_token, refresh_token, expires_in } = data;
  const expiresAt = Date.now() + expires_in * 1000;

  localStorage.setItem('spotify_access_token', access_token);
  if (refresh_token) localStorage.setItem('spotify_refresh_token', refresh_token);
  localStorage.setItem('spotify_expires_at', String(expiresAt));

  return access_token;
}

export async function getValidToken(): Promise<string | null> {
  const token = localStorage.getItem('spotify_access_token');
  const expiresAt = Number(localStorage.getItem('spotify_expires_at') ?? 0);

  if (token && Date.now() < expiresAt - 60_000) return token;
  return refreshAccessToken();
}

export function clearSpotifyTokens(): void {
  localStorage.removeItem('spotify_access_token');
  localStorage.removeItem('spotify_refresh_token');
  localStorage.removeItem('spotify_expires_at');
}

export function isSpotifyConnected(): boolean {
  return !!localStorage.getItem('spotify_access_token');
}

// ── Spotify API: search track ─────────────────────────────────────────────────
export interface SpotifyTrack {
  id: string;
  uri: string;
  name: string;
  artists: { name: string }[];
  album: { name: string; images: { url: string }[] };
  duration_ms: number;
  preview_url: string | null;
}

const searchCache = new Map<string, SpotifyTrack | null>();
let rateLimitResetAt = 0;

function setRateLimitReset(timestamp: number) {
  rateLimitResetAt = timestamp;
  (globalThis as any).__spotifyRateLimitResetAt = timestamp;
}

function normalizeText(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[\u2018\u2019\u201A\u201B\u2032\u0060]/g, "'")
    .replace(/^['\u2018\u2019\u201A`]+/, '')
    .trim();
}

function sanitizeSearchQuery(title: string, artist: string) {
  // 1. Clean Title — remove leading dots, strip metadata tags like (Remastered 2011)
  let cleanTitle = title.replace(/^\.+/, '').trim();
  cleanTitle = cleanTitle.replace(/\s*[\(\[][^)]*?(remaster|live|edit|mono|stereo|version|mix)[^)]*?[\)\]]/gi, '').trim();

  // 2. Clean Artist — take first artist in collaborations (e.g. "Queen & David Bowie" → "Queen")
  let cleanArtist = artist;
  const splitters = [/\s+&\s+/, /\s+feat\.?\s+/i, /\s+ft\.?\s+/i, /\s+vs\.?\s+/i, /\s+with\s+/i, /\s*,\s*/];
  for (const splitter of splitters) {
    if (splitter.test(cleanArtist)) {
      cleanArtist = cleanArtist.split(splitter)[0].trim();
      break;
    }
  }
  return { cleanTitle, cleanArtist };
}

async function trySearch(query: string, token: string, retryCount = 0): Promise<SpotifyTrack | null> {
  if (Date.now() < rateLimitResetAt) {
    // If we haven't retried yet, wait for the rate limit to reset then try
    if (retryCount === 0) {
      const waitMs = rateLimitResetAt - Date.now();
      if (waitMs > 0 && waitMs <= 10_000) {
        console.log(`[Spotify] Rate limited — waiting ${Math.ceil(waitMs / 1000)}s before retry...`);
        await new Promise(resolve => setTimeout(resolve, waitMs + 500));
        return trySearch(query, token, retryCount + 1);
      }
    }
    return null;
  }
  
  try {
    const res = await fetch(
      `https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=track&limit=1`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    
    if (res.status === 429) {
      const retryAfter = parseInt(res.headers.get('Retry-After') || '5', 10);
      const waitMs = retryAfter * 1000;
      setRateLimitReset(Date.now() + waitMs);
      console.warn(`[Spotify] 429 Rate Limited. Retry-After: ${retryAfter}s`);

      // Auto-retry once if the wait is reasonable (≤10s)
      if (retryCount === 0 && waitMs <= 10_000) {
        console.log(`[Spotify] Waiting ${retryAfter}s then retrying...`);
        await new Promise(resolve => setTimeout(resolve, waitMs + 500));
        return trySearch(query, token, retryCount + 1);
      }
      return null;
    }
    
    if (!res.ok) return null;
    const data = await res.json();
    return data.tracks?.items?.[0] ?? null;
  } catch {
    return null;
  }
}

export async function searchTrack(title: string, artist: string, token: string): Promise<SpotifyTrack | null> {
  const cacheKey = `${title.toLowerCase()}|${artist.toLowerCase()}`;

  // Return cached result immediately — no API call needed
  if (searchCache.has(cacheKey)) {
    return searchCache.get(cacheKey) ?? null;
  }

  // If rate limited, trySearch will auto-wait-and-retry for short waits
  if (Date.now() < rateLimitResetAt) {
    const waitMs = rateLimitResetAt - Date.now();
    if (waitMs > 10_000) {
      const waitSec = Math.ceil(waitMs / 1000);
      console.warn(`[Spotify] Rate limited for ${waitSec}s more. Skipping search.`);
      return null;
    }
    // Short wait — trySearch will handle the delay automatically
  }

  const { cleanTitle, cleanArtist } = sanitizeSearchQuery(title, artist);
  const normTitle  = normalizeText(cleanTitle);
  const normArtist = normalizeText(cleanArtist);

  // Max 2 strategies to stay well within rate limits
  const strategies = [
    `track:${cleanTitle} artist:${cleanArtist}`,
    `${normTitle} ${normArtist}`,
  ];

  for (const query of strategies) {
    const result = await trySearch(query, token);
    if (!result) continue;
    searchCache.set(cacheKey, result); // cache found track
    return result;
  }

  // Cache the miss so we don't search again this session
  searchCache.set(cacheKey, null);
  return null;
}
