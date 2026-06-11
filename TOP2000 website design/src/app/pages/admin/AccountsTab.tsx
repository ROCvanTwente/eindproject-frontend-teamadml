import React, { useState } from 'react';
import {
	UserCheck,
	Shield,
	AlertCircle,
	Search,
	Loader2,
	Edit2,
	CheckCircle2,
	X
} from 'lucide-react';
import { toast } from 'sonner';
import {
	type BackendUser,
	type RoleChangeRequest,
	createRoleRequest,
	approveRoleRequest,
	rejectRoleRequest
} from '../../data/api';
import { getRelativeTimeString } from './shared';

type AccountsTabProps = {
	users: BackendUser[];
	roleRequests: RoleChangeRequest[];
	usersLoading: boolean;
	onRefresh: () => Promise<void> | void;
};

export function AccountsTab({ users, roleRequests, usersLoading, onRefresh }: AccountsTabProps) {
	const [usersSearchQuery, setUsersSearchQuery] = useState('');
	const [selectedUserForPromo, setSelectedUserForPromo] = useState<BackendUser | null>(null);
	const [promotingUserRole, setPromotingUserRole] = useState<string>('Admin');

	return (
		<div className="space-y-8">
			{/* User Statistics Grid */}
			<div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
				<div className="bg-card border border-border rounded-2xl p-6 hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 group">
					<div className="flex items-center justify-between mb-3">
						<span className="text-sm font-semibold text-muted-foreground group-hover:text-foreground transition-colors">Totaal Gebruikers</span>
						<div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
							<UserCheck className="w-4 h-4" />
						</div>
					</div>
					<div className="text-4xl font-extrabold tracking-tight">
						{users.length}
					</div>
					<span className="text-xs text-muted-foreground mt-1 block">Geregistreerde accounts</span>
				</div>

				<div className="bg-card border border-border rounded-2xl p-6 hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 group">
					<div className="flex items-center justify-between mb-3">
						<span className="text-sm font-semibold text-muted-foreground group-hover:text-foreground transition-colors">Administrators</span>
						<div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-500">
							<Shield className="w-4 h-4" />
						</div>
					</div>
					<div className="text-4xl font-extrabold tracking-tight">
						{users.filter(u => u.role === 'Admin').length}
					</div>
					<span className="text-xs text-muted-foreground mt-1 block">Actieve beheerders</span>
				</div>

				<div className="bg-card border border-border rounded-2xl p-6 hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 group">
					<div className="flex items-center justify-between mb-3">
						<span className="text-sm font-semibold text-muted-foreground group-hover:text-foreground transition-colors">Openstaande Aanvragen</span>
						<div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-500">
							<AlertCircle className="w-4 h-4" />
						</div>
					</div>
					<div className="text-4xl font-extrabold tracking-tight">
						{roleRequests.filter(r => r.status === 'Pending').length}
					</div>
					<span className="text-xs text-muted-foreground mt-1 block">Vereist 2e admin verificatie</span>
				</div>
			</div>

			{/* Main content grid: Users List and Requests Feed */}
			<div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
				{/* Users List Card */}
				<div className="lg:col-span-2 bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
					<div className="p-6 border-b border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white/5">
						<div>
							<h3 className="font-bold text-lg text-foreground">Gebruikersdatabase</h3>
							<p className="text-xs text-muted-foreground mt-1">Beheer rollen en inspecteer registraties.</p>
						</div>
						<div className="relative w-full sm:w-64">
							<Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/60" />
							<input
								type="text"
								placeholder="Zoek gebruiker..."
								value={usersSearchQuery}
								onChange={(e) => setUsersSearchQuery(e.target.value)}
								className="w-full pl-10 pr-4 py-2 border border-white/10 rounded-xl bg-background/60 focus:outline-none focus:border-primary text-xs focus:ring-1 focus:ring-primary/45 transition-all"
							/>
						</div>
					</div>

					{usersLoading ? (
						<div className="p-12 flex flex-col items-center justify-center gap-3 text-muted-foreground">
							<Loader2 className="w-6 h-6 animate-spin text-primary" />
							<span className="text-xs font-semibold">Gebruikers ophalen...</span>
						</div>
					) : (
						<div className="overflow-x-auto">
							<table className="w-full text-left border-collapse">
								<thead>
									<tr className="border-b border-white/10 text-xs text-muted-foreground uppercase bg-white/5">
										<th className="px-6 py-3.5 font-bold">ID</th>
										<th className="px-6 py-3.5 font-bold">Gebruikersnaam</th>
										<th className="px-6 py-3.5 font-bold">Rol</th>
										<th className="px-6 py-3.5 font-bold">Geregistreerd Op</th>
										<th className="px-6 py-3.5 font-bold text-right">Acties</th>
									</tr>
								</thead>
								<tbody className="divide-y divide-white/5 text-sm">
									{users
										.filter(u => u.username.toLowerCase().includes(usersSearchQuery.toLowerCase()))
										.map((user) => (
											<tr key={user.userId} className="hover:bg-white/5 transition-colors">
												<td className="px-6 py-4 font-mono text-xs text-muted-foreground">#{user.userId}</td>
												<td className="px-6 py-4 font-bold text-foreground">{user.username}</td>
												<td className="px-6 py-4">
													<span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
														user.role === 'Admin'
															? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
															: 'bg-sky-500/10 text-sky-400 border-sky-500/30'
													}`}>
														<span className={`w-1.5 h-1.5 rounded-full ${user.role === 'Admin' ? 'bg-emerald-500' : 'bg-sky-500'}`}></span>
														{user.role}
													</span>
												</td>
												<td className="px-6 py-4 text-xs text-muted-foreground">
													{new Date(user.createdAtUtc).toLocaleDateString('nl-NL', {
														day: '2-digit',
														month: 'short',
														year: 'numeric',
														hour: '2-digit',
														minute: '2-digit'
													})}
												</td>
												<td className="px-6 py-4 text-right">
													<button
														onClick={() => {
															setSelectedUserForPromo(user);
															setPromotingUserRole(user.role === 'Admin' ? 'User' : 'Admin');
														}}
														className="inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:text-primary/80 transition-colors bg-primary/10 border border-primary/20 hover:bg-primary/20 px-3 py-1.5 rounded-lg cursor-pointer"
													>
														<Edit2 className="w-3 h-3" />
														Rol Wijzigen
													</button>
												</td>
											</tr>
										))}
								</tbody>
							</table>
						</div>
					)}
				</div>

				{/* Proposals and Verification Requests Card */}
				<div className="space-y-6">
					<div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
						<div className="p-6 border-b border-white/10 bg-white/5">
							<h3 className="font-bold text-lg text-foreground">Openstaande Verificaties</h3>
							<p className="text-xs text-muted-foreground mt-1">Maker-Checker goedkeuringen door andere admins.</p>
						</div>

						<div className="p-6 space-y-4 max-h-[450px] overflow-y-auto">
							{roleRequests.filter(r => r.status === 'Pending').length === 0 ? (
								<div className="py-8 text-center text-xs text-muted-foreground flex flex-col items-center gap-2">
									<CheckCircle2 className="w-8 h-8 text-emerald-500/40" />
									<span>Geen openstaande verificatieverzoeken.</span>
								</div>
							) : (
								roleRequests
									.filter(r => r.status === 'Pending')
									.map((req) => {
										const isOwnRequest = req.requestedBy.toLowerCase() === (localStorage.getItem('username') ?? '').toLowerCase();
										return (
											<div key={req.id} className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-3">
												<div className="flex items-start justify-between gap-2">
													<div>
														<h4 className="font-bold text-sm text-foreground">{req.targetUsername}</h4>
														<p className="text-xs text-muted-foreground mt-0.5">
															Proposeer rol: <span className="font-bold text-primary">{req.newRole}</span>
														</p>
													</div>
													<span className="text-[10px] text-muted-foreground whitespace-nowrap">
														{getRelativeTimeString(req.createdAtUtc)}
													</span>
												</div>
												
												<div className="text-xs text-muted-foreground bg-black/20 p-2 rounded-lg border border-white/5">
													Aangevraagd door: <span className="font-semibold text-foreground">{req.requestedBy}</span>
												</div>

												{isOwnRequest ? (
													<div className="text-[11px] text-amber-500 font-semibold flex items-center gap-1.5 bg-amber-500/10 border border-amber-500/20 p-2 rounded-lg">
														<AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
														<span>Verificatie door 2e admin vereist (eigen verzoek).</span>
													</div>
												) : null}

												<div className="flex gap-2">
													<button
														disabled={isOwnRequest}
														onClick={async () => {
															if (confirm(`Weet u zeker dat u de rol van ${req.targetUsername} wilt wijzigen naar ${req.newRole}?`)) {
																const res = await approveRoleRequest(req.id);
																if (res.ok) {
																	toast.success("Rol succesvol goedgekeurd en bijgewerkt!");
																	await onRefresh();
																} else {
																	toast.error(res.message || "Fout bij goedkeuren verzoek.");
																}
															}
														}}
														className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all text-center justify-center flex items-center gap-1 cursor-pointer ${
															isOwnRequest
																? 'bg-emerald-500/5 text-emerald-500/30 border border-emerald-500/10 cursor-not-allowed'
																: 'bg-emerald-500 text-white hover:bg-emerald-600'
														}`}
													>
														Goedkeuren
													</button>
													<button
														onClick={async () => {
															if (confirm(`Weet u zeker dat u dit verzoek wilt afwijzen?`)) {
																const res = await rejectRoleRequest(req.id);
																if (res.ok) {
																	toast.success("Rolwijzigingsverzoek afgewezen.");
																	await onRefresh();
																} else {
																	toast.error(res.message || "Fout bij afwijzen verzoek.");
																}
															}
														}}
														className="flex-1 py-1.5 border border-primary/20 hover:bg-primary hover:text-white text-primary rounded-lg text-xs font-bold transition-all text-center justify-center flex items-center gap-1 cursor-pointer"
													>
														Afwijzen
													</button>
												</div>
											</div>
										);
									})
							)}
						</div>
					</div>

					{/* Request History Card */}
					<div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
						<div className="p-6 border-b border-white/10 bg-white/5">
							<h3 className="font-bold text-sm text-foreground">Verificatiegeschiedenis</h3>
						</div>
						<div className="p-6 space-y-3 max-h-[300px] overflow-y-auto divide-y divide-white/5">
							{roleRequests.filter(r => r.status !== 'Pending').length === 0 ? (
								<div className="py-4 text-center text-xs text-muted-foreground">
									Geen eerdere verzoeken verwerkt.
								</div>
							) : (
								roleRequests
									.filter(r => r.status !== 'Pending')
									.map((req) => (
										<div key={req.id} className="pt-3 first:pt-0 space-y-1">
											<div className="flex items-center justify-between text-xs">
												<span className="font-bold text-foreground">{req.targetUsername}</span>
												<span className={`px-2 py-0.5 rounded text-[10px] font-bold border uppercase ${
													req.status === 'Approved'
														? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
														: 'bg-primary/10 text-primary border-primary/20'
												}`}>
													{req.status === 'Approved' ? 'Goedgekeurd' : 'Afgewezen'}
												</span>
											</div>
											<p className="text-[11px] text-muted-foreground">
												Rol naar <span className="font-semibold text-foreground">{req.newRole}</span>. 
												Ingezonden door <span className="text-foreground">{req.requestedBy}</span>
												{req.approvedBy && (
													<> en verwerkt door <span className="text-foreground">{req.approvedBy}</span></>
												)}.
											</p>
										</div>
									))
							)}
						</div>
					</div>
				</div>
			</div>

			{/* Role Promotion Request Modal */}
			{selectedUserForPromo && (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 overflow-y-auto">
					<div className="bg-card border border-white/10 rounded-2xl shadow-2xl max-w-md w-full overflow-hidden transform transition-all my-8">
						<div className="px-6 py-4 border-b border-white/10 flex items-center justify-between bg-white/5">
							<h3 className="text-lg font-bold flex items-center gap-2">
								<Shield className="w-5 h-5 text-primary" />
								Rolwijziging Aanvragen
							</h3>
							<button onClick={() => setSelectedUserForPromo(null)} className="text-muted-foreground hover:text-foreground cursor-pointer p-1 bg-white/5 rounded-lg border border-white/5 hover:border-white/20 transition-all">
								<X className="w-4 h-4" />
							</button>
						</div>

						<div className="p-6 space-y-4">
							<p className="text-sm text-muted-foreground">
								U vraagt een rolwijziging aan voor de gebruiker: <span className="font-bold text-foreground">{selectedUserForPromo.username}</span>
							</p>

							<div className="space-y-1.5">
								<label htmlFor="promoRole" className="block text-sm font-semibold text-foreground">
									Nieuwe Rol
								</label>
								<select
									id="promoRole"
									value={promotingUserRole}
									onChange={(e) => setPromotingUserRole(e.target.value)}
									className="w-full px-4 py-2.5 border border-white/10 rounded-xl bg-background/60 focus:outline-none focus:border-primary text-sm focus:ring-1 focus:ring-primary/45 transition-all text-foreground bg-popover font-semibold"
								>
									<option value="Admin">Admin (Beheerder)</option>
									<option value="User">User (Standaard Gebruiker)</option>
								</select>
							</div>

							<div className="text-xs text-amber-500 bg-amber-500/10 border border-amber-500/20 p-3.5 rounded-xl flex items-start gap-2">
								<AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
								<span>
									<strong>Maker-Checker Verificatie:</strong> Rolwijzigingen naar Admin vereisen goedkeuring door een <strong>andere admin</strong> voordat ze actief worden.
								</span>
							</div>

							<div className="flex justify-end gap-3 pt-2">
								<button
									onClick={() => setSelectedUserForPromo(null)}
									className="bg-transparent border border-white/10 hover:bg-white/5 text-foreground px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer font-semibold"
								>
									Annuleren
								</button>
								<button
									onClick={async () => {
										const res = await createRoleRequest(selectedUserForPromo.userId, promotingUserRole);
										setSelectedUserForPromo(null);
										if (res.ok) {
											toast.success("Rolwijzigingsverzoek succesvol ingediend! Een andere admin moet dit nu goedkeuren.");
											await onRefresh();
										} else {
											toast.error(res.message || "Fout bij indienen verzoek.");
										}
									}}
									className="bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-lg shadow-primary/10 cursor-pointer"
								>
									Verzoek Indienen
								</button>
							</div>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}
