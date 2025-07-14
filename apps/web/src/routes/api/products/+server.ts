import type { RequestHandler } from '@sveltejs/kit';
import { error } from '@sveltejs/kit';

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3001';

export const GET: RequestHandler = async ({ fetch }) => {
	try {
		const response = await fetch(`${API_BASE_URL}/products`);
		
		if (!response.ok) {
			throw error(response.status, `Failed to fetch products: ${response.statusText}`);
		}

		const products = await response.json();
		
		return new Response(JSON.stringify(products), {
			headers: {
				'Content-Type': 'application/json'
			}
		});
	} catch (err) {
		console.error('API proxy error:', err);
		throw error(500, 'Failed to fetch products from API');
	}
};
