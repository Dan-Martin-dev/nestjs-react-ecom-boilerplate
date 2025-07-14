<script lang="ts">
	export let loading: boolean = false;
	export let size: 'sm' | 'md' | 'lg' = 'md';
	export let color: string = 'blue';

	$: spinnerSize = size === 'sm' ? 'w-4 h-4' : size === 'lg' ? 'w-8 h-8' : 'w-6 h-6';
	$: borderColor = `border-${color}-600`;
</script>

{#if loading}
	<div class="flex justify-center items-center p-4">
		<div class={`${spinnerSize} border-2 border-gray-200 border-t-${color}-600 rounded-full animate-spin`}></div>
	</div>
{/if}
