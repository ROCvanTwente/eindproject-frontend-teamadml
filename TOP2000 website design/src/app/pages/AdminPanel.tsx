import { useEffect, useState } from 'react';
import { AlertCircle, Loader2, Music2, RefreshCw, Users } from 'lucide-react';
import { loadAdminCatalog, type BackendArtist, type BackendSong } from '../data/api';

const ITEMS_PER_PAGE = 10;

type FetchState = 'idle' | 'loading' | 'success' | 'error';
type SortDirection = 'asc' | 'desc';
type ArtistSortKey = 'artistId' | 'name' | 'songCount';
type SongSortKey = 'songId' | 'title' | 'artistName' | 'releaseYear';
type EndpointKey = 'artists' | 'songs';
type EndpointDiagnostic = {
	key: EndpointKey;
	label: string;
	url: string;
	status: FetchState;
	httpStatus?: number;
	detail: string;
	expectedFields: string[];
};

const ADMIN_ENDPOINTS: Record<EndpointKey, Omit<EndpointDiagnostic, 'status' | 'httpStatus' | 'detail'>> = {
	artists: {
		key: 'artists',
		label: 'Artiesten',
		url: '/api/artists',
		expectedFields: ['artistId', 'name', 'website'],
	},
	songs: {
		key: 'songs',
		label: 'Nummers',
		url: '/api/songs',
		expectedFields: ['songId', 'title', 'artistId', 'releaseYear', 'youtube'],
	},
};

const createEndpointDiagnostics = (status: FetchState): Record<EndpointKey, EndpointDiagnostic> => ({
	artists: {
		...ADMIN_ENDPOINTS.artists,
		status,
		detail: status === 'loading' ? 'Request wordt uitgevoerd...' : 'Nog geen request uitgevoerd.',
	},
	songs: {
		...ADMIN_ENDPOINTS.songs,
		status,
		detail: status === 'loading' ? 'Request wordt uitgevoerd...' : 'Nog geen request uitgevoerd.',
	},
});

function formatEndpointFailure(diagnostic: EndpointDiagnostic) {
	if (typeof diagnostic.httpStatus === 'number') {
		return `${diagnostic.url} returned ${diagnostic.httpStatus}`;
	}

	return `${diagnostic.url} failed before a response was received`;
}


function paginateItems<T>(items: T[], currentPage: number) {
	const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
	return items.slice(startIndex, startIndex + ITEMS_PER_PAGE);
}

function getVisiblePageNumbers(currentPage: number, totalPages: number) {
	if (totalPages <= 7) {
		return Array.from({ length: totalPages }, (_, index) => index + 1);
	}

	if (currentPage <= 4) {
		return [1, 2, 3, 4, 5, 'ellipsis', totalPages] as const;
	}

	if (currentPage >= totalPages - 3) {
		return [1, 'ellipsis', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages] as const;
	}

	return [1, 'ellipsis', currentPage - 1, currentPage, currentPage + 1, 'ellipsis', totalPages] as const;
}

function compareValues(leftValue: string | number, rightValue: string | number, direction: SortDirection) {
	const comparison = typeof leftValue === 'number' && typeof rightValue === 'number'
		? leftValue - rightValue
		: String(leftValue).localeCompare(String(rightValue), 'nl', { sensitivity: 'base' });

	return direction === 'asc' ? comparison : -comparison;
}

type PaginationProps = {
	currentPage: number;
	totalPages: number;
	onPageChange: (page: number) => void;
};

