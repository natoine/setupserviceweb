<script lang="ts">
	import { t } from 'svelte-i18n';

	const aarriRows = [
		{ step: $t('aarri.steps.acquisition'), metric: $t('aarri.placeholder.metric'), value: 0 },
		{ step: $t('aarri.steps.activation'),  metric: $t('aarri.placeholder.metric'), value: 0 },
		{ step: $t('aarri.steps.retention'),   metric: $t('aarri.placeholder.metric'), value: 0 },
		{ step: $t('aarri.steps.referral'),    metric: $t('aarri.placeholder.metric'), value: 0 },
		{ step: $t('aarri.steps.impact'),      metric: $t('aarri.placeholder.metric'), value: 0 }
	];

	const impactMatrix = [
		{
			stage: $t('aarri.impact.utilisable.label'),
			metrics: [
				$t('aarri.impact.utilisable.m1'),
				$t('aarri.impact.utilisable.m2'),
				$t('aarri.impact.utilisable.m3')
			]
		},
		{
			stage: $t('aarri.impact.utilise.label'),
			metrics: [
				$t('aarri.impact.utilise.m1'),
				$t('aarri.impact.utilise.m2'),
				$t('aarri.impact.utilise.m3'),
				$t('aarri.impact.utilise.m4')
			]
		},
		{
			stage: $t('aarri.impact.utile.label'),
			metrics: [
				$t('aarri.impact.utile.m1'),
				$t('aarri.impact.utile.m2')
			]
		},
		{
			stage: $t('aarri.impact.impactant.label'),
			metrics: [
				$t('aarri.impact.impactant.m1'),
				$t('aarri.impact.impactant.m2'),
				$t('aarri.impact.impactant.m3')
			]
		}
	];
</script>

<svelte:head>
	<title>AARRI — APP_NAME</title>
</svelte:head>

<div class="container aarri-page">
	<h1 class="page-title">AARRI</h1>
	<p class="page-subtitle">{$t('aarri.subtitle')}</p>

	<!-- Tableau AARRI -->
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
				{#each aarriRows as row}
					<tr>
						<td class="cell-step">{row.step}</td>
						<td class="cell-metric">{row.metric}</td>
						<td class="cell-value">{row.value}</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>

	<!-- Matrice d'impact -->
	<h2 class="section-title">{$t('aarri.impact.title')}</h2>

	<div class="table-wrapper">
		<table class="aarri-table">
			<thead>
				<tr>
					<th>{$t('aarri.impact.col.stage')}</th>
					<th>{$t('aarri.impact.col.metric')}</th>
					<th class="col-value">{$t('aarri.impact.col.value')}</th>
				</tr>
			</thead>
			<tbody>
				{#each impactMatrix as group}
					{#each group.metrics as metric, i}
						<tr class:group-start={i === 0}>
							{#if i === 0}
								<td class="cell-stage" rowspan={group.metrics.length}>{group.stage}</td>
							{/if}
							<td class="cell-metric">{metric}</td>
							<td class="cell-value">0</td>
						</tr>
					{/each}
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

	.section-title {
		font-size: 1.25rem;
		font-weight: 600;
		color: var(--color-text);
		margin-block: var(--space-2xl) var(--space-lg);
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

	/* Séparateur visuel entre groupes de la matrice d'impact */
	tbody tr.group-start td {
		border-top: 2px solid var(--color-border);
	}
	tbody tr.group-start:first-child td {
		border-top: none;
	}

	td {
		padding: var(--space-md) var(--space-lg);
		font-size: 0.95rem;
		vertical-align: middle;
	}

	.cell-step {
		font-weight: 600;
		color: var(--color-text-accent);
		white-space: nowrap;
	}

	/* Cellule de niveau dans la matrice d'impact — centrée verticalement sur le groupe */
	.cell-stage {
		font-weight: 700;
		color: var(--color-text-accent);
		white-space: nowrap;
		border-right: 1px solid var(--color-border);
		background: var(--color-bg-raised);
		vertical-align: middle;
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
