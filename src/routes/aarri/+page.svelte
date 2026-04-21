<script lang="ts">
	import { t } from 'svelte-i18n';

	const rows = [
		{ step: $t('aarri.steps.acquisition'), metric: $t('aarri.placeholder.metric'), value: 0 },
		{ step: $t('aarri.steps.activation'),  metric: $t('aarri.placeholder.metric'), value: 0 },
		{ step: $t('aarri.steps.retention'),   metric: $t('aarri.placeholder.metric'), value: 0 },
		{ step: $t('aarri.steps.referral'),    metric: $t('aarri.placeholder.metric'), value: 0 },
		{ step: $t('aarri.steps.impact'),      metric: $t('aarri.placeholder.metric'), value: 0 }
	];
</script>

<svelte:head>
	<title>AARRI — APP_NAME</title>
</svelte:head>

<div class="container aarri-page">
	<h1 class="page-title">AARRI</h1>
	<p class="page-subtitle">{$t('aarri.subtitle')}</p>

	<div class="table-wrapper">
		<table class="aarri-table">
			<thead>
				<tr>
					<th>{$t('aarri.col.step')}</th>
					<th>{$t('aarri.col.metric')}</th>
					<th class="col-value">{$t('aarri.col.value')}</th>
				</tr>
			</thead>
			<tbody>
				{#each rows as row}
					<tr>
						<td class="cell-step">{row.step}</td>
						<td class="cell-metric">{row.metric}</td>
						<td class="cell-value">{row.value}</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>
</div>

<style>
	.aarri-page {
		padding-block: var(--space-3xl);
		max-width: 860px;
	}

	.page-title {
		font-size: clamp(1.75rem, 4vw, 2.5rem);
		font-weight: 700;
		color: var(--color-text);
		margin-bottom: var(--space-sm);
	}

	.page-subtitle {
		color: var(--color-text-muted);
		font-size: 0.95rem;
		margin-bottom: var(--space-2xl);
	}

	.table-wrapper {
		overflow-x: auto;
		border: 1px solid var(--color-border);
		border-radius: var(--radius-lg);
	}

	.aarri-table {
		width: 100%;
		border-collapse: collapse;
	}

	thead tr {
		background: var(--color-bg-raised);
		border-bottom: 1px solid var(--color-border);
	}

	th {
		padding: var(--space-md) var(--space-lg);
		text-align: left;
		font-size: 0.8rem;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.06em;
		color: var(--color-text-muted);
	}

	th.col-value,
	td.cell-value {
		text-align: right;
		white-space: nowrap;
	}

	tbody tr {
		border-bottom: 1px solid var(--color-border);
		transition: background-color var(--transition);
	}

	tbody tr:last-child { border-bottom: none; }
	tbody tr:hover { background: var(--color-bg-raised); }

	td {
		padding: var(--space-md) var(--space-lg);
		font-size: 0.95rem;
	}

	.cell-step {
		font-weight: 600;
		color: var(--color-text-accent);
		white-space: nowrap;
	}

	.cell-metric {
		color: var(--color-text-muted);
		font-style: italic;
	}

	.cell-value {
		font-variant-numeric: tabular-nums;
		font-weight: 700;
		font-size: 1.1rem;
		color: var(--color-text);
	}
</style>