function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
	const visiblePages = getVisiblePageNumbers(currentPage, totalPages);
	const [pageInput, setPageInput] = useState(String(currentPage));

	useEffect(() => {
		setPageInput(String(currentPage));
	}, [currentPage]);

	const submitPage = () => {
		const parsedPage = Number.parseInt(pageInput, 10);
		if (Number.isNaN(parsedPage)) {
			setPageInput(String(currentPage));
			return;
		}

		onPageChange(Math.min(Math.max(parsedPage, 1), totalPages));
	};

	return (
		<div className="flex items-center gap-2 flex-wrap justify-end">
			<button
				onClick={() => onPageChange(Math.max(1, currentPage - 1))}
				disabled={currentPage === 1}
				className="px-3 py-2 rounded-lg border border-border disabled:opacity-50 disabled:cursor-not-allowed hover:bg-secondary transition-colors"
			>
				&lt;
			</button>

			{visiblePages.map((page, index) => page === 'ellipsis' ? (
				<span key={`ellipsis-${index}`} className="px-2 text-muted-foreground">
					...
				</span>
			) : (
				<button
					key={page}
					onClick={() => onPageChange(page)}
					className={`px-3 py-2 rounded-lg border transition-colors ${
						page === currentPage
							? 'bg-primary text-primary-foreground border-primary'
							: 'border-border hover:bg-secondary'
					}`}
				>
					{page}
				</button>
			))}

			<button
				onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
				disabled={currentPage === totalPages}
				className="px-3 py-2 rounded-lg border border-border disabled:opacity-50 disabled:cursor-not-allowed hover:bg-secondary transition-colors"
			>
				&gt;
			</button>

			<div className="flex items-center gap-2 ml-2">
				<input
					type="number"
					min={1}
					max={totalPages}
					value={pageInput}
					onChange={(event) => setPageInput(event.target.value)}
					onKeyDown={(event) => {
						if (event.key === 'Enter') {
							submitPage();
						}
					}}
					className="w-20 px-3 py-2 rounded-lg border border-border bg-background"
					aria-label="Ga naar pagina"
				/>
				<button
					onClick={submitPage}
					className="px-3 py-2 rounded-lg border border-border hover:bg-secondary transition-colors"
				>
					Ga
				</button>
			</div>
		</div>
	);
}

type SortHeaderProps = {
	label: string;
	isActive: boolean;
	direction: SortDirection;
	onClick: () => void;
};

function SortHeader({ label, isActive, direction, onClick }: SortHeaderProps) {
	return (
		<button
			type="button"
			onClick={onClick}
			className="inline-flex items-center gap-2 hover:text-primary transition-colors"
		>
			<span>{label}</span>
			<span className="text-xs text-muted-foreground">{isActive ? (direction === 'asc' ? '▲' : '▼') : '↕'}</span>
		</button>
	);
}

