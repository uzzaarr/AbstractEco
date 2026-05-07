# newabs — ecosystem dashboard

Vite + React 19 dashboard that renders pre-fetched Dune Analytics data from `public/data/*.json`.

## Local dev

```
npm install
npm run dev
```

Build: `npm run build` → `dist/`.

## Data refresh

`npm run fetch-dune` (needs `DUNE_API_KEY` in `.env`) refreshes the cached JSON. In production a weekly GitHub Actions workflow (`.github/workflows/refresh-dune.yml`) does this automatically every Monday and commits the result; Vercel auto-deploys the new build.
