<script lang="ts">
	import { t } from 'svelte-i18n';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	const sections = data.content
		.split(/\n## /)
		.filter(Boolean)
		.map((block) => {
			const [heading, ...body] = block.split('\n');
			return {
				heading: heading.replace(/^## /, ''),
				body: body.join('\n').trim()
			};
		});
</script>

<svelte:head>
	<title>{$t('nav.changelog')} — APP_NAME</title>
</svelte:head>

<div class="container changelog-page">
	<h1 class="page-title">{$t('nav.changelog')}</h1>

	<div class="changelog-content">
		{#each sections as section}
			<section class="changelog-section">
				<h2 class="version-heading">{section.heading}</h2>
				<pre class="version-body">{section.body}</pre>
			</section>
		{/each}
	</div>
</div>

<style>
	.changelog-page {
		padding-block: var(--space-3xl);
		max-width: 800px;
	}

	.page-title {
		margin-bottom: var(--space-2xl);
		font-size: clamp(1.75rem, 4vw, 2.5rem);
		font-weight: 700;
		color: var(--color-text);
	}

	.changelog-section {
		margin-bottom: var(--space-2xl);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-lg);
		overflow: hidden;
	}

	.version-heading {
		background: var(--color-bg-raised);
		border-bottom: 1px solid var(--color-border);
		padding: var(--space-md) var(--space-lg);
		font-size: 1rem;
		font-weight: 600;
		color: var(--color-text);
	}

	.version-body {
		padding: var(--space-lg);
		font-family: var(--font-body);
		font-size: 0.9rem;
		color: var(--color-text-muted);
		white-space: pre-wrap;
		line-height: 1.7;
	}
</style>
