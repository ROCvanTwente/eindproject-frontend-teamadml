export type ApiError = {
  url: string;
  status?: number;
  message: string;
};

export type ApiResult<T> =
  | {
      ok: true;
      url: string;
      status: number;
      data: T;
    }
  | {
      ok: false;
      url: string;
      status?: number;
      message: string;
    };

export type ApiEndpointDiagnostic = {
  url: string;
  ok: boolean;
  status?: number;
  detail: string;
};

export type EndpointLoadResult<T> = {
  ok: boolean;
  data: T[];
  diagnostic: ApiEndpointDiagnostic;
  message?: string;
  loadedAt: string;
};

export type AdminCatalogLoadResult = {
  ok: boolean;
  artists: BackendArtist[];
  songs: BackendSong[];
  diagnostics: {
    artists: ApiEndpointDiagnostic;
    songs: ApiEndpointDiagnostic;
  };
  message?: string;
};

export type BackendArtist = {
  artistId: number;
  name: string;
  website?: string;
  bio?: string;
  biography?: string; // added to match backend
  photoUrl?: string;
  photo?: string; // added to match backend
  wikiUrl?: string;
  numberOfSongs?: number;
};

type RawBackendArtist = BackendArtist & {
  biography?: string | null;
  photo?: string | null;
  wiki?: string | null;
  songs?: unknown[];
};

export type BackendSong = {
  songId: number;
  title: string;
  artistId: number;
  releaseYear: number;
  youtube?: string;
  artistName?: string;
  albumCover?: string;
  imgUrl?: string; // added to match backend
  lyricsPreview?: string;
  lyrics?: string; // added to match backend
  timesListed?: number;
  artist?: BackendArtist; // added to match backend
};

export type BackendTop2000Entry = {
  songId: number;
  year: number;
  position: number;
  song: BackendSong;
};

type RawBackendSong = BackendSong & {
  imgUrl?: string | null;
  lyrics?: string | null;
  artist?: {
    artistId?: number;
    name?: string;
  };
  top2000Entries?: Array<{
    year: number;
    position: number;
  }>;
};

export type SongDetailLoadResult = ApiResult<BackendSong> & {
  rankings?: SongRanking[];
};

export type SongRanking = {
  year: number;
  position: number;
};

export const API_ENDPOINTS = {
  artists: '/api/artists',
  songs: '/api/songs',
  top2000: '/api/top2000',
} as const;

function getResponseMessage(url: string, status: number, body: string) {
  const trimmedBody = body.trim();

  if (trimmedBody.length > 0) {
    return trimmedBody.slice(0, 180);
  }

  return `${url} returned ${status}.`;
}

async function fetchJson<T>(
  url: string,
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET',
  bodyData?: unknown
): Promise<ApiResult<T>> {
  try {
    const options: RequestInit = {
      method,
      cache: 'no-store',
      headers: {}
    };

    // Attach Bearer token from localStorage if available
    const token = localStorage.getItem('token');
    if (token) {
      options.headers = {
        ...options.headers,
        'Authorization': `Bearer ${token}`
      };
    }

    if (bodyData !== undefined) {
      options.headers = {
        ...options.headers,
        'Content-Type': 'application/json',
      };
      options.body = JSON.stringify(bodyData);
    }
    const response = await fetch(url, options);
    const body = await response.text();

    if (!response.ok) {
      return {
        ok: false,
        url,
        status: response.status,
        message: getResponseMessage(url, response.status, body),
      };
    }

    if (method === 'DELETE' || response.status === 204 || body.trim().length === 0) {
      return {
        ok: true,
        url,
        status: response.status,
        data: null as unknown as T,
      };
    }

    try {
      return {
        ok: true,
        url,
        status: response.status,
        data: JSON.parse(body) as T,
      };
    } catch {
      return {
        ok: false,
        url,
        status: response.status,
        message: `${url} returned invalid JSON.`,
      };
    }
  } catch (error) {
    return {
      ok: false,
      url,
      message: error instanceof Error
        ? `${url} failed before a usable response was returned: ${error.message}`
        : `Request failed for ${url}.`,
    };
  }
}

function toDiagnostic<T>(result: ApiResult<T>): ApiEndpointDiagnostic {
  return {
    url: result.url,
    ok: result.ok,
    status: result.status,
    detail: result.ok ? 'Response ontvangen.' : result.message,
  };
}

