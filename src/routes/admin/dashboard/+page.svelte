<script lang="ts">
	import type { PageData } from './$types';
	import type { AdminUser } from './+page.server';
	import type { ActivityType } from '$lib/server/activity';

	let { data }: { data: PageData } = $props();

	// ── Tabs ────────────────────────────────────────────────────
	type Tab = 'users' | 'activity' | 'emails';
	let activeTab = $state<Tab>('users');

	function setTab(t: Tab) {
		activeTab = t;
		if (t === 'activity' && activities.length === 0) loadActivity(1);
		if (t === 'emails'   && emailDays.length === 0)  loadEmailStats();
	}

	// ── Helpers ─────────────────────────────────────────────────
	function fmt(ts: number | null): string {
		if (!ts) return '—';
		return new Date(ts * 1000).toLocaleString(undefined, {
			day: '2-digit', month: '2-digit', year: 'numeric',
			hour: '2-digit', minute: '2-digit'
		});
	}

	// ════════════════════════════════════════════════════════════
	// TAB: USERS
	// ════════════════════════════════════════════════════════════
	let deletedIds  = $state(new Set<number>());
	const users     = $derived(data.users.filter((u: AdminUser) => !deletedIds.has(u.id)));

	let feedback    = $state<Record<number, { type: 'ok' | 'err'; msg: string }>>({});
	let deletingId  = $state<number | null>(null);
	let confirmId   = $state<number | null>(null);
	let sendingResetId = $state<number | null>(null);

	function setFeedback(id: number, type: 'ok' | 'err', msg: string) {
		feedback = { ...feedback, [id]: { type, msg } };
		setTimeout(() => { const { [id]: _, ...rest } = feedback; feedback = rest; }, 3500);
	}

	async function deleteUser(id: number) {
		deletingId = id; confirmId = null;
		try {
			const res = await fetch(`/api/admin/users/${id}`, { method: 'DELETE' });
			if (res.ok) deletedIds = new Set([...deletedIds, id]);
			else setFeedback(id, 'err', 'Delete failed.');
		} finally { deletingId = null; }
	}

	async function sendReset(id: number) {
		sendingResetId = id;
		try {
			const res = await fetch(`/api/admin/users/${id}/send-reset`, { method: 'POST' });
			setFeedback(id, res.ok ? 'ok' : 'err', res.ok ? 'Link sent.' : 'Send failed.');
		} finally { sendingResetId = null; }
	}

	// ════════════════════════════════════════════════════════════
	// TAB: ACTIVITY
	// ════════════════════════════════════════════════════════════
	interface ActivityItem { id: number; type: ActivityType; meta: string; created_at: number }

	let activities     = $state<ActivityItem[]>([]);
	let activityPage   = $state(1);
	let activityPages  = $state(1);
	let activityTotal  = $state(0);
	let activityLoading = $state(false);

	async function loadActivity(page: number) {
		activityLoading = true;
		try {
			const res  = await fetch(`/api/admin/activity?page=${page}`);
			const json = await res.json();
			activities    = json.items;
			activityPage  = json.page;
			activityPages = json.pages;
			activityTotal = json.total;
		} finally { activityLoading = false; }
	}

	const ACTIVITY_LABELS: Record<ActivityType, { label: string; color: string }> = {
		account_created:           { label: 'Account created',    color: '#22c55e' },
		account_deleted:           { label: 'Account deleted',    color: '#ef4444' },
		login:                     { label: 'Login',              color: '#3b82f6' },
		email_verification_sent:   { label: 'Verification email', color: '#a855f7' },
		email_password_reset_sent: { label: 'Password reset',     color: '#f97316' },
		email_admin_access_sent:   { label: 'Admin access email', color: '#ef4444' }
	};

	function activityDetail(item: ActivityItem): string {
		try {
			const meta = JSON.parse(item.meta) as Record<string, string>;
			if (item.type === 'account_created')   return `${meta.username} (${meta.email})`;
			if (item.type === 'account_deleted')   return `${meta.username} (${meta.email}) — by ${meta.deleted_by}`;
			if (item.type === 'login')             return `${meta.username ?? ''} (${meta.email})`;
			if (item.type.startsWith('email_'))    return `→ ${meta.to}${meta.sent_by === 'admin' ? ' (admin)' : ''}`;
		} catch { /* ignore */ }
		return '—';
	}

	// ════════════════════════════════════════════════════════════
	// TAB: EMAIL STATS
	// ════════════════════════════════════════════════════════════
	interface DayStat { date: string; count: number }

	const MONTH_NAMES = ['January','February','March','April','May','June',
	                     'July','August','September','October','November','December'];

	let emailDays    = $state<DayStat[]>([]);
	let emailYear    = $state(new Date().getFullYear());
	let emailMonth   = $state(new Date().getMonth() + 1);
	let emailLoading = $state(false);

	async function loadEmailStats() {
		emailLoading = true;
		try {
			const res  = await fetch(`/api/admin/email-stats?year=${emailYear}&month=${emailMonth}`);
			const json = await res.json();
			emailDays = json.days;
		} finally { emailLoading = false; }
	}

	async function prevMonth() {
		if (emailMonth === 1) { emailMonth = 12; emailYear--; } else { emailMonth--; }
		await loadEmailStats();
	}
	async function nextMonth() {
		if (emailMonth === 12) { emailMonth = 1; emailYear++; } else { emailMonth++; }
		await loadEmailStats();
	}

	const emailTotal = $derived(emailDays.reduce((s, d) => s + d.count, 0));
	const emailMax   = $derived(Math.max(1, ...emailDays.map((d) => d.count)));
