// PyLearn on Freebuff Sites.
//
// One Worker sits in front of the built SPA. It serves the Sign in with
// Freebuff routes (`/auth/freebuff/*`), the small JSON API the app talks to,
// and hands everything else to the static assets.
//
// Accounts: a learner's progress is always looked up by the Freebuff `sub`
// from the verified session cookie — never by an id sent from the browser.
import { createFreebuffAuth, isSameOriginRequest } from '@freebuff/auth'

/** Progress snapshots are small; anything bigger is a bad client. */
const MAX_PROGRESS_BYTES = 512 * 1024

const SCHEMA = `CREATE TABLE IF NOT EXISTS progress (
  owner TEXT PRIMARY KEY,
  data TEXT NOT NULL,
  updated_at INTEGER NOT NULL
)`

// One auth instance per isolate: it caches OIDC discovery and signing keys.
let auth
let handler
// Created once, retried after a failure so a cold database can't wedge the app.
let schemaReady

function ensureSchema(env) {
  schemaReady ??= env.DB.prepare(SCHEMA)
    .run()
    .catch((error) => {
      schemaReady = undefined
      throw error
    })
  return schemaReady
}

function json(body, status = 200) {
  // Every API answer here is per-visitor: never cache it anywhere.
  return Response.json(body, { status, headers: { 'cache-control': 'private, no-store' } })
}

/** Map the Freebuff profile onto the shape the app already uses. */
function toUser(user) {
  if (!user) return null
  return {
    id: user.sub,
    email: user.email ?? '',
    name: user.name || user.email || 'Learner',
    picture: user.picture,
  }
}

async function readProgress(env, owner) {
  await ensureSchema(env)
  const row = await env.DB
    .prepare('SELECT data FROM progress WHERE owner = ?1')
    .bind(owner)
    .first()
  if (!row?.data) return null
  try {
    const parsed = JSON.parse(row.data)
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : null
  } catch {
    return null
  }
}

async function writeProgress(env, owner, progress) {
  await ensureSchema(env)
  await env.DB
    .prepare(
      `INSERT INTO progress (owner, data, updated_at) VALUES (?1, ?2, ?3)
       ON CONFLICT(owner) DO UPDATE SET data = excluded.data, updated_at = excluded.updated_at`,
    )
    .bind(owner, JSON.stringify(progress), Date.now())
    .run()
}

async function api(request, env, freebuff) {
  const url = new URL(request.url)

  if (!url.pathname.startsWith('/api/')) return null

  if (url.pathname === '/api/auth/me' && request.method === 'GET') {
    // `provider` tells the app which sign-in UI to render: this deployment has
    // no password accounts, it uses Sign in with Freebuff.
    return json({ provider: 'freebuff', user: toUser(await freebuff.getUser(request)) })
  }

  if (url.pathname === '/api/progress') {
    const user = await freebuff.getUser(request)
    if (!user) return json({ error: 'Sign in required.' }, 401)

    if (request.method === 'GET') {
      return json({ progress: await readProgress(env, user.sub) })
    }

    if (request.method === 'PUT') {
      // State change: only this site may write, and only for its own account.
      if (!isSameOriginRequest(request, env.APP_ORIGIN)) {
        return json({ error: 'Cross-origin request rejected.' }, 403)
      }
      const text = await request.text()
      if (text.length > MAX_PROGRESS_BYTES) return json({ error: 'Progress payload too large.' }, 413)

      let body
      try {
        body = JSON.parse(text)
      } catch {
        return json({ error: 'Expected JSON.' }, 400)
      }
      const progress = body?.progress
      if (!progress || typeof progress !== 'object' || Array.isArray(progress)) {
        return json({ error: 'Expected a progress object.' }, 400)
      }

      await writeProgress(env, user.sub, progress)
      return json({ ok: true, savedAt: Date.now() })
    }

    return json({ error: 'Method not allowed.' }, 405)
  }

  return json({ error: 'Not found.' }, 404)
}

function setup(env) {
  auth ??= createFreebuffAuth({
    clientId: env.FREEBUFF_CLIENT_ID,
    issuer: env.FREEBUFF_ISSUER,
    baseUrl: env.APP_ORIGIN,
    // Local `wrangler dev` runs on http://localhost; deployed origins are https.
    allowInsecureLocalhost: /^http:\/\/(localhost|127\.0\.0\.1|\[::1\])(:\d+)?$/.test(env.APP_ORIGIN),
  })
  const freebuff = auth

  // `wrap` serves /auth/freebuff/* and keeps the session cookie fresh. It has to
  // run before the asset fallback so those routes reach it.
  handler ??= freebuff.wrap(async (request, env) => {
    const response = await api(request, env, freebuff)
    return response ?? env.ASSETS.fetch(request)
  })

  return handler
}

export default {
  fetch(request, env) {
    return setup(env)(request, env)
  },
}
