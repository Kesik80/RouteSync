// api/expand.js — Vercel serverless function
// Expands shortened Google Maps links and extracts coordinates

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');

  const url = req.query.url;
  if (!url) return res.status(400).json({ error: 'Missing url param' });

  try {
    // Try direct coordinate extraction from URL
    const coordMatch = url.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
    if (coordMatch) {
      return res.status(200).json({ lat: parseFloat(coordMatch[1]), lng: parseFloat(coordMatch[2]) });
    }

    // Follow redirects to expand shortened URL
    const r = await fetch(url, {
      method: 'GET',
      redirect: 'follow',
      headers: { 'User-Agent': 'Mozilla/5.0' }
    });

    const finalUrl = r.url;
    const body = await r.text();

    // Try from final URL
    const m1 = finalUrl.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
    if (m1) return res.status(200).json({ lat: parseFloat(m1[1]), lng: parseFloat(m1[2]) });

    // Try from body
    const m2 = body.match(/\"(-?\d{1,3}\.\d{4,})\",\"(-?\d{1,3}\.\d{4,})\"/);
    if (m2) return res.status(200).json({ lat: parseFloat(m2[1]), lng: parseFloat(m2[2]) });

    // Try ll= param
    const m3 = finalUrl.match(/[?&]ll=(-?\d+\.\d+),(-?\d+\.\d+)/);
    if (m3) return res.status(200).json({ lat: parseFloat(m3[1]), lng: parseFloat(m3[2]) });

    return res.status(404).json({ error: 'Coordinates not found in URL', finalUrl });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}
