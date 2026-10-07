// PyLearn API + static host. Zero dependencies: node:http + node:sqlite.
//
// In development Vite (port 5183) proxies /api here. In production this server
// also serves the built `dist/` folder, so app and API share one origin and the
// session cookie just works.
import { createServer } from 'node:http'
import { createReadStream, existsSync, statSync } from 'node:fs'
import { dirname, extname, join, normalize, resolve, sep } from 'node:path'
import { fileURLToPath } from 'node:url'

import { db, publicUser, DATA_DIR } from './db.js'
import {
  COOKIE_NAME,
  SESSION_TTL_MS,
  createSession,
  destroySession,
  hashPassword,
  loadProgress,
  purgeExpiredSessions,
  saveProgress,
  userFromToken,
  validateCredentials,
  verifyPassword,
} from './auth.js'
import { clientIp, parseCookies, readJson, sendJson, serializeCookie } from './http.js'

const here = dirname(fileURLToPath(import.meta.url))
const DIST_DIR = resolve(here, '..', 'dist')
// `|| 5184` (not `??`) because an empty PORT env var would otherwise become 0.
const PORT = Number(process.env.PORT) || 5184
const COOKIE_SECURE = process.env.PYLEARN_COOKIE_SECURE === '1'

// PyLearn is a plain-HTTP app; TLS is terminated by the edge/host in front of it
// (Cloudflare, Render, etc.). The server trusts X-Forwarded-Proto only when the
// request is already HTTPS — it never flips Secure on for plain HTTP.
// See README.md § HTTPS.

purgeExpiredSessions()
const purgeTimer = setInterval(purgeExpiredSessions, 60 * 60 * 1000)
purgeTimer.unref()

// ── naive in-memory rate limiting (per IP + route) ──
const attempts = new Map()

function rateLimited(key, limit, windowMs) {
  const now = Date.now()
  const rec = attempts.get(key)
  if (!rec || rec.resetAt < now) {
    attempts.set(key, { count: 1, resetAt: now + windowMs })
    return false
  }
  rec.count += 1
  return rec.count > limit
}

const sweepTimer = setInterval(() => {
  const now = Date.now()
  for (const [key, rec] of attempts) if (rec.resetAt < now) attempts.delete(key)
}, 5 * 60 * 1000)
sweepTimer.unref()

// ── helpers ──

function sessionCookie(token, req) {
  const secure = COOKIE_SECURE || req.headers['x-forwarded-proto'] === 'https'
  return serializeCookie(COOKIE_NAME, token, { maxAge: SESSION_TTL_MS / 1000, secure, sameSite: 'Lax' })
}

function clearCookie() {
  return serializeCookie(COOKIE_NAME, '', { maxAge: 0, expires: new Date(0), sameSite: 'Lax' })
}

function currentUser(req) {
  return userFromToken(parseCookies(req)[COOKIE_NAME])
}

function fail(res, status, message) {
  return sendJson(res, status, { error: message })
}

// ── API routes ──

async function handleSignup(req, res) {
  if (rateLimited(`signup:${clientIp(req)}`, 10, 15 * 60 * 1000)) {
    return fail(res, 429, 'Too many sign-up attempts. Try again in a few minutes.')
  }
  const body = await readJson(req)
  const { error, value } = validateCredentials(body)
  if (error) return fail(res, 400, error)

  const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(value.email)
  if (existing) return fail(res, 409, 'That email is already registered — try signing in.')

  const info = db
    .prepare('INSERT INTO users (email, name, pw_hash, created_at) VALUES (?, ?, ?, ?)')
    .run(value.email, value.name, hashPassword(value.password), Date.now())
  const userId = Number(info.lastInsertRowid)

  const token = createSession(userId)
  return sendJson(
    res,
    201,
    { user: { id: userId, email: value.email, name: value.name } },
    { 'set-cookie': sessionCookie(token, req) },
  )
}

async function handleLogin(req, res) {
  if (rateLimited(`login:${clientIp(req)}`, 20, 15 * 60 * 1000)) {
    return fail(res, 429, 'Too many sign-in attempts. Try again in a few minutes.')
  }
  const body = await readJson(req)
  const email = String(body.email ?? '').trim().toLowerCase()
  const password = String(body.password ?? '')

  const row = db.prepare('SELECT * FROM users WHERE email = ?').get(email)
  // Same message either way so this can't be used to discover which emails exist.
  if (!row || !verifyPassword(password, row.pw_hash)) {
    return fail(res, 401, 'Email or password is incorrect.')
  }

  const token = createSession(row.id)
  return sendJson(res, 200, { user: publicUser(row) }, { 'set-cookie': sessionCookie(token, req) })
}

