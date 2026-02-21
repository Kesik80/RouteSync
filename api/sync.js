// api/sync.js — Vercel serverless function
// In-memory live route sharing (KV store recommended for production)
// For production: replace with Vercel KV, Redis, or Supabase

const store = new Map(); // Note: resets on cold start — use KV in production

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  const { id } = req.query;
  if (!id) return res.status(400).json({ error: 'Missing id' });

  // GET — fetch live data
  if (req.method === 'GET') {
    const data = store.get(id);
    if (!data) return res.status(404).json({ error: 'Session not found' });
    // Check TTL (4 hours)
    if (Date.now() - data.createdAt > 4 * 3600 * 1000) {
      store.delete(id);
      return res.status(404).json({ error: 'Session expired' });
    }
    return res.status(200).json(data);
  }

  // POST — create/update live session
  if (req.method === 'POST') {
    const body = req.body;
    if (!body) return res.status(400).json({ error: 'Missing body' });
    store.set(id, { ...body, updatedAt: Date.now(), createdAt: body.createdAt || Date.now() });
    return res.status(200).json({ ok: true, id });
  }

  // DELETE — end session
  if (req.method === 'DELETE') {
    store.delete(id);
    return res.status(200).json({ ok: true });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
