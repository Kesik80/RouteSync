// /api/calculate-time.js — Vercel Serverless Function
// Считает время в пути между двумя точками через Google Maps Distance Matrix API
// POST { originLat, originLng, destLat, destLng }
// Возвращает { success: true, duration: { text, minutes } }

const https = require('https');

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Content-Type', 'application/json');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ success: false, error: 'Только POST' });

  const key = process.env.GOOGLE_API_KEY;
  if (!key) return res.status(500).json({ success: false, error: 'GOOGLE_API_KEY не задан' });

  let body;
  try {
    body = await getBody(req);
  } catch {
    return res.status(400).json({ success: false, error: 'Ошибка чтения тела запроса' });
  }

  const { originLat, originLng, destLat, destLng } = body;

  if (!originLat || !originLng || !destLat || !destLng) {
    return res.status(400).json({ success: false, error: 'Нужны originLat, originLng, destLat, destLng' });
  }

  const url = [
    'https://maps.googleapis.com/maps/api/distancematrix/json',
    `?origins=${originLat},${originLng}`,
    `&destinations=${destLat},${destLng}`,
    `&mode=driving`,
    `&language=de`,
    `&key=${key}`
  ].join('');

  try {
    const data = await fetchJson(url);

    if (data.status !== 'OK') {
      return res.status(502).json({ success: false, error: `Google API: ${data.status}` });
    }

    const element = data.rows?.[0]?.elements?.[0];
    if (!element || element.status !== 'OK') {
      return res.status(502).json({ success: false, error: `Маршрут не найден: ${element?.status}` });
    }

    const seconds = element.duration.value;
    const minutes = Math.ceil(seconds / 60);

    return res.json({
      success: true,
      duration: {
        text: element.duration.text,
        minutes
      },
      distance: {
        text: element.distance.text,
        meters: element.distance.value
      }
    });

  } catch (e) {
    return res.status(500).json({ success: false, error: e.message });
  }
};

function fetchJson(url) {
  return new Promise((resolve, reject) => {
    const req = https.get(url, { timeout: 10000 }, res => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try { resolve(JSON.parse(body)); }
        catch { reject(new Error('Ошибка парсинга JSON от Google')); }
      });
    });
    req.on('error', reject);
    req.on('timeout', () => { req.destroy(); reject(new Error('Timeout')); });
  });
}

function getBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      try { resolve(JSON.parse(body)); } catch { resolve({}); }
    });
    req.on('error', reject);
  });
}
