<script lang="ts">
	import { t } from 'svelte-i18n';
	import { page } from '$app/state';
	import { onMount } from 'svelte';
	import AuthForm from '$lib/components/ui/AuthForm.svelte';

	type Status = 'loading' | 'success' | 'error';

	let status = $state<Status>('loading');
	let errorCode = $state('');

	onMount(async () => {
		const token = page.url.searchParams.get('token');

		if (!token) {
			status = 'error';
			errorCode = 'MISSING_TOKEN';
			return;
		}

		try {
			const res = await fetch(`/api/auth/verify-email?token=${token}`);
			const data = await res.json();

			if (res.ok) {
				status = 'success';
			} else {
				status = 'error';
				errorCode = data.code ?? 'UNKNOWN';
			}
		} catch {
			status = 'error';
			errorCode = 'UNKNOWN';
		}
	});
</script>

<svelte:head>
	<title>{$t('auth.verifyEmail')} — APP_NAME</title>
</svelte:head>

<AuthForm title={$t('auth.verifyEmail')}>
	{#if status === 'loading'}
		<div class="status-content">
			<div class="spinner" aria-hidden="true"></div>
			<p>{$t('auth.verifying')}</p>
		</div>
	{:else if status === 'success'}
		<div class="status-content">
			<p class="icon" aria-hidden="true">✅</p>
			<p class="success-msg">{$t('auth.emailVerified')}</p>
			<a href="/login" class="btn btn-primary btn-full" style="margin-top: var(--space-md)">
				{$t('auth.login')}
			</a>
		</div>
	{:else}
		<div class="status-content">
			<p class="icon" aria-hidden="true">⚠️</p>
			<p class="error-msg">
				{$t(`auth.errors.${errorCode}`, { default: $t('auth.errors.UNKNOWN') })}
			</p>
			<a href="/register" class="btn btn-secondary btn-full" style="margin-top: var(--space-md)">
				{$t('auth.register')}
			</a>
		</div>
	{/if}
</AuthForm>

<style>
	.status-content {
		text-align: center;
		padding-block: var(--space-md);
	}

	.icon {
		font-size: 2.5rem;
		margin-bottom: var(--space-md);
	}

	.spinner {
		width: 32px;
		height: 32px;
		border: 3px solid var(--color-border);
		border-top-color: var(--color-primary);
		border-radius: 50%;
		animation: spin 0.8s linear infinite;
		margin: 0 auto var(--space-md);
	}

	@keyframes spin {
		to { transform: rotate(360deg); }
	}
</style>
