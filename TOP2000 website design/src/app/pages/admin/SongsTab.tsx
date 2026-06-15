import React, { useState, useMemo, useEffect } from 'react';
import {
	Search,
	Filter,
	Music2,
	Youtube,
	Edit2,
	Plus,
	Trash2,
	X,
	AlertCircle,
	Loader2,
	Sparkles,
	Image
} from 'lucide-react';
import { toast } from 'sonner';
import {
	type BackendArtist,
	type BackendSong,
	type AuditAction,
	type AuditEntityType,
	createSong,
	updateSong,
	deleteSong
} from '../../data/api';
import {
	SortHeader,
	Pagination,
	compareValues,
	paginateItems,
	type SortDirection
} from './shared';

type SongSortKey = 'songId' | 'title' | 'artistName' | 'releaseYear';

type SongsTabProps = {
	songs: BackendSong[];
	artists: BackendArtist[];
	onRefresh: () => Promise<void> | void;
	addAuditLogEntry: (action: AuditAction, entityType: AuditEntityType, name: string, details: string) => Promise<void> | void;
	registerOpenAddModal: (fn: () => void) => void;
};

export function SongsTab({ songs, artists, onRefresh, addAuditLogEntry, registerOpenAddModal }: SongsTabProps) {
	const [songPage, setSongPage] = useState(1);
	const [songSearchQuery, setSongSearchQuery] = useState('');
	const [songArtistFilter, setSongArtistFilter] = useState('');
	const [songSort, setSongSort] = useState<{ key: SongSortKey; direction: SortDirection }>({
		key: 'songId',
		direction: 'asc',
	});

	// Modals and CRUD States
	const [activeModal, setActiveModal] = useState<'add_song' | 'edit_song' | null>(null);
	const [confirmDeleteModal, setConfirmDeleteModal] = useState<{ id: number; name: string } | null>(null);
	const [submitting, setSubmitting] = useState(false);
	const [submitError, setSubmitError] = useState('');

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

	// Register the function to parent on mount so AdminPanel can trigger it
	useEffect(() => {
		registerOpenAddModal(handleOpenAddSongModal);
	}, [registerOpenAddModal]);

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
				void addAuditLogEntry(
					'SYSTEEM',
					'NUMMER',
					songFormTitle.trim(),
					`Spotify album cover succesvol opgehaald voor song (Artiest: ${artistName}).`
				);
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
				if (activeModal === 'add_song') {
					const artistName = artists.find(a => String(a.artistId) === String(songFormArtistId))?.name || `ID ${songFormArtistId}`;
					void addAuditLogEntry('TOEVOEGEN', 'NUMMER', songFormTitle.trim(), `Nummer toegevoegd en gekoppeld aan artiest ${artistName}.`);
				} else {
					const original = songs.find(s => s.songId === songFormId);
					const changes: string[] = [];
					const currentArtistName = artists.find(a => String(a.artistId) === String(songFormArtistId))?.name || `ID ${songFormArtistId}`;
					if (original) {
						if (original.title !== songFormTitle.trim()) {
							changes.push(`titel gewijzigd van "${original.title}" naar "${songFormTitle.trim()}"`);
						}
						if (original.artistId !== Number(songFormArtistId)) {
							const oldArtistName = artists.find(a => a.artistId === original.artistId)?.name || `ID ${original.artistId}`;
							changes.push(`artiest gewijzigd van "${oldArtistName}" naar "${currentArtistName}"`);
						}
						if (original.releaseYear !== Number(songFormReleaseYear)) {
							changes.push(`jaar gewijzigd van ${original.releaseYear} naar ${songFormReleaseYear}`);
						}
						if ((original.youtube ?? '').trim() !== songFormYoutube.trim()) {
							changes.push('YouTube link bijgewerkt');
						}
						const origCover = original.imgUrl ?? original.albumCover ?? '';
						if (origCover.trim() !== songFormImgUrl.trim()) {
							changes.push('albumcover bijgewerkt');
						}
						const origLyrics = original.lyrics ?? original.lyricsPreview ?? '';
						if (origLyrics.trim() !== songFormLyrics.trim()) {
							changes.push('lyrics bijgewerkt');
						}
					}
					const details = changes.length > 0
						? `Catalogusgegevens bijgewerkt (Artiest: ${currentArtistName}, Jaar: ${songFormReleaseYear}). Wijzigingen: ${changes.join(', ')}.`
						: `Catalogusgegevens bijgewerkt (Artiest: ${currentArtistName}, Jaar: ${songFormReleaseYear}) zonder merkbare wijzigingen.`;
					void addAuditLogEntry('BEWERKEN', 'NUMMER', songFormTitle.trim(), details);
				}
				setActiveModal(null);
				await onRefresh();
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
			const result = await deleteSong(confirmDeleteModal.id);

			if (result.ok) {
				toast.success(`Nummer succesvol verwijderd!`);
				void addAuditLogEntry(
					'VERWIJDEREN',
					'NUMMER',
					confirmDeleteModal.name,
					`Nummer permanent verwijderd uit catalogus.`
				);
				setConfirmDeleteModal(null);
				await onRefresh();
			} else {
				const errMsg = result.message ?? 'Verwijderen mislukt.';
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

	const artistNamesById = useMemo(() => new Map(artists.map(a => [a.artistId, a.name])), [artists]);

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

	const songTotalPages = Math.max(1, Math.ceil(sortedSongs.length / 10));
	const safeSongPage = Math.min(songPage, songTotalPages);
	const paginatedSongs = paginateItems(sortedSongs, safeSongPage);

	const toggleSongSort = (key: SongSortKey) => {
		setSongSort(current => ({
			key,
			direction: current.key === key && current.direction === 'asc' ? 'desc' : 'asc',
		}));
		setSongPage(1);
	};

	return (
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
							<th className="px-6 py-4">
								<SortHeader label="ID" isActive={songSort.key === 'songId'} direction={songSort.direction} onClick={() => toggleSongSort('songId')} />
							</th>
							<th className="px-6 py-4">
								<SortHeader label="Titel" isActive={songSort.key === 'title'} direction={songSort.direction} onClick={() => toggleSongSort('title')} />
							</th>
							<th className="px-6 py-4">
								<SortHeader label="Artiest" isActive={songSort.key === 'artistName'} direction={songSort.direction} onClick={() => toggleSongSort('artistName')} />
							</th>
							<th className="px-6 py-4">
								<SortHeader label="Jaar" isActive={songSort.key === 'releaseYear'} direction={songSort.direction} onClick={() => toggleSongSort('releaseYear')} />
							</th>
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
										Cover Image URL
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
								Weet u zeker dat u nummer{' '}
								<strong className="font-bold text-primary">"{confirmDeleteModal.name}"</strong> wilt verwijderen?
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
