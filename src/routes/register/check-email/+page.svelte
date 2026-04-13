<script lang="ts">
	import { t } from 'svelte-i18n';
	import { page } from '$app/state';
	import AuthForm from '$lib/components/ui/AuthForm.svelte';

	const email = $derived(page.url.searchParams.get('email') ?? '');
</script>

<svelte:head>
	<title>{$t('auth.checkEmail')} — APP_NAME</title>
</svelte:head>

<AuthForm title={$t('auth.checkEmail')}>
	<div class="check-email-content">
		<p class="icon" aria-hidden="true">📬</p>
		<p class="message">{$t('auth.checkEmailMessage', { values: { email } })}</p>
		<p class="hint">{$t('auth.checkSpam')}</p>
	</div>
	<p class="form-footer">
		<a href="/">{$t('auth.backToHome')}</a>
	</p>
</AuthForm>

<style>
	.check-email-content {
		text-align: center;
		padding-block: var(--space-md);
	}

	.icon {
		font-size: 3rem;
		margin-bottom: var(--space-md);
	}

	.message {
		color: var(--color-text);
		margin-bottom: var(--space-md);
		line-height: 1.6;
	}

	.hint {
		font-size: 0.85rem;
		color: var(--color-text-muted);
		font-style: italic;
	}
</style>