function toArrayData<T>(result: ApiResult<T[]>, invalidShapeMessage: string): { data: T[]; diagnostic: ApiEndpointDiagnostic } {
  if (!result.ok) {
    return {
      data: [],
      diagnostic: toDiagnostic(result),
    };
  }

  if (!Array.isArray(result.data)) {
    return {
      data: [],
      diagnostic: {
        url: result.url,
        ok: false,
        status: result.status,
        detail: invalidShapeMessage,
      },
    };
  }

  return {
    data: result.data,
    diagnostic: toDiagnostic(result),
  };
}

async function loadArrayEndpoint<T>(
  loader: () => Promise<ApiResult<T[]>>,
  invalidShapeMessage: string,
): Promise<EndpointLoadResult<T>> {
  const loadedAt = new Date().toISOString();
  const result = await loader();
  const endpoint = toArrayData(result, invalidShapeMessage);

  return {
    ok: endpoint.diagnostic.ok,
    data: endpoint.data,
    diagnostic: endpoint.diagnostic,
    message: endpoint.diagnostic.ok ? undefined : endpoint.diagnostic.detail,
    loadedAt,
  };
}

function formatFailedEndpoints(diagnostics: AdminCatalogLoadResult['diagnostics']) {
  return Object.values(diagnostics)
    .filter((diagnostic) => !diagnostic.ok)
    .map((diagnostic) => typeof diagnostic.status === 'number'
      ? `${diagnostic.url} returned ${diagnostic.status}`
      : `${diagnostic.url} failed before a response was received`)
    .join(', ');
}

export function normalizeBackendArtist(raw: RawBackendArtist): BackendArtist {
  const numberOfSongs = raw.numberOfSongs
    ?? (Array.isArray(raw.songs) ? raw.songs.length : undefined);

  return {
    artistId: raw.artistId,
    name: raw.name,
    website: raw.website,
    bio: raw.bio ?? raw.biography ?? undefined,
    photoUrl: raw.photoUrl ?? raw.photo ?? undefined,
    wikiUrl: raw.wikiUrl ?? raw.wiki ?? undefined,
    numberOfSongs,
  };
}

let artistsCatalogCache: BackendArtist[] | null = null;
let artistsCatalogPromise: Promise<BackendArtist[]> | null = null;

async function loadArtistsCatalogCache(): Promise<BackendArtist[]> {
  if (artistsCatalogCache) {
    return artistsCatalogCache;
  }

  if (!artistsCatalogPromise) {
    artistsCatalogPromise = fetchArtists().then((result) => {
      if (!result.ok || !Array.isArray(result.data)) {
        return [];
      }

      artistsCatalogCache = result.data.map((artist) => normalizeBackendArtist(artist as RawBackendArtist));
      return artistsCatalogCache;
    });
  }

  return artistsCatalogPromise;
}

export async function findArtistInCatalog(artistId: number): Promise<BackendArtist | undefined> {
  const catalog = await loadArtistsCatalogCache();
  return catalog.find((artist) => artist.artistId === artistId);
}

export async function fetchArtistForDetail(artistId: number): Promise<ApiResult<BackendArtist>> {
  const byIdResult = await fetchJson<RawBackendArtist>(`${API_ENDPOINTS.artists}/${artistId}`);

  if (byIdResult.ok) {
    return {
      ok: true,
      url: byIdResult.url,
      status: byIdResult.status,
      data: normalizeBackendArtist(byIdResult.data),
    };
  }

  const fromCatalog = await findArtistInCatalog(artistId);
  if (fromCatalog) {
    return {
      ok: true,
      url: `${API_ENDPOINTS.artists} (catalog)`,
      status: 200,
      data: fromCatalog,
    };
  }

  return {
    ok: false,
    url: byIdResult.url,
    status: byIdResult.status,
    message: byIdResult.message,
  };
}

export async function fetchSongsByArtist(artistId: number, artistName?: string): Promise<BackendSong[]> {
  const byArtistResult = await fetchJson<RawBackendSong[]>(
    `${API_ENDPOINTS.songs}/by-artist/${artistId}`,
  );

  if (byArtistResult.ok && Array.isArray(byArtistResult.data)) {
    return byArtistResult.data.map((song) => {
      const normalized = normalizeBackendSong(song);
      return {
        ...normalized,
        artistName: normalized.artistName ?? artistName ?? song.artist?.name,
      };
    });
  }

  const catalog = await loadSongsCatalogCache();
  return catalog
    .filter((song) => song.artistId === artistId)
    .map((song) => ({
      ...song,
      artistName: song.artistName ?? artistName,
    }));
}

