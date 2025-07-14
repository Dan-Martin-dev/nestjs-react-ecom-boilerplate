<script lang="ts">
	import { onMount } from 'svelte';
	import type { Product } from '@repo/shared';
	import { formatPrice } from '@repo/shared';
	import Button from '@repo/ui/components/Button.svelte';
	import Card from '@repo/ui/components/Card.svelte';
	import LoadingSpinner from '@repo/ui/components/LoadingSpinner.svelte';

	let products: Product[] = [];
	let loading = true;

	onMount(async () => {
		try {
			// Fetch products from your API
			const response = await fetch('/api/products');
			if (response.ok) {
				products = await response.json();
			}
		} catch (error) {
			console.error('Failed to fetch products:', error);
		} finally {
			loading = false;
		}
	});

	function addToCart(productId: string) {
		console.log('Adding product to cart:', productId);
		// TODO: Implement add to cart functionality
	}
</script>

<svelte:head>
	<title>Ecommerce Store</title>
	<meta name="description" content="Modern ecommerce built with SvelteKit and Turborepo" />
</svelte:head>

<main class="container mx-auto px-4 py-8">
	<h1 class="text-4xl font-bold text-center mb-8">Welcome to Our Store</h1>

	<LoadingSpinner {loading} />
	
	{#if !loading && products.length > 0}
		<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
			{#each products as product}
				<Card>
					<h3 class="text-xl font-semibold mb-2">{product.name}</h3>
					<p class="text-gray-600 mb-4">{product.description || 'No description available'}</p>
					<div class="flex justify-between items-center">
						<span class="text-2xl font-bold text-blue-600">{formatPrice(product.price)}</span>
						<Button variant="primary" on:click={() => addToCart(product.id)}>
							Add to Cart
						</Button>
					</div>
				</Card>
			{/each}
		</div>
	{:else if !loading}
		<div class="text-center py-12">
			<p class="text-xl text-gray-600 mb-4">No products available at the moment.</p>
			<Button variant="primary" on:click={() => window.location.reload()}>
				Refresh
			</Button>
		</div>
	{/if}
</main>

<style>
	.container {
		max-width: 1200px;
	}
</style>
