// Cloudflare Pages Function — /functions/api/sync.js
// Handles GET (read) and PUT (write) for AJ profile data in KV storage.
// KV binding: KV_BINDING (Namespace ID: d476c1cfcbfc4a32ad2f14b0d3a6d193)

const KEY = 'aj_data';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, PUT, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export async function onRequest(context) {
  const { request, env } = context;

  // Preflight
  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: CORS });
  }

  // Read
  if (request.method === 'GET') {
    const data = await env.KV_BINDING.get(KEY, 'text');
    return new Response(data ?? 'null', {
      status: 200,
      headers: { ...CORS, 'Content-Type': 'application/json' },
    });
  }

  // Write
  if (request.method === 'PUT') {
    const body = await request.text();
    if (!body) {
      return new Response(JSON.stringify({ ok: false, error: 'Empty body' }), {
        status: 400,
        headers: { ...CORS, 'Content-Type': 'application/json' },
      });
    }
    // Validate JSON before storing
    try {
      JSON.parse(body);
    } catch {
      return new Response(JSON.stringify({ ok: false, error: 'Invalid JSON' }), {
        status: 400,
        headers: { ...CORS, 'Content-Type': 'application/json' },
      });
    }
    await env.KV_BINDING.put(KEY, body);
    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { ...CORS, 'Content-Type': 'application/json' },
    });
  }

  return new Response('Method not allowed', { status: 405, headers: CORS });
}
