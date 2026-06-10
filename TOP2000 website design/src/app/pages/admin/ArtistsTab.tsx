import React, { useState, useMemo, useEffect } from 'react';
import {
	Search,
	Users,
	ChevronUp,
	ChevronDown,
	ExternalLink,
	Globe,
	Music2,
	Youtube,
	Info,
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
	createArtist,
	updateArtist,
	deleteArtist
} from '../../data/api';
import {
	SortHeader,
	Pagination,
	compareValues,
	paginateItems,
	type SortDirection
} from './shared';

type ArtistSortKey = 'artistId' | 'name' | 'songCount';

type ArtistsTabProps = {
	artists: BackendArtist[];
	songs: BackendSong[];
	onRefresh: () => Promise<void> | void;
	addAuditLogEntry: (action: AuditAction, entityType: AuditEntityType, name: string, details: string) => Promise<void> | void;
	// Props to allow parent to trigger Add Artist modal (e.g. from header button)
	registerOpenAddModal: (fn: () => void) => void;
};

export function ArtistsTab({ artists, songs, onRefresh, addAuditLogEntry, registerOpenAddModal }: ArtistsTabProps) {
	const [artistPage, setArtistPage] = useState(1);
	const [artistSearchQuery, setArtistSearchQuery] = useState('');
	const [artistSort, setArtistSort] = useState<{ key: ArtistSortKey; direction: SortDirection }>({
		key: 'artistId',
		direction: 'asc',
	});

	// Expanded Row for Artists
	const [expandedArtistId, setExpandedArtistId] = useState<number | null>(null);

	// Modals and CRUD States
	const [activeModal, setActiveModal] = useState<'add_artist' | 'edit_artist' | null>(null);
	const [confirmDeleteModal, setConfirmDeleteModal] = useState<{ id: number; name: string } | null>(null);
	const [submitting, setSubmitting] = useState(false);
	const [submitError, setSubmitError] = useState('');

	// Artist Form Fields
	const [artistFormId, setArtistFormId] = useState<number | null>(null);
	const [artistFormName, setArtistFormName] = useState('');
	const [artistFormBiography, setArtistFormBiography] = useState('');
	const [artistFormPhoto, setArtistFormPhoto] = useState('');
	const [artistFormWebsite, setArtistFormWebsite] = useState('');

	// Spotify API Integration States
	const [fetchingSpotify, setFetchingSpotify] = useState(false);

	const handleOpenAddArtistModal = () => {
		setArtistFormId(null);
		setArtistFormName('');
		setArtistFormBiography('');
		setArtistFormPhoto('');
		setArtistFormWebsite('');
		setSubmitError('');
		setActiveModal('add_artist');
	};

	// Register the function to parent on mount so AdminPanel can trigger it
	useEffect(() => {
		registerOpenAddModal(handleOpenAddArtistModal);
	}, [registerOpenAddModal]);

	const handleOpenEditArtistModal = (artist: BackendArtist) => {
		setArtistFormId(artist.artistId);
		setArtistFormName(artist.name);
		setArtistFormBiography(artist.biography ?? artist.bio ?? '');
		setArtistFormPhoto(artist.photo ?? artist.photoUrl ?? '');
		setArtistFormWebsite(artist.website ?? '');
		setSubmitError('');
		setActiveModal('edit_artist');
	};

	const handleFetchSpotifyArtistPhoto = async () => {
		if (!artistFormName.trim()) {
			toast.error('Vul eerst een artiest in');
			return;
		}

		setFetchingSpotify(true);
		try {
			const artistParam = encodeURIComponent(artistFormName.trim());
			const response = await fetch(`/api/artists/spotify-photo?artist=${artistParam}`);

			if (!response.ok) {
				const errorMsg = await response.text();
				throw new Error(errorMsg || `Server fout ${response.status}`);
			}

			const data = await response.json();
			const photoUrl = data.photoUrl;

			if (photoUrl) {
				setArtistFormPhoto(photoUrl);
				toast.success('Artist photo succesvol opgehaald via de backend proxy!');
				void addAuditLogEntry(
					'SYSTEEM',
					'ARTIEST',
					artistFormName.trim(),
					`Spotify artist photo succesvol opgehaald voor artiest.`
				);
			} else {
				toast.error('Geen artist photo gevonden voor deze artiest');
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
				if (activeModal === 'add_artist') {
					void addAuditLogEntry('TOEVOEGEN', 'ARTIEST', artistFormName.trim(), 'Artiest handmatig aangemaakt.');
				} else {
					const original = artists.find(a => a.artistId === artistFormId);
					const changes: string[] = [];
					if (original) {
						if (original.name !== artistFormName.trim()) {
							changes.push(`naam gewijzigd van "${original.name}" naar "${artistFormName.trim()}"`);
						}
						const origBio = original.biography ?? original.bio ?? '';
						if (origBio.trim() !== artistFormBiography.trim()) {
							changes.push('biografie bijgewerkt');
						}
						const origPhoto = original.photo ?? original.photoUrl ?? '';
						if (origPhoto.trim() !== artistFormPhoto.trim()) {
							changes.push('foto bijgewerkt');
						}
						if ((original.website ?? '').trim() !== artistFormWebsite.trim()) {
							changes.push('website bijgewerkt');
						}
					}
					const details = changes.length > 0
						? `Profielgegevens bijgewerkt. Wijzigingen: ${changes.join(', ')}.`
						: 'Profielgegevens bijgewerkt zonder merkbare wijzigingen.';
					void addAuditLogEntry('BEWERKEN', 'ARTIEST', artistFormName.trim(), details);
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
			const result = await deleteArtist(confirmDeleteModal.id);

			if (result.ok) {
				toast.success(`Artiest succesvol verwijderd!`);
				void addAuditLogEntry(
					'VERWIJDEREN',
					'ARTIEST',
					confirmDeleteModal.name,
					`Artiest permanent verwijderd uit catalogus.`
				);
				setConfirmDeleteModal(null);
				await onRefresh();
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

	// Calculations for Stats and Sorting
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

	const artistTotalPages = Math.max(1, Math.ceil(sortedArtists.length / 10));
	const safeArtistPage = Math.min(artistPage, artistTotalPages);
	const paginatedArtists = paginateItems(sortedArtists, safeArtistPage);

	const toggleArtistSort = (key: ArtistSortKey) => {
		setArtistSort(current => ({
			key,
			direction: current.key === key && current.direction === 'asc' ? 'desc' : 'asc',
		}));
		setArtistPage(1);
	};

	return (
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
							<th className="px-6 py-4 w-16">Foto</th>
							<th className="px-6 py-4">
								<SortHeader label="ID" isActive={artistSort.key === 'artistId'} direction={artistSort.direction} onClick={() => toggleArtistSort('artistId')} />
							</th>
							<th className="px-6 py-4">
								<SortHeader label="Naam" isActive={artistSort.key === 'name'} direction={artistSort.direction} onClick={() => toggleArtistSort('name')} />
							</th>
							<th className="px-6 py-4">
								<SortHeader label="Nummers" isActive={artistSort.key === 'songCount'} direction={artistSort.direction} onClick={() => toggleArtistSort('songCount')} />
							</th>
							<th className="px-6 py-4">Website</th>
							<th className="px-6 py-4 text-right">Acties</th>
						</tr>
					</thead>
					<tbody>
						{paginatedArtists.length === 0 ? (
							<tr>
								<td colSpan={7} className="px-6 py-12 text-center text-muted-foreground">
									Geen artiesten gevonden die voldoen aan de zoekcriteria.
								</td>
							</tr>
						) : paginatedArtists.map((artist, idx) => {
							const isExpanded = expandedArtistId === artist.artistId;
							const artistSongsList = songs.filter(s => s.artistId === artist.artistId);
							return (
								<React.Fragment key={artist.artistId ?? `artist-${idx}`}>
									<tr
										className={`border-b border-white/5 transition-colors cursor-pointer hover:bg-white/5 ${isExpanded ? 'bg-white/5' : ''
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
										<td className="px-6 py-3" onClick={(e) => e.stopPropagation()}>
											{artist.photo || artist.photoUrl ? (
												<img
													src={artist.photo ?? artist.photoUrl}
													alt={artist.name}
													className="w-10 h-10 object-cover rounded-lg shadow-sm border border-white/10 transition-transform hover:scale-110 duration-200"
													onError={(e) => {
														(e.target as HTMLImageElement).style.display = 'none';
														(e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden');
													}}
												/>
											) : null}
											<div className={`w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center border border-white/5 ${artist.photo || artist.photoUrl ? 'hidden' : ''}`}>
												<Users className="w-5 h-5 text-muted-foreground/35" />
											</div>
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
										<tr className="border-b border-white/5 bg-black/20">
											<td colSpan={7} className="px-6 py-0">
												<div className="py-6 grid grid-cols-1 lg:grid-cols-[200px_1fr_280px] gap-6 items-start">

													{/* --- LEFT: Large photo + quick stats --- */}
													<div className="flex flex-col items-center gap-3">
														{artist.photo || artist.photoUrl ? (
															<img
																src={artist.photo ?? artist.photoUrl}
																alt={artist.name}
																className="w-44 h-44 object-cover rounded-2xl shadow-2xl border-2 border-white/15 transition-transform hover:scale-105 duration-300"
																onError={(e) => {
																	(e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1501612780327-45045538702b?w=400&h=400&fit=crop';
																}}
															/>
														) : (
															<div className="w-44 h-44 rounded-2xl bg-gradient-to-br from-primary/30 to-primary/10 flex items-center justify-center border-2 border-primary/20 shadow-xl">
																<Users className="w-16 h-16 text-primary/40" />
															</div>
														)}
														<div className="flex flex-wrap justify-center gap-2 w-full">
															<span className="inline-flex items-center gap-1.5 text-[11px] font-bold bg-white/10 border border-white/10 px-2.5 py-1 rounded-full">
																<Music2 className="w-3 h-3 text-primary" />
																{artistSongsList.length} nummers
															</span>
															{artist.website && (
																<a
																	href={artist.website}
																	target="_blank"
																	rel="noopener noreferrer"
																	onClick={(e) => e.stopPropagation()}
																	className="inline-flex items-center gap-1.5 text-[11px] font-bold bg-primary/10 border border-primary/20 text-primary px-2.5 py-1 rounded-full hover:bg-primary hover:text-white transition-all"
																>
																	<Globe className="w-3 h-3" />
																	Website
																</a>
															)}
															<a
																href={`https://nl.wikipedia.org/wiki/${encodeURIComponent(artist.name)}`}
																target="_blank"
																rel="noopener noreferrer"
																onClick={(e) => e.stopPropagation()}
																className="inline-flex items-center gap-1.5 text-[11px] font-bold bg-white/5 border border-white/10 text-muted-foreground px-2.5 py-1 rounded-full hover:bg-white/15 hover:text-foreground transition-all"
															>
																<ExternalLink className="w-3 h-3" />
																Wikipedia
															</a>
														</div>
													</div>

													{/* --- MIDDLE: Biography --- */}
													<div className="space-y-3">
														<div className="flex items-center justify-between">
															<h4 className="font-bold text-base text-foreground flex items-center gap-2">
																<Info className="w-4 h-4 text-primary" />
																Biografie
															</h4>
															<button
																onClick={(e) => { e.stopPropagation(); handleOpenEditArtistModal(artist); }}
																className="inline-flex items-center gap-1.5 text-[11px] font-bold text-primary bg-primary/10 border border-primary/20 px-3 py-1.5 rounded-lg hover:bg-primary hover:text-white transition-all cursor-pointer"
															>
																<Edit2 className="w-3 h-3" />
																Bewerken
															</button>
														</div>

														{(artist.biography ?? artist.bio) ? (
															<p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line max-h-52 overflow-y-auto pr-2 scrollbar-thin">
																{artist.biography ?? artist.bio}
															</p>
														) : (
															<div className="flex flex-col items-center justify-center gap-2 py-8 rounded-xl border border-dashed border-white/10 bg-white/3 text-center">
																<Info className="w-6 h-6 text-muted-foreground/40" />
																<p className="text-xs text-muted-foreground italic">Geen biografie geregistreerd.</p>
																<button
																	onClick={(e) => { e.stopPropagation(); handleOpenEditArtistModal(artist); }}
																	className="text-[11px] font-bold text-primary underline underline-offset-2 hover:text-primary/80 transition-colors cursor-pointer"
																>
																	Biografie toevoegen →
																</button>
															</div>
														)}
													</div>

													{/* --- RIGHT: Songs list with thumbnails --- */}
													<div className="space-y-2">
														<h4 className="font-bold text-xs uppercase tracking-widest text-muted-foreground flex items-center gap-2 mb-3">
															<Music2 className="w-3.5 h-3.5" />
															Nummers
															<span className="ml-auto bg-white/10 border border-white/10 rounded-full px-2 py-0.5 text-[10px] font-bold">{artistSongsList.length}</span>
														</h4>
														<div className="space-y-1 max-h-56 overflow-y-auto pr-1 scrollbar-thin">
															{artistSongsList.length === 0 ? (
																<span className="text-xs text-muted-foreground italic">Nog geen nummers in de database.</span>
															) : artistSongsList.map(song => (
																<div
																	key={song.songId}
																	className="flex items-center gap-2.5 text-xs bg-white/5 hover:bg-white/10 px-2.5 py-2 rounded-xl border border-white/5 transition-colors group"
																>
																	{song.imgUrl || song.albumCover ? (
																		<img
																			src={song.imgUrl ?? song.albumCover}
																			alt={song.title}
																			className="w-8 h-8 rounded-lg object-cover flex-shrink-0 border border-white/10"
																			onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
																		/>
																	) : (
																		<div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center flex-shrink-0 border border-white/5">
																			<Music2 className="w-3.5 h-3.5 text-muted-foreground/35" />
																		</div>
																	)}
																	<span className="font-semibold truncate flex-1 text-foreground">{song.title}</span>
																	<span className="font-mono text-muted-foreground text-[11px] flex-shrink-0">{song.releaseYear}</span>
																	{song.youtube && (
																		<a
																			href={song.youtube}
																			target="_blank"
																			rel="noopener noreferrer"
																			onClick={(e) => e.stopPropagation()}
																			className="text-red-400 hover:text-red-300 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
																			title="YouTube"
																		>
																			<Youtube className="w-3.5 h-3.5" />
																		</a>
																	)}
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
								<div className="flex items-center justify-between">
									<label htmlFor="artistPhoto" className="block text-sm font-semibold text-foreground">
										Foto URL
									</label>
									<button
										type="button"
										onClick={handleFetchSpotifyArtistPhoto}
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
								Weet u zeker dat u artiest{' '}
								<strong className="font-bold text-primary">"{confirmDeleteModal.name}"</strong> wilt verwijderen?
								<span className="block mt-3 text-xs text-muted-foreground bg-destructive/5 p-3 rounded-xl border border-destructive/20 leading-normal">
									Waarschuwing: een artiest kan niet worden verwijderd als er nog nummers aan gekoppeld zijn.
								</span>
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
