<script lang="ts">
	import { t } from 'svelte-i18n';
	import { page } from '$app/state';
	import AuthForm from '$lib/components/ui/AuthForm.svelte';
	import PasswordInput from '$lib/components/ui/PasswordInput.svelte';

	let password = $state('');
	let confirmPassword = $state('');
	let error = $state('');
	let success = $state(false);
	let loading = $state(false);

	const token = $derived(page.url.searchParams.get('token') ?? '');

	async function handleSubmit(e: Event) {
		e.preventDefault();
		error = '';

		if (password !== confirmPassword) {
			error = $t('auth.errors.PASSWORD_MISMATCH');
			return;
		}

		loading = true;

		try {
			const res = await fetch('/api/auth/reset-password', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ token, password })
			});

			const data = await res.json();

			if (!res.ok) {
				error = $t(`auth.errors.${data.code}`, { default: $t('auth.errors.UNKNOWN') });
				return;
			}

			success = true;
		} finally {
			loading = false;
		}
	}
</script>

<svelte:head>
	<title>{$t('auth.resetPassword')} — APP_NAME</title>
</svelte:head>

<AuthForm title={$t('auth.resetPassword')}>
	{#if success}
		<div class="success-content">
			<p class="icon" aria-hidden="true">🔓</p>
			<p class="success-msg">{$t('auth.passwordResetSuccess')}</p>
			<a href="/login" class="btn btn-primary btn-full" style="margin-top: var(--space-md)">
				{$t('auth.login')}
			</a>
		</div>
	{:else}
		{#if !token}
			<p class="error-msg" role="alert">{$t('auth.errors.MISSING_TOKEN')}</p>
		{:else}
			{#if error}
				<p class="error-msg" role="alert">{error}</p>
			{/if}

			<form onsubmit={handleSubmit} novalidate>
				<div class="form-group">
					<label for="password">{$t('auth.newPassword')}</label>
					<PasswordInput
						id="password"
						name="password"
						autocomplete="new-password"
						minlength={8}
						bind:value={password}
						disabled={loading}
					/>
				</div>

				<div class="form-group">
					<label for="confirm-password">{$t('auth.confirmPassword')}</label>
					<PasswordInput
						id="confirm-password"
						name="confirm-password"
						autocomplete="new-password"
						minlength={8}
						bind:value={confirmPassword}
						disabled={loading}
					/>
				</div>

				<button type="submit" class="btn btn-primary btn-full" disabled={loading}>
					{loading ? $t('auth.saving') : $t('auth.resetPassword')}
				</button>
			</form>
		{/if}
	{/if}
</AuthForm>

<style>
	.success-content {
		text-align: center;
		padding-block: var(--space-md);
	}

	.icon {
		font-size: 3rem;
		margin-bottom: var(--space-md);
	}
</style>