export function fetchArtists() {
  return fetchJson<BackendArtist[]>(API_ENDPOINTS.artists);
}

export function fetchSongs() {
  return fetchJson<BackendSong[]>(API_ENDPOINTS.songs);
}

let songsCatalogCache: BackendSong[] | null = null;
let songsCatalogPromise: Promise<BackendSong[]> | null = null;

function extractRankingsFromRaw(raw: RawBackendSong): SongRanking[] {
  if (!Array.isArray(raw.top2000Entries)) {
    return [];
  }

  return raw.top2000Entries
    .map((entry) => ({ year: entry.year, position: entry.position }))
    .sort((left, right) => right.year - left.year);
}

export function normalizeBackendSong(raw: RawBackendSong): BackendSong {
  const timesListed = raw.timesListed
    ?? (Array.isArray(raw.top2000Entries) ? raw.top2000Entries.length : undefined);

  return {
    songId: raw.songId,
    title: raw.title,
    artistId: raw.artistId,
    releaseYear: raw.releaseYear ?? 0,
    youtube: raw.youtube ?? undefined,
    artistName: raw.artistName ?? raw.artist?.name,
    albumCover: raw.albumCover ?? raw.imgUrl ?? undefined,
    lyricsPreview: raw.lyricsPreview ?? raw.lyrics ?? undefined,
    timesListed,
  };
}

export function primeSongsCatalog(songs: RawBackendSong[] | BackendSong[]) {
  if (songs.length === 0) {
    return;
  }

  songsCatalogCache = songs.map((song) => normalizeBackendSong(song as RawBackendSong));
  songsCatalogPromise = Promise.resolve(songsCatalogCache);
}

async function loadSongsCatalogCache(): Promise<BackendSong[]> {
  if (songsCatalogCache) {
    return songsCatalogCache;
  }

  if (!songsCatalogPromise) {
    songsCatalogPromise = fetchSongs().then((result) => {
      if (!result.ok || !Array.isArray(result.data)) {
        songsCatalogPromise = null;
        return [];
      }

      songsCatalogCache = result.data.map((song) => normalizeBackendSong(song as RawBackendSong));
      return songsCatalogCache;
    });
  }

  return songsCatalogPromise;
}

export async function findSongInCatalog(songId: number): Promise<BackendSong | undefined> {
  const catalog = await loadSongsCatalogCache();
  return catalog.find((song) => song.songId === songId);
}

export async function fetchSongForDetail(songId: number): Promise<SongDetailLoadResult> {
  const byIdResult = await fetchJson<RawBackendSong>(`${API_ENDPOINTS.songs}/${songId}`);

  if (byIdResult.ok) {
    return {
      ok: true,
      url: byIdResult.url,
      status: byIdResult.status,
      data: normalizeBackendSong(byIdResult.data),
      rankings: extractRankingsFromRaw(byIdResult.data),
    };
  }

  const fromCatalog = await findSongInCatalog(songId);
  if (fromCatalog) {
    return {
      ok: true,
      url: `${API_ENDPOINTS.songs} (catalog)`,
      status: 200,
      data: fromCatalog,
      rankings: [],
    };
  }

  return {
    ok: false,
    url: byIdResult.url,
    status: byIdResult.status,
    message: byIdResult.message,
  };
}

export function fetchSongById(songId: number) {
  return fetchSongForDetail(songId);
}

export function fetchSongRankings(songId: number) {
  return fetchJson<SongRanking[]>(`${API_ENDPOINTS.songs}/${songId}/rankings`);
}

export function fetchTop2000Years() {
  return fetchJson<number[]>(API_ENDPOINTS.top2000);
}

export function fetchTop2000ByYear(year: number) {
  return fetchJson<BackendTop2000Entry[]>(`${API_ENDPOINTS.top2000}/${year}`);
}

export async function loadSongsCatalog(): Promise<EndpointLoadResult<BackendSong>> {
  const result = await loadArrayEndpoint(fetchSongs, `${API_ENDPOINTS.songs} returned an unexpected JSON shape.`);

  if (result.ok && result.data.length > 0) {
    const normalized = result.data.map((song) => normalizeBackendSong(song as RawBackendSong));
    primeSongsCatalog(normalized);
    return {
      ...result,
      data: normalized,
    };
  }

  return result;
}

