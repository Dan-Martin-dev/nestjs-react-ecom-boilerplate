<script lang="ts">
	import type { ButtonProps } from '../index';

	export let variant: ButtonProps['variant'] = 'primary';
	export let size: ButtonProps['size'] = 'md';
	export let disabled: ButtonProps['disabled'] = false;
	export let loading: ButtonProps['loading'] = false;
	export let type: 'button' | 'submit' | 'reset' = 'button';

	$: classes = [
		'px-4 py-2 rounded font-medium transition-colors duration-200 focus:outline-none focus:ring-2',
		variant === 'primary' ? 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500' : '',
		variant === 'secondary' ? 'bg-gray-200 text-gray-900 hover:bg-gray-300 focus:ring-gray-500' : '',
		variant === 'danger' ? 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500' : '',
		size === 'sm' ? 'px-3 py-1 text-sm' : '',
		size === 'md' ? 'px-4 py-2' : '',
		size === 'lg' ? 'px-6 py-3 text-lg' : '',
		disabled || loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer',
	].filter(Boolean).join(' ');
</script>

<button
	class={classes}
	{type}
	{disabled}
	on:click
	on:blur
	on:focus
	on:keydown
>
	{#if loading}
		<div class="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
	{/if}
	<slot />
</button>
