# 🚗 RouteSync v2.0

Carpooling route planner with live tracking, passenger view & trip history.

## Files
- `index.html` — Main app
- `passenger.html` — Live passenger view (shareable link)
- `history.html` — Trip history & stats
- `stations.js` — Your route data (coords, times, orders)
- `api/calculate-time.js` — Google Maps Distance Matrix API
- `api/expand.js` — Expand short Maps links
- `api/sync.js` — Live session sharing
- `vercel.json` — Vercel deployment config

## Deploy
```bash
vercel
```
Set env: `GOOGLE_MAPS_API_KEY=your_key`

## God Mode Password
Default: `admin` — change `GOD_HASH` in index.html (bcrypt)
