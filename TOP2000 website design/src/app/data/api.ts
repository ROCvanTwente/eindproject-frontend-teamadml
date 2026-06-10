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
    };
    if (bodyData !== undefined) {
      options.headers = {
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

export function fetchArtists() {
  return fetchJson<BackendArtist[]>(API_ENDPOINTS.artists);
}

export function fetchSongs() {
  return fetchJson<BackendSong[]>(API_ENDPOINTS.songs);
}

export function fetchTop2000Years() {
  return fetchJson<number[]>(API_ENDPOINTS.top2000);
}

export async function loadArtistsCatalog() {
  const result = await loadArrayEndpoint(fetchArtists, `${API_ENDPOINTS.artists} returned an unexpected JSON shape.`);
  if (result.ok && result.data) {
    result.data = result.data.map(artist => ({
      ...artist,
      bio: artist.bio ?? artist.biography,
      biography: artist.biography ?? artist.bio,
      photoUrl: artist.photoUrl ?? artist.photo,
      photo: artist.photo ?? artist.photoUrl,
    }));
  }
  return result;
}

export async function loadSongsCatalog() {
  const result = await loadArrayEndpoint(fetchSongs, `${API_ENDPOINTS.songs} returned an unexpected JSON shape.`);
  if (result.ok && result.data) {
    result.data = result.data.map(song => ({
      ...song,
      albumCover: song.albumCover ?? song.imgUrl,
      imgUrl: song.imgUrl ?? song.albumCover,
      lyricsPreview: song.lyricsPreview ?? song.lyrics,
      lyrics: song.lyrics ?? song.lyricsPreview,
      artistName: song.artistName ?? song.artist?.name,
    }));
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