function handleLogout(req, res) {
  destroySession(parseCookies(req)[COOKIE_NAME])
  return sendJson(res, 200, { ok: true }, { 'set-cookie': clearCookie() })
}

function handleMe(req, res) {
  return sendJson(res, 200, { user: currentUser(req) })
}

function handleGetProgress(req, res) {
  const user = currentUser(req)
  if (!user) return fail(res, 401, 'Not signed in.')
  return sendJson(res, 200, { progress: loadProgress(user.id) })
}

async function handlePutProgress(req, res) {
  const user = currentUser(req)
  if (!user) return fail(res, 401, 'Not signed in.')

  const body = await readJson(req)
  const progress = body?.progress
  if (!progress || typeof progress !== 'object' || Array.isArray(progress)) {
    return fail(res, 400, 'Expected a progress object.')
  }
  saveProgress(user.id, progress)
  return sendJson(res, 200, { ok: true, savedAt: Date.now() })
}

const ROUTES = {
  'POST /api/auth/signup': handleSignup,
  'POST /api/auth/login': handleLogin,
  'POST /api/auth/logout': handleLogout,
  'GET /api/auth/me': handleMe,
  'GET /api/progress': handleGetProgress,
  'PUT /api/progress': handlePutProgress,
}

// ── static hosting (production) ──

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
  '.map': 'application/json; charset=utf-8',
}

function serveStatic(req, res) {
  if (!existsSync(DIST_DIR)) {
    res.writeHead(404, { 'content-type': 'text/plain; charset=utf-8' })
    res.end('No build found. Run `npm run build` first.')
    return
  }

  const urlPath = decodeURIComponent((req.url ?? '/').split('?')[0])
  // normalize + prefix check stops `../` from escaping the dist folder.
  const candidate = resolve(DIST_DIR, '.' + normalize(urlPath))
  const insideDist = candidate === DIST_DIR || candidate.startsWith(DIST_DIR + sep)
  let filePath = insideDist && existsSync(candidate) && statSync(candidate).isFile() ? candidate : null
  if (!filePath) filePath = join(DIST_DIR, 'index.html') // SPA fallback

  const ext = extname(filePath).toLowerCase()
  const immutable = ext !== '.html' && filePath.includes('assets')
  res.writeHead(200, {
    'content-type': MIME[ext] ?? 'application/octet-stream',
    'cache-control': immutable ? 'public, max-age=31536000, immutable' : 'no-cache',
  })
  createReadStream(filePath).pipe(res)
}

// ── server ──

const server = createServer(async (req, res) => {
  res.setHeader('x-content-type-options', 'nosniff')
  res.setHeader('referrer-policy', 'same-origin')
  res.setHeader('x-frame-options', 'DENY')

  const url = req.url ?? '/'
  const pathname = url.split('?')[0].replace(/\/+$/, '') || '/'

  if (pathname.startsWith('/api')) {
    const handler = ROUTES[`${req.method} ${pathname}`]
    if (!handler) return fail(res, 404, 'Unknown API route.')
    try {
      await handler(req, res)
    } catch (err) {
      const status = err?.status ?? 500
      if (status >= 500) console.error('[api]', req.method, pathname, err)
      if (!res.headersSent) fail(res, status, status === 500 ? 'Something went wrong on the server.' : String(err.message))
    }
    return
  }

  if (req.method !== 'GET' && req.method !== 'HEAD') {
    res.writeHead(405, { 'content-type': 'text/plain' })
    res.end('Method not allowed')
    return
  }

  serveStatic(req, res)
})

server.listen(PORT, () => {
  console.log(`PyLearn API listening on http://localhost:${PORT}`)
  console.log(`  database: ${DATA_DIR}`)
  if (existsSync(DIST_DIR)) console.log(`  serving build: ${DIST_DIR}`)
})

for (const signal of ['SIGINT', 'SIGTERM']) {
  process.on(signal, () => server.close(() => process.exit(0)))
}
