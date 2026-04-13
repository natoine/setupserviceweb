<script lang="ts">
	let {
		value = $bindable(''),
		id,
		name = 'password',
		autocomplete = 'current-password',
		minlength = 8,
		required = true,
		placeholder = '••••••••',
		disabled = false
	}: {
		value?: string;
		id?: string;
		name?: string;
		autocomplete?: string;
		minlength?: number;
		required?: boolean;
		placeholder?: string;
		disabled?: boolean;
	} = $props();

	let showPassword = $state(false);
</script>

<div class="password-wrapper">
	<input
		{id}
		{name}
		type={showPassword ? 'text' : 'password'}
		bind:value
		{autocomplete}
		{minlength}
		{required}
		{placeholder}
		{disabled}
		class="form-input"
	/>
	<button
		type="button"
		class="toggle-btn"
		onclick={() => (showPassword = !showPassword)}
		aria-label={showPassword ? 'Hide password' : 'Show password'}
		tabindex="-1"
	>
		{showPassword ? '🙈' : '👁'}
	</button>
</div>

<style>
	.password-wrapper {
		position: relative;
		display: flex;
		align-items: center;
	}

	.password-wrapper :global(.form-input) {
		padding-right: 2.75rem;
		width: 100%;
	}

	.toggle-btn {
		position: absolute;
		right: var(--space-sm);
		background: none;
		border: none;
		cursor: pointer;
		font-size: 1rem;
		padding: var(--space-xs);
		color: var(--color-text-muted);
		transition: color var(--transition);
		line-height: 1;
	}
	.toggle-btn:hover { color: var(--color-text-accent); }
</style>
