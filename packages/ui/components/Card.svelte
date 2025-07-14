<script lang="ts">
	export let padding: string = 'p-6';
	export let shadow: string = 'shadow-md';
	export let rounded: string = 'rounded-lg';
</script>

<div class={`bg-white ${padding} ${shadow} ${rounded}`}>
	<slot />
</div>
