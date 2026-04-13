<script lang="ts">
	import { t } from 'svelte-i18n';
	import { goto, invalidateAll } from '$app/navigation';
	import { authUser } from '$lib/stores/auth';
	import PasswordInput from '$lib/components/ui/PasswordInput.svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	// ── Section open state ─────────────────────────────────────
	type Section = 'username' | 'password' | 'delete' | null;
	let openSection = $state<Section>(null);

	function toggle(section: Section) {
		openSection = openSection === section ? null : section;
	}

	// ── Change username ────────────────────────────────────────
	// svelte-ignore state_referenced_locally
	let newUsername = $state(data.user.username);
	let usernameError = $state('');
	let usernameSuccess = $state('');
	let usernameLoading = $state(false);

	async function handleUsernameSubmit(e: Event) {
		e.preventDefault();
		usernameError = '';
		usernameSuccess = '';
		usernameLoading = true;
		try {
			const res = await fetch('/api/account/username', {
				method: 'PATCH',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ username: newUsername })
			});
			const d = await res.json();
			if (!res.ok) {
				usernameError = $t(`auth.errors.${d.code}`, { default: $t('auth.errors.UNKNOWN') });
				return;
			}
			authUser.update((u) => (u ? { ...u, username: d.username } : u));
			await invalidateAll();
			usernameSuccess = $t('account.usernameUpdated');
			openSection = null;
		} finally {
			usernameLoading = false;
		}
	}

	// ── Change password ────────────────────────────────────────
	let currentPassword = $state('');
	let newPassword = $state('');
	let confirmNewPassword = $state('');
	let passwordError = $state('');
	let passwordSuccess = $state('');
	let passwordLoading = $state(false);

	async function handlePasswordSubmit(e: Event) {
		e.preventDefault();
		passwordError = '';
		passwordSuccess = '';
		if (newPassword !== confirmNewPassword) {
			passwordError = $t('auth.errors.PASSWORD_MISMATCH');
			return;
		}
		passwordLoading = true;
		try {
			const res = await fetch('/api/account/password', {
				method: 'PATCH',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ currentPassword, newPassword })
			});
			const d = await res.json();
			if (!res.ok) {
				passwordError = $t(`auth.errors.${d.code}`, { default: $t('auth.errors.UNKNOWN') });
				return;
			}
			currentPassword = '';
			newPassword = '';
			confirmNewPassword = '';
			passwordSuccess = $t('account.passwordUpdated');
			openSection = null;
		} finally {
			passwordLoading = false;
		}
	}

	// ── Delete account ─────────────────────────────────────────
	let deletePassword = $state('');
	let deleteError = $state('');
	let deleteLoading = $state(false);

	async function handleDeleteSubmit(e: Event) {
		e.preventDefault();
		deleteError = '';
		deleteLoading = true;
		try {
			const res = await fetch('/api/account/delete', {
				method: 'DELETE',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ password: deletePassword })
			});
			const d = await res.json();
			if (!res.ok) {
				deleteError = $t(`auth.errors.${d.code}`, { default: $t('auth.errors.UNKNOWN') });
				return;
			}
			authUser.set(null);
			goto('/');
		} finally {
			deleteLoading = false;
		}
	}
</script>

<svelte:head>
	<title>{data.user.username} — {$t('account.title')} — APP_NAME</title>
</svelte:head>

