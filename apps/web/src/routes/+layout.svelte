<script lang="ts">
	import { onMount } from 'svelte';
	import '../app.css';

	let mounted = false;

	onMount(() => {
		mounted = true;
	});
</script>

<div class="min-h-screen bg-gray-50">
	<!-- Navigation Header -->
	<header class="bg-white shadow-sm border-b">
		<nav class="container mx-auto px-4 py-4">
			<div class="flex justify-between items-center">
				<a href="/" class="text-2xl font-bold text-blue-600">EcomStore</a>
				<div class="flex space-x-6">
					<a href="/" class="text-gray-600 hover:text-blue-600 transition-colors">Home</a>
					<a href="/products" class="text-gray-600 hover:text-blue-600 transition-colors">Products</a>
					<a href="/cart" class="text-gray-600 hover:text-blue-600 transition-colors">Cart</a>
					<a href="/account" class="text-gray-600 hover:text-blue-600 transition-colors">Account</a>
				</div>
			</div>
		</nav>
	</header>

	<!-- Main Content -->
	<main class="flex-1">
		<slot />
	</main>

	<!-- Footer -->
	<footer class="bg-gray-900 text-white mt-16">
		<div class="container mx-auto px-4 py-8">
			<div class="grid grid-cols-1 md:grid-cols-3 gap-8">
				<div>
					<h3 class="text-lg font-semibold mb-4">About Us</h3>
					<p class="text-gray-400">Modern ecommerce built with SvelteKit and Turborepo</p>
				</div>
				<div>
					<h3 class="text-lg font-semibold mb-4">Quick Links</h3>
					<ul class="space-y-2 text-gray-400">
						<li><a href="/products" class="hover:text-white transition-colors">Products</a></li>
						<li><a href="/support" class="hover:text-white transition-colors">Support</a></li>
						<li><a href="/contact" class="hover:text-white transition-colors">Contact</a></li>
					</ul>
				</div>
				<div>
					<h3 class="text-lg font-semibold mb-4">Contact</h3>
					<p class="text-gray-400">Email: support@ecomstore.com</p>
					<p class="text-gray-400">Phone: (555) 123-4567</p>
				</div>
			</div>
			<div class="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
				<p>&copy; 2024 EcomStore. All rights reserved.</p>
			</div>
		</div>
	</footer>
</div>

<style>
	:global(body) {
		margin: 0;
		padding: 0;
		font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
	}
	
	.container {
		max-width: 1200px;
	}
</style>
