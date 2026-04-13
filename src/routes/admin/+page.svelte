<script lang="ts">
	import AuthForm from '$lib/components/ui/AuthForm.svelte';

	let email = $state('');
	let submitted = $state(false);
	let loading = $state(false);

	async function handleSubmit(e: Event) {
		e.preventDefault();
		loading = true;
		try {
			await fetch('/api/admin/request-access', {
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
	<title>Admin — APP_NAME</title>
</svelte:head>

<AuthForm title="Admin Access">
	{#if submitted}
		<p class="success-msg">
			If this email is registered as admin, a link has been sent.
		</p>
	{:else}
		<form onsubmit={handleSubmit} novalidate>
			<div class="form-group">
				<label for="email">Email</label>
				<input
					id="email"
					type="email"
					name="email"
					autocomplete="email"
					required
					bind:value={email}
					class="form-input"
					placeholder="admin@example.com"
					disabled={loading}
				/>
			</div>
			<button type="submit" class="btn btn-primary btn-full" disabled={loading}>
				{loading ? 'Sending…' : 'Send login link'}
			</button>
		</form>
	{/if}
</AuthForm>