export function AdminPanel() {
	const [artists, setArtists] = useState<BackendArtist[]>([]);
	const [songs, setSongs] = useState<BackendSong[]>([]);
	const [fetchState, setFetchState] = useState<FetchState>('idle');
	const [errorMessage, setErrorMessage] = useState('');
	const [endpointDiagnostics, setEndpointDiagnostics] = useState<Record<EndpointKey, EndpointDiagnostic>>(
		() => createEndpointDiagnostics('idle')
	);
	const [artistPage, setArtistPage] = useState(1);
	const [songPage, setSongPage] = useState(1);
	const [artistIdFilter, setArtistIdFilter] = useState('');
	const [songIdFilter, setSongIdFilter] = useState('');
	const [artistSort, setArtistSort] = useState<{ key: ArtistSortKey; direction: SortDirection }>({
		key: 'artistId',
		direction: 'asc',
	});
	const [songSort, setSongSort] = useState<{ key: SongSortKey; direction: SortDirection }>({
		key: 'songId',
		direction: 'asc',
	});

	const loadAdminData = async () => {
		setFetchState('loading');
		setErrorMessage('');
		setEndpointDiagnostics(createEndpointDiagnostics('loading'));

		try {
			const adminCatalog = await loadAdminCatalog();

			const nextDiagnostics: Record<EndpointKey, EndpointDiagnostic> = {
				artists: {
					...ADMIN_ENDPOINTS.artists,
					status: adminCatalog.diagnostics.artists.ok ? 'success' : 'error',
					httpStatus: adminCatalog.diagnostics.artists.status,
					detail: adminCatalog.diagnostics.artists.detail,
				},
				songs: {
					...ADMIN_ENDPOINTS.songs,
					status: adminCatalog.diagnostics.songs.ok ? 'success' : 'error',
					httpStatus: adminCatalog.diagnostics.songs.status,
					detail: adminCatalog.diagnostics.songs.detail,
				},
			};

			setEndpointDiagnostics(nextDiagnostics);

			setArtists(adminCatalog.artists);
			setSongs([...adminCatalog.songs].sort((leftSong, rightSong) => leftSong.songId - rightSong.songId));
			setArtistPage(1);
			setSongPage(1);

			if (!adminCatalog.ok) {
				console.error('Admin backend request failed', adminCatalog);
				setFetchState('error');
				setErrorMessage(adminCatalog.message ?? 'Unknown backend error');
				return;
			}

			setFetchState('success');
		} catch (error) {
			console.error('Admin panel failed to load backend data', error);
			setFetchState('error');
			setErrorMessage(error instanceof Error ? error.message : 'Unknown backend error');
		}
	};

	useEffect(() => {
		void loadAdminData();
	}, []);

	const artistNamesById = new Map(artists.map(artist => [artist.artistId, artist.name]));
	const songCountsByArtistId = songs.reduce((counts, song) => {
		counts.set(song.artistId, (counts.get(song.artistId) ?? 0) + 1);
		return counts;
	}, new Map<number, number>());
	const filteredArtists = artists.filter(artist => artistIdFilter.trim() === '' || String(artist.artistId).includes(artistIdFilter.trim()));
	const filteredSongs = songs.filter(song => songIdFilter.trim() === '' || String(song.songId).includes(songIdFilter.trim()));
	const sortedArtists = [...filteredArtists].sort((leftArtist, rightArtist) => {
		if (artistSort.key === 'name') {
			return compareValues(leftArtist.name, rightArtist.name, artistSort.direction);
		}

		if (artistSort.key === 'songCount') {
			return compareValues(
				songCountsByArtistId.get(leftArtist.artistId) ?? 0,
				songCountsByArtistId.get(rightArtist.artistId) ?? 0,
				artistSort.direction,
			);
		}

		return compareValues(leftArtist.artistId, rightArtist.artistId, artistSort.direction);
	});
	const sortedSongs = [...filteredSongs].sort((leftSong, rightSong) => {
		if (songSort.key === 'title') {
			return compareValues(leftSong.title, rightSong.title, songSort.direction);
		}

		if (songSort.key === 'artistName') {
			return compareValues(
				artistNamesById.get(leftSong.artistId) ?? leftSong.artistId,
				artistNamesById.get(rightSong.artistId) ?? rightSong.artistId,
				songSort.direction,
			);
		}

		if (songSort.key === 'releaseYear') {
			return compareValues(leftSong.releaseYear, rightSong.releaseYear, songSort.direction);
		}

		return compareValues(leftSong.songId, rightSong.songId, songSort.direction);
	});
	const artistTotalPages = Math.max(1, Math.ceil(sortedArtists.length / ITEMS_PER_PAGE));
	const songTotalPages = Math.max(1, Math.ceil(sortedSongs.length / ITEMS_PER_PAGE));
	const safeArtistPage = Math.min(artistPage, artistTotalPages);
	const safeSongPage = Math.min(songPage, songTotalPages);
	const paginatedArtists = paginateItems(sortedArtists, safeArtistPage);
	const paginatedSongs = paginateItems(sortedSongs, safeSongPage);
	const diagnosticsList = Object.values(endpointDiagnostics);

	const toggleArtistSort = (key: ArtistSortKey) => {
		setArtistSort(currentSort => ({
			key,
			direction: currentSort.key === key && currentSort.direction === 'asc' ? 'desc' : 'asc',
		}));
		setArtistPage(1);
	};

	const toggleSongSort = (key: SongSortKey) => {
		setSongSort(currentSort => ({
			key,
			direction: currentSort.key === key && currentSort.direction === 'asc' ? 'desc' : 'asc',
		}));
		setSongPage(1);
	};

	return (
		<div className="pb-12">
			<section className="py-12">
				<div className="container mx-auto px-4">
					<div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
						<div>
							<h1 className="text-4xl md:text-5xl font-bold mb-4">Admin Panel</h1>
							<p className="text-muted-foreground text-lg">
								Gecombineerd overzicht van artiesten en nummers uit de backend.
							</p>
						</div>

						<button
							onClick={() => void loadAdminData()}
							className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-5 py-3 rounded-lg hover:bg-primary/90 transition-colors"
						>
							<RefreshCw className="w-4 h-4" />
							Vernieuwen
						</button>
					</div>
				</div>
			</section>

			<div className="container mx-auto px-4 mt-12 space-y-8">
				<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
					<div className="bg-card border border-border rounded-lg p-6 shadow-sm">
						<div className="flex items-center gap-3 mb-3">
							<Users className="w-6 h-6 text-primary" />
							<h2 className="font-semibold">Artiesten</h2>
						</div>
						<div className="text-3xl font-bold">{artists.length}</div>
						<p className="text-sm text-muted-foreground mt-2">Opgehaald via `/api/artists`</p>
					</div>

					<div className="bg-card border border-border rounded-lg p-6 shadow-sm">
						<div className="flex items-center gap-3 mb-3">
							<Music2 className="w-6 h-6 text-primary" />
							<h2 className="font-semibold">Nummers</h2>
						</div>
						<div className="text-3xl font-bold">{songs.length}</div>
						<p className="text-sm text-muted-foreground mt-2">Opgehaald via `/api/songs`</p>
					</div>

					<div className="bg-card border border-border rounded-lg p-6 shadow-sm">
						<div className="flex items-center gap-3 mb-3">
							<AlertCircle className="w-6 h-6 text-primary" />
							<h2 className="font-semibold">Status</h2>
						</div>
						<div className="text-lg font-semibold">
							{fetchState === 'loading' && 'Backend laden...'}
							{fetchState === 'success' && 'Backend gekoppeld'}
							{fetchState === 'error' && 'Backend returned 500'}
							{fetchState === 'idle' && 'Wachten'}
						</div>
						{errorMessage && (
							<p className="text-sm text-destructive mt-2">{errorMessage}</p>
						)}
					</div>
				</div>

				<section className="grid grid-cols-1 md:grid-cols-2 gap-6">
					{diagnosticsList.map(diagnostic => (
						<div key={diagnostic.key} className="bg-card border border-border rounded-lg p-6 shadow-sm">
							<div className="flex items-center justify-between gap-4 mb-3">
								<div>
									<h2 className="text-xl font-semibold">{diagnostic.label}</h2>
									<p className="text-sm text-muted-foreground">{diagnostic.url}</p>
								</div>
								<div className={`rounded-full px-3 py-1 text-xs font-semibold ${
									diagnostic.status === 'success'
										? 'bg-emerald-500/10 text-emerald-700'
										: diagnostic.status === 'error'
											? 'bg-destructive/10 text-destructive'
											: 'bg-secondary text-foreground'
								}`}>
									{diagnostic.status === 'success' && 'OK'}
									{diagnostic.status === 'error' && `HTTP ${diagnostic.httpStatus ?? 'fout'}`}
									{diagnostic.status === 'loading' && 'Laden'}
									{diagnostic.status === 'idle' && 'Nog niet geladen'}
								</div>
							</div>
							<p className="text-sm text-muted-foreground mb-4">{diagnostic.detail}</p>
							<p className="text-xs uppercase tracking-[0.18em] text-muted-foreground mb-2">Verwachte velden</p>
							<div className="flex flex-wrap gap-2">
								{diagnostic.expectedFields.map(field => (
									<span key={field} className="rounded-full bg-secondary px-3 py-1 text-xs text-foreground">
										{field}
									</span>
								))}
							</div>
						</div>
					))}
				</section>

				{fetchState === 'loading' && (
					<div className="bg-card border border-border rounded-lg p-8 flex items-center justify-center gap-3 text-muted-foreground">
						<Loader2 className="w-5 h-5 animate-spin" />
						Backend data wordt geladen...
					</div>
				)}

				{fetchState === 'error' && (
					<div className="bg-destructive/5 border border-destructive/30 rounded-lg p-6">
						<div className="flex items-center gap-3 text-destructive font-semibold mb-2">
							<AlertCircle className="w-5 h-5" />
							Backend data kon niet worden geladen
						</div>
						<p className="text-sm text-muted-foreground">{errorMessage}</p>
						<p className="text-sm text-muted-foreground mt-2">
							De browser liet eerder een CORS-melding zien, maar de directe oorzaak is nu zichtbaar per endpoint hierboven.
						</p>
					</div>
				)}

				<section className="bg-card border border-border rounded-lg shadow-md overflow-hidden">
					<div className="px-6 py-4 border-b border-border flex items-center justify-between">
						<div>
							<h2 className="text-2xl font-bold">Artiesten</h2>
							<p className="text-sm text-muted-foreground">Live data uit de backend</p>
						</div>
						<input
							type="text"
							value={artistIdFilter}
							onChange={(event) => {
								setArtistIdFilter(event.target.value);
								setArtistPage(1);
							}}
							placeholder="Zoek op artiest ID"
							className="w-full max-w-52 px-4 py-2 rounded-lg border border-border bg-background"
						/>
					</div>

					<div className="overflow-x-auto">
						<table className="w-full">
							<thead className="bg-secondary">
								<tr>
									<th className="px-4 py-3 text-left"><SortHeader label="ID" isActive={artistSort.key === 'artistId'} direction={artistSort.direction} onClick={() => toggleArtistSort('artistId')} /></th>
									<th className="px-4 py-3 text-left"><SortHeader label="Naam" isActive={artistSort.key === 'name'} direction={artistSort.direction} onClick={() => toggleArtistSort('name')} /></th>
									<th className="px-4 py-3 text-left"><SortHeader label="Aantal nummers" isActive={artistSort.key === 'songCount'} direction={artistSort.direction} onClick={() => toggleArtistSort('songCount')} /></th>
									<th className="px-4 py-3 text-left">Website</th>
									<th className="px-4 py-3 text-left">Wikipedia</th>
								</tr>
							</thead>
							<tbody>
								{artists.length === 0 ? (
									<tr>
										<td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
											Geen artiesten geladen.
										</td>
									</tr>
								) : paginatedArtists.map((artist, index) => (
									<tr key={artist.artistId ?? `${artist.name}-${index}`} className={index % 2 === 0 ? 'bg-secondary/30' : ''}>
										<td className="px-4 py-3">{artist.artistId}</td>
										<td className="px-4 py-3 font-semibold">{artist.name}</td>
										<td className="px-4 py-3">{songCountsByArtistId.get(artist.artistId) ?? 0}</td>
										<td className="px-4 py-3">
											{artist.website ? (
												<a href={artist.website} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline text-sm">
													Link
												</a>
											) : (
												<span className="text-muted-foreground text-sm">-</span>
											)}
										</td>
										<td className="px-4 py-3">
												<a href={`https://nl.wikipedia.org/wiki/${artist.name}`} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline text-sm">
													{artist.name}
												</a>
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>

					<div className="px-6 py-4 border-t border-border flex items-center justify-between gap-4">
						<p className="text-sm text-muted-foreground">
							Pagina {safeArtistPage} van {artistTotalPages}
						</p>
						<Pagination currentPage={safeArtistPage} totalPages={artistTotalPages} onPageChange={setArtistPage} />
					</div>
				</section>

				<section className="bg-card border border-border rounded-lg shadow-md overflow-hidden">
					<div className="px-6 py-4 border-b border-border flex items-center justify-between">
						<div>
							<h2 className="text-2xl font-bold">Nummers</h2>
							<p className="text-sm text-muted-foreground">Live data uit de backend</p>
						</div>
						<input
							type="text"
							value={songIdFilter}
							onChange={(event) => {
								setSongIdFilter(event.target.value);
								setSongPage(1);
							}}
							placeholder="Zoek op song ID"
							className="w-full max-w-52 px-4 py-2 rounded-lg border border-border bg-background"
						/>
					</div>

					<div className="overflow-x-auto">
						<table className="w-full">
							<thead className="bg-secondary">
								<tr>
									<th className="px-4 py-3 text-left"><SortHeader label="ID" isActive={songSort.key === 'songId'} direction={songSort.direction} onClick={() => toggleSongSort('songId')} /></th>
									<th className="px-4 py-3 text-left"><SortHeader label="Titel" isActive={songSort.key === 'title'} direction={songSort.direction} onClick={() => toggleSongSort('title')} /></th>
									<th className="px-4 py-3 text-left"><SortHeader label="Artiest" isActive={songSort.key === 'artistName'} direction={songSort.direction} onClick={() => toggleSongSort('artistName')} /></th>
									<th className="px-4 py-3 text-left"><SortHeader label="Jaar" isActive={songSort.key === 'releaseYear'} direction={songSort.direction} onClick={() => toggleSongSort('releaseYear')} /></th>
									<th className="px-4 py-3 text-left">Keer in lijst</th>
									<th className="px-4 py-3 text-left">YouTube</th>
								</tr>
							</thead>
							<tbody>
								{songs.length === 0 ? (
									<tr>
										<td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
											Geen nummers geladen.
										</td>
									</tr>
								) : paginatedSongs.map((song, index) => (
									<tr key={song.songId ?? `${song.title}-${song.artistId}-${index}`} className={index % 2 === 0 ? 'bg-secondary/30' : ''}>
										<td className="px-4 py-3">{song.songId}</td>
										<td className="px-4 py-3 font-semibold">{song.title}</td>
										<td className="px-4 py-3">{artistNamesById.get(song.artistId) ?? song.artistId}</td>
										<td className="px-4 py-3">{song.releaseYear}</td>
										<td className="px-4 py-3">0</td>
										<td className="px-4 py-3">
											{song.youtube ? (
												<a href={song.youtube} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline text-sm">
													Link
												</a>
											) : (
												<span className="text-muted-foreground text-sm">-</span>
											)}
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>

					<div className="px-6 py-4 border-t border-border flex items-center justify-between gap-4">
						<p className="text-sm text-muted-foreground">
							Pagina {safeSongPage} van {songTotalPages}
						</p>
						<Pagination currentPage={safeSongPage} totalPages={songTotalPages} onPageChange={setSongPage} />
					</div>
				</section>
			</div>
		</div>
	);
}
