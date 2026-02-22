// /api/parse-coords.js — Vercel Serverless Function
// Принимает GET ?input=<строка> или POST { input: "..." }
// Возвращает { success: true, lat, lng } или { success: false, error: "..." }

const https = require('https');
const http  = require('http');

// ── Утилита: HTTP GET с редиректами ──────────────────────────────────────────
function fetchUrl(url, redirectCount = 0) {
  return new Promise((resolve, reject) => {
    if (redirectCount > 10) return reject(new Error('Слишком много редиректов'));
    const mod = url.startsWith('https') ? https : http;
    const req = mod.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; CoordsParser/1.0)',
        'Accept': 'text/html,application/xhtml+xml,*/*'
      },
      timeout: 8000
    }, res => {
      // Следуем за редиректом
      if ([301, 302, 303, 307, 308].includes(res.statusCode) && res.headers.location) {
        const next = res.headers.location.startsWith('http')
          ? res.headers.location
          : new URL(res.headers.location, url).href;
        res.resume();
        return resolve(fetchUrl(next, redirectCount + 1));
      }
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => resolve({ url, body, status: res.statusCode }));
    });
    req.on('error', reject);
    req.on('timeout', () => { req.destroy(); reject(new Error('Timeout')); });
  });
}

// ── Парсер координат из строки / URL ─────────────────────────────────────────
function parseCoords(str) {
  const check = (lat, lng) =>
    Math.abs(lat) <= 90 && Math.abs(lng) <= 180 ? { lat, lng } : null;

  let m;
  // @lat,lng  (Google Maps)
  m = str.match(/@([-+]?\d+\.\d+),([-+]?\d+\.\d+)/);
  if (m) return check(+m[1], +m[2]);
  // ll=lat,lng
  m = str.match(/ll=([-+]?\d+\.\d+),([-+]?\d+\.\d+)/);
  if (m) return check(+m[1], +m[2]);
  // /place/lat,lng
  m = str.match(/\/place\/([-+]?\d+\.\d+),([-+]?\d+\.\d+)/);
  if (m) return check(+m[1], +m[2]);
  // ?q= / ?query= / ?center= / ?dest=
  m = str.match(/[?&](?:q|query|center|dest)=([-+]?\d+\.\d+),([-+]?\d+\.\d+)/);
  if (m) return check(+m[1], +m[2]);
  // Просто два числа с точкой рядом
  m = str.match(/([-+]?\d{1,3}\.\d{4,})[\s,]+([-+]?\d{1,3}\.\d{4,})/);
  if (m) return check(+m[1], +m[2]);

  return null;
}

// ── Парсер текстового ввода (не URL) ─────────────────────────────────────────
function parseText(s) {
  // Европейский: 51,530, 6,850
  if (/^-?\d{1,2},\d+\s*,\s*-?\d{1,3},\d+$/.test(s)) {
    const p = s.split(',').map(t => t.trim());
    const lat = parseFloat(p[0] + '.' + p[1]);
    const lng = parseFloat(p[2] + '.' + p[3]);
    if (Math.abs(lat) <= 90 && Math.abs(lng) <= 180) return { lat, lng };
  }
  // Десятичный: 51.530, 6.850
  if (/^-?\d{1,2}(?:\.\d+)?\s*,\s*-?\d{1,3}(?:\.\d+)?$/.test(s)) {
    const [lat, lng] = s.split(',').map(Number);
    if (Math.abs(lat) <= 90 && Math.abs(lng) <= 180) return { lat, lng };
  }
  // DMS: 51°31'30"N 6°51'03"E
  const dms = [...s.matchAll(/(\d{1,3})°(\d{1,2})'(\d{1,2}(?:\.\d+)?)"?\s*([NSEW])/gi)];
  if (dms.length === 2) {
    const toDec = ([, d, m, sec, dir]) => {
      let v = +d + +m / 60 + +sec / 3600;
      if (/[SW]/i.test(dir)) v = -v;
      return v;
    };
    const lat = toDec(dms[0]), lng = toDec(dms[1]);
    if (Math.abs(lat) <= 90 && Math.abs(lng) <= 180) return { lat, lng };
  }
  return null;
}

// ── Поиск координат в HTML-тексте страницы ───────────────────────────────────
function parseCoordsFromBody(body) {
  let m;
  m = body.match(/"lat"\s*:\s*([-+]?\d+\.\d+)\s*,\s*"lng"\s*:\s*([-+]?\d+\.\d+)/);
  if (m && Math.abs(+m[1]) <= 90) return { lat: +m[1], lng: +m[2] };
  m = body.match(/[?&]q=([-+]?\d+\.\d+),([-+]?\d+\.\d+)/);
  if (m && Math.abs(+m[1]) <= 90) return { lat: +m[1], lng: +m[2] };
  m = body.match(/([-+]?\d{1,3}\.\d{5,}),\s*([-+]?\d{1,3}\.\d{5,})/);
  if (m && Math.abs(+m[1]) <= 90) return { lat: +m[1], lng: +m[2] };
  return null;
}

// ── Главный обработчик ───────────────────────────────────────────────────────
module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Content-Type', 'application/json');

  const input = (
    req.method === 'POST' ? (await getBody(req)).input : req.query.input
  )?.trim();

  if (!input) {
    return res.status(400).json({ success: false, error: 'Параметр input обязателен' });
  }

  try {
    // 1. Не ссылка — парсим как текст
    if (!/^https?:\/\//i.test(input)) {
      const coords = parseText(input);
      if (coords) return res.json({ success: true, ...coords });
      return res.status(422).json({ success: false, error: 'Координаты не распознаны' });
    }

    // 2. Ссылка — следуем за редиректами (раскрывает goo.gl, maps.app.goo.gl и др.)
    const { url: finalUrl, body } = await fetchUrl(input);

    // Пробуем вытащить координаты из финального URL
    const fromUrl = parseCoords(finalUrl);
    if (fromUrl) return res.json({ success: true, ...fromUrl, source: 'url' });

    // Пробуем из тела страницы
    const fromBody = parseCoordsFromBody(body);
    if (fromBody) return res.json({ success: true, ...fromBody, source: 'body' });

    return res.status(422).json({ success: false, error: 'Координаты не найдены в ссылке' });

  } catch (e) {
    return res.status(500).json({ success: false, error: e.message });
  }
};

// ── Читаем тело POST запроса ─────────────────────────────────────────────────
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
