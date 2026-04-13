<script lang="ts">
	import { t } from 'svelte-i18n';
</script>

<svelte:head>
	<title>{$t('meta.title')}</title>
	<meta name="description" content={$t('meta.description')} />
</svelte:head>

<section class="hero">
	<div class="container">
		<h1 class="hero-title">APP_NAME</h1>
		<p class="hero-subtitle">{$t('meta.description')}</p>
		<div class="hero-actions">
			<a href="/register" class="btn btn-primary">{$t('auth.register')}</a>
			<a href="/login" class="btn btn-secondary">{$t('auth.login')}</a>
		</div>
	</div>
</section>

<style>
	.hero {
		min-height: calc(100dvh - 120px);
		display: flex;
		align-items: center;
		padding-block: var(--space-3xl);
	}

	.hero-title {
		font-size: clamp(2.5rem, 8vw, 5rem);
		font-weight: 700;
		color: var(--color-text);
		margin-bottom: var(--space-md);
	}

	.hero-subtitle {
		font-size: clamp(1rem, 2.5vw, 1.25rem);
		color: var(--color-text-muted);
		max-width: 520px;
		margin-bottom: var(--space-xl);
	}

	.hero-actions {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-md);
	}
</style>
