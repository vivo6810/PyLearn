# PyLearn

A mobile-first Python course — beginner to advanced — that runs real Python in
the browser via Pyodide. 35 lessons across 6 tracks, quizzes, hidden-test
exercises, XP, achievements and certificates.

**Live site: https://vivo6810.github.io/** — deployed from `main` by
GitHub Actions on every push (built with `VITE_BASE=/`). The old project URL,
https://vivo6810.github.io/PyLearn/, redirects to the root site and preserves
hash-based lesson links.

## Guest mode (GitHub Pages)

The Pages deployment is the **client only** — GitHub Pages serves static files
and cannot run the Node backend that accounts need. On that deployment the app
detects the missing API on boot and runs in guest mode:

- Everything works: lessons, in-browser Python, quizzes, exercises, XP,
  achievements, certificates.
- Progress, drafts and notes are saved in **this browser's localStorage only**.
- The account/sign-in screens are hidden, and Settings explains the local-only
  storage. Use **Settings → Export backup** to keep a copy or move progress to
  another browser.

Real accounts (sign-up, sign-in, cross-device progress) require running the
Node server — see [Deploying with accounts](#deploying-with-accounts). The code
is already wired for both: the same build enables accounts automatically when
the API is reachable.

## Quick start (local, full features)

```bash
npm install
npm run dev:all      # API on :5184 + Vite on :5183
```

Open http://localhost:5183 — accounts, sign-up and server-synced progress all
work locally.

Run the two processes separately instead, if you prefer:

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
  pyodide/           Web Worker running CPython via Pyodide (loaded from CDN)
  curriculum/        The course content, as typed data
  state/             App context, per-account storage, API client
server/              Node backend — zero dependencies
  index.js           HTTP server: API routes + static hosting of dist/
  auth.js            scrypt password hashing, sessions, progress
  db.js              SQLite schema (users, sessions, progress)
  http.js            JSON bodies, cookies, client IP
```

The backend deliberately uses **only Node built-ins** — `node:http`,
`node:sqlite` and `node:crypto` — so there is nothing to install and no native
module to compile.

In development Vite proxies `/api` to the API process, so the browser stays on
one origin and the session cookie needs no CORS handling. In production one
Node process serves both `dist/` and `/api`.

## Accounts

When the backend is running (locally, or on a Node host):

- Learners sign up once; an HttpOnly session cookie keeps them signed in for
  30 days, so they never have to sign up again.
- Passwords are hashed with **scrypt** (N=32768) with a per-user random salt and
  compared in constant time.
- Sessions store only a **SHA-256 hash of the token**, so a database leak can't
  be replayed. The cookie is `HttpOnly` + `SameSite=Lax`, and `Secure` over HTTPS.
- Login failures return one message whether or not the email exists, so the
  endpoint can't be used to discover which emails are registered.
- Per-IP rate limiting on sign-up and sign-in, a request-body size cap, input
  validation, and path-traversal-safe static serving.
- Progress is namespaced per account and synced to the server. Work done as a
  guest is adopted into the first account created on that device.

Known gaps: no password reset, no email verification, rate limiting is
per-process in memory.

## Environment variables

| Variable | Default | Purpose |
| --- | --- | --- |
| `PORT` | `5184` | Port the API listens on |
| `PYLEARN_DATA_DIR` | `server/data` | Where `pylearn.db` lives |
| `PYLEARN_COOKIE_SECURE` | off | Force the `Secure` cookie flag |
| `VITE_BASE` | `/` | Asset base path (Pages builds use `/PyLearn/`) |

## Deploying

### GitHub Pages (current — guest mode)

Automatic: push to `main` and the workflow in
`.github/workflows/deploy-pages.yml` builds the site. The `vivo6810.github.io`
repository publishes the app at the root URL; the `PyLearn` repository
publishes a redirect from the old `/PyLearn/` URL.

One-time setup, if not enabled yet: repository **Settings → Pages →
Build and deployment → Source: “GitHub Actions”**. After that, every push
deploys automatically. The root build uses `VITE_BASE=/`.

### Deploying with accounts

Static hosts (GitHub Pages, Netlify, static Vercel) **cannot** run the API. To
get real accounts, deploy the Node server to any host that runs Node:

**Render:** `render.yaml` is a ready blueprint — point Render at this repo.
Note that durable accounts need a persistent disk: on the free plan the
filesystem is ephemeral and the SQLite database (and every account) is wiped on
each deploy — uncomment the `disk` block and `PYLEARN_DATA_DIR` in
`render.yaml` when you want durability.

**Anywhere with Docker** (Fly.io, Railway, Koyeb, Render):

```bash
docker build -t pylearn .
docker run -p 8080:8080 -v pylearn-data:/data pylearn
```

> **Persist the database.** On hosts with an ephemeral filesystem the SQLite
> file is lost on every deploy or restart, which silently deletes all accounts.
> Attach a volume at `/data` (Docker) or set `PYLEARN_DATA_DIR` to the mounted
> disk.

Set `PYLEARN_COOKIE_SECURE=1` when serving over HTTPS if your host doesn't
forward `X-Forwarded-Proto`.

## HTTPS

PyLearn itself doesn't terminate TLS — it's a plain HTTP server (the session
cookie is marked `Secure` only when the request came in over HTTPS, via
`X-Forwarded-Proto` or `PYLEARN_COOKIE_SECURE`). Put an HTTPS-terminating edge
in front of it:

- **Cloudflare (recommended):** proxy the hostname through Cloudflare and set
  `Always Use HTTPS` + a Page Rule / edge rule that forces HTTPS. That also
  gives you the Cloudflare Turnstile widget for the login page without running
  your own challenge server.
- **Render / any other host:** most platform-managed TLS does the same thing —
  the platform terminates TLS and forwards plain HTTP to your container, sending
  `X-Forwarded-Proto: https`. The server already reads that header, so the
  `Secure` cookie flag comes out right.

In short: run PyLearn over plain HTTP and let the edge/CDN do HTTPS. The app
behaves the same either way; only the cookie flag depends on the edge telling
the truth about the original request scheme.

## Notes

- `source/` holds third-party course books used only to author the curriculum
  (`npm run extract`). It is gitignored and never shipped — the app doesn't read
  it at runtime.
- `server/data/` is gitignored because it contains password hashes.
# spacing
# reconnect
