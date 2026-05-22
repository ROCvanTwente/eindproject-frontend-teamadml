import { useEffect, useState } from 'react';
import { AlertCircle, Loader2, Music2, RefreshCw, Users } from 'lucide-react';
import type { Artist, Song } from '../data/mockData';

const BACKEND_URL = 'https://top2000teamadml.runasp.net';

type FetchState = 'idle' | 'loading' | 'success' | 'error';

export function AdminPanel() {
	const [artists, setArtists] = useState<Artist[]>([]);
	const [songs, setSongs] = useState<Song[]>([]);
	const [fetchState, setFetchState] = useState<FetchState>('idle');
	const [errorMessage, setErrorMessage] = useState('');

	const loadAdminData = async () => {
		setFetchState('loading');
		setErrorMessage('');

		try {
			const [artistsResponse, songsResponse, top2000Response] = await Promise.all([
				fetch(`${BACKEND_URL}/api/artists`, { cache: 'no-store' }),
				fetch(`${BACKEND_URL}/api/songs`, { cache: 'no-store' }),
                fetch(`${BACKEND_URL}/api/top2000`, { cache: 'no-store' })
			]);

			if (!artistsResponse.ok || !songsResponse.ok || !top2000Response.ok) {
				const failedEndpoints = [
					!artistsResponse.ok ? `/api/artists (${artistsResponse.status})` : null,
					!songsResponse.ok ? `/api/songs (${songsResponse.status})` : null,
					!top2000Response.ok ? `/api/top2000 (${top2000Response.status})` : null,
				].filter(Boolean).join(', ');

				throw new Error(`Backend request failed for ${failedEndpoints}`);
			}

			const [artistsData, songsData] = await Promise.all([
				artistsResponse.json() as Promise<Artist[]>,
				songsResponse.json() as Promise<Song[]>,
			]);

			setArtists(Array.isArray(artistsData) ? artistsData : []);
			setSongs(Array.isArray(songsData) ? songsData : []);
			setFetchState('success');
		} catch (error) {
			setFetchState('error');
			setErrorMessage(error instanceof Error ? error.message : 'Unknown backend error');
		}
	};

	useEffect(() => {
		void loadAdminData();
	}, []);

	return (
		<div className="pb-12">
			<section className="bg-gradient-to-r from-destructive/10 via-white to-primary/10 py-12 border-b border-border">
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
							{fetchState === 'error' && 'Backend fout'}
							{fetchState === 'idle' && 'Wachten'}
						</div>
						{errorMessage && (
							<p className="text-sm text-destructive mt-2">{errorMessage}</p>
						)}
					</div>
				</div>

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
					</div>
				)}

				<section className="bg-card border border-border rounded-lg shadow-md overflow-hidden">
					<div className="px-6 py-4 border-b border-border flex items-center justify-between">
						<div>
							<h2 className="text-2xl font-bold">Artiesten</h2>
							<p className="text-sm text-muted-foreground">Live data uit de backend</p>
						</div>
					</div>

					<div className="overflow-x-auto">
						<table className="w-full">
							<thead className="bg-secondary">
								<tr>
									<th className="px-4 py-3 text-left">ID</th>
									<th className="px-4 py-3 text-left">Naam</th>
									<th className="px-4 py-3 text-left">Aantal nummers</th>
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
								) : artists.map((artist, index) => (
									<tr key={artist.id} className={index % 2 === 0 ? 'bg-secondary/30' : ''}>
										<td className="px-4 py-3">{artist.id}</td>
										<td className="px-4 py-3 font-semibold">{artist.name}</td>
										<td className="px-4 py-3">{artist.numberOfSongs ?? '-'}</td>
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
											{artist.wikiUrl ? (
												<a href={artist.wikiUrl} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline text-sm">
													Wiki
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
				</section>

				<section className="bg-card border border-border rounded-lg shadow-md overflow-hidden">
					<div className="px-6 py-4 border-b border-border flex items-center justify-between">
						<div>
							<h2 className="text-2xl font-bold">Nummers</h2>
							<p className="text-sm text-muted-foreground">Live data uit de backend</p>
						</div>
					</div>

					<div className="overflow-x-auto">
						<table className="w-full">
							<thead className="bg-secondary">
								<tr>
									<th className="px-4 py-3 text-left">ID</th>
									<th className="px-4 py-3 text-left">Titel</th>
									<th className="px-4 py-3 text-left">Artiest</th>
									<th className="px-4 py-3 text-left">Jaar</th>
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
								) : songs.map((song, index) => (
									<tr key={song.id} className={index % 2 === 0 ? 'bg-secondary/30' : ''}>
										<td className="px-4 py-3">{song.id}</td>
										<td className="px-4 py-3 font-semibold">{song.title}</td>
										<td className="px-4 py-3">{song.artistName}</td>
										<td className="px-4 py-3">{song.year}</td>
										<td className="px-4 py-3">{song.timesListed}</td>
										<td className="px-4 py-3">
											{song.youtubeUrl ? (
												<a href={song.youtubeUrl} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline text-sm">
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
				</section>
			</div>
		</div>
	);
}
