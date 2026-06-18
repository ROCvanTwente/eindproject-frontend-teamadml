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
  songs?: BackendSong[];
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

export type SongRanking = {
  songId: number;
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

const activeGetRequests = new Map<string, Promise<any>>();

async function fetchJson<T>(
  url: string,
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET',
  bodyData?: unknown
): Promise<ApiResult<T>> {
  if (method === 'GET') {
    let pending = activeGetRequests.get(url);
    if (!pending) {
      pending = fetchJsonImpl<T>(url, method, bodyData);
      activeGetRequests.set(url, pending);
      const cleanUp = () => activeGetRequests.delete(url);
      pending.then(cleanUp, cleanUp);
    }
    return pending;
  }
  return fetchJsonImpl<T>(url, method, bodyData);
}

async function fetchJsonImpl<T>(
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

export function fetchArtists() {
  return fetchJson<BackendArtist[]>(API_ENDPOINTS.artists);
}

export function fetchSongs() {
  return fetchJson<BackendSong[]>(API_ENDPOINTS.songs);
}

export async function fetchArtistForDetail(id: number): Promise<ApiResult<BackendArtist>> {
  const result = await fetchJson<BackendArtist & { wiki?: string }>(`${API_ENDPOINTS.artists}/${id}`);
  if (result.ok && result.data) {
    const data = result.data;
    const mappedSongs = (data.songs || []).map(song => ({
      ...song,
      albumCover: song.albumCover ?? song.imgUrl,
      imgUrl: song.imgUrl ?? song.albumCover,
      lyricsPreview: song.lyricsPreview ?? song.lyrics,
      lyrics: song.lyrics ?? song.lyricsPreview,
      artistName: song.artistName ?? data.name,
    }));
    return {
      ...result,
      data: {
        ...data,
        bio: data.bio ?? data.biography,
        biography: data.biography ?? data.bio,
        photoUrl: data.photoUrl ?? data.photo,
        photo: data.photo ?? data.photoUrl,
        wikiUrl: data.wikiUrl ?? data.wiki,
        songs: mappedSongs,
      }
    };
  }
  return result;
}

export async function fetchSongsByArtist(artistId: number, artistName?: string): Promise<BackendSong[]> {
  const result = await fetchJson<BackendSong[]>(`${API_ENDPOINTS.songs}/by-artist/${artistId}`);
  if (result.ok && result.data) {
    return result.data.map(song => ({
      ...song,
      albumCover: song.albumCover ?? song.imgUrl,
      imgUrl: song.imgUrl ?? song.albumCover,
      lyricsPreview: song.lyricsPreview ?? song.lyrics,
      lyrics: song.lyrics ?? song.lyricsPreview,
      artistName: song.artistName ?? artistName,
    }));
  }
  return [];
}

export async function fetchSongForDetail(id: number): Promise<ApiResult<BackendSong & { rankings?: SongRanking[] }>> {
  const result = await fetchJson<BackendSong & { top2000Entries?: any[] }>(`${API_ENDPOINTS.songs}/${id}`);
  if (result.ok && result.data) {
    const data = result.data;
    const rankings: SongRanking[] = (data.top2000Entries || []).map(entry => ({
      songId: entry.songId,
      year: entry.year,
      position: entry.position
    }));
    return {
      ...result,
      data: {
        ...data,
        albumCover: data.albumCover ?? data.imgUrl,
        imgUrl: data.imgUrl ?? data.albumCover,
        lyricsPreview: data.lyricsPreview ?? data.lyrics,
        lyrics: data.lyrics ?? data.lyricsPreview,
        artistName: data.artistName ?? data.artist?.name,
        rankings
      }
    };
  }
  return result as ApiResult<BackendSong & { rankings?: SongRanking[] }>;
}

export async function fetchSongRankings(songId: number): Promise<ApiResult<SongRanking[]>> {
  const result = await fetchJson<BackendSong & { top2000Entries?: any[] }>(`${API_ENDPOINTS.songs}/${songId}`);
  if (result.ok && result.data) {
    const rankings: SongRanking[] = (result.data.top2000Entries || []).map(entry => ({
      songId: entry.songId,
      year: entry.year,
      position: entry.position
    }));
    return {
      ok: true,
      url: result.url,
      status: result.status,
      data: rankings
    };
  }
  return {
    ok: false,
    url: result.url,
    status: result.status,
    message: result.ok ? "Geen rankings gevonden." : (result as any).message
  };
}

let yearsCache: ApiResult<number[]> | null = null;
const top2000Cache = new Map<number, EndpointLoadResult<BackendTop2000Entry>>();

export function clearApiCaches() {
  yearsCache = null;
  top2000Cache.clear();
}

export async function fetchTop2000Years() {
  if (yearsCache) return yearsCache;
  const result = await fetchJson<number[]>(API_ENDPOINTS.top2000);
  if (result.ok) {
    yearsCache = result;
  }
  return result;
}

export function fetchTop2000ByYear(year: number) {
  return fetchJson<BackendTop2000Entry[]>(`${API_ENDPOINTS.top2000}/${year}`);
}

export async function loadTop2000ByYear(year: number) {
  if (top2000Cache.has(year)) {
    return top2000Cache.get(year)!;
  }
  const result = await loadArrayEndpoint(() => fetchTop2000ByYear(year), `Muzieklijst voor ${year} kon niet worden geladen.`);
  if (result.ok && result.data) {
    result.data = result.data.map(entry => ({
      ...entry,
      song: entry.song ? {
        ...entry.song,
        albumCover: entry.song.albumCover ?? entry.song.imgUrl,
        imgUrl: entry.song.imgUrl ?? entry.song.albumCover,
        lyricsPreview: entry.song.lyricsPreview ?? entry.song.lyrics,
        lyrics: entry.song.lyrics ?? entry.song.lyricsPreview,
        artistName: entry.song.artistName ?? entry.song.artist?.name,
      } : entry.song
    }));
    top2000Cache.set(year, result);
  }
  return result;
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

export interface VoteResultEntry {
  songId: number;
  title: string;
  artistName: string;
  imgUrl?: string;
  voteCount: number;
}

export function fetchMyVotes() {
  return fetchJson<number[]>('/api/votes/my-votes');
}

export function submitVotes(songIds: number[]) {
  return fetchJson<{ message: string }>('/api/votes', 'POST', songIds);
}

export function fetchVoteResults() {
  return fetchJson<VoteResultEntry[]>('/api/votes/results');
}
