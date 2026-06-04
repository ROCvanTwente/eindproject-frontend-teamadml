import React, { useEffect, useState, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
	AlertCircle,
	Loader2,
	Music2,
	RefreshCw,
	Users,
	Trash2,
	Edit2,
	X,
	Plus,
	Info,
	Image,
	LayoutDashboard,
	Activity,
	CheckCircle2,
	ChevronDown,
	ChevronUp,
	ExternalLink,
	Search,
	Filter,
	Calendar,
	Youtube,
	Globe,
	Sparkles,
	Flame,
	Settings,
	Key
} from 'lucide-react';
import {
	loadAdminCatalog,
	type BackendArtist,
	type BackendSong,
	createArtist,
	updateArtist,
	deleteArtist,
	createSong,
	updateSong,
	deleteSong
} from '../data/api';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'motion/react';
import {
	ResponsiveContainer,
	BarChart,
	Bar,
	XAxis,
	YAxis,
	Tooltip,
	CartesianGrid,
	AreaChart,
	Area,
	Cell
} from 'recharts';

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
			className="inline-flex items-center gap-2 hover:text-primary transition-colors text-left"
		>
			<span className="font-semibold">{label}</span>
			<span className="text-xs text-muted-foreground">{isActive ? (direction === 'asc' ? '▲' : '▼') : '↕'}</span>
		</button>
	);
}