<div class="container account-page">

	<!-- Welcome banner -->
	<div class="welcome-banner">
		<div>
			<p class="welcome-label">{$t('account.welcome')}</p>
			<h1 class="welcome-username">{data.user.username}</h1>
			<p class="welcome-email">{data.user.email}</p>
		</div>
	</div>

	<!-- Settings sections -->
	<div class="settings-list">

		<!-- Change username -->
		<div class="settings-section" class:open={openSection === 'username'}>
			<button
				class="section-header"
				onclick={() => toggle('username')}
				aria-expanded={openSection === 'username'}
			>
				<span class="section-title">{$t('account.changeUsername')}</span>
				<span class="section-chevron" aria-hidden="true">{openSection === 'username' ? '▲' : '▼'}</span>
			</button>

			{#if openSection === 'username'}
				<div class="section-body">
					{#if usernameError}<p class="msg msg-error" role="alert">{usernameError}</p>{/if}
					{#if usernameSuccess}<p class="msg msg-success">{usernameSuccess}</p>{/if}
					<form onsubmit={handleUsernameSubmit} novalidate>
						<div class="form-group">
							<label for="new-username">{$t('auth.username')}</label>
							<input
								id="new-username"
								type="text"
								class="form-input"
								minlength={2}
								maxlength={24}
								required
								bind:value={newUsername}
								disabled={usernameLoading}
							/>
						</div>
						<div class="form-actions">
							<button type="submit" class="btn btn-primary" disabled={usernameLoading}>
								{usernameLoading ? $t('account.saving') : $t('account.save')}
							</button>
							<button type="button" class="btn btn-secondary" onclick={() => { openSection = null; newUsername = data.user.username; }}>
								{$t('account.cancel')}
							</button>
						</div>
					</form>
				</div>
			{/if}
		</div>

		<!-- Change password -->
		<div class="settings-section" class:open={openSection === 'password'}>
			<button
				class="section-header"
				onclick={() => toggle('password')}
				aria-expanded={openSection === 'password'}
			>
				<span class="section-title">{$t('account.changePassword')}</span>
				<span class="section-chevron" aria-hidden="true">{openSection === 'password' ? '▲' : '▼'}</span>
			</button>

			{#if openSection === 'password'}
				<div class="section-body">
					{#if passwordError}<p class="msg msg-error" role="alert">{passwordError}</p>{/if}
					{#if passwordSuccess}<p class="msg msg-success">{passwordSuccess}</p>{/if}
					<form onsubmit={handlePasswordSubmit} novalidate>
						<div class="form-group">
							<label for="current-password">{$t('account.currentPassword')}</label>
							<PasswordInput
								id="current-password"
								name="currentPassword"
								autocomplete="current-password"
								bind:value={currentPassword}
								disabled={passwordLoading}
							/>
						</div>
						<div class="form-group">
							<label for="new-password">{$t('auth.newPassword')}</label>
							<PasswordInput
								id="new-password"
								name="newPassword"
								autocomplete="new-password"
								minlength={8}
								bind:value={newPassword}
								disabled={passwordLoading}
							/>
						</div>
						<div class="form-group">
							<label for="confirm-new-password">{$t('auth.confirmPassword')}</label>
							<PasswordInput
								id="confirm-new-password"
								name="confirmNewPassword"
								autocomplete="new-password"
								minlength={8}
								bind:value={confirmNewPassword}
								disabled={passwordLoading}
							/>
						</div>
						<div class="form-actions">
							<button type="submit" class="btn btn-primary" disabled={passwordLoading}>
								{passwordLoading ? $t('account.saving') : $t('account.save')}
							</button>
							<button type="button" class="btn btn-secondary" onclick={() => { openSection = null; currentPassword = ''; newPassword = ''; confirmNewPassword = ''; }}>
								{$t('account.cancel')}
							</button>
						</div>
					</form>
				</div>
			{/if}
		</div>

		<!-- Delete account -->
		<div class="settings-section settings-section--danger" class:open={openSection === 'delete'}>
			<button
				class="section-header"
				onclick={() => toggle('delete')}
				aria-expanded={openSection === 'delete'}
			>
				<span class="section-title section-title--danger">{$t('account.deleteAccount')}</span>
				<span class="section-chevron" aria-hidden="true">{openSection === 'delete' ? '▲' : '▼'}</span>
			</button>

			{#if openSection === 'delete'}
				<div class="section-body">
					<p class="delete-warning">{$t('account.deleteWarning')}</p>
					{#if deleteError}<p class="msg msg-error" role="alert">{deleteError}</p>{/if}
					<form onsubmit={handleDeleteSubmit} novalidate>
						<div class="form-group">
							<label for="delete-password">{$t('account.confirmWithPassword')}</label>
							<PasswordInput
								id="delete-password"
								name="deletePassword"
								autocomplete="current-password"
								bind:value={deletePassword}
								disabled={deleteLoading}
							/>
						</div>
						<div class="form-actions">
							<button type="submit" class="btn btn-danger" disabled={deleteLoading}>
								{deleteLoading ? $t('account.deleting') : $t('account.deleteConfirm')}
							</button>
							<button type="button" class="btn btn-secondary" onclick={() => { openSection = null; deletePassword = ''; }}>
								{$t('account.cancel')}
							</button>
						</div>
					</form>
				</div>
			{/if}
		</div>

	</div>
</div>

<style>
	.account-page {
		padding-block: var(--space-3xl);
		max-width: 680px;
	}

	.welcome-banner {
		background: var(--color-bg-raised);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-lg);
		padding: var(--space-xl) var(--space-2xl);
		margin-bottom: var(--space-2xl);
	}

	.welcome-label {
		font-size: 0.8rem;
		text-transform: uppercase;
		letter-spacing: 0.08em;
		color: var(--color-text-muted);
		margin-bottom: var(--space-xs);
	}

	.welcome-username {
		font-size: clamp(1.5rem, 4vw, 2rem);
		font-weight: 700;
		color: var(--color-text);
		margin-bottom: var(--space-xs);
	}

	.welcome-email {
		font-size: 0.875rem;
		color: var(--color-text-muted);
	}

	.settings-list {
		display: flex;
		flex-direction: column;
		gap: var(--space-sm);
	}

	.settings-section {
		background: var(--color-bg-raised);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-lg);
		overflow: hidden;
		transition: border-color var(--transition);
	}

	.settings-section.open { border-color: var(--color-border-glow); }
	.settings-section--danger.open { border-color: var(--color-danger); }

	.section-header {
		width: 100%;
		display: flex;
		align-items: center;
		gap: var(--space-md);
		padding: var(--space-md) var(--space-lg);
		background: none;
		border: none;
		cursor: pointer;
		text-align: left;
		transition: background-color var(--transition);
	}

	.section-header:hover { background: rgba(255, 255, 255, 0.03); }

	.section-title {
		flex: 1;
		font-family: var(--font-ui);
		font-size: 0.9rem;
		font-weight: 500;
		color: var(--color-text);
	}

	.section-title--danger { color: var(--color-danger-light); }

	.section-chevron {
		font-size: 0.65rem;
		color: var(--color-text-muted);
	}

	.section-body {
		padding: var(--space-lg) var(--space-xl);
		border-top: 1px solid var(--color-border);
	}

	.form-group {
		display: flex;
		flex-direction: column;
		gap: var(--space-xs);
		margin-bottom: var(--space-md);
	}

	label {
		font-size: 0.8rem;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		color: var(--color-text-muted);
	}

	.form-input {
		width: 100%;
		padding: var(--space-sm) var(--space-md);
		background: var(--color-bg);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-sm);
		color: var(--color-text);
		font-family: var(--font-body);
		font-size: 1rem;
		outline: none;
		transition: border-color var(--transition), box-shadow var(--transition);
	}

	.form-input:focus {
		border-color: var(--color-border-glow);
		box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2);
	}

	.form-actions {
		display: flex;
		gap: var(--space-sm);
		margin-top: var(--space-md);
		flex-wrap: wrap;
	}

	.msg {
		padding: var(--space-sm) var(--space-md);
		border-radius: var(--radius-sm);
		font-size: 0.875rem;
		margin-bottom: var(--space-md);
	}

	.msg-error {
		background: rgba(220, 38, 38, 0.1);
		border: 1px solid var(--color-danger);
		color: var(--color-danger-light);
	}

	.msg-success {
		background: rgba(22, 163, 74, 0.1);
		border: 1px solid var(--color-success);
		color: #86efac;
	}

	.delete-warning {
		font-size: 0.875rem;
		color: var(--color-danger-light);
		margin-bottom: var(--space-md);
		line-height: 1.5;
	}
</style>