</script>

<svelte:head>
	<title>Admin Dashboard — APP_NAME</title>
</svelte:head>

<div class="container admin-page">

	<!-- Header -->
	<div class="admin-header">
		<div>
			<p class="admin-label">Admin panel</p>
			<h1 class="admin-title">APP_NAME</h1>
		</div>
	</div>

	<!-- Stats summary -->
	<div class="stats-grid">
		<div class="stat-card">
			<p class="stat-value">{data.stats.totalUsers}</p>
			<p class="stat-label">Users</p>
		</div>
		<div class="stat-card">
			<p class="stat-value">{data.stats.verifiedUsers}</p>
			<p class="stat-label">Verified</p>
		</div>
		<div class="stat-card">
			<p class="stat-value">{data.stats.totalUsers - data.stats.verifiedUsers}</p>
			<p class="stat-label">Pending</p>
		</div>
	</div>

	<!-- Tabs -->
	<div class="tabs" role="tablist">
		<button role="tab" aria-selected={activeTab === 'users'}    class:active={activeTab === 'users'}    onclick={() => setTab('users')}>   Users</button>
		<button role="tab" aria-selected={activeTab === 'activity'} class:active={activeTab === 'activity'} onclick={() => setTab('activity')}>Activity</button>
		<button role="tab" aria-selected={activeTab === 'emails'}   class:active={activeTab === 'emails'}   onclick={() => setTab('emails')}>  Emails</button>
	</div>

	<!-- ══ TAB: USERS ══════════════════════════════════════════ -->
	{#if activeTab === 'users'}
	<div class="tab-panel" role="tabpanel">
		<div class="table-wrapper">
			<table class="data-table">
				<thead><tr>
					<th>Email</th>
					<th>Username</th>
					<th>Status</th>
					<th>Created</th>
					<th>Last login</th>
					<th>Actions</th>
				</tr></thead>
				<tbody>
					{#each users as user (user.id)}
					<tr class:unverified={!user.is_verified}>
						<td class="cell-email">{user.email}</td>
						<td>{user.username ?? '—'}</td>
						<td>
							<span class="badge" class:badge-ok={user.is_verified} class:badge-warn={!user.is_verified}>
								{user.is_verified ? 'Verified' : 'Pending'}
							</span>
						</td>
						<td class="cell-date">{fmt(user.created_at)}</td>
						<td class="cell-date">{fmt(user.last_login_at)}</td>
						<td class="cell-actions">
							{#if feedback[user.id]}
								<span class="inline-feedback" class:feedback-ok={feedback[user.id].type === 'ok'} class:feedback-err={feedback[user.id].type === 'err'}>{feedback[user.id].msg}</span>
							{:else if confirmId === user.id}
								<span class="confirm-text">Confirm?</span>
								<button class="btn-action btn-danger" onclick={() => deleteUser(user.id)} disabled={deletingId === user.id}>Yes</button>
								<button class="btn-action btn-cancel" onclick={() => confirmId = null}>No</button>
							{:else}
								<button class="btn-action btn-reset" onclick={() => sendReset(user.id)} disabled={sendingResetId === user.id} title="Send password reset link">
									{sendingResetId === user.id ? '…' : '🔑 Reset'}
								</button>
								<button class="btn-action btn-danger" onclick={() => confirmId = user.id} title="Delete account">🗑 Delete</button>
							{/if}
						</td>
					</tr>
					{/each}
					{#if users.length === 0}
					<tr><td colspan="6" class="empty-row">No users yet.</td></tr>
					{/if}
				</tbody>
			</table>
		</div>
	</div>
	{/if}

	<!-- ══ TAB: ACTIVITY ═══════════════════════════════════════ -->
	{#if activeTab === 'activity'}
	<div class="tab-panel" role="tabpanel">
		{#if activityLoading}
			<p class="loading-msg">Loading…</p>
		{:else}
			<div class="table-wrapper">
				<table class="data-table">
					<thead><tr>
						<th>Date</th>
						<th>Event</th>
						<th>Detail</th>
					</tr></thead>
					<tbody>
						{#each activities as item (item.id)}
						<tr>
							<td class="cell-date">{fmt(item.created_at)}</td>
							<td>
								<span class="badge-event" style="--c:{ACTIVITY_LABELS[item.type]?.color ?? '#888'}">
									{ACTIVITY_LABELS[item.type]?.label ?? item.type}
								</span>
							</td>
							<td class="cell-detail">{activityDetail(item)}</td>
						</tr>
						{/each}
						{#if activities.length === 0}
						<tr><td colspan="3" class="empty-row">No activity yet.</td></tr>
						{/if}
					</tbody>
				</table>
			</div>

			{#if activityPages > 1}
			<div class="pagination">
				<button class="btn-page" onclick={() => loadActivity(activityPage - 1)} disabled={activityPage <= 1}>←</button>
				<span class="page-info">{activityPage} / {activityPages} <span class="page-total">({activityTotal} entries)</span></span>
				<button class="btn-page" onclick={() => loadActivity(activityPage + 1)} disabled={activityPage >= activityPages}>→</button>
			</div>
			{/if}
		{/if}
	</div>
	{/if}

	<!-- ══ TAB: EMAIL STATS ════════════════════════════════════ -->
	{#if activeTab === 'emails'}
	<div class="tab-panel" role="tabpanel">
		<div class="month-nav">
			<button class="btn-page" onclick={prevMonth} disabled={emailLoading}>←</button>
			<span class="month-label">{MONTH_NAMES[emailMonth - 1]} {emailYear}</span>
			<button class="btn-page" onclick={nextMonth} disabled={emailLoading}>→</button>
		</div>

		{#if emailLoading}
			<p class="loading-msg">Loading…</p>
		{:else}
			<div class="table-wrapper">
				<table class="data-table email-table">
					<thead><tr>
						<th>Date</th>
						<th>Sent</th>
						<th>Chart</th>
					</tr></thead>
					<tbody>
						{#each emailDays as day (day.date)}
						<tr class:day-zero={day.count === 0}>
							<td class="cell-date">{day.date}</td>
							<td class="cell-count">{day.count > 0 ? day.count : '—'}</td>
							<td class="cell-bar">
								{#if day.count > 0}
								<div class="bar" style="width:{Math.round((day.count / emailMax) * 100)}%"></div>
								{/if}
							</td>
						</tr>
						{/each}
					</tbody>
					<tfoot>
						<tr>
							<td colspan="2" class="foot-total">Total: <strong>{emailTotal}</strong> email{emailTotal > 1 ? 's' : ''}</td>
							<td></td>
						</tr>
					</tfoot>
				</table>
			</div>
		{/if}
	</div>
	{/if}

</div>

<style>
	.admin-page { padding-block: var(--space-3xl); }

	/* ── Header ──────────────────────────────────────────────── */
	.admin-header {
		margin-bottom: var(--space-xl);
		padding: var(--space-xl) var(--space-2xl);
		background: var(--color-bg-raised);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-lg);
	}
	.admin-label {
		font-size: 0.8rem; text-transform: uppercase; letter-spacing: 0.08em;
		color: var(--color-text-muted); margin-bottom: var(--space-xs);
	}
	.admin-title { font-size: clamp(1.5rem, 4vw, 2rem); font-weight: 700; color: var(--color-text); }

	/* ── Stats ───────────────────────────────────────────────── */
	.stats-grid {
		display: grid; grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
		gap: var(--space-md); margin-bottom: var(--space-xl);
	}
	.stat-card {
		background: var(--color-bg-raised); border: 1px solid var(--color-border);
		border-radius: var(--radius-lg); padding: var(--space-lg); text-align: center;
	}
	.stat-value { font-size: 2rem; color: var(--color-primary); font-weight: 700; line-height: 1; margin-bottom: var(--space-xs); }
	.stat-label { font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.06em; color: var(--color-text-muted); }

	/* ── Tabs ─────────────────────────────────────────────────── */
	.tabs {
		display: flex; gap: 2px; margin-bottom: var(--space-lg);
		border-bottom: 1px solid var(--color-border);
	}
	.tabs button {
		padding: var(--space-sm) var(--space-lg);
		background: none; border: none; border-bottom: 2px solid transparent;
		cursor: pointer; font-size: 0.875rem; font-weight: 500;
		color: var(--color-text-muted); transition: all var(--transition);
		margin-bottom: -1px;
	}
	.tabs button:hover { color: var(--color-text); }
	.tabs button.active { color: var(--color-primary); border-bottom-color: var(--color-primary); }

	/* ── Table shared ─────────────────────────────────────────── */
	.table-wrapper { overflow-x: auto; border: 1px solid var(--color-border); border-radius: var(--radius-lg); }
	.data-table { width: 100%; border-collapse: collapse; font-size: 0.875rem; }
	.data-table thead { background: var(--color-bg-raised); border-bottom: 1px solid var(--color-border); }
	.data-table th {
		padding: var(--space-sm) var(--space-md); text-align: left;
		font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.06em;
		color: var(--color-text-muted); white-space: nowrap;
	}
	.data-table td { padding: var(--space-sm) var(--space-md); border-bottom: 1px solid rgba(51,65,85,0.5); vertical-align: middle; }
	.data-table tr:last-child td { border-bottom: none; }
	.data-table tr:hover td { background: rgba(255,255,255,0.02); }
	.data-table tfoot td { border-top: 1px solid var(--color-border); background: var(--color-bg-raised); }

	.cell-email  { max-width: 220px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
	.cell-date   { white-space: nowrap; color: var(--color-text-muted); font-size: 0.8rem; }
	.cell-detail { color: var(--color-text-muted); font-size: 0.82rem; }

	.unverified { opacity: 0.6; }
	.empty-row  { text-align: center; color: var(--color-text-muted); padding: var(--space-xl); font-style: italic; }
	.loading-msg { text-align: center; color: var(--color-text-muted); padding: var(--space-2xl); font-style: italic; }

	/* ── Badges ───────────────────────────────────────────────── */
	.badge {
		display: inline-block; padding: 2px 8px; border-radius: 999px;
		font-size: 0.72rem; letter-spacing: 0.04em; text-transform: uppercase;
	}
	.badge-ok   { background: rgba(22,163,74,.2);  color: #86efac; border: 1px solid #16a34a; }
	.badge-warn { background: rgba(202,138,4,.2);  color: #fde68a; border: 1px solid #ca8a04; }

	/* ── User actions ─────────────────────────────────────────── */
	.cell-actions { white-space: nowrap; display: flex; align-items: center; gap: var(--space-xs); flex-wrap: wrap; }
	.btn-action {
		padding: 3px 10px; border-radius: var(--radius-sm);
		font-size: 0.72rem; letter-spacing: 0.04em; text-transform: uppercase;
		cursor: pointer; border: 1px solid transparent; transition: all var(--transition);
	}
	.btn-action:disabled { opacity: 0.5; cursor: not-allowed; }
	.btn-reset  { background: rgba(59,130,246,.15); border-color: var(--color-border-glow); color: var(--color-text-accent); }
	.btn-reset:hover:not(:disabled) { background: rgba(59,130,246,.3); }
	.btn-danger { background: rgba(220,38,38,.2);  border-color: var(--color-danger);      color: var(--color-danger-light); }
	.btn-danger:hover:not(:disabled) { background: rgba(220,38,38,.4); }
	.btn-cancel { background: rgba(255,255,255,.05); border-color: var(--color-border);    color: var(--color-text-muted); }
	.btn-cancel:hover { color: var(--color-text); }
	.confirm-text    { font-size: 0.75rem; color: var(--color-danger-light); }
	.inline-feedback { font-size: 0.75rem; }
	.feedback-ok  { color: #86efac; }
	.feedback-err { color: var(--color-danger-light); }

	/* ── Activity badge ───────────────────────────────────────── */
	.badge-event {
		display: inline-block; padding: 2px 8px; border-radius: 999px;
		font-size: 0.72rem; letter-spacing: 0.04em; text-transform: uppercase;
		background: color-mix(in srgb, var(--c) 20%, transparent);
		color: var(--c);
		border: 1px solid color-mix(in srgb, var(--c) 40%, transparent);
	}

	/* ── Pagination ───────────────────────────────────────────── */
	.pagination { display: flex; align-items: center; justify-content: center; gap: var(--space-lg); margin-top: var(--space-lg); }
	.page-info  { font-size: 0.85rem; color: var(--color-text-muted); }
	.page-total { font-size: 0.75rem; }
	.btn-page {
		padding: var(--space-xs) var(--space-md); background: var(--color-bg-raised);
		border: 1px solid var(--color-border); border-radius: var(--radius-sm);
		color: var(--color-text-accent); cursor: pointer; font-size: 0.9rem;
		transition: all var(--transition);
	}
	.btn-page:hover:not(:disabled) { border-color: var(--color-border-glow); }
	.btn-page:disabled { opacity: 0.4; cursor: not-allowed; }

	/* ── Month nav ────────────────────────────────────────────── */
	.month-nav { display: flex; align-items: center; justify-content: center; gap: var(--space-xl); margin-bottom: var(--space-lg); }
	.month-label { font-size: 1.1rem; font-weight: 600; color: var(--color-text); min-width: 200px; text-align: center; }

	/* ── Email stats ──────────────────────────────────────────── */
	.day-zero td { opacity: 0.4; }
	.cell-count  { color: var(--color-primary); text-align: right; padding-right: var(--space-lg); }
	.cell-bar    { width: 99%; }
	.bar         { height: 12px; background: var(--color-primary); border-radius: 999px; min-width: 4px; transition: width 300ms ease; }
	.foot-total  { padding: var(--space-sm) var(--space-md); color: var(--color-text-muted); font-size: 0.85rem; }
	.foot-total strong { color: var(--color-primary); }
</style>
