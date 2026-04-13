<script lang="ts">
	import { t } from 'svelte-i18n';
	import { goto, invalidateAll } from '$app/navigation';
	import { authUser } from '$lib/stores/auth';
	import AuthForm from '$lib/components/ui/AuthForm.svelte';
	import PasswordInput from '$lib/components/ui/PasswordInput.svelte';

	let email = $state('');
	let password = $state('');
	let error = $state('');
	let loading = $state(false);

	async function handleSubmit(e: Event) {
		e.preventDefault();
		error = '';
		loading = true;

		try {
			const res = await fetch('/api/auth/login', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ email, password })
			});

			const data = await res.json();

			if (!res.ok) {
				error = $t(`auth.errors.${data.code}`, { default: $t('auth.errors.UNKNOWN') });
				return;
			}

			authUser.set(data.user);
			await invalidateAll();
			goto('/account');
		} finally {
			loading = false;
		}
	}
</script>

<svelte:head>
	<title>{$t('auth.login')} — APP_NAME</title>
</svelte:head>

<AuthForm title={$t('auth.loginTitle')}>
	{#if error}
		<p class="error-msg" role="alert">{error}</p>
	{/if}

	<form onsubmit={handleSubmit} novalidate>
		<div class="form-group">
			<label for="email">{$t('auth.email')}</label>
			<input
				id="email"
				type="email"
				name="email"
				autocomplete="email"
				required
				bind:value={email}
				class="form-input"
				placeholder="you@example.com"
				disabled={loading}
			/>
		</div>

		<div class="form-group">
			<label for="password">{$t('auth.password')}</label>
			<PasswordInput
				id="password"
				name="password"
				autocomplete="current-password"
				bind:value={password}
				disabled={loading}
			/>
		</div>

		<div class="forgot-link">
			<a href="/forgot-password">{$t('auth.forgotPassword')}</a>
		</div>

		<button type="submit" class="btn btn-primary btn-full" disabled={loading}>
			{loading ? $t('auth.loggingIn') : $t('auth.login')}
		</button>
	</form>

	<p class="form-footer">
		{$t('auth.noAccount')}
		<a href="/register">{$t('auth.register')}</a>
	</p>
</AuthForm>

<style>
	.forgot-link {
		text-align: right;
		margin-top: calc(-1 * var(--space-xs));
		margin-bottom: var(--space-md);
	}

	.forgot-link a {
		font-size: 0.8rem;
		color: var(--color-text-muted);
	}
	.forgot-link a:hover { color: var(--color-text-accent); }
</style>
