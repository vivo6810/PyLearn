// Client for the PyLearn API.
//
// The session token lives in an HttpOnly cookie set by the server, so it is
// never visible to JavaScript. Every call therefore just needs credentials to
// be sent; there is no token to store or attach manually.
import type { ProgressState } from '../types'

/** Which sign-in system this deployment has. */
export type AuthProvider = 'password' | 'freebuff'

export interface AuthUser {
  /** Stable per-account id: the Freebuff `sub`, or the id from the Node API. */
  id: string | number
  email: string
  name: string
  picture?: string
}

export class ApiError extends Error {
  status: number
  constructor(message: string, status: number) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  let res: Response
  try {
    res = await fetch(`/api${path}`, {
      ...init,
      // Bounded so a hung/unreachable server can never block the app on boot.
      signal: init.signal ?? AbortSignal.timeout(8000),
      credentials: 'same-origin',
      headers: {
        ...(init.body ? { 'content-type': 'application/json' } : {}),
        ...(init.headers ?? {}),
      },
    })
  } catch {
    // Usually means the API process isn't running (npm run server / dev:all).
    throw new ApiError("Can't reach the PyLearn server. Is it running?", 0)
  }

  const text = await res.text()
  let payload: any = null
  if (text) {
    try {
      payload = JSON.parse(text)
    } catch {
      payload = null
    }
  }

  if (!res.ok) throw new ApiError(payload?.error ?? `Request failed (${res.status})`, res.status)
  return payload as T
}

export interface SessionProbe {
  /** False when there is no account API at all (a static-only deploy). */
  available: boolean
  /** How visitors sign in here, or null when there are no accounts. */
  provider: AuthProvider | null
  user: AuthUser | null
}

/**
 * Ask the server who we are, while also working out whether an account API
 * exists at all. A static host (e.g. GitHub Pages) answers an unknown path with
 * a 404 or with HTML, and both must mean "no accounts" rather than an error.
 */
export async function fetchSession(): Promise<SessionProbe> {
  const none: SessionProbe = { available: false, provider: null, user: null }
  try {
    const res = await fetch('/api/auth/me', {
      credentials: 'same-origin',
      signal: AbortSignal.timeout(6000),
    })
    if (!res.ok) return none
    const payload = JSON.parse(await res.text())
    if (!payload || typeof payload !== 'object' || !('user' in payload)) {
      return none
    }
    // A Freebuff-hosted deployment answers with `provider: 'freebuff'`; the
    // bundled Node server leaves the field out and keeps its email + password
    // form, so the same client works on both.
    const provider: AuthProvider = payload.provider === 'freebuff' ? 'freebuff' : 'password'
    return { available: true, provider, user: payload.user ?? null }
  } catch {
    return none
  }
}

export async function signUp(input: { email: string; password: string; name?: string }): Promise<AuthUser> {
  const { user } = await request<{ user: AuthUser }>('/auth/signup', {
    method: 'POST',
    body: JSON.stringify(input),
  })
  return user
}

export async function signIn(input: { email: string; password: string }): Promise<AuthUser> {
  const { user } = await request<{ user: AuthUser }>('/auth/login', {
    method: 'POST',
    body: JSON.stringify(input),
  })
  return user
}

export async function signOut(): Promise<void> {
  await request<{ ok: true }>('/auth/logout', { method: 'POST' })
}

export async function fetchRemoteProgress(): Promise<ProgressState | null> {
  const { progress } = await request<{ progress: ProgressState | null }>('/progress')
  return progress ?? null
}

export async function pushRemoteProgress(progress: ProgressState): Promise<void> {
  await request<{ ok: true }>('/progress', { method: 'PUT', body: JSON.stringify({ progress }) })
}

// ── Sign in with Freebuff (used when the deployment reports that provider) ──

/**
 * Where a link should point to start Sign in with Freebuff. It is a plain link
 * on purpose: the handler answers with a redirect to the identity provider, and
 * the browser follows it. `returnTo` is a local path.
 */
export function freebuffSignInUrl(returnTo = '/'): string {
  return `/auth/freebuff/signin?returnTo=${encodeURIComponent(returnTo)}`
}

/** Ends the Freebuff session. The handler only accepts a POST from this site. */
export async function freebuffSignOut(): Promise<void> {
  const body = new URLSearchParams({ returnTo: '/' })
  const res = await fetch('/auth/freebuff/signout', {
    method: 'POST',
    credentials: 'same-origin',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body: body.toString(),
  })
  if (!res.ok) throw new ApiError('Could not sign out.', res.status)
}
