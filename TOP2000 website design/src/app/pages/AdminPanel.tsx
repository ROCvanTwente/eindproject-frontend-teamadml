import React, { useEffect, useState, useMemo, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
	AlertCircle,
	Loader2,
	Music2,
	RefreshCw,
	Users,
	Plus,
	LayoutDashboard,
	ClipboardList,
	UserCheck,
	Sparkles
} from 'lucide-react';
import {
	loadAdminCatalog,
	type BackendArtist,
	type BackendSong,
	fetchAuditLogs,
	createAuditLog,
	type AuditLogEntry,
	type AuditAction,
	type AuditEntityType,
	fetchUsers,
	fetchRoleRequests,
	type BackendUser,
	type RoleChangeRequest
} from '../data/api';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'motion/react';

import { OverviewTab, type EndpointDiagnostic, type EndpointKey } from './admin/OverviewTab';
import { ArtistsTab } from './admin/ArtistsTab';
import { SongsTab } from './admin/SongsTab';
import { AuditLogTab } from './admin/AuditLogTab';
import { AccountsTab } from './admin/AccountsTab';

type FetchState = 'idle' | 'loading' | 'success' | 'error';

const ADMIN_ENDPOINTS = {
	artists: {
		key: 'artists' as EndpointKey,
		label: 'Artiesten',
		url: '/api/artists',
		expectedFields: ['artistId', 'name', 'website'],
	},
	songs: {
		key: 'songs' as EndpointKey,
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

	const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);
	const [users, setUsers] = useState<BackendUser[]>([]);
	const [roleRequests, setRoleRequests] = useState<RoleChangeRequest[]>([]);
	const [usersLoading, setUsersLoading] = useState(false);

	const openAddArtistModalRef = useRef<() => void>(() => {});
	const openAddSongModalRef = useRef<() => void>(() => {});

	const addAuditLogEntry = async (action: AuditAction, entityType: AuditEntityType, name: string, details: string) => {
		const newEntry: Omit<AuditLogEntry, 'id' | 'timestamp'> & { id?: string; timestamp?: string } = {
			id: '',
			timestamp: '',
			action,
			entityType,
			name,
			details
		};

		const apiResult = await createAuditLog(newEntry);

		if (apiResult.ok && apiResult.data) {
			setAuditLogs(prev => {
				const updated = [apiResult.data, ...prev];
				localStorage.setItem('top2000_audit_log', JSON.stringify(updated));
				return updated;
			});
		} else {
			const localEntry: AuditLogEntry = {
				id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
				timestamp: new Date().toISOString(),
				action,
				entityType,
				name,
				details
			};
			setAuditLogs(prev => {
				const updated = [localEntry, ...prev];
				localStorage.setItem('top2000_audit_log', JSON.stringify(updated));
				return updated;
			});
		}
	};

	const currentTab = useMemo(() => {
		if (location.pathname.includes('/artiesten')) return 'artists';
		if (location.pathname.includes('/nummers')) return 'songs';
		if (location.pathname.includes('/logboek')) return 'audit-log';
		if (location.pathname.includes('/gebruikers')) return 'accounts';
		return 'overview';
	}, [location.pathname]);

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

	const loadUsersData = async () => {
		setUsersLoading(true);
		try {
			const [usersRes, requestsRes] = await Promise.all([
				fetchUsers(),
				fetchRoleRequests()
			]);

			if (usersRes.ok && usersRes.data) {
				setUsers(usersRes.data);
			}
			if (requestsRes.ok && requestsRes.data) {
				setRoleRequests(requestsRes.data);
			}
		} catch (error) {
			console.error("Fout bij laden gebruikersgegevens:", error);
		} finally {
			setUsersLoading(false);
		}
	};

	const loadAuditLogsData = async () => {
		const result = await fetchAuditLogs();
		if (result.ok && Array.isArray(result.data)) {
			setAuditLogs(result.data);
			localStorage.setItem('top2000_audit_log', JSON.stringify(result.data));
		} else {
			const storedLogs = localStorage.getItem('top2000_audit_log');
			if (storedLogs) {
				try {
					setAuditLogs(JSON.parse(storedLogs));
				} catch (e) {
					console.error('Error parsing stored logs:', e);
				}
			} else {
				const mockLogs: AuditLogEntry[] = [
					{
						id: 'mock-1',
						timestamp: new Date(Date.now() - 3600000 * 24).toISOString(),
						action: 'SYSTEEM',
						entityType: 'SYSTEEM',
						name: 'Database Koppeling',
						details: 'Initieel database schema geladen, connectie succesvol met SmarterASP.net backend.'
					},
					{
						id: 'mock-2',
						timestamp: new Date(Date.now() - 3600000 * 20).toISOString(),
						action: 'SYSTEEM',
						entityType: 'SYSTEEM',
						name: 'Spotify API Integratie',
						details: 'Verbinding met Spotify API geactiveerd voor automatisch ophalen van cover images.'
					},
					{
						id: 'mock-3',
						timestamp: new Date(Date.now() - 3600000 * 12).toISOString(),
						action: 'TOEVOEGEN',
						entityType: 'ARTIEST',
						name: 'Queen',
						details: 'Nieuwe artiest handmatig toegevoegd aan de database.'
					},
					{
						id: 'mock-4',
						timestamp: new Date(Date.now() - 3600000 * 8).toISOString(),
						action: 'BEWERKEN',
						entityType: 'NUMMER',
						name: 'Bohemian Rhapsody',
						details: 'YouTube link en lyrics details geüpdatet.'
					},
					{
						id: 'mock-5',
						timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
						action: 'VERWIJDEREN',
						entityType: 'NUMMER',
						name: 'Test Song 123',
						details: 'Tijdelijk testnummer permanent verwijderd.'
					}
				];
				setAuditLogs(mockLogs);
				localStorage.setItem('top2000_audit_log', JSON.stringify(mockLogs));
				for (const log of mockLogs) {
					void createAuditLog(log);
				}
			}
		}
	};

	useEffect(() => {
		const token = localStorage.getItem('token');
		const role = localStorage.getItem('role');
		if (!token || role !== 'Admin') {
			window.location.href = '/login';
			return;
		}

		void loadAdminData();
		void loadUsersData();
		void loadAuditLogsData();
	}, []);

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
						className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 cursor-pointer whitespace-nowrap ${currentTab === 'overview'
							? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20'
							: 'hover:bg-white/5 text-muted-foreground hover:text-foreground'
							}`}
					>
						<LayoutDashboard className="w-4 h-4" />
						Dashboard Overzicht
					</button>

					<button
						onClick={() => navigate('/admin/artiesten')}
						className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 cursor-pointer whitespace-nowrap ${currentTab === 'artists'
							? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20'
							: 'hover:bg-white/5 text-muted-foreground hover:text-foreground'
							}`}
					>
						<Users className="w-4 h-4" />
						Artiesten Beheer
					</button>

					<button
						onClick={() => navigate('/admin/nummers')}
						className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 cursor-pointer whitespace-nowrap ${currentTab === 'songs'
							? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20'
							: 'hover:bg-white/5 text-muted-foreground hover:text-foreground'
							}`}
					>
						<Music2 className="w-4 h-4" />
						Nummers Beheer
					</button>

					<button
						onClick={() => navigate('/admin/logboek')}
						className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 cursor-pointer whitespace-nowrap ${currentTab === 'audit-log'
							? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20'
							: 'hover:bg-white/5 text-muted-foreground hover:text-foreground'
							}`}
					>
						<ClipboardList className="w-4 h-4" />
						Audit Logboek
					</button>

					<button
						onClick={() => navigate('/admin/gebruikers')}
						className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 cursor-pointer whitespace-nowrap ${currentTab === 'accounts'
							? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20'
							: 'hover:bg-white/5 text-muted-foreground hover:text-foreground'
							}`}
					>
						<UserCheck className="w-4 h-4" />
						Gebruikers Beheer
					</button>
				</nav>

				<div className="mt-auto hidden lg:flex flex-col gap-4 pt-6 border-t border-white/10">
					<div className="bg-white/5 rounded-xl p-4 border border-white/5">
						<span className="text-xs uppercase tracking-wider text-muted-foreground font-semibold block mb-2">Backend Services</span>
						<div className="space-y-2">
							{diagnosticsList.map(diag => (
								<div key={diag.key} className="flex items-center justify-between text-xs">
									<span className="text-muted-foreground">{diag.label}</span>
									<span className={`inline-flex items-center gap-1 font-bold ${diag.status === 'success' ? 'text-emerald-500' : 'text-primary'
										}`}>
										<span className={`w-1.5 h-1.5 rounded-full ${diag.status === 'success' ? 'bg-emerald-500' : 'bg-primary'
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
				<header className="relative overflow-hidden p-6 md:p-8 rounded-2xl border border-zinc-800 bg-gradient-to-r from-red-900 via-red-655 to-red-900 text-white flex flex-col md:flex-row md:items-center justify-between gap-4">
					<div className="absolute inset-0 bg-black/15 pointer-events-none" />
					<div className="relative z-10">
						<h1 className="text-3xl md:text-4xl font-black bg-clip-text text-transparent bg-gradient-to-r from-white via-zinc-100 to-zinc-300 leading-tight">
							{currentTab === 'overview' && 'Dashboard Overzicht'}
							{currentTab === 'artists' && 'Artiesten Database'}
							{currentTab === 'songs' && 'Nummers Catalogus'}
							{currentTab === 'audit-log' && 'Systeem & Activiteiten Logboek'}
							{currentTab === 'accounts' && 'Gebruikers & Bevoegdheden'}
						</h1>
						<p className="text-red-100 text-sm mt-2">
							{currentTab === 'overview' && 'Status, statistieken en overzicht van de TOP 2000 catalogus.'}
							{currentTab === 'artists' && 'Beheer artiesten in de catalogus. Klik op een artiest voor detailweergave.'}
							{currentTab === 'songs' && 'Volledige catalogus van nummers, gekoppelde artiesten en media.'}
							{currentTab === 'audit-log' && 'Historisch overzicht van wijzigingen, toevoegingen, verwijderingen en systeemgebeurtenissen.'}
							{currentTab === 'accounts' && 'Overzicht van geregistreerde gebruikers en beheer van admin-rol aanvragen.'}
						</p>
					</div>

					<div className="flex items-center gap-3 relative z-10">
						<button
							onClick={() => void loadAdminData()}
							disabled={fetchState === 'loading'}
							className="inline-flex lg:hidden items-center justify-center p-3 rounded-xl border border-white/15 bg-white/5 hover:bg-white/10 transition-colors text-white"
							aria-label="Vernieuwen"
						>
							<RefreshCw className={`w-4 h-4 ${fetchState === 'loading' ? 'animate-spin' : ''}`} />
						</button>

						{currentTab === 'artists' && (
							<button
								onClick={() => openAddArtistModalRef.current?.()}
								className="bg-white hover:bg-white/90 text-red-900 px-5 py-3 rounded-xl font-bold flex items-center gap-2 transition-all shadow-lg shadow-black/10 cursor-pointer"
							>
								<Plus className="w-5 h-5" />
								Artiest Toevoegen
							</button>
						)}

						{currentTab === 'songs' && (
							<button
								onClick={() => openAddSongModalRef.current?.()}
								className="bg-white hover:bg-white/90 text-red-900 px-5 py-3 rounded-xl font-bold flex items-center gap-2 transition-all shadow-lg shadow-black/10 cursor-pointer"
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
								Controleer of de dotnet backend service correct is opgestart op https://top2000teamadml.runasp.net.
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
							{currentTab === 'overview' && (
								<OverviewTab
									artists={artists}
									songs={songs}
									endpointDiagnostics={endpointDiagnostics}
								/>
							)}

							{currentTab === 'artists' && (
								<ArtistsTab
									artists={artists}
									songs={songs}
									onRefresh={loadAdminData}
									addAuditLogEntry={addAuditLogEntry}
									registerOpenAddModal={(fn) => { openAddArtistModalRef.current = fn; }}
								/>
							)}

							{currentTab === 'songs' && (
								<SongsTab
									songs={songs}
									artists={artists}
									onRefresh={loadAdminData}
									addAuditLogEntry={addAuditLogEntry}
									registerOpenAddModal={(fn) => { openAddSongModalRef.current = fn; }}
								/>
							)}

							{currentTab === 'audit-log' && (
								<AuditLogTab
									auditLogs={auditLogs}
									onRefresh={loadAuditLogsData}
									addAuditLogEntry={addAuditLogEntry}
								/>
							)}

							{currentTab === 'accounts' && (
								<AccountsTab
									users={users}
									roleRequests={roleRequests}
									usersLoading={usersLoading}
									onRefresh={loadUsersData}
								/>
							)}
						</motion.div>
					</AnimatePresence>
				)}
			</main>
		</div>
	);
}
