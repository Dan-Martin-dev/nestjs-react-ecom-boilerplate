import type { RequestHandler } from '@sveltejs/kit';

export const GET: RequestHandler = async () => {
  return new Response(JSON.stringify({ status: 'ok', timestamp: Date.now() }), {
    headers: { 'Content-Type': 'application/json' },
  });
};
