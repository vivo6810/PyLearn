# Freebuff deployment

The site is hosted by Freebuff Sites as one Worker in front of the built SPA.

- **Site:** `PyLearn` — id `7f3c1a92-2b64-4d18-9e57-a1c0d84b6f23`
- **Preview:** https://site-1d51b89504dc4234964ea73e3e6a7b5d.freebuff.page
- **D1 binding:** `DB` (progress rows keyed by the Freebuff `sub`)
- **Auth:** Sign in with Freebuff, project `92b9a9d3-40f6-4955-8faa-d95a68813b7a`

## Redeploy

```sh
npm run build                                     # tsc --noEmit + vite build → dist/
npx esbuild worker/index.js --bundle --format=esm \
  --target=es2022 --platform=browser --outfile=build/worker.js
# then upload freebuff-deploy.json through Freebuff (Sites → deploy)
```

`wrangler.jsonc` runs the same bundle locally against local D1 and the
development Freebuff client ID:

```sh
npx wrangler dev --port 8787
```

## Why a Worker instead of `server/`

Freebuff hosting runs Workers, not Node processes, and has no persistent
filesystem. `server/` (node:http + node:sqlite, password accounts) is still the
self-hosted path — `Dockerfile` / `render.yaml` — and the client detects which
one it is talking to from `/api/auth/me` (`provider: 'freebuff' | 'password'`).
