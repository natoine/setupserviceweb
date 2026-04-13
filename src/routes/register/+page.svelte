<script lang="ts">
	import { t } from 'svelte-i18n';
	import { goto } from '$app/navigation';
	import AuthForm from '$lib/components/ui/AuthForm.svelte';
	import PasswordInput from '$lib/components/ui/PasswordInput.svelte';

	let email = $state('');
	let username = $state('');
	let password = $state('');
	let confirmPassword = $state('');
	let error = $state('');
	let loading = $state(false);

	async function handleSubmit(e: Event) {
		e.preventDefault();
		error = '';

		if (password !== confirmPassword) {
			error = $t('auth.errors.PASSWORD_MISMATCH');
			return;
		}

		loading = true;

		try {
			const res = await fetch('/api/auth/register', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ email, username, password })
			});

			const data = await res.json();

			if (!res.ok) {
				error = $t(`auth.errors.${data.code}`, { default: $t('auth.errors.UNKNOWN') });
				return;
			}

			goto(`/register/check-email?email=${encodeURIComponent(email)}`);
		} finally {
			loading = false;
		}
	}
</script>

<svelte:head>
	<title>{$t('auth.register')} — APP_NAME</title>
</svelte:head>

<AuthForm title={$t('auth.registerTitle')}>
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
			<label for="username">{$t('auth.username')}</label>
			<input
				id="username"
				type="text"
				name="username"
				autocomplete="username"
				required
				minlength={2}
				maxlength={24}
				bind:value={username}
				class="form-input"
				placeholder={$t('auth.usernamePlaceholder')}
				disabled={loading}
			/>
		</div>

		<div class="form-group">
			<label for="password">{$t('auth.password')}</label>
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
			{loading ? $t('auth.registering') : $t('auth.register')}
		</button>
	</form>

	<p class="form-footer">
		{$t('auth.alreadyHaveAccount')}
		<a href="/login">{$t('auth.login')}</a>
	</p>
</AuthForm>
