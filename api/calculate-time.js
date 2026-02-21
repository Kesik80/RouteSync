// api/calculate-time.js — Vercel serverless function
// Calculates real driving time via Google Maps Distance Matrix API

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { originLat, originLng, destLat, destLng, departureTime } = req.body || {};

  if (!originLat || !originLng || !destLat || !destLng) {
    return res.status(400).json({ error: 'Missing coordinates' });
  }

  const key = process.env.GOOGLE_MAPS_API_KEY;
  if (!key) return res.status(500).json({ error: 'API key not configured' });

  const dep = departureTime === 'now'
    ? Math.floor(Date.now() / 1000)
    : parseInt(departureTime) || Math.floor(Date.now() / 1000);

  const url = `https://maps.googleapis.com/maps/api/distancematrix/json` +
    `?origins=${originLat},${originLng}` +
    `&destinations=${destLat},${destLng}` +
    `&mode=driving` +
    `&departure_time=${dep}` +
    `&traffic_model=best_guess` +
    `&key=${key}`;

  try {
    const r = await fetch(url);
    const data = await r.json();

    if (data.status !== 'OK') {
      return res.status(500).json({ error: data.status, details: data.error_message });
    }

    const element = data.rows?.[0]?.elements?.[0];
    if (!element || element.status !== 'OK') {
      return res.status(500).json({ error: 'Route not found', element });
    }

    // Prefer duration_in_traffic (with departure_time)
    const durationSec = element.duration_in_traffic?.value ?? element.duration?.value ?? 0;
    const distanceM = element.distance?.value ?? 0;
    const minutes = Math.round(durationSec / 60);
    const km = (distanceM / 1000).toFixed(1);

    return res.status(200).json({
      success: true,
      duration: { seconds: durationSec, minutes, text: element.duration_in_traffic?.text ?? element.duration?.text },
      distance: { meters: distanceM, km, text: element.distance?.text },
      traffic: !!element.duration_in_traffic,
    });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}
