# PyLearn

A mobile-first Python course — beginner to advanced — that runs real Python in
the browser via Pyodide. 33 lessons across 6 tracks, quizzes, hidden-test
exercises, XP, achievements, certificates, and a full account system.

## Quick start

```bash
npm install
npm run dev:all      # API on :5184 + Vite on :5183
```

Open http://localhost:5183.

`dev:all` runs both processes; alternatively run them in separate terminals:

```bash
npm run server       # API only
npm run dev          # Vite only (proxies /api to the API)
```

## Scripts

| Script | What it does |
| --- | --- |
| `npm run dev:all` | API + Vite together, prefixed output |
| `npm run dev` | Vite dev server (`:5183`) |
| `npm run server` | API server (`:5184`) |
| `npm start` | Build the app, then serve app + API from one process |
| `npm run build` | Typecheck, then bundle to `dist/` |
| `npm run check` | Curriculum content integrity checks |

## Architecture

```
src/                 React + TypeScript app (Vite)
  pyodide/           Web Worker running CPython via Pyodide
  curriculum/        The course content, as typed data
  state/             App context, per-account storage, API client
server/              Node backend — zero dependencies
  index.js           HTTP server: API routes + static hosting of dist/
  auth.js            scrypt password hashing, sessions, progress
  db.js              SQLite schema (users, sessions, progress)
  http.js            JSON bodies, cookies, client IP
```

The backend deliberately uses **only Node built-ins** — `node:http`,
`node:sqlite` and `node:crypto` — so there is nothing to install, no native
module to compile, and no dependency supply chain.

In development Vite proxies `/api` to the API process, so the browser stays on
a single origin and the session cookie is same-origin (no CORS involved). In
production one Node process serves both `dist/` and `/api`.

## Accounts

Learners sign up once; a session cookie keeps them signed in for 30 days, so
they never have to sign up again. Progress is namespaced per account and synced
to the server, so XP, lessons and certificates follow them to any browser.

Implemented:

- Passwords hashed with **scrypt** (N=32768) and a per-user random salt,
  compared in constant time.
- Sessions store only a **SHA-256 hash of the token**, so a database leak can't
  be replayed. The cookie is `HttpOnly` + `SameSite=Lax`, and `Secure` whenever
  the request arrives over HTTPS.
- Login failures return one message whether or not the email exists, so the
  endpoint can't be used to discover which emails are registered.
- Per-IP rate limiting on sign-up and sign-in, a 512 KB request body cap, input
  validation, and static file serving that is guarded against path traversal.
- "Continue without an account" keeps the app usable offline; work done that way
  is adopted into the first account created on that device.

Not implemented (worth knowing before this is public): no password reset, no
email verification, and rate limiting is per-process in memory.

## Environment variables

| Variable | Default | Purpose |
| --- | --- | --- |
| `PORT` | `5184` | Port the API listens on |
| `PYLEARN_DATA_DIR` | `server/data` | Where `pylearn.db` lives |
| `PYLEARN_COOKIE_SECURE` | off | Force the `Secure` cookie flag |

## Deploying

The free static-only options (GitHub Pages, Netlify, Vercel as a static site)
**cannot host this app** — it needs a running Node process for accounts. Use a
host that runs Node.

**Render:** `render.yaml` is a ready blueprint — point Render at this repo.

**Anywhere with Docker** (Fly.io, Railway, Koyeb, Render):

```bash
docker build -t pylearn .
docker run -p 8080:8080 -v pylearn-data:/data pylearn
```

> **Persist the database.** On hosts with an ephemeral filesystem the SQLite file
> is lost on every deploy or restart, which silently deletes all accounts. Attach
> a volume at `/data` (Docker) or set `PYLEARN_DATA_DIR` to the mounted disk.
> On Render the free instance has no disk — uncomment the `disk` block and
> `PYLEARN_DATA_DIR` in `render.yaml` when you want durable accounts.

Set `PYLEARN_COOKIE_SECURE=1` when serving over HTTPS if your host doesn't
forward `X-Forwarded-Proto`.

## Notes

- `source/` holds third-party course books used only to author the curriculum
  (`npm run extract`). It is gitignored and never shipped — the app doesn't read
  it at runtime.
- `server/data/` is gitignored because it contains password hashes.
