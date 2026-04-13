<!-- Shared layout shell for all auth pages -->
<script lang="ts">
	let { title, children }: { title: string; children: import('svelte').Snippet } = $props();
</script>

<div class="auth-page">
	<div class="auth-card">
		<a href="/" class="auth-logo" aria-label="Home">APP_NAME</a>
		<h1 class="auth-title">{title}</h1>
		{@render children()}
	</div>
</div>

<style>
	.auth-page {
		min-height: 100dvh;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: var(--space-md);
		background: var(--color-bg);
	}

	.auth-card {
		width: 100%;
		max-width: 420px;
		background: var(--color-bg-raised);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-lg);
		padding: var(--space-2xl);
		box-shadow: 0 8px 40px rgba(0, 0, 0, 0.4);
	}

	.auth-logo {
		display: block;
		font-family: var(--font-display);
		font-size: 1.1rem;
		font-weight: 700;
		color: var(--color-primary);
		text-decoration: none;
		margin-bottom: var(--space-xl);
	}
	.auth-logo:hover { color: var(--color-primary-light); }

	.auth-title {
		font-size: 1.4rem;
		margin-bottom: var(--space-xl);
		color: var(--color-text);
	}

	/* Form styles shared by children via :global */
	:global(.auth-card .form-group) {
		display: flex;
		flex-direction: column;
		gap: var(--space-xs);
		margin-bottom: var(--space-md);
	}

	:global(.auth-card label) {
		font-size: 0.8rem;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		color: var(--color-text-muted);
		font-family: var(--font-ui);
	}

	:global(.auth-card .form-input) {
		width: 100%;
		padding: var(--space-sm) var(--space-md);
		background: var(--color-bg);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-sm);
		color: var(--color-text);
		font-family: var(--font-body);
		font-size: 1rem;
		transition: border-color var(--transition), box-shadow var(--transition);
		outline: none;
	}

	:global(.auth-card .form-input:focus) {
		border-color: var(--color-border-glow);
		box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2);
	}

	:global(.auth-card .error-msg) {
		background: rgba(220, 38, 38, 0.1);
		border: 1px solid var(--color-danger);
		border-radius: var(--radius-sm);
		padding: var(--space-sm) var(--space-md);
		font-size: 0.875rem;
		color: var(--color-danger-light);
		margin-bottom: var(--space-md);
	}

	:global(.auth-card .success-msg) {
		background: rgba(22, 163, 74, 0.1);
		border: 1px solid var(--color-success);
		border-radius: var(--radius-sm);
		padding: var(--space-sm) var(--space-md);
		font-size: 0.875rem;
		color: #86efac;
		margin-bottom: var(--space-md);
	}

	:global(.auth-card .form-footer) {
		margin-top: var(--space-lg);
		text-align: center;
		font-size: 0.875rem;
		color: var(--color-text-muted);
	}

	:global(.auth-card .form-footer a) {
		color: var(--color-text-accent);
	}

	:global(.auth-card .btn-full) {
		width: 100%;
		margin-top: var(--space-sm);
	}
</style>
