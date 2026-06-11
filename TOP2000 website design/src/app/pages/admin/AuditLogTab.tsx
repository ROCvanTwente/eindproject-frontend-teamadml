import React, { useState, useMemo } from 'react';
import {
	Search,
	Filter,
	Trash2,
	ClipboardList,
	Plus,
	Edit2,
	Activity,
	Info,
	Calendar,
	Music2,
	Users,
	Settings
} from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'motion/react';
import {
	type AuditLogEntry,
	type AuditAction,
	type AuditEntityType,
	clearAuditLogs
} from '../../data/api';
import {
	Pagination,
	paginateItems,
	getRelativeTimeString
} from './shared';

type AuditLogTabProps = {
	auditLogs: AuditLogEntry[];
	onRefresh: () => Promise<void> | void;
	addAuditLogEntry: (action: AuditAction, entityType: AuditEntityType, name: string, details: string) => Promise<void> | void;
};

export function AuditLogTab({ auditLogs, onRefresh, addAuditLogEntry }: AuditLogTabProps) {
	const [auditSearchQuery, setAuditSearchQuery] = useState('');
	const [auditActionFilter, setAuditActionFilter] = useState<string>('ALL');
	const [auditTypeFilter, setAuditTypeFilter] = useState<string>('ALL');
	const [auditPage, setAuditPage] = useState(1);

	const auditStats = useMemo(() => {
		let added = 0;
		let edited = 0;
		let deleted = 0;
		let system = 0;

		auditLogs.forEach(log => {
			if (log.action === 'TOEVOEGEN') added++;
			else if (log.action === 'BEWERKEN') edited++;
			else if (log.action === 'VERWIJDEREN') deleted++;
			else if (log.action === 'SYSTEEM') system++;
		});

		return {
			total: auditLogs.length,
			added,
			edited,
			deleted,
			system
		};
	}, [auditLogs]);

	// Filter and Sort Audit Logs
	const filteredAuditLogs = useMemo(() => {
		return auditLogs.filter(log => {
			const query = auditSearchQuery.toLowerCase().trim();
			const matchQuery = !query || (
				log.name.toLowerCase().includes(query) ||
				log.details.toLowerCase().includes(query) ||
				log.action.toLowerCase().includes(query) ||
				log.entityType.toLowerCase().includes(query)
			);

			const matchAction = auditActionFilter === 'ALL' || log.action === auditActionFilter;
			const matchType = auditTypeFilter === 'ALL' || log.entityType === auditTypeFilter;

			return matchQuery && matchAction && matchType;
		});
	}, [auditLogs, auditSearchQuery, auditActionFilter, auditTypeFilter]);

	const auditTotalPages = Math.max(1, Math.ceil(filteredAuditLogs.length / 10));
	const safeAuditPage = Math.min(auditPage, auditTotalPages);
	const paginatedAuditLogs = useMemo(() => {
		return paginateItems(filteredAuditLogs, safeAuditPage);
	}, [filteredAuditLogs, safeAuditPage]);

	const handleClearLogs = async () => {
		if (confirm('Weet u zeker dat u het logboek wilt wissen? Dit kan niet ongedaan worden gemaakt.')) {
			const result = await clearAuditLogs();
			if (result.ok) {
				toast.success('Logboek succesvol gewist!');
				localStorage.removeItem('top2000_audit_log');
				await onRefresh();
			} else {
				toast.warn('Logboek lokaal gewist, maar backend kon niet worden bereikt.');
				localStorage.removeItem('top2000_audit_log');
				await onRefresh();
			}
		}
	};

	return (
		<div className="space-y-6">
			{/* Audit Stats Grid */}
			<div className="grid grid-cols-2 md:grid-cols-5 gap-4">
				<div className="bg-card border border-border rounded-2xl p-4 flex flex-col justify-between hover:shadow-lg hover:shadow-primary/5 transition-all duration-300">
					<div className="flex items-center justify-between mb-2">
						<span className="text-xs font-semibold text-muted-foreground">Totaal Logs</span>
						<div className="w-7 h-7 rounded-lg bg-white/5 flex items-center justify-center text-muted-foreground border border-white/5">
							<ClipboardList className="w-3.5 h-3.5" />
						</div>
					</div>
					<div>
						<div className="text-2xl font-extrabold tracking-tight">{auditStats.total}</div>
						<span className="text-[10px] text-muted-foreground">Logboek regels</span>
					</div>
				</div>
				<div className="bg-card border border-border rounded-2xl p-4 flex flex-col justify-between hover:shadow-lg hover:shadow-primary/5 transition-all duration-300">
					<div className="flex items-center justify-between mb-2">
						<span className="text-xs font-semibold text-muted-foreground">Toevoegingen</span>
						<div className="w-7 h-7 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400 border border-emerald-500/20">
							<Plus className="w-3.5 h-3.5" />
						</div>
					</div>
					<div>
						<div className="text-2xl font-extrabold tracking-tight text-emerald-400">{auditStats.added}</div>
						<span className="text-[10px] text-muted-foreground">Aangemaakt</span>
					</div>
				</div>
				<div className="bg-card border border-border rounded-2xl p-4 flex flex-col justify-between hover:shadow-lg hover:shadow-primary/5 transition-all duration-300">
					<div className="flex items-center justify-between mb-2">
						<span className="text-xs font-semibold text-muted-foreground">Bewerkingen</span>
						<div className="w-7 h-7 rounded-lg bg-sky-500/10 flex items-center justify-center text-sky-400 border border-sky-500/20">
							<Edit2 className="w-3.5 h-3.5" />
						</div>
					</div>
					<div>
						<div className="text-2xl font-extrabold tracking-tight text-sky-400">{auditStats.edited}</div>
						<span className="text-[10px] text-muted-foreground">Bijgewerkt</span>
					</div>
				</div>
				<div className="bg-card border border-border rounded-2xl p-4 flex flex-col justify-between hover:shadow-lg hover:shadow-primary/5 transition-all duration-300">
					<div className="flex items-center justify-between mb-2">
						<span className="text-xs font-semibold text-muted-foreground">Verwijderingen</span>
						<div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
							<Trash2 className="w-3.5 h-3.5" />
						</div>
					</div>
					<div>
						<div className="text-2xl font-extrabold tracking-tight text-primary">{auditStats.deleted}</div>
						<span className="text-[10px] text-muted-foreground">Verwijderd</span>
					</div>
				</div>
				<div className="bg-card border border-border rounded-2xl p-4 col-span-2 md:col-span-1 flex flex-col justify-between hover:shadow-lg hover:shadow-primary/5 transition-all duration-300">
					<div className="flex items-center justify-between mb-2">
						<span className="text-xs font-semibold text-muted-foreground">Systeem</span>
						<div className="w-7 h-7 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-400 border border-indigo-500/20">
							<Activity className="w-3.5 h-3.5" />
						</div>
					</div>
					<div>
						<div className="text-2xl font-extrabold tracking-tight text-indigo-400">{auditStats.system}</div>
						<span className="text-[10px] text-muted-foreground">Systeem log</span>
					</div>
				</div>
			</div>

			{/* Logboek Panel */}
			<div className="bg-card border border-border rounded-2xl shadow-xl overflow-hidden">
				{/* Search and Filters */}
				<div className="p-6 border-b border-white/10 flex flex-col gap-4 bg-white/5">
					<div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
						{/* Search Input */}
						<div className="relative flex-1 w-full">
							<Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
							<input
								type="text"
								value={auditSearchQuery}
								onChange={(e) => {
									setAuditSearchQuery(e.target.value);
									setAuditPage(1);
								}}
								placeholder="Zoek in logboek op onderwerp of details..."
								className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-white/10 bg-background/50 focus:outline-none focus:border-primary text-sm transition-colors"
							/>
						</div>

						{/* Secondary Filters Dropdown / Button */}
						<div className="flex items-center gap-3 w-full lg:w-auto flex-wrap sm:flex-nowrap">
							<div className="flex items-center gap-2 w-full sm:w-auto">
								<Filter className="w-4 h-4 text-muted-foreground flex-shrink-0" />
								<select
									value={auditTypeFilter}
									onChange={(e) => {
										setAuditTypeFilter(e.target.value);
										setAuditPage(1);
									}}
									className="w-full sm:w-44 px-3 py-2.5 rounded-xl border border-white/10 bg-background/50 focus:outline-none focus:border-primary text-sm text-foreground animate-none"
								>
									<option value="ALL">Alle Types</option>
									<option value="NUMMER">Nummers</option>
									<option value="ARTIEST">Artiesten</option>
									<option value="SYSTEEM">Systeem</option>
								</select>
							</div>

							<button
								onClick={handleClearLogs}
								className="border border-destructive/30 text-destructive bg-destructive/5 hover:bg-destructive hover:text-white px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer w-full sm:w-auto"
							>
								<Trash2 className="w-3.5 h-3.5" />
								Logboek Wissen
							</button>
						</div>
					</div>

					{/* Pill Actions Filter */}
					<div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-white/5">
						<span className="text-xs text-muted-foreground font-semibold mr-2">Filter op actie:</span>
						{[
							{ value: 'ALL', label: 'Alle Acties', activeClass: 'bg-white/10 text-foreground border-white/20' },
							{ value: 'TOEVOEGEN', label: 'Toevoegen', activeClass: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 shadow-sm' },
							{ value: 'BEWERKEN', label: 'Bewerken', activeClass: 'bg-sky-500/10 text-sky-400 border-sky-500/30 shadow-sm' },
							{ value: 'VERWIJDEREN', label: 'Verwijderen', activeClass: 'bg-primary/10 text-primary border-primary/30 shadow-sm' },
							{ value: 'SYSTEEM', label: 'Systeem', activeClass: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30 shadow-sm' }
						].map((pill) => {
							const isActive = auditActionFilter === pill.value;
							return (
								<button
									key={pill.value}
									onClick={() => {
										setAuditActionFilter(pill.value);
										setAuditPage(1);
									}}
									className={`px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all cursor-pointer ${isActive
										? pill.activeClass
										: 'border-white/5 bg-transparent text-muted-foreground hover:bg-white/5 hover:text-foreground'
										}`}
								>
									{pill.label}
								</button>
							);
						})}
					</div>
				</div>

				{/* Timeline Feed */}
				<div className="p-6 relative">
					{paginatedAuditLogs.length === 0 ? (
						<div className="py-16 flex flex-col items-center justify-center text-center gap-4 text-muted-foreground">
							<div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center border border-white/10 shadow-inner">
								<ClipboardList className="w-8 h-8 text-muted-foreground/40" />
							</div>
							<div>
								<h4 className="font-bold text-base text-foreground">Geen logboekvermeldingen</h4>
								<p className="text-xs text-muted-foreground max-w-sm mt-1">Er zijn geen gebeurtenissen gevonden die voldoen aan de geselecteerde filters of zoekterm.</p>
							</div>
							{(auditSearchQuery || auditActionFilter !== 'ALL' || auditTypeFilter !== 'ALL') && (
								<button
									onClick={() => {
										setAuditSearchQuery('');
										setAuditActionFilter('ALL');
										setAuditTypeFilter('ALL');
										setAuditPage(1);
									}}
									className="text-xs text-primary font-bold hover:underline underline-offset-4 cursor-pointer mt-2"
								>
									Filters resetten
								</button>
							)}
						</div>
					) : (
						<div className="relative pl-8 sm:pl-10 space-y-6 before:absolute before:left-3 before:top-2 before:bottom-2 before:w-[2px] before:bg-white/10 before:rounded-full">
							<AnimatePresence mode="popLayout">
								{paginatedAuditLogs.map((log) => {
									// Action icon and colors
									let actionColor = 'bg-white/10 text-muted-foreground border-white/20';
									let actionIcon = <Info className="w-3.5 h-3.5" />;
									let leftBorderColor = 'border-l-white/20';
									if (log.action === 'TOEVOEGEN') {
										actionColor = 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
										actionIcon = <Plus className="w-3.5 h-3.5" />;
										leftBorderColor = 'border-l-emerald-500/40';
									} else if (log.action === 'BEWERKEN') {
										actionColor = 'bg-sky-500/20 text-sky-400 border-sky-500/30';
										actionIcon = <Edit2 className="w-3.5 h-3.5" />;
										leftBorderColor = 'border-l-sky-500/40';
									} else if (log.action === 'VERWIJDEREN') {
										actionColor = 'bg-primary/20 text-primary border-primary/30';
										actionIcon = <Trash2 className="w-3.5 h-3.5" />;
										leftBorderColor = 'border-l-primary/40';
									} else if (log.action === 'SYSTEEM') {
										actionColor = 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30';
										actionIcon = <Activity className="w-3.5 h-3.5" />;
										leftBorderColor = 'border-l-indigo-500/40';
									}

									// Entity badge details
									let entityIcon = <Settings className="w-3 h-3" />;
									let entityBadge = 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20';
									if (log.entityType === 'NUMMER') {
										entityIcon = <Music2 className="w-3 h-3" />;
										entityBadge = 'bg-pink-500/10 text-pink-400 border-pink-500/20';
									} else if (log.entityType === 'ARTIEST') {
										entityIcon = <Users className="w-3 h-3" />;
										entityBadge = 'bg-amber-500/10 text-amber-400 border-amber-500/20';
									}

									return (
										<motion.div
											key={log.id}
											layout
											initial={{ opacity: 0, y: 15 }}
											animate={{ opacity: 1, y: 0 }}
											exit={{ opacity: 0, y: -15 }}
											transition={{ duration: 0.25 }}
											className="relative group"
										>
											{/* Timeline Point */}
											<div className={`absolute -left-8 sm:-left-10 top-1.5 w-6 h-6 rounded-full border flex items-center justify-center shadow-lg transition-transform group-hover:scale-110 duration-200 z-10 ${actionColor}`}>
												{actionIcon}
											</div>

											{/* Card Body */}
											<div className={`bg-white/5 border border-white/5 border-l-4 rounded-2xl p-4 transition-all duration-300 hover:bg-white/10 hover:shadow-xl hover:shadow-black/10 ${leftBorderColor}`}>
												<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
													<div className="flex items-center gap-2 flex-wrap">
														<h4 className="font-bold text-sm text-foreground">{log.name}</h4>

														{/* Entity Type Badge */}
														<span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md border text-[10px] font-bold tracking-wider ${entityBadge}`}>
															{entityIcon}
															{log.entityType}
														</span>
													</div>

													{/* Timestamp Info */}
													<div className="flex items-center gap-2 text-xs text-muted-foreground font-semibold">
														<Calendar className="w-3 h-3" />
														<span title={new Date(log.timestamp).toLocaleString('nl-NL')}>{getRelativeTimeString(log.timestamp)}</span>
														<span className="hidden sm:inline text-muted-foreground/30">•</span>
														<span className="hidden sm:inline font-mono text-[10px] text-muted-foreground/60">
															{new Date(log.timestamp).toLocaleString('nl-NL', {
																hour: '2-digit',
																minute: '2-digit',
																second: '2-digit'
															})}
														</span>
													</div>
												</div>

												{/* Details */}
												<p className="text-xs text-muted-foreground leading-relaxed whitespace-pre-wrap pl-1">
													{log.details}
												</p>
											</div>
										</motion.div>
									);
								})}
							</AnimatePresence>
						</div>
					)}
				</div>

				{/* Pagination */}
				<div className="px-6 py-4 border-t border-white/10 flex items-center justify-between gap-4 bg-white/5">
					<p className="text-xs text-muted-foreground font-semibold">
						Pagina {safeAuditPage} van {auditTotalPages} (Totaal {filteredAuditLogs.length} items)
					</p>
					<Pagination currentPage={safeAuditPage} totalPages={auditTotalPages} onPageChange={setAuditPage} />
				</div>
			</div>
		</div>
	);
}