export async function loadAdminCatalog(): Promise<AdminCatalogLoadResult> {
  const [artistsResult, songsResult] = await Promise.all([
    fetchArtists(),
    fetchSongs(),
  ]);

  const artists = toArrayData(artistsResult, `${API_ENDPOINTS.artists} returned an unexpected JSON shape.`);
  const songs = toArrayData(songsResult, `${API_ENDPOINTS.songs} returned an unexpected JSON shape.`);

  const mappedArtists = artists.data.map(artist => ({
    ...artist,
    bio: artist.bio ?? artist.biography,
    biography: artist.biography ?? artist.bio,
    photoUrl: artist.photoUrl ?? artist.photo,
    photo: artist.photo ?? artist.photoUrl,
  }));

  const mappedSongs = songs.data.map(song => ({
    ...song,
    albumCover: song.albumCover ?? song.imgUrl,
    imgUrl: song.imgUrl ?? song.albumCover,
    lyricsPreview: song.lyricsPreview ?? song.lyrics,
    lyrics: song.lyrics ?? song.lyricsPreview,
    artistName: song.artistName ?? song.artist?.name,
  }));

  const diagnostics = {
    artists: artists.diagnostic,
    songs: songs.diagnostic,
  };

  if (artists.diagnostic.ok && songs.diagnostic.ok) {
    return {
      ok: true,
      artists: mappedArtists,
      songs: mappedSongs,
      diagnostics,
    };
  }

  return {
    ok: false,
    artists: mappedArtists,
    songs: mappedSongs,
    diagnostics,
    message: `Backend returned an error: ${formatFailedEndpoints(diagnostics)}.`,
  };
}

export function createArtist(artist: Omit<BackendArtist, 'artistId'>) {
  return fetchJson<BackendArtist>(API_ENDPOINTS.artists, 'POST', artist);
}

export function updateArtist(id: number, artist: BackendArtist) {
  return fetchJson<void>(`${API_ENDPOINTS.artists}/${id}`, 'PUT', artist);
}

export function deleteArtist(id: number) {
  return fetchJson<void>(`${API_ENDPOINTS.artists}/${id}`, 'DELETE');
}

export function createSong(song: Omit<BackendSong, 'songId'>) {
  return fetchJson<BackendSong>(API_ENDPOINTS.songs, 'POST', song);
}

export function updateSong(id: number, song: BackendSong) {
  return fetchJson<void>(`${API_ENDPOINTS.songs}/${id}`, 'PUT', song);
}

export function deleteSong(id: number) {
  return fetchJson<void>(`${API_ENDPOINTS.songs}/${id}`, 'DELETE');
}

export type AuditAction = 'TOEVOEGEN' | 'BEWERKEN' | 'VERWIJDEREN' | 'SYSTEEM';
export type AuditEntityType = 'NUMMER' | 'ARTIEST' | 'SYSTEEM';
export interface AuditLogEntry {
  id: string;
  timestamp: string;
  action: AuditAction;
  entityType: AuditEntityType;
  name: string;
  details: string;
}

export function fetchAuditLogs() {
  return fetchJson<AuditLogEntry[]>('/api/audit-logs');
}

export function createAuditLog(log: Omit<AuditLogEntry, 'id' | 'timestamp'> & { id?: string; timestamp?: string }) {
  return fetchJson<AuditLogEntry>('/api/audit-logs', 'POST', log);
}

export function clearAuditLogs() {
  return fetchJson<void>('/api/audit-logs', 'DELETE');
}

export interface BackendUser {
  userId: number;
  username: string;
  role: string;
  createdAtUtc: string;
}

export interface RoleChangeRequest {
  id: number;
  targetUserId: number;
  targetUsername: string;
  newRole: string;
  requestedBy: string;
  createdAtUtc: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  approvedBy?: string;
  approvedAtUtc?: string;
}

export function fetchUsers() {
  return fetchJson<BackendUser[]>('/api/users');
}

export function fetchRoleRequests() {
  return fetchJson<RoleChangeRequest[]>('/api/users/requests');
}

export function createRoleRequest(targetUserId: number, newRole: string) {
  return fetchJson<RoleChangeRequest>('/api/users/request-role', 'POST', { targetUserId, newRole });
}

export function approveRoleRequest(id: number) {
  return fetchJson<void>(`/api/users/approve-role/${id}`, 'POST');
}

export function rejectRoleRequest(id: number) {
  return fetchJson<void>(`/api/users/reject-role/${id}`, 'POST');
}
