// Versioned localStorage stores: progress, sessions, notes.
//
// Signed in, everything is namespaced under the account id (`.u3`) so two
// people sharing a machine keep their own XP. Signed out, the plain keys are
// the guest profile.
import type { ProgressState, SessionState } from '../types'

const PROGRESS_KEY = 'pylearn.progress.v1'
const SESSION_KEY = 'pylearn.session.v1'

let scope: string | null = null

/** Point storage at a signed-in account, or `null` for the guest profile. */
export function setStorageScope(next: string | null) {
  scope = next
}

export function currentScope(): string | null {
  return scope
}

function progressKey(forScope = scope) {
  return forScope ? `${PROGRESS_KEY}.${forScope}` : PROGRESS_KEY
}

function sessionKey(forScope = scope) {
  return forScope ? `${SESSION_KEY}.${forScope}` : SESSION_KEY
}

function read<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return fallback
    const parsed = JSON.parse(raw)
    return parsed as T
  } catch {
    return fallback
  }
}

function write(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // storage full / private mode — progress just won't persist
  }
}

export const defaultProgress: ProgressState = {
  version: 1,
  lessons: {},
  xp: 0,
  streak: 0,
  theme: 'light',
  achievements: [],
  certificates: [],
}

export function loadProgress(): ProgressState {
  return loadProgressFor(scope)
}

/** Read any scope's progress — used to adopt guest progress into a new account. */
export function loadProgressFor(forScope: string | null): ProgressState {
  return { ...defaultProgress, ...read<Partial<ProgressState>>(progressKey(forScope), {}) } as ProgressState
}

/** True when the guest profile has real work in it worth adopting on sign-up. */
export function guestHasProgress(): boolean {
  const p = loadProgressFor(null)
  return Object.keys(p.lessons).length > 0 || p.xp > 0
}

export function saveProgress(p: ProgressState) {
  write(progressKey(), p)
}

/**
 * Move the signed-out profile into the account we just switched to.
 * Notes and code drafts are copied across, and the guest progress is dropped so
 * that a second account created on this device can't claim the same work.
 */
export function adoptGuestSession() {
  try {
    const guestSession = localStorage.getItem(SESSION_KEY)
    if (guestSession && !localStorage.getItem(sessionKey())) {
      localStorage.setItem(sessionKey(), guestSession)
    }
    localStorage.removeItem(PROGRESS_KEY)
    localStorage.removeItem(SESSION_KEY)
  } catch {
    /* ignore */
  }
}

/** Wipe the current scope's keys (used by "Reset everything"). */
export function clearScopedStorage() {
  try {
    localStorage.removeItem(progressKey())
    localStorage.removeItem(sessionKey())
  } catch {
    /* ignore */
  }
}

export const emptySession: SessionState = {
  version: 1,
  updatedAt: 0,
  drafts: {},
  quizDrafts: {},
  notes: {},
}

export function loadSession(): SessionState {
  return { ...emptySession, ...read<Partial<SessionState>>(sessionKey(), {}) } as SessionState
}

let saveTimer: ReturnType<typeof setTimeout> | null = null
export function saveSessionDebounced(s: SessionState) {
  if (saveTimer) clearTimeout(saveTimer)
  const key = sessionKey()
  saveTimer = setTimeout(() => {
    write(key, { ...s, updatedAt: Date.now() })
  }, 400)
}

export function todayKey(d = new Date()): string {
  return d.toISOString().slice(0, 10)
}

/** XP awards */
export const XP = {
  lessonComplete: 50,
  quizPerfect: 25,
  quizPass: 10,
  exercisePass: 20,
}
