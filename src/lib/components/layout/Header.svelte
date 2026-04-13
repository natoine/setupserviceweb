<script lang="ts">
	import { t } from 'svelte-i18n';
	import { goto, invalidateAll } from '$app/navigation';
	import { page } from '$app/state';


	const user = $derived(page.data.user ?? null);

	async function handleLogout() {
		await fetch('/api/auth/logout', { method: 'POST' });
		await invalidateAll();
		goto('/');
	}
</script>

<header class="site-header">
	<div class="container header-inner">
		<a href="/" class="logo" aria-label="APP_NAME — Home">APP_NAME</a>

		<nav class="nav" aria-label="Main navigation">
			<a href="/changelog" class="nav-link">{$t('nav.changelog')}</a>
		</nav>

		<div class="header-auth">
			{#if user}
				<a href="/account" class="username">{user.username}</a>
				<button class="btn-ghost" onclick={handleLogout}>{$t('auth.logout')}</button>
			{:else}
				<a href="/login" class="btn-ghost">{$t('auth.login')}</a>
				<a href="/register" class="btn btn-primary btn-xs">{$t('auth.register')}</a>
			{/if}
		</div>
	</div>
</header>

<style>
	.site-header {
		position: sticky;
		top: 0;
		z-index: 100;
		background: rgba(15, 23, 42, 0.95);
		border-bottom: 1px solid var(--color-border);
		backdrop-filter: blur(8px);
	}

	.header-inner {
		display: flex;
		align-items: center;
		gap: var(--space-md);
		padding-block: var(--space-sm);
	}

	.logo {
		font-family: var(--font-display);
		font-size: 1.1rem;
		font-weight: 700;
		color: var(--color-primary);
		text-decoration: none;
		flex-shrink: 0;
	}
	.logo:hover { color: var(--color-primary-light); }

	.nav {
		display: flex;
		align-items: center;
		gap: var(--space-md);
		margin-left: auto;
	}

	.nav-link {
		font-family: var(--font-ui);
		font-size: 0.875rem;
		color: var(--color-text-muted);
		transition: color var(--transition);
	}
	.nav-link:hover { color: var(--color-text); }

	.header-auth {
		display: flex;
		align-items: center;
		gap: var(--space-sm);
	}

	.username {
		font-size: 0.875rem;
		color: var(--color-text-accent);
		text-decoration: none;
		transition: color var(--transition);
	}
	.username:hover { color: var(--color-primary-light); }

	.btn-ghost {
		background: none;
		border: none;
		cursor: pointer;
		font-family: var(--font-ui);
		font-size: 0.875rem;
		color: var(--color-text-muted);
		transition: color var(--transition);
		text-decoration: none;
		padding: var(--space-xs) var(--space-sm);
	}
	.btn-ghost:hover { color: var(--color-text); }

	.btn-xs {
		padding: var(--space-xs) var(--space-md);
		font-size: 0.8rem;
	}
</style>
