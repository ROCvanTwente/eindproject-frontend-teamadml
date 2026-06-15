import React, { useMemo } from 'react';
import {
	Users,
	Music2,
	Activity,
	Calendar,
} from 'lucide-react';
import {
	ResponsiveContainer,
	AreaChart,
	CartesianGrid,
	XAxis,
	YAxis,
	Tooltip,
	Area
} from 'recharts';
import type { BackendArtist, BackendSong } from '../../data/api';
import { ProgressRing } from './shared';

export type FetchState = 'idle' | 'loading' | 'success' | 'error';
export type EndpointKey = 'artists' | 'songs';
export type EndpointDiagnostic = {
	key: EndpointKey;
	label: string;
	url: string;
	status: FetchState;
	httpStatus?: number;
	detail: string;
	expectedFields: string[];
};

type OverviewTabProps = {
	artists: BackendArtist[];
	songs: BackendSong[];
	endpointDiagnostics: Record<EndpointKey, EndpointDiagnostic>;
};

export function OverviewTab({ artists, songs, endpointDiagnostics }: OverviewTabProps) {
	// Charts computations
	const songsByYear = useMemo(() => {
		const counts: Record<number, number> = {};
		songs.forEach(song => {
			const year = song.releaseYear;
			if (!year) return;
			counts[year] = (counts[year] || 0) + 1;
		});

		const years = Object.keys(counts).map(Number).sort((a, b) => a - b);
		return years.map(yr => ({
			Jaar: yr,
			Aantal: counts[yr] || 0
		}));
	}, [songs]);

	const completenessStats = useMemo(() => {
		const total = songs.length;
		if (total === 0) return { coverPercent: 0, youtubePercent: 0, lyricsPercent: 0, coversCount: 0, youtubeCount: 0, lyricsCount: 0, total: 0 };

		let coversCount = 0;
		let youtubeCount = 0;
		let lyricsCount = 0;

		songs.forEach(song => {
			if (song.imgUrl?.trim() || song.albumCover?.trim()) coversCount++;
			if (song.youtube?.trim()) youtubeCount++;
			if (song.lyrics?.trim() || song.lyricsPreview?.trim()) lyricsCount++;
		});

		return {
			coverPercent: Math.round((coversCount / total) * 100),
			youtubePercent: Math.round((youtubeCount / total) * 100),
			lyricsPercent: Math.round((lyricsCount / total) * 100),
			coversCount,
			youtubeCount,
			lyricsCount,
			total
		};
	}, [songs]);

	const artistCompletenessStats = useMemo(() => {
		const total = artists.length;
		if (total === 0) return { photoPercent: 0, bioPercent: 0, websitePercent: 0, photoCount: 0, bioCount: 0, websiteCount: 0, total: 0 };

		let photoCount = 0;
		let bioCount = 0;
		let websiteCount = 0;

		artists.forEach(artist => {
			if (artist.photo?.trim() || artist.photoUrl?.trim()) photoCount++;
			if (artist.biography?.trim() || artist.bio?.trim()) bioCount++;
			if (artist.website?.trim()) websiteCount++;
		});

		return {
			photoPercent: Math.round((photoCount / total) * 100),
			bioPercent: Math.round((bioCount / total) * 100),
			websitePercent: Math.round((websiteCount / total) * 100),
			photoCount,
			bioCount,
			websiteCount,
			total
		};
	}, [artists]);

	const diagnosticsList = Object.values(endpointDiagnostics);

	return (
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
			<div className="grid grid-cols-1 lg:grid-cols-1 gap-8">
				{/* Chart 1: Release Jaar Tijdlijn */}
				<div className="bg-card border border-border rounded-2xl p-6 flex flex-col">
					<h3 className="text-lg font-bold mb-1 flex items-center gap-2">
						<Calendar className="w-4 h-4 text-primary" />
						Release Jaar Tijdlijn
					</h3>
					<p className="text-xs text-muted-foreground mb-6">Distributie en dichtheid van nummers per releasejaar in de catalogus.</p>

					<div className="w-full h-72 flex-1">
						{songsByYear.length > 0 ? (
							<ResponsiveContainer width="100%" height={280}>
								<AreaChart data={songsByYear} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
									<defs>
										<linearGradient id="colorSongs" x1="0" y1="0" x2="0" y2="1">
											<stop offset="5%" stopColor="var(--primary)" stopOpacity={0.4} />
											<stop offset="95%" stopColor="var(--primary)" stopOpacity={0} />
										</linearGradient>
									</defs>
									<CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
									<XAxis dataKey="Jaar" stroke="rgba(255,255,255,0.4)" fontSize={11} />
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

				{/* Chart 2: Compleetheidsanalyse */}
				<div className="bg-card border border-border rounded-2xl p-6 flex flex-col col-span-full">
					<h3 className="text-lg font-bold mb-1 flex items-center gap-2">
						<Activity className="w-4 h-4 text-primary" />
						Media & Compleetheidsanalyse
					</h3>
					<p className="text-xs text-muted-foreground mb-6">Dekking van media en metadata voor nummers en artiesten in de catalogus.</p>

					<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
						{/* Songs completeness */}
						<div className="bg-white/5 border border-white/5 rounded-2xl p-5">
							<div className="flex items-center gap-2 mb-4">
								<Music2 className="w-4 h-4 text-primary" />
								<span className="text-sm font-bold text-foreground">Nummers</span>
								<span className="ml-auto text-xs text-muted-foreground font-semibold">{completenessStats.total} totaal</span>
							</div>
							<div className="flex flex-row gap-3 justify-around">
								<ProgressRing
									percentage={completenessStats.coverPercent}
									label="Albumcovers"
									count={completenessStats.coversCount}
									total={completenessStats.total}
									strokeColor="#10b981"
								/>
								<ProgressRing
									percentage={completenessStats.youtubePercent}
									label="YouTube Video's"
									count={completenessStats.youtubeCount}
									total={completenessStats.total}
									strokeColor="#ef4444"
								/>
								<ProgressRing
									percentage={completenessStats.lyricsPercent}
									label="Songteksten"
									count={completenessStats.lyricsCount}
									total={completenessStats.total}
									strokeColor="#38bdf8"
								/>
							</div>
						</div>

						{/* Artists completeness */}
						<div className="bg-white/5 border border-white/5 rounded-2xl p-5">
							<div className="flex items-center gap-2 mb-4">
								<Users className="w-4 h-4 text-primary" />
								<span className="text-sm font-bold text-foreground">Artiesten</span>
								<span className="ml-auto text-xs text-muted-foreground font-semibold">{artistCompletenessStats.total} totaal</span>
							</div>
							<div className="flex flex-row gap-3 justify-around">
								<ProgressRing
									percentage={artistCompletenessStats.photoPercent}
									label="Artiestfoto"
									count={artistCompletenessStats.photoCount}
									total={artistCompletenessStats.total}
									strokeColor="#f59e0b"
								/>
								<ProgressRing
									percentage={artistCompletenessStats.bioPercent}
									label="Biografie"
									count={artistCompletenessStats.bioCount}
									total={artistCompletenessStats.total}
									strokeColor="#a78bfa"
								/>
								<ProgressRing
									percentage={artistCompletenessStats.websitePercent}
									label="Website"
									count={artistCompletenessStats.websiteCount}
									total={artistCompletenessStats.total}
									strokeColor="#34d399"
								/>
							</div>
						</div>
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
								<div className={`rounded-full px-3 py-1 text-xs font-bold ${diagnostic.status === 'success'
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
	);
}
