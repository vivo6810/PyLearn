// Password hashing (scrypt) and session-token management.
// Node's built-in scrypt is a real password KDF, so no native bcrypt/argon2
// dependency is needed.
import { createHash, randomBytes, scryptSync, timingSafeEqual } from 'node:crypto'
import { db, publicUser } from './db.js'

export const COOKIE_NAME = 'pylearn_sid'
export const SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000 // 30 days

// scrypt cost. N=2^15 is a reasonable interactive-login work factor.
const SCRYPT = { N: 32768, r: 8, p: 1, keylen: 64, maxmem: 128 * 1024 * 1024 }

/** Store as `scrypt$N$r$p$salt$hash` so the parameters can be raised later. */
export function hashPassword(password) {
  const salt = randomBytes(16)
  const key = scryptSync(password, salt, SCRYPT.keylen, { N: SCRYPT.N, r: SCRYPT.r, p: SCRYPT.p, maxmem: SCRYPT.maxmem })
  return ['scrypt', SCRYPT.N, SCRYPT.r, SCRYPT.p, salt.toString('base64'), key.toString('base64')].join('$')
}

export function verifyPassword(password, stored) {
  try {
    const [scheme, n, r, p, saltB64, keyB64] = String(stored).split('$')
    if (scheme !== 'scrypt') return false
    const salt = Buffer.from(saltB64, 'base64')
    const expected = Buffer.from(keyB64, 'base64')
    const actual = scryptSync(password, salt, expected.length, {
      N: Number(n),
      r: Number(r),
      p: Number(p),
      maxmem: SCRYPT.maxmem,
    })
    // Constant-time compare so response timing can't leak the hash.
    return actual.length === expected.length && timingSafeEqual(actual, expected)
  } catch {
    return false
  }
}

/** Only a hash of the session token is stored, so a DB leak can't be replayed. */
function tokenHash(token) {
  return createHash('sha256').update(token).digest('hex')
}

export function createSession(userId) {
  const token = randomBytes(32).toString('base64url')
  const now = Date.now()
  db.prepare('INSERT INTO sessions (token_hash, user_id, created_at, expires_at) VALUES (?, ?, ?, ?)').run(
    tokenHash(token),
    userId,
    now,
    now + SESSION_TTL_MS,
  )
  return token
}

export function userFromToken(token) {
  if (!token) return null
  const row = db
    .prepare(
      `SELECT u.id, u.email, u.name, s.expires_at
         FROM sessions s JOIN users u ON u.id = s.user_id
        WHERE s.token_hash = ?`,
    )
    .get(tokenHash(token))
  if (!row) return null
  if (row.expires_at < Date.now()) {
    destroySession(token)
    return null
  }
  return publicUser(row)
}

export function destroySession(token) {
  if (!token) return
  db.prepare('DELETE FROM sessions WHERE token_hash = ?').run(tokenHash(token))
}

export function destroyUserSessions(userId) {
  db.prepare('DELETE FROM sessions WHERE user_id = ?').run(userId)
}

export function purgeExpiredSessions() {
  db.prepare('DELETE FROM sessions WHERE expires_at < ?').run(Date.now())
}

// ── progress ──

export function loadProgress(userId) {
  const row = db.prepare('SELECT data FROM progress WHERE user_id = ?').get(userId)
  if (!row) return null
  try {
    return JSON.parse(row.data)
  } catch {
    return null
  }
}

export function saveProgress(userId, data) {
  db.prepare(
    `INSERT INTO progress (user_id, data, updated_at) VALUES (?, ?, ?)
     ON CONFLICT(user_id) DO UPDATE SET data = excluded.data, updated_at = excluded.updated_at`,
  ).run(userId, JSON.stringify(data), Date.now())
}

// ── input validation ──

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

export function validateCredentials({ email, password, name }) {
  const cleanEmail = String(email ?? '').trim().toLowerCase()
  const cleanPassword = String(password ?? '')
  const cleanName = String(name ?? '').trim()

  if (!EMAIL_RE.test(cleanEmail) || cleanEmail.length > 254) {
    return { error: 'Enter a valid email address.' }
  }
  if (cleanPassword.length < 8) return { error: 'Password must be at least 8 characters.' }
  if (cleanPassword.length > 200) return { error: 'Password must be under 200 characters.' }
  if (cleanName.length > 60) return { error: 'Name must be under 60 characters.' }

  return {
    value: {
      email: cleanEmail,
      password: cleanPassword,
      // Fall back to the part before @ so the greeting always has something.
      name: cleanName || cleanEmail.split('@')[0],
    },
  }
}
