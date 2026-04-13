<script lang="ts">
	import { t } from 'svelte-i18n';
	import AuthForm from '$lib/components/ui/AuthForm.svelte';

	let email = $state('');
	let submitted = $state(false);
	let loading = $state(false);

	async function handleSubmit(e: Event) {
		e.preventDefault();
		loading = true;

		try {
			await fetch('/api/auth/forgot-password', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ email })
			});
			submitted = true;
		} finally {
			loading = false;
		}
	}
</script>

<svelte:head>
	<title>{$t('auth.forgotPassword')} — APP_NAME</title>
</svelte:head>

<AuthForm title={$t('auth.forgotPassword')}>
	{#if submitted}
		<div class="submitted-content">
			<p class="icon" aria-hidden="true">📬</p>
			<p class="success-msg">{$t('auth.forgotPasswordSent')}</p>
		</div>
	{:else}
		<p class="hint">{$t('auth.forgotPasswordHint')}</p>

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

			<button type="submit" class="btn btn-primary btn-full" disabled={loading}>
				{loading ? $t('auth.sending') : $t('auth.sendResetLink')}
			</button>
		</form>
	{/if}

	<p class="form-footer">
		<a href="/login">{$t('auth.backToLogin')}</a>
	</p>
</AuthForm>

<style>
	.hint {
		font-size: 0.875rem;
		color: var(--color-text-muted);
		margin-bottom: var(--space-lg);
	}

	.submitted-content {
		text-align: center;
		padding-block: var(--space-md);
	}

	.icon {
		font-size: 3rem;
		margin-bottom: var(--space-md);
	}
</style>
