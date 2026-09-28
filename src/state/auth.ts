// Client for the PyLearn API.
//
// The session token lives in an HttpOnly cookie set by the server, so it is
// never visible to JavaScript. Every call therefore just needs credentials to
// be sent; there is no token to store or attach manually.
import type { ProgressState } from '../types'

export interface AuthUser {
  id: number
  email: string
  name: string
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

export async function fetchMe(): Promise<AuthUser | null> {
  const { user } = await request<{ user: AuthUser | null }>('/auth/me')
  return user
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
