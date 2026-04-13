<script lang="ts">
	import '../app.css';
	import { isLoading } from 'svelte-i18n';
	import { authUser } from '$lib/stores/auth';
	import Header from '$lib/components/layout/Header.svelte';
	import Footer from '$lib/components/layout/Footer.svelte';

	let { children, data } = $props();

	// Sync server-side user into client store on every navigation
	$effect(() => {
		authUser.set(data.user ?? null);
	});
</script>

{#if $isLoading}
	<div class="loading-screen" aria-busy="true">
		<div class="loading-spinner" aria-hidden="true"></div>
	</div>
{:else}
	<Header />
	<main>
		{@render children()}
	</main>
	<Footer />
{/if}

<style>
	.loading-screen {
		min-height: 100dvh;
		display: flex;
		align-items: center;
		justify-content: center;
		background: var(--color-bg);
	}

	.loading-spinner {
		width: 32px;
		height: 32px;
		border: 3px solid var(--color-border);
		border-top-color: var(--color-primary);
		border-radius: 50%;
		animation: spin 0.8s linear infinite;
	}

	@keyframes spin {
		to { transform: rotate(360deg); }
	}

	main {
		flex: 1;
	}
</style>
