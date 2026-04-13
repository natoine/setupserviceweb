<script lang="ts">
	import { t } from 'svelte-i18n';
</script>

<footer class="site-footer">
	<div class="container footer-inner">
		<p class="tagline">{$t('footer.tagline')}</p>
		<nav class="footer-nav" aria-label="Footer navigation">
			<a href="/changelog">{$t('footer.links.changelog')}</a>
		</nav>
	</div>
</footer>

<style>
	.site-footer {
		border-top: 1px solid var(--color-border);
		background: var(--color-bg-raised);
		padding-block: var(--space-xl);
		margin-top: auto;
	}

	.footer-inner {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: var(--space-md);
		text-align: center;
	}

	@media (min-width: 640px) {
		.footer-inner {
			flex-direction: row;
			justify-content: space-between;
			text-align: left;
		}
	}

	.tagline {
		font-size: 0.875rem;
		color: var(--color-text-muted);
	}

	.footer-nav {
		display: flex;
		gap: var(--space-lg);
	}

	.footer-nav a {
		font-size: 0.875rem;
		color: var(--color-text-muted);
	}
	.footer-nav a:hover { color: var(--color-text); }
</style>