export function AdminPanel() {
	const location = useLocation();
	const navigate = useNavigate();

	const [artists, setArtists] = useState<BackendArtist[]>([]);
	const [songs, setSongs] = useState<BackendSong[]>([]);
	const [fetchState, setFetchState] = useState<FetchState>('idle');
	const [errorMessage, setErrorMessage] = useState('');
	const [endpointDiagnostics, setEndpointDiagnostics] = useState<Record<EndpointKey, EndpointDiagnostic>>(
		() => createEndpointDiagnostics('idle')
	);
	const [artistPage, setArtistPage] = useState(1);
	const [songPage, setSongPage] = useState(1);
	
	// Global Search Filters
	const [artistSearchQuery, setArtistSearchQuery] = useState('');
	const [songSearchQuery, setSongSearchQuery] = useState('');
	const [songArtistFilter, setSongArtistFilter] = useState('');

	// Sorting
	const [artistSort, setArtistSort] = useState<{ key: ArtistSortKey; direction: SortDirection }>({
		key: 'artistId',
		direction: 'asc',
	});
	const [songSort, setSongSort] = useState<{ key: SongSortKey; direction: SortDirection }>({
		key: 'songId',
		direction: 'asc',
	});

	// Expanded Row for Artists
	const [expandedArtistId, setExpandedArtistId] = useState<number | null>(null);

	// Modals and CRUD States
	const [activeModal, setActiveModal] = useState<'add_artist' | 'edit_artist' | 'add_song' | 'edit_song' | null>(null);
	const [confirmDeleteModal, setConfirmDeleteModal] = useState<{ type: 'artist' | 'song'; id: number; name: string } | null>(null);
	const [submitting, setSubmitting] = useState(false);
	const [submitError, setSubmitError] = useState('');

	// Artist Form Fields
	const [artistFormId, setArtistFormId] = useState<number | null>(null);
	const [artistFormName, setArtistFormName] = useState('');
	const [artistFormBiography, setArtistFormBiography] = useState('');
	const [artistFormPhoto, setArtistFormPhoto] = useState('');
	const [artistFormWebsite, setArtistFormWebsite] = useState('');

	// Song Form Fields
	const [songFormId, setSongFormId] = useState<number | null>(null);
	const [songFormTitle, setSongFormTitle] = useState('');
	const [songFormArtistId, setSongFormArtistId] = useState('');
	const [songFormReleaseYear, setSongFormReleaseYear] = useState('');
	const [songFormYoutube, setSongFormYoutube] = useState('');
	const [songFormImgUrl, setSongFormImgUrl] = useState('');
	const [songFormLyrics, setSongFormLyrics] = useState('');

	// Spotify API Integration States
	const [fetchingSpotify, setFetchingSpotify] = useState(false);

	// Navigation tab state synced with URL path
	const currentTab = useMemo(() => {
		if (location.pathname.includes('/artiesten')) return 'artists';
		if (location.pathname.includes('/nummers')) return 'songs';
		return 'overview';
	}, [location.pathname]);

	const handleOpenAddArtistModal = () => {
		setArtistFormId(null);
		setArtistFormName('');
		setArtistFormBiography('');
		setArtistFormPhoto('');
		setArtistFormWebsite('');
		setSubmitError('');
		setActiveModal('add_artist');
	};

	const handleOpenEditArtistModal = (artist: BackendArtist) => {
		setArtistFormId(artist.artistId);
		setArtistFormName(artist.name);
		setArtistFormBiography(artist.biography ?? artist.bio ?? '');
		setArtistFormPhoto(artist.photo ?? artist.photoUrl ?? '');
		setArtistFormWebsite(artist.website ?? '');
		setSubmitError('');
		setActiveModal('edit_artist');
	};

	const handleOpenAddSongModal = () => {
		setSongFormId(null);
		setSongFormTitle('');
		setSongFormArtistId(artists.length > 0 ? String(artists[0].artistId) : '');
		setSongFormReleaseYear(String(new Date().getFullYear()));
		setSongFormYoutube('');
		setSongFormImgUrl('');
		setSongFormLyrics('');
		setSubmitError('');
		setActiveModal('add_song');
	};

	const handleOpenEditSongModal = (song: BackendSong) => {
		setSongFormId(song.songId);
		setSongFormTitle(song.title);
		setSongFormArtistId(String(song.artistId));
		setSongFormReleaseYear(String(song.releaseYear));
		setSongFormYoutube(song.youtube ?? '');
		setSongFormImgUrl(song.imgUrl ?? song.albumCover ?? '');
		setSongFormLyrics(song.lyrics ?? song.lyricsPreview ?? '');
		setSubmitError('');
		setActiveModal('edit_song');
	};

	const handleFetchSpotifyCover = async () => {
		if (!songFormTitle.trim()) {
			toast.error('Vul eerst een titel in');
			return;
		}
		
		const selectedArtist = artists.find(a => String(a.artistId) === String(songFormArtistId));
		const artistName = selectedArtist ? selectedArtist.name : '';
		
		if (!artistName) {
			toast.error('Selecteer eerst een artiest');
			return;
		}

		setFetchingSpotify(true);
		try {
			const titleParam = encodeURIComponent(songFormTitle.trim());
			const artistParam = encodeURIComponent(artistName);
			
			const response = await fetch(`/api/songs/spotify-cover?title=${titleParam}&artist=${artistParam}`);

			if (!response.ok) {
				const errorMsg = await response.text();
				throw new Error(errorMsg || `Server fout ${response.status}`);
			}

			const data = await response.json();
			const coverUrl = data.coverUrl;

			if (coverUrl) {
				setSongFormImgUrl(coverUrl);
				toast.success('Cover image succesvol opgehaald via de backend proxy!');
			} else {
				toast.error('Geen cover image gevonden voor dit nummer');
			}
		} catch (error: any) {
			console.error('Spotify API Fout:', error);
			toast.error(`Spotify Fout: ${error.message || 'Onbekende fout'}`);
		} finally {
			setFetchingSpotify(false);
		}
	};

	const handleSubmitArtist = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!artistFormName.trim()) {
			setSubmitError('Naam is verplicht.');
			return;
		}

		setSubmitting(true);
		setSubmitError('');

		const artistData = {
			name: artistFormName.trim(),
			biography: artistFormBiography.trim(),
			bio: artistFormBiography.trim(),
			photo: artistFormPhoto.trim(),
			photoUrl: artistFormPhoto.trim(),
			website: artistFormWebsite.trim(),
		};

		try {
			let result;
			if (activeModal === 'add_artist') {
				result = await createArtist(artistData);
			} else {
				result = await updateArtist(artistFormId!, { artistId: artistFormId!, ...artistData });
			}

			if (result.ok) {
				toast.success(activeModal === 'add_artist' ? 'Artiest succesvol toegevoegd!' : 'Artiest succesvol bijgewerkt!');
				setActiveModal(null);
				await loadAdminData();
			} else {
				setSubmitError(result.message ?? 'Er is een fout opgetreden.');
				toast.error(result.message ?? 'Opslaan mislukt.');
			}
		} catch (err) {
			setSubmitError(err instanceof Error ? err.message : 'Netwerkfout.');
			toast.error('Er is een netwerkfout opgetreden.');
		} finally {
			setSubmitting(false);
		}
	};

	const handleSubmitSong = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!songFormTitle.trim()) {
			setSubmitError('Titel is verplicht.');
			return;
		}
		if (!songFormArtistId) {
			setSubmitError('Selecteer een artiest.');
			return;
		}
		const yearNum = Number(songFormReleaseYear);
		if (isNaN(yearNum) || yearNum < 1800 || yearNum > new Date().getFullYear() + 2) {
			setSubmitError('Voer een geldig jaartal in.');
			return;
		}

		setSubmitting(true);
		setSubmitError('');

		const songData = {
			title: songFormTitle.trim(),
			artistId: Number(songFormArtistId),
			releaseYear: yearNum,
			youtube: songFormYoutube.trim(),
			imgUrl: songFormImgUrl.trim(),
			albumCover: songFormImgUrl.trim(),
			lyrics: songFormLyrics.trim(),
			lyricsPreview: songFormLyrics.trim(),
		};

		try {
			let result;
			if (activeModal === 'add_song') {
				result = await createSong(songData);
			} else {
				result = await updateSong(songFormId!, { songId: songFormId!, ...songData });
			}

			if (result.ok) {
				toast.success(activeModal === 'add_song' ? 'Nummer succesvol toegevoegd!' : 'Nummer succesvol bijgewerkt!');
				setActiveModal(null);
				await loadAdminData();
			} else {
				setSubmitError(result.message ?? 'Er is een fout opgetreden.');
				toast.error(result.message ?? 'Opslaan mislukt.');
			}
		} catch (err) {
			setSubmitError(err instanceof Error ? err.message : 'Netwerkfout.');
			toast.error('Er is een netwerkfout opgetreden.');
		} finally {
			setSubmitting(false);
		}
	};

	const handleDeleteConfirm = async () => {
		if (!confirmDeleteModal) return;
		setSubmitting(true);
		setSubmitError('');

		try {
			let result;
			if (confirmDeleteModal.type === 'artist') {
				result = await deleteArtist(confirmDeleteModal.id);
			} else {
				result = await deleteSong(confirmDeleteModal.id);
			}

			if (result.ok) {
				toast.success(`${confirmDeleteModal.type === 'artist' ? 'Artiest' : 'Nummer'} succesvol verwijderd!`);
				setConfirmDeleteModal(null);
				await loadAdminData();
			} else {
				const errMsg = result.message ?? 'Verwijderen mislukt. Deze artiest heeft mogelijk nog gekoppelde nummers.';
				setSubmitError(errMsg);
				toast.error(errMsg);
			}
		} catch (err) {
			setSubmitError(err instanceof Error ? err.message : 'Netwerkfout bij het verwijderen.');
			toast.error('Netwerkfout bij verwijderen.');
		} finally {
			setSubmitting(false);
		}
	};

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
			setSongs([...adminCatalog.songs].sort((a, b) => a.songId - b.songId));

			if (!adminCatalog.ok) {
				setFetchState('error');
				setErrorMessage(adminCatalog.message ?? 'Backend data kon niet volledig worden geladen.');
				toast.error('Fout bij het laden van backend data.');
				return;
			}

			setFetchState('success');
		} catch (error) {
			setFetchState('error');
			setErrorMessage(error instanceof Error ? error.message : 'Onbekende fout.');
			toast.error('Netwerkfout bij het ophalen van backend data.');
		}
	};

	useEffect(() => {
		void loadAdminData();
	}, []);

	// Calculations for Stats and Sorting
	const artistNamesById = useMemo(() => new Map(artists.map(a => [a.artistId, a.name])), [artists]);
	const songCountsByArtistId = useMemo(() => {
		const counts = new Map<number, number>();
		songs.forEach(song => {
			counts.set(song.artistId, (counts.get(song.artistId) ?? 0) + 1);
		});
		return counts;
	}, [songs]);

	// Filter and Sort Artists
	const filteredArtists = useMemo(() => {
		return artists.filter(artist => {
			const query = artistSearchQuery.toLowerCase().trim();
			if (!query) return true;
			return (
				String(artist.artistId).includes(query) ||
				artist.name.toLowerCase().includes(query) ||
				(artist.biography ?? artist.bio ?? '').toLowerCase().includes(query)
			);
		});
	}, [artists, artistSearchQuery]);

	const sortedArtists = useMemo(() => {
		return [...filteredArtists].sort((left, right) => {
			if (artistSort.key === 'name') {
				return compareValues(left.name, right.name, artistSort.direction);
			}
			if (artistSort.key === 'songCount') {
				return compareValues(
					songCountsByArtistId.get(left.artistId) ?? 0,
					songCountsByArtistId.get(right.artistId) ?? 0,
					artistSort.direction,
				);
			}
			return compareValues(left.artistId, right.artistId, artistSort.direction);
		});
	}, [filteredArtists, artistSort, songCountsByArtistId]);

	// Filter and Sort Songs
	const filteredSongs = useMemo(() => {
		return songs.filter(song => {
			const query = songSearchQuery.toLowerCase().trim();
			const matchQuery = !query || (
				String(song.songId).includes(query) ||
				song.title.toLowerCase().includes(query) ||
				(artistNamesById.get(song.artistId) ?? '').toLowerCase().includes(query) ||
				String(song.releaseYear).includes(query)
			);
			
			const matchArtist = !songArtistFilter || String(song.artistId) === songArtistFilter;
			return matchQuery && matchArtist;
		});
	}, [songs, songSearchQuery, songArtistFilter, artistNamesById]);

	const sortedSongs = useMemo(() => {
		return [...filteredSongs].sort((left, right) => {
			if (songSort.key === 'title') {
				return compareValues(left.title, right.title, songSort.direction);
			}
			if (songSort.key === 'artistName') {
				return compareValues(
					artistNamesById.get(left.artistId) ?? left.artistId,
					artistNamesById.get(right.artistId) ?? right.artistId,
					songSort.direction,
				);
			}
			if (songSort.key === 'releaseYear') {
				return compareValues(left.releaseYear, right.releaseYear, songSort.direction);
			}
			return compareValues(left.songId, right.songId, songSort.direction);
		});
	}, [filteredSongs, songSort, artistNamesById]);

	// Paginations
	const artistTotalPages = Math.max(1, Math.ceil(sortedArtists.length / ITEMS_PER_PAGE));
	const songTotalPages = Math.max(1, Math.ceil(sortedSongs.length / ITEMS_PER_PAGE));
	const safeArtistPage = Math.min(artistPage, artistTotalPages);
	const safeSongPage = Math.min(songPage, songTotalPages);
	const paginatedArtists = paginateItems(sortedArtists, safeArtistPage);
	const paginatedSongs = paginateItems(sortedSongs, safeSongPage);

	// Charts computations
	const songsByDecade = useMemo(() => {
		const counts: Record<string, number> = {};
		songs.forEach(song => {
			const year = song.releaseYear;
			if (!year) return;
			let decade = 'Other';
			if (year < 1960) decade = '< 1960';
			else if (year >= 1960 && year < 1970) decade = '60s';
			else if (year >= 1970 && year < 1980) decade = '70s';
			else if (year >= 1980 && year < 1990) decade = '80s';
			else if (year >= 1990 && year < 2000) decade = '90s';
			else if (year >= 2000 && year < 2010) decade = '00s';
			else if (year >= 2010 && year < 2020) decade = '10s';
			else if (year >= 2020) decade = '20s';
			counts[decade] = (counts[decade] || 0) + 1;
		});

		const order = ['< 1960', '60s', '70s', '80s', '90s', '00s', '10s', '20s'];
		return order
			.map(dec => ({ decade: dec, Aantal: counts[dec] || 0 }))
			.filter(item => item.Aantal > 0);
	}, [songs]);

	const topArtistsData = useMemo(() => {
		return artists
			.map(artist => ({
				name: artist.name,
				Aantal: songCountsByArtistId.get(artist.artistId) ?? 0
			}))
			.sort((a, b) => b.Aantal - a.Aantal)
			.slice(0, 7)
			.filter(item => item.Aantal > 0);
	}, [artists, songCountsByArtistId]);

	const toggleArtistSort = (key: ArtistSortKey) => {
		setArtistSort(current => ({
			key,
			direction: current.key === key && current.direction === 'asc' ? 'desc' : 'asc',
		}));
		setArtistPage(1);
	};

	const toggleSongSort = (key: SongSortKey) => {
		setSongSort(current => ({
			key,
			direction: current.key === key && current.direction === 'asc' ? 'desc' : 'asc',
		}));
		setSongPage(1);
	};

	const diagnosticsList = Object.values(endpointDiagnostics);

	return (
		<div className="flex flex-col lg:flex-row min-h-screen text-foreground relative">
			{/* Dashboard Sidebar */}
			<aside className="w-full lg:w-72 flex-shrink-0 border-b lg:border-b-0 lg:border-r border-white/10 p-6 flex flex-col gap-6">
				<div className="flex items-center gap-3 pb-6 border-b border-white/10">
					<div className="w-10 h-10 bg-primary/20 rounded-xl flex items-center justify-center border border-primary/40">
						<Sparkles className="w-5 h-5 text-primary" />
					</div>
					<div>
						<h2 className="font-bold text-lg leading-tight">Beheerpaneel</h2>
						<span className="text-xs text-muted-foreground flex items-center gap-1.5 mt-0.5">
							<span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
							Systeem Actief
						</span>
					</div>
				</div>

				<nav className="flex flex-row lg:flex-col gap-1.5 overflow-x-auto pb-2 lg:pb-0 scrollbar-none">
					<button
						onClick={() => navigate('/admin')}
						className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 cursor-pointer whitespace-nowrap ${
							currentTab === 'overview'
								? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20'
								: 'hover:bg-white/5 text-muted-foreground hover:text-foreground'
						}`}
					>
						<LayoutDashboard className="w-4 h-4" />
						Dashboard Overzicht
					</button>

					<button
						onClick={() => navigate('/admin/artiesten')}
						className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 cursor-pointer whitespace-nowrap ${
							currentTab === 'artists'
								? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20'
								: 'hover:bg-white/5 text-muted-foreground hover:text-foreground'
						}`}
					>
						<Users className="w-4 h-4" />
						Artiesten Beheer
					</button>

					<button
						onClick={() => navigate('/admin/nummers')}
						className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 cursor-pointer whitespace-nowrap ${
							currentTab === 'songs'
								? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20'
								: 'hover:bg-white/5 text-muted-foreground hover:text-foreground'
						}`}
					>
						<Music2 className="w-4 h-4" />
						Nummers Beheer
					</button>
				</nav>

				<div className="mt-auto hidden lg:flex flex-col gap-4 pt-6 border-t border-white/10">
					<div className="bg-white/5 rounded-xl p-4 border border-white/5">
						<span className="text-xs uppercase tracking-wider text-muted-foreground font-semibold block mb-2">Backend Services</span>
						<div className="space-y-2">
							{diagnosticsList.map(diag => (
								<div key={diag.key} className="flex items-center justify-between text-xs">
									<span className="text-muted-foreground">{diag.label}</span>
									<span className={`inline-flex items-center gap-1 font-bold ${
										diag.status === 'success' ? 'text-emerald-500' : 'text-primary'
									}`}>
										<span className={`w-1.5 h-1.5 rounded-full ${
											diag.status === 'success' ? 'bg-emerald-500' : 'bg-primary'
										}`}></span>
										{diag.status === 'success' ? 'OK' : 'FAIL'}
									</span>
								</div>
							))}
						</div>
					</div>
					<button
						onClick={() => void loadAdminData()}
						className="inline-flex items-center justify-center gap-2 bg-secondary hover:bg-white/15 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer border border-white/5"
					>
						<RefreshCw className="w-3.5 h-3.5" />
						Gegevens Vernieuwen
					</button>
				</div>
			</aside>

			{/* Main Content Pane */}
			<main className="flex-1 p-6 md:p-8 overflow-y-auto max-w-7xl mx-auto w-full space-y-8">
				{/* Top bar header */}
				<header className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-white/10">
					<div>
						<h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">
							{currentTab === 'overview' && 'Dashboard Overzicht'}
							{currentTab === 'artists' && 'Artiesten Database'}
							{currentTab === 'songs' && 'Nummers Catalogus'}
						</h1>
						<p className="text-muted-foreground text-sm mt-1">
							{currentTab === 'overview' && 'Status, statistieken en overzicht van de TOP 2000 catalogus.'}
							{currentTab === 'artists' && 'Beheer artiesten in de catalogus. Klik op een artiest voor detailweergave.'}
							{currentTab === 'songs' && 'Volledige catalogus van nummers, gekoppelde artiesten en media.'}
						</p>
					</div>

					<div className="flex items-center gap-3">
						<button
							onClick={() => void loadAdminData()}
							disabled={fetchState === 'loading'}
							className="inline-flex lg:hidden items-center justify-center p-3 rounded-xl border border-white/10 hover:bg-secondary transition-colors"
							aria-label="Vernieuwen"
						>
							<RefreshCw className={`w-4 h-4 ${fetchState === 'loading' ? 'animate-spin' : ''}`} />
						</button>

						{currentTab === 'artists' && (
							<button
								onClick={handleOpenAddArtistModal}
								className="bg-primary hover:bg-primary/90 text-primary-foreground px-5 py-3 rounded-xl font-bold flex items-center gap-2 transition-all shadow-lg shadow-primary/10 cursor-pointer"
							>
								<Plus className="w-5 h-5" />
								Artiest Toevoegen
							</button>
						)}

						{currentTab === 'songs' && (
							<button
								onClick={handleOpenAddSongModal}
								className="bg-primary hover:bg-primary/90 text-primary-foreground px-5 py-3 rounded-xl font-bold flex items-center gap-2 transition-all shadow-lg shadow-primary/10 cursor-pointer"
							>
								<Plus className="w-5 h-5" />
								Nummer Toevoegen
							</button>
						)}
					</div>
				</header>

				{/* Loading / Error States */}
				{fetchState === 'loading' && (
					<div className="bg-card/40 border border-border backdrop-blur-sm rounded-2xl p-12 flex flex-col items-center justify-center gap-4 text-muted-foreground">
						<Loader2 className="w-8 h-8 animate-spin text-primary" />
						<span className="font-semibold text-sm">Gegevens synchroniseren met database...</span>
					</div>
				)}

				{fetchState === 'error' && (
					<div className="bg-destructive/10 border border-destructive/20 rounded-2xl p-6 flex gap-4 items-start">
						<AlertCircle className="w-6 h-6 text-destructive flex-shrink-0 mt-0.5" />
						<div>
							<h3 className="text-lg font-bold text-destructive">Synchronisatiefout</h3>
							<p className="text-sm text-muted-foreground mt-1">{errorMessage}</p>
							<p className="text-xs text-muted-foreground/80 mt-2">
								Controleer of de dotnet backend service correct is opgestart op http://localhost:5229.
							</p>
						</div>
					</div>
				)}

				{fetchState !== 'loading' && (
					<AnimatePresence mode="wait">
						<motion.div
							key={currentTab}
							initial={{ opacity: 0, y: 15 }}
							animate={{ opacity: 1, y: 0 }}
							exit={{ opacity: 0, y: -15 }}
							transition={{ duration: 0.2 }}
							className="space-y-8"
						>
							{/* Tab content: Overview */}
							{currentTab === 'overview' && (
								<div className="space-y-8">
									{/* Stats Grid */}
									<div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
										<div className="bg-card border border-border rounded-2xl p-6 hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 group">
											<div className="flex items-center justify-between mb-3">
												<span className="text-sm font-semibold text-muted-foreground group-hover:text-foreground transition-colors">Totaal Artiesten</span>
												<div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
													<Users className="w-4 h-4" />
												</div>
											</div>
											<div className="text-4xl font-extrabold tracking-tight">{artists.length}</div>
											<span className="text-xs text-muted-foreground mt-1 block">Beschikbaar op `/api/artists`</span>
										</div>

										<div className="bg-card border border-border rounded-2xl p-6 hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 group">
											<div className="flex items-center justify-between mb-3">
												<span className="text-sm font-semibold text-muted-foreground group-hover:text-foreground transition-colors">Totaal Nummers</span>
												<div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
													<Music2 className="w-4 h-4" />
												</div>
											</div>
											<div className="text-4xl font-extrabold tracking-tight">{songs.length}</div>
											<span className="text-xs text-muted-foreground mt-1 block">Beschikbaar op `/api/songs`</span>
										</div>

										<div className="bg-card border border-border rounded-2xl p-6 hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 group">
											<div className="flex items-center justify-between mb-3">
												<span className="text-sm font-semibold text-muted-foreground group-hover:text-foreground transition-colors">Systeemstatus</span>
												<div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
													<Activity className="w-4 h-4" />
												</div>
											</div>
											<div className="text-xl font-bold flex items-center gap-2 mt-2">
												<span className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse"></span>
												Gekoppeld
											</div>
											<span className="text-xs text-muted-foreground mt-2 block">Vite API Proxy Actief</span>
										</div>
									</div>

									{/* Charts and Health Diagnostics Grid */}
									<div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
										{/* Chart 1: Decade Distribution */}
										<div className="bg-card border border-border rounded-2xl p-6 flex flex-col">
											<h3 className="text-lg font-bold mb-1 flex items-center gap-2">
												<Calendar className="w-4 h-4 text-primary" />
												Distributie per Decennium
											</h3>
											<p className="text-xs text-muted-foreground mb-6">Aantal nummers gecategoriseerd per release decennium.</p>
											
											<div className="w-full h-72 flex-1">
												{songsByDecade.length > 0 ? (
													<ResponsiveContainer width="100%" height={280}>
														<AreaChart data={songsByDecade} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
															<defs>
																<linearGradient id="colorSongs" x1="0" y1="0" x2="0" y2="1">
																	<stop offset="5%" stopColor="var(--primary)" stopOpacity={0.4}/>
																	<stop offset="95%" stopColor="var(--primary)" stopOpacity={0}/>
																</linearGradient>
															</defs>
															<CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
															<XAxis dataKey="decade" stroke="rgba(255,255,255,0.4)" fontSize={11} />
															<YAxis stroke="rgba(255,255,255,0.4)" fontSize={11} allowDecimals={false} />
															<Tooltip 
																contentStyle={{ 
																	backgroundColor: 'var(--popover)', 
																	borderColor: 'var(--border)',
																	borderRadius: '12px',
																	color: 'var(--foreground)'
																}}
															/>
															<Area type="monotone" dataKey="Aantal" stroke="var(--primary)" strokeWidth={2.5} fillOpacity={1} fill="url(#colorSongs)" />
														</AreaChart>
													</ResponsiveContainer>
												) : (
													<div className="h-full flex items-center justify-center text-xs text-muted-foreground">Geen catalogusdata om te visualiseren.</div>
												)}
											</div>
										</div>

										{/* Chart 2: Top Artists */}
										<div className="bg-card border border-border rounded-2xl p-6 flex flex-col">
											<h3 className="text-lg font-bold mb-1 flex items-center gap-2">
												<Flame className="w-4 h-4 text-primary" />
												Meeste Nummers in Catalogus
											</h3>
											<p className="text-xs text-muted-foreground mb-6">Top artiesten gerangschikt naar aantal geregistreerde songs.</p>

											<div className="w-full h-72 flex-1">
												{topArtistsData.length > 0 ? (
													<ResponsiveContainer width="100%" height={280}>
														<BarChart data={topArtistsData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
															<CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
															<XAxis dataKey="name" stroke="rgba(255,255,255,0.4)" fontSize={10} tickFormatter={(value) => value.slice(0, 10)} />
															<YAxis stroke="rgba(255,255,255,0.4)" fontSize={11} allowDecimals={false} />
															<Tooltip 
																contentStyle={{ 
																	backgroundColor: 'var(--popover)', 
																	borderColor: 'var(--border)',
																	borderRadius: '12px',
																	color: 'var(--foreground)'
																}}
															/>
															<Bar dataKey="Aantal" radius={[6, 6, 0, 0]}>
																{topArtistsData.map((entry, index) => (
																	<Cell key={`cell-${index}`} fill={index === 0 ? 'var(--primary)' : 'rgba(255,255,255,0.18)'} />
																))}
															</Bar>
														</BarChart>
													</ResponsiveContainer>
												) : (
													<div className="h-full flex items-center justify-center text-xs text-muted-foreground">Geen catalogusdata om te visualiseren.</div>
												)}
											</div>
										</div>
									</div>

									{/* Endpoint diagnostics detail widget */}
									<section className="bg-card border border-border rounded-2xl p-6">
										<h3 className="text-lg font-bold mb-4">API Diagnose & Koppelingen</h3>
										<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
											{diagnosticsList.map(diagnostic => (
												<div key={diagnostic.key} className="bg-white/5 border border-white/5 rounded-xl p-5">
													<div className="flex items-center justify-between gap-4 mb-3">
														<div>
															<h4 className="font-bold text-base">{diagnostic.label}</h4>
															<code className="text-xs text-muted-foreground">{diagnostic.url}</code>
														</div>
														<div className={`rounded-full px-3 py-1 text-xs font-bold ${
															diagnostic.status === 'success'
																? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
																: diagnostic.status === 'error'
																	? 'bg-destructive/10 text-primary border border-primary/20'
																	: 'bg-white/5 text-foreground'
														}`}>
															{diagnostic.status === 'success' && 'VERBONDEN'}
															{diagnostic.status === 'error' && `ERROR ${diagnostic.httpStatus ?? ''}`}
															{diagnostic.status === 'loading' && 'LADEN...'}
															{diagnostic.status === 'idle' && 'GEEN REQUEST'}
														</div>
													</div>
													<p className="text-xs text-muted-foreground mb-4">{diagnostic.detail}</p>
													<span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold block mb-2">Verwacht Schema</span>
													<div className="flex flex-wrap gap-1.5">
														{diagnostic.expectedFields.map(field => (
															<span key={field} className="rounded-md bg-white/5 border border-white/5 px-2 py-0.5 text-xs font-mono text-muted-foreground">
																{field}
															</span>
														))}
													</div>
												</div>
											))}
										</div>
									</section>
								</div>
							)}

							{/* Tab content: Artists */}
							{currentTab === 'artists' && (
								<div className="bg-card border border-border rounded-2xl shadow-xl overflow-hidden">
									{/* Controls header */}
									<div className="p-6 border-b border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white/5">
										<div className="relative max-w-md w-full">
											<Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
											<input
												type="text"
												value={artistSearchQuery}
												onChange={(e) => {
													setArtistSearchQuery(e.target.value);
													setArtistPage(1);
												}}
												placeholder="Zoek artiesten op naam, ID of biografie..."
												className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-white/10 bg-background/50 focus:outline-none focus:border-primary text-sm transition-colors"
											/>
										</div>

										<div className="text-xs text-muted-foreground font-semibold">
											{filteredArtists.length} resultaten gevonden
										</div>
									</div>

									{/* Table */}
									<div className="overflow-x-auto">
										<table className="w-full text-sm text-left border-collapse">
											<thead>
												<tr className="border-b border-white/10 bg-white/5 text-xs uppercase tracking-wider text-muted-foreground">
													<th className="px-6 py-4 w-12 text-center"></th>
													<th className="px-6 py-4"><SortHeader label="ID" isActive={artistSort.key === 'artistId'} direction={artistSort.direction} onClick={() => toggleArtistSort('artistId')} /></th>
													<th className="px-6 py-4"><SortHeader label="Naam" isActive={artistSort.key === 'name'} direction={artistSort.direction} onClick={() => toggleArtistSort('name')} /></th>
													<th className="px-6 py-4"><SortHeader label="Nummers" isActive={artistSort.key === 'songCount'} direction={artistSort.direction} onClick={() => toggleArtistSort('songCount')} /></th>
													<th className="px-6 py-4">Website</th>
													<th className="px-6 py-4 text-right">Acties</th>
												</tr>
											</thead>
											<tbody>
												{paginatedArtists.length === 0 ? (
													<tr>
														<td colSpan={6} className="px-6 py-12 text-center text-muted-foreground">
															Geen artiesten gevonden die voldoen aan de zoekcriteria.
														</td>
													</tr>
												) : paginatedArtists.map((artist, idx) => {
													const isExpanded = expandedArtistId === artist.artistId;
													const artistSongsList = songs.filter(s => s.artistId === artist.artistId);
													return (
														<React.Fragment key={artist.artistId ?? `artist-${idx}`}>
															<tr 
																className={`border-b border-white/5 transition-colors cursor-pointer hover:bg-white/5 ${
																	isExpanded ? 'bg-white/5' : ''
																}`}
																onClick={() => setExpandedArtistId(isExpanded ? null : artist.artistId)}
															>
																<td className="px-6 py-4 text-center">
																	{isExpanded ? (
																		<ChevronUp className="w-4 h-4 text-muted-foreground inline" />
																	) : (
																		<ChevronDown className="w-4 h-4 text-muted-foreground inline" />
																	)}
																</td>
																<td className="px-6 py-4 font-mono text-xs text-muted-foreground">{artist.artistId}</td>
																<td className="px-6 py-4 font-bold text-base text-foreground">{artist.name}</td>
																<td className="px-6 py-4 font-semibold">{songCountsByArtistId.get(artist.artistId) ?? 0}</td>
																<td className="px-6 py-4">
																	{artist.website ? (
																		<a
																			href={artist.website}
																			target="_blank"
																			rel="noopener noreferrer"
																			onClick={(e) => e.stopPropagation()}
																			className="inline-flex items-center gap-1 text-primary hover:underline font-semibold"
																		>
																			Link
																			<ExternalLink className="w-3 h-3" />
																		</a>
																	) : (
																		<span className="text-muted-foreground">-</span>
																	)}
																</td>
																<td className="px-6 py-4 text-right" onClick={(e) => e.stopPropagation()}>
																	<button
																		onClick={() => handleOpenEditArtistModal(artist)}
																		className="inline-flex items-center justify-center px-3 py-1.5 rounded-lg text-primary bg-primary/10 border border-primary/20 hover:bg-primary hover:text-white transition-all font-semibold text-xs cursor-pointer mr-2"
																	>
																		<Edit2 className="w-3.5 h-3.5 mr-1" />
																		Beheer
																	</button>
																</td>
															</tr>

															{/* Expanded Area */}
															{isExpanded && (
																<tr className="border-b border-white/5 bg-black/15">
																	<td colSpan={6} className="px-8 py-6">
																		<div className="grid grid-cols-1 md:grid-cols-4 gap-6">
																			{/* Photo thumbnail */}
																			<div className="flex flex-col items-center justify-center bg-white/5 border border-white/5 rounded-2xl p-4">
																				{artist.photo || artist.photoUrl ? (
																					<img
																						src={artist.photo ?? artist.photoUrl}
																						alt={artist.name}
																						className="w-32 h-32 object-cover rounded-xl shadow-lg border border-white/10"
																						onError={(e) => {
																							(e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1501612780327-45045538702b?w=200&h=200&fit=crop';
																						}}
																					/>
																				) : (
																					<div className="w-32 h-32 rounded-xl bg-white/5 flex items-center justify-center text-muted-foreground border border-white/5">
																						<Users className="w-12 h-12 text-muted-foreground/45" />
																					</div>
																				)}
																				<span className="text-xs text-muted-foreground mt-3 font-semibold">Fotopreview</span>
																			</div>

																			{/* Biography */}
																			<div className="md:col-span-2 space-y-3">
																				<h4 className="font-bold text-lg text-primary flex items-center gap-1.5">
																					<Info className="w-4 h-4" />
																					Biografie
																				</h4>
																				<p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line max-h-48 overflow-y-auto pr-2 scrollbar-thin">
																					{artist.biography ?? artist.bio ?? 'Er is geen biografie geregistreerd voor deze artiest.'}
																				</p>
																				<div className="pt-2 flex items-center gap-3">
																					<a
																						href={`https://nl.wikipedia.org/wiki/${encodeURIComponent(artist.name)}`}
																						target="_blank"
																						rel="noopener noreferrer"
																						className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground font-semibold bg-white/5 px-2.5 py-1 rounded-md border border-white/5"
																					>
																						Wikipedia
																						<ExternalLink className="w-3 h-3" />
																					</a>
																				</div>
																			</div>

																			{/* Songs list */}
																			<div className="space-y-3 border-t md:border-t-0 md:border-l border-white/10 pt-4 md:pt-0 md:pl-6">
																				<h4 className="font-bold text-sm uppercase tracking-wider text-muted-foreground">Nummers ({artistSongsList.length})</h4>
																				<div className="space-y-1.5 max-h-48 overflow-y-auto pr-2 scrollbar-thin">
																					{artistSongsList.length === 0 ? (
																						<span className="text-xs text-muted-foreground italic">Nog geen nummers in de database.</span>
																					) : artistSongsList.map(song => (
																						<div key={song.songId} className="flex items-center justify-between gap-3 text-xs bg-white/5 px-2.5 py-1.5 rounded-lg border border-white/5">
																							<span className="font-semibold truncate">{song.title}</span>
																							<span className="font-mono text-muted-foreground">{song.releaseYear}</span>
																						</div>
																					))}
																				</div>
																			</div>
																		</div>
																	</td>
																</tr>
															)}
														</React.Fragment>
													);
												})}
											</tbody>
										</table>
									</div>

									{/* Pagination */}
									<div className="px-6 py-4 border-t border-white/10 flex items-center justify-between gap-4 bg-white/5">
										<p className="text-xs text-muted-foreground font-semibold">
											Pagina {safeArtistPage} van {artistTotalPages} (Totaal {sortedArtists.length} items)
										</p>
										<Pagination currentPage={safeArtistPage} totalPages={artistTotalPages} onPageChange={setArtistPage} />
									</div>
								</div>
							)}

							{/* Tab content: Songs */}
							{currentTab === 'songs' && (
								<div className="bg-card border border-border rounded-2xl shadow-xl overflow-hidden">
									{/* Search controls */}
									<div className="p-6 border-b border-white/10 flex flex-col md:flex-row gap-4 bg-white/5">
										<div className="relative flex-1">
											<Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
											<input
												type="text"
												value={songSearchQuery}
												onChange={(e) => {
													setSongSearchQuery(e.target.value);
													setSongPage(1);
												}}
												placeholder="Zoek nummers op titel, ID, jaar of artiest..."
												className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-white/10 bg-background/50 focus:outline-none focus:border-primary text-sm transition-colors"
											/>
										</div>

										<div className="w-full md:w-64 flex items-center gap-2">
											<Filter className="w-4 h-4 text-muted-foreground flex-shrink-0" />
											<select
												value={songArtistFilter}
												onChange={(e) => {
													setSongArtistFilter(e.target.value);
													setSongPage(1);
												}}
												className="w-full px-3 py-2.5 rounded-xl border border-white/10 bg-background/50 focus:outline-none focus:border-primary text-sm text-foreground"
											>
												<option value="">Alle artiesten</option>
												{artists.map(art => (
													<option key={art.artistId} value={art.artistId}>{art.name}</option>
												))}
											</select>
										</div>
									</div>

									{/* Table */}
									<div className="overflow-x-auto">
										<table className="w-full text-sm text-left border-collapse">
											<thead>
												<tr className="border-b border-white/10 bg-white/5 text-xs uppercase tracking-wider text-muted-foreground">
													<th className="px-6 py-4 w-16">Cover</th>
													<th className="px-6 py-4"><SortHeader label="ID" isActive={songSort.key === 'songId'} direction={songSort.direction} onClick={() => toggleSongSort('songId')} /></th>
													<th className="px-6 py-4"><SortHeader label="Titel" isActive={songSort.key === 'title'} direction={songSort.direction} onClick={() => toggleSongSort('title')} /></th>
													<th className="px-6 py-4"><SortHeader label="Artiest" isActive={songSort.key === 'artistName'} direction={songSort.direction} onClick={() => toggleSongSort('artistName')} /></th>
													<th className="px-6 py-4"><SortHeader label="Jaar" isActive={songSort.key === 'releaseYear'} direction={songSort.direction} onClick={() => toggleSongSort('releaseYear')} /></th>
													<th className="px-6 py-4">YouTube</th>
													<th className="px-6 py-4 text-right">Acties</th>
												</tr>
											</thead>
											<tbody>
												{paginatedSongs.length === 0 ? (
													<tr>
														<td colSpan={7} className="px-6 py-12 text-center text-muted-foreground">
															Geen nummers gevonden die voldoen aan de zoekcriteria.
														</td>
													</tr>
												) : paginatedSongs.map((song, idx) => (
													<tr key={song.songId ?? `song-${idx}`} className="border-b border-white/5 transition-colors hover:bg-white/5">
														<td className="px-6 py-3">
															{song.imgUrl || song.albumCover ? (
																<img
																	src={song.imgUrl ?? song.albumCover}
																	alt={song.title}
																	className="w-10 h-10 object-cover rounded-lg shadow-sm border border-white/10 transition-transform hover:scale-110 duration-200"
																	onError={(e) => {
																		(e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=200&h=200&fit=crop';
																	}}
																/>
															) : (
																<div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center text-muted-foreground border border-white/5">
																	<Music2 className="w-5 h-5 text-muted-foreground/35" />
																</div>
															)}
														</td>
														<td className="px-6 py-4 font-mono text-xs text-muted-foreground">{song.songId}</td>
														<td className="px-6 py-4 font-bold text-base text-foreground">{song.title}</td>
														<td className="px-6 py-4 font-semibold text-muted-foreground">{artistNamesById.get(song.artistId) ?? song.artistId}</td>
														<td className="px-6 py-4 font-mono text-xs">{song.releaseYear}</td>
														<td className="px-6 py-4">
															{song.youtube ? (
																<a
																	href={song.youtube}
																	target="_blank"
																	rel="noopener noreferrer"
																	className="inline-flex items-center gap-1.5 text-xs bg-red-500/10 text-red-400 border border-red-500/20 px-2 py-1 rounded-md hover:bg-red-500 hover:text-white transition-all font-semibold"
																>
																	<Youtube className="w-3.5 h-3.5" />
																	YouTube
																</a>
															) : (
																<span className="text-muted-foreground">-</span>
															)}
														</td>
														<td className="px-6 py-4 text-right">
															<button
																onClick={() => handleOpenEditSongModal(song)}
																className="inline-flex items-center justify-center px-3 py-1.5 rounded-lg text-primary bg-primary/10 border border-primary/20 hover:bg-primary hover:text-white transition-all font-semibold text-xs cursor-pointer"
															>
																<Edit2 className="w-3.5 h-3.5 mr-1" />
																Beheer
															</button>
														</td>
													</tr>
												))}
											</tbody>
										</table>
									</div>

									{/* Pagination */}
									<div className="px-6 py-4 border-t border-white/10 flex items-center justify-between gap-4 bg-white/5">
										<p className="text-xs text-muted-foreground font-semibold">
											Pagina {safeSongPage} van {songTotalPages} (Totaal {sortedSongs.length} items)
										</p>
										<Pagination currentPage={safeSongPage} totalPages={songTotalPages} onPageChange={setSongPage} />
									</div>
								</div>
							)}
						</motion.div>
					</AnimatePresence>
				)}
			</main>

			{/* Add/Edit Artist Modal */}
			{activeModal && (activeModal === 'add_artist' || activeModal === 'edit_artist') && (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 overflow-y-auto">
					<div className="bg-card border border-white/10 rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden transform transition-all my-8">
						<div className="px-6 py-4 border-b border-white/10 flex items-center justify-between bg-white/5">
							<h3 className="text-xl font-bold flex items-center gap-2">
								<Users className="w-5 h-5 text-primary" />
								{activeModal === 'add_artist' ? 'Artiest Toevoegen' : 'Artiest Bewerken'}
							</h3>
							<button onClick={() => setActiveModal(null)} className="text-muted-foreground hover:text-foreground cursor-pointer p-1 bg-white/5 rounded-lg border border-white/5 hover:border-white/20 transition-all">
								<X className="w-4 h-4" />
							</button>
						</div>

						<form onSubmit={handleSubmitArtist} className="p-6 space-y-5">
							{submitError && (
								<div className="bg-destructive/10 border border-destructive/20 text-primary text-xs p-3.5 rounded-xl flex items-center gap-2">
									<AlertCircle className="w-4 h-4 flex-shrink-0" />
									<span>{submitError}</span>
								</div>
							)}

							<div className="space-y-1.5">
								<label htmlFor="artistName" className="block text-sm font-semibold text-foreground">
									Naam <span className="text-primary">*</span>
								</label>
								<input
									type="text"
									id="artistName"
									value={artistFormName}
									onChange={(e) => setArtistFormName(e.target.value)}
									required
									placeholder="bijv. Queen, The Beatles, David Bowie"
									className="w-full px-4 py-2.5 border border-white/10 rounded-xl bg-background/60 focus:outline-none focus:border-primary text-sm focus:ring-1 focus:ring-primary/45 transition-all"
								/>
							</div>

							<div className="space-y-1.5">
								<label htmlFor="artistWebsite" className="block text-sm font-semibold text-foreground">
									Website URL
								</label>
								<div className="relative">
									<Globe className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
									<input
										type="url"
										id="artistWebsite"
										value={artistFormWebsite}
										onChange={(e) => setArtistFormWebsite(e.target.value)}
										placeholder="https://www.example.com"
										className="w-full pl-10 pr-4 py-2.5 border border-white/10 rounded-xl bg-background/60 focus:outline-none focus:border-primary text-sm focus:ring-1 focus:ring-primary/45 transition-all"
									/>
								</div>
							</div>

							<div className="space-y-1.5">
								<label htmlFor="artistPhoto" className="block text-sm font-semibold text-foreground">
									Foto URL (Voor live preview)
								</label>
								<div className="relative">
									<Image className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
									<input
										type="url"
										id="artistPhoto"
										value={artistFormPhoto}
										onChange={(e) => setArtistFormPhoto(e.target.value)}
										placeholder="https://images.unsplash.com/photo-..."
										className="w-full pl-10 pr-4 py-2.5 border border-white/10 rounded-xl bg-background/60 focus:outline-none focus:border-primary text-sm focus:ring-1 focus:ring-primary/45 transition-all"
									/>
								</div>

								{/* Live Photo Preview */}
								{artistFormPhoto && (
									<div className="mt-3 flex flex-col items-center justify-center p-3 border border-white/5 bg-white/5 rounded-xl">
										<img
											src={artistFormPhoto}
											alt="Form Preview"
											className="h-28 object-cover rounded-lg shadow-md border border-white/10"
											onError={(e) => {
												(e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1501612780327-45045538702b?w=200&h=200&fit=crop';
											}}
										/>
										<span className="text-[10px] text-muted-foreground mt-2 font-semibold">Fotopreview</span>
									</div>
								)}
							</div>

							<div className="space-y-1.5">
								<label htmlFor="artistBio" className="block text-sm font-semibold text-foreground">
									Biografie
								</label>
								<textarea
									id="artistBio"
									value={artistFormBiography}
									onChange={(e) => setArtistFormBiography(e.target.value)}
									rows={4}
									placeholder="Schrijf een korte biografie of band geschiedenis..."
									className="w-full px-4 py-2.5 border border-white/10 rounded-xl bg-background/60 focus:outline-none focus:border-primary text-sm focus:ring-1 focus:ring-primary/45 transition-all resize-y scrollbar-thin"
								/>
							</div>

							<div className="border-t border-white/10 pt-4 flex items-center justify-between gap-3">
								{activeModal === 'edit_artist' ? (
									<button
										type="button"
										onClick={() => {
											setConfirmDeleteModal({
												type: 'artist',
												id: artistFormId!,
												name: artistFormName
											});
											setActiveModal(null);
										}}
										className="inline-flex items-center gap-2 px-4 py-2.5 border border-destructive text-primary bg-destructive/5 rounded-xl hover:bg-primary hover:text-white transition-all text-xs font-bold cursor-pointer"
									>
										<Trash2 className="w-4 h-4" />
										Verwijderen
									</button>
								) : (
									<div />
								)}

								<div className="flex items-center gap-3">
									<button
										type="button"
										onClick={() => setActiveModal(null)}
										className="px-4 py-2.5 border border-white/10 rounded-xl hover:bg-secondary transition-colors text-xs font-semibold cursor-pointer"
									>
										Annuleren
									</button>
									<button
										type="submit"
										disabled={submitting}
										className="px-5 py-2.5 bg-primary text-primary-foreground rounded-xl hover:bg-primary/95 disabled:opacity-50 transition-colors text-xs font-bold flex items-center gap-2 cursor-pointer shadow-lg shadow-primary/20"
									>
										{submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
										Opslaan
									</button>
								</div>
							</div>
						</form>
					</div>
				</div>
			)}

			{/* Add/Edit Song Modal */}
			{activeModal && (activeModal === 'add_song' || activeModal === 'edit_song') && (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 overflow-y-auto">
					<div className="bg-card border border-white/10 rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden transform transition-all my-8">
						<div className="px-6 py-4 border-b border-white/10 flex items-center justify-between bg-white/5">
							<h3 className="text-xl font-bold flex items-center gap-2">
								<Music2 className="w-5 h-5 text-primary" />
								{activeModal === 'add_song' ? 'Nummer Toevoegen' : 'Nummer Bewerken'}
							</h3>
							<button onClick={() => setActiveModal(null)} className="text-muted-foreground hover:text-foreground cursor-pointer p-1 bg-white/5 rounded-lg border border-white/5 hover:border-white/20 transition-all">
								<X className="w-4 h-4" />
							</button>
						</div>

						<form onSubmit={handleSubmitSong} className="p-6 space-y-5">
							{submitError && (
								<div className="bg-destructive/10 border border-destructive/20 text-primary text-xs p-3.5 rounded-xl flex items-center gap-2">
									<AlertCircle className="w-4 h-4 flex-shrink-0" />
									<span>{submitError}</span>
								</div>
							)}

							<div className="space-y-1.5">
								<label htmlFor="songTitle" className="block text-sm font-semibold text-foreground">
									Titel <span className="text-primary">*</span>
								</label>
								<input
									type="text"
									id="songTitle"
									value={songFormTitle}
									onChange={(e) => setSongFormTitle(e.target.value)}
									required
									placeholder="bijv. Bohemian Rhapsody, Yesterday"
									className="w-full px-4 py-2.5 border border-white/10 rounded-xl bg-background/60 focus:outline-none focus:border-primary text-sm focus:ring-1 focus:ring-primary/45 transition-all"
								/>
							</div>

							<div className="grid grid-cols-2 gap-4">
								<div className="space-y-1.5">
									<label htmlFor="songArtistId" className="block text-sm font-semibold text-foreground">
										Artiest <span className="text-primary">*</span>
									</label>
									<select
										id="songArtistId"
										value={songFormArtistId}
										onChange={(e) => setSongFormArtistId(e.target.value)}
										required
										className="w-full px-3 py-2.5 border border-white/10 rounded-xl bg-background focus:outline-none focus:border-primary text-sm text-foreground"
									>
										<option value="" disabled>Selecteer artiest</option>
										{artists.map((artist) => (
											<option key={artist.artistId} value={artist.artistId}>
												{artist.name}
											</option>
										))}
									</select>
								</div>

								<div className="space-y-1.5">
									<label htmlFor="songReleaseYear" className="block text-sm font-semibold text-foreground">
										Release Jaar <span className="text-primary">*</span>
									</label>
									<input
										type="number"
										id="songReleaseYear"
										value={songFormReleaseYear}
										onChange={(e) => setSongFormReleaseYear(e.target.value)}
										required
										min={1800}
										max={new Date().getFullYear() + 2}
										className="w-full px-4 py-2.5 border border-white/10 rounded-xl bg-background/60 focus:outline-none focus:border-primary text-sm focus:ring-1 focus:ring-primary/45 transition-all font-mono"
									/>
								</div>
							</div>

							<div className="space-y-1.5">
								<label htmlFor="songYoutube" className="block text-sm font-semibold text-foreground">
									YouTube URL
								</label>
								<div className="relative">
									<Youtube className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
									<input
										type="url"
										id="songYoutube"
										value={songFormYoutube}
										onChange={(e) => setSongFormYoutube(e.target.value)}
										placeholder="https://www.youtube.com/watch?v=..."
										className="w-full pl-10 pr-4 py-2.5 border border-white/10 rounded-xl bg-background/60 focus:outline-none focus:border-primary text-sm focus:ring-1 focus:ring-primary/45 transition-all font-mono text-xs"
									/>
								</div>
							</div>

							<div className="space-y-1.5">
								<div className="flex items-center justify-between">
									<label htmlFor="songImgUrl" className="block text-sm font-semibold text-foreground">
										Cover Image URL (Voor live preview)
									</label>
									<button
										type="button"
										onClick={handleFetchSpotifyCover}
										disabled={fetchingSpotify}
										className="text-[11px] font-bold text-primary-foreground bg-primary/95 hover:bg-primary px-3 py-1 rounded-lg transition-all shadow-md shadow-primary/10 flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
									>
										{fetchingSpotify ? (
											<Loader2 className="w-3.5 h-3.5 animate-spin" />
										) : (
											<Sparkles className="w-3.5 h-3.5" />
										)}
										Spotify Cover
									</button>
								</div>

								<div className="relative">
									<Image className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
									<input
										type="url"
										id="songImgUrl"
										value={songFormImgUrl}
										onChange={(e) => setSongFormImgUrl(e.target.value)}
										placeholder="https://images.unsplash.com/photo-..."
										className="w-full pl-10 pr-4 py-2.5 border border-white/10 rounded-xl bg-background/60 focus:outline-none focus:border-primary text-sm focus:ring-1 focus:ring-primary/45 transition-all font-mono text-xs text-foreground"
									/>
								</div>

								{/* Live Song Image Preview */}
								{songFormImgUrl && (
									<div className="mt-3 flex flex-col items-center justify-center p-3 border border-white/5 bg-white/5 rounded-xl">
										<img
											src={songFormImgUrl}
											alt="Cover Preview"
											className="h-28 object-cover rounded-lg shadow-md border border-white/10"
											onError={(e) => {
												(e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=200&h=200&fit=crop';
											}}
										/>
										<span className="text-[10px] text-muted-foreground mt-2 font-semibold">Albumcoverpreview</span>
									</div>
								)}
							</div>

							<div className="space-y-1.5">
								<label htmlFor="songLyrics" className="block text-sm font-semibold text-foreground">
									Lyrics (Preview)
								</label>
								<textarea
									id="songLyrics"
									value={songFormLyrics}
									onChange={(e) => setSongFormLyrics(e.target.value)}
									rows={3}
									placeholder="Is this the real life? Is this just fantasy..."
									className="w-full px-4 py-2.5 border border-white/10 rounded-xl bg-background/60 focus:outline-none focus:border-primary text-sm focus:ring-1 focus:ring-primary/45 transition-all resize-y scrollbar-thin"
								/>
							</div>

							<div className="border-t border-white/10 pt-4 flex items-center justify-between gap-3">
								{activeModal === 'edit_song' ? (
									<button
										type="button"
										onClick={() => {
											setConfirmDeleteModal({
												type: 'song',
												id: songFormId!,
												name: songFormTitle
											});
											setActiveModal(null);
										}}
										className="inline-flex items-center gap-2 px-4 py-2.5 border border-destructive text-primary bg-destructive/5 rounded-xl hover:bg-primary hover:text-white transition-all text-xs font-bold cursor-pointer"
									>
										<Trash2 className="w-4 h-4" />
										Verwijderen
									</button>
								) : (
									<div />
								)}

								<div className="flex items-center gap-3">
									<button
										type="button"
										onClick={() => setActiveModal(null)}
										className="px-4 py-2.5 border border-white/10 rounded-xl hover:bg-secondary transition-colors text-xs font-semibold cursor-pointer"
									>
										Annuleren
									</button>
									<button
										type="submit"
										disabled={submitting}
										className="px-5 py-2.5 bg-primary text-primary-foreground rounded-xl hover:bg-primary/95 disabled:opacity-50 transition-colors text-xs font-bold flex items-center gap-2 cursor-pointer shadow-lg shadow-primary/20"
									>
										{submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
										Opslaan
									</button>
								</div>
							</div>
						</form>
					</div>
				</div>
			)}

			{/* Delete Confirmation Modal */}
			{confirmDeleteModal && (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 overflow-y-auto">
					<div className="bg-card border border-white/10 rounded-2xl shadow-2xl max-w-md w-full overflow-hidden transform transition-all my-8">
						<div className="px-6 py-4 border-b border-white/10 flex items-center justify-between bg-destructive/5 text-primary">
							<div className="flex items-center gap-2 font-bold text-lg">
								<AlertCircle className="w-5 h-5" />
								Verwijdering Bevestigen
							</div>
							<button onClick={() => setConfirmDeleteModal(null)} className="text-muted-foreground hover:text-foreground cursor-pointer p-1 bg-white/5 rounded-lg border border-white/5 hover:border-white/20 transition-all">
								<X className="w-4 h-4" />
							</button>
						</div>

						<div className="p-6 space-y-4">
							{submitError && (
								<div className="bg-destructive/10 border border-destructive/20 text-primary text-xs p-3.5 rounded-xl flex items-center gap-2">
									<AlertCircle className="w-4 h-4 flex-shrink-0" />
									<span>{submitError}</span>
								</div>
							)}

							<p className="text-foreground text-sm leading-relaxed">
								Weet u zeker dat u {confirmDeleteModal.type === 'artist' ? 'artiest' : 'nummer'}{' '}
								<strong className="font-bold text-primary">"{confirmDeleteModal.name}"</strong> wilt verwijderen?
								{confirmDeleteModal.type === 'artist' && (
									<span className="block mt-3 text-xs text-muted-foreground bg-destructive/5 p-3 rounded-xl border border-destructive/20 leading-normal">
										Waarschuwing: een artiest kan niet worden verwijderd als er nog nummers aan gekoppeld zijn.
									</span>
								)}
							</p>

							<div className="border-t border-white/10 pt-4 flex items-center justify-end gap-3">
								<button
									type="button"
									onClick={() => setConfirmDeleteModal(null)}
									className="px-4 py-2.5 border border-white/10 rounded-xl hover:bg-secondary transition-colors text-xs font-semibold cursor-pointer"
								>
									Annuleren
								</button>
								<button
									type="button"
									onClick={handleDeleteConfirm}
									disabled={submitting}
									className="px-5 py-2.5 bg-primary text-white rounded-xl hover:bg-primary/90 disabled:opacity-50 transition-colors text-xs font-bold flex items-center gap-2 cursor-pointer"
								>
									{submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
									Ja, Verwijderen
								</button>
							</div>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}
