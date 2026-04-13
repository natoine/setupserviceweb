<script lang="ts">
	import { locale } from 'svelte-i18n';
	import { SUPPORTED_LOCALES, type Locale } from '$lib/i18n';

	const labels: Record<Locale, string> = {
		en: 'EN',
		fr: 'FR'
	};

	function switchLocale(next: Locale) {
		locale.set(next);
		if (typeof document !== 'undefined') {
			document.cookie = `locale=${next};path=/;max-age=31536000;SameSite=Lax`;
			document.documentElement.lang = next;
		}
	}
</script>

<div class="lang-switcher" role="group" aria-label="Language">
	{#each SUPPORTED_LOCALES as lang}
		<button
			class="lang-btn"
			class:active={$locale?.startsWith(lang)}
			onclick={() => switchLocale(lang)}
			aria-pressed={$locale?.startsWith(lang)}
		>
			{labels[lang]}
		</button>
	{/each}
</div>

<style>
	.lang-switcher {
		display: flex;
		gap: 2px;
	}

	.lang-btn {
		padding: var(--space-xs) var(--space-sm);
		background: transparent;
		border: 1px solid var(--color-border);
		border-radius: var(--radius-sm);
		color: var(--color-text-muted);
		font-family: var(--font-ui);
		font-size: 0.75rem;
		letter-spacing: 0.05em;
		cursor: pointer;
		transition: all var(--transition);
	}

	.lang-btn:hover {
		border-color: var(--color-border-glow);
		color: var(--color-text);
	}

	.lang-btn.active {
		border-color: var(--color-primary);
		color: var(--color-primary);
		background: rgba(59, 130, 246, 0.1);
	}
</style>
