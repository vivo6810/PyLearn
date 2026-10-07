import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import type { ProgressState, SessionState, Track } from '../types'
import {
  XP,
  adoptGuestSession,
  clearScopedStorage,
  defaultProgress,
  loadProgress,
  loadProgressFor,
  loadSession,
  saveProgress,
  saveSessionDebounced,
  setStorageScope,
  todayKey,
} from './storage'
import {
  fetchRemoteProgress,
  fetchSession,
  pushRemoteProgress,
  signIn as apiSignIn,
  signOut as apiSignOut,
  signUp as apiSignUp,
} from './auth'
import type { AuthUser } from './auth'
import { ACHIEVEMENTS } from '../achievements'

/** Set once the learner picks "continue without an account". */
const GUEST_KEY = 'pylearn.guest.v1'

interface Ctx {
  tracks: Track[]
  progress: ProgressState
  session: SessionState
  theme: 'light' | 'dark'
  toggleTheme: () => void
  lessonCompleted: (id: string) => boolean
  getLessonProgress: (id: string) => { completed: boolean; quizScore?: number; exerciseDone: string[] }
  completeLesson: (id: string) => void
  recordQuiz: (id: string, score: number, total: number) => void
  recordExercisePass: (id: string, idx: number) => void
  setDraft: (key: string, code: string) => void
  getDraft: (key: string) => string | undefined
  setQuizDraft: (lessonId: string, qIdx: number, choice: number) => void
  getQuizDraft: (lessonId: string) => Record<number, number> | undefined
  clearQuizDraft: (lessonId: string) => void
  setNote: (lessonId: string, text: string) => void
  getNote: (lessonId: string) => string | undefined
  setLastLesson: (id: string) => void
  resetAll: () => void
  toasts: Toast[]
  pushToast: (text: string, icon?: string) => void
  /** Account state. `authReady` is false until the API has been probed. */
  auth: AuthUser | null
  authReady: boolean
  /** False on a static-only deploy (no API): the app runs guest-only. */
  accountsEnabled: boolean
  guest: boolean
  signUp: (email: string, password: string, name: string) => Promise<void>
  signIn: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
  continueAsGuest: () => void
}

export interface Toast {
  id: number
  text: string
  icon?: string
}

const AppCtx = createContext<Ctx | null>(null)

export function useApp(): Ctx {
  const ctx = useContext(AppCtx)
  if (!ctx) throw new Error('useApp must be used inside AppProvider')
  return ctx
}

export function AppProvider({ tracks, children }: { tracks: Track[]; children: ReactNode }) {
  const [progress, setProgress] = useState<ProgressState>(() => loadProgress())
  const [session, setSession] = useState<SessionState>(() => loadSession())
  const [toasts, setToasts] = useState<Toast[]>([])
  const toastSeq = useRef(0)
  const [auth, setAuth] = useState<AuthUser | null>(null)
  const [authReady, setAuthReady] = useState(false)
  const [accountsEnabled, setAccountsEnabled] = useState(false)
  const [guest, setGuest] = useState(() => {
    try {
      return localStorage.getItem(GUEST_KEY) === '1'
    } catch {
      return false
    }
  })

  const pushToast = useCallback((text: string, icon?: string) => {
    const id = ++toastSeq.current
    setToasts((t) => [...t, { id, text, icon }])
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 4200)
  }, [])

  // ── theme ──
  const theme = progress.theme
  useEffect(() => {
    document.documentElement.dataset.theme = theme
  }, [theme])
  const toggleTheme = useCallback(() => {
    setProgress((p) => {
      const next = { ...p, theme: p.theme === 'dark' ? ('light' as const) : ('dark' as const) }
      saveProgress(next)
      pushRemoteProgress(next).catch(() => { /* offline */ })
      return next
    })
  }, [pushRemoteProgress])

  // ── streak bookkeeping on mount ──
  useEffect(() => {
    const today = todayKey()
    setProgress((p) => {
      if (p.lastActiveDay === today) return p
      const yesterday = todayKey(new Date(Date.now() - 86_400_000))
      const streak = p.lastActiveDay === yesterday ? p.streak + 1 : p.lastActiveDay ? 1 : 0
      const next = { ...p, lastActiveDay: today, streak }
      saveProgress(next)
      return next
    })
  }, [])

  // ── account session ──

  /** Point the app at an account's saved progress, adopting guest work if it's new. */
  const applyAccount = useCallback(async (user: AuthUser) => {
    // Scope first: loadProgress()/loadSession() below then read this account's cache.
    setStorageScope(`u${user.id}`)

    let remote: ProgressState | null = null
    try {
      remote = await fetchRemoteProgress()
    } catch {
      /* offline — fall back to the local cache below */
    }

    const remoteHasWork = !!remote && Object.keys(remote.lessons ?? {}).length > 0
    const cached = loadProgress()
    const cachedHasWork = Object.keys(cached.lessons).length > 0
    const guest = loadProgressFor(null)
    const guestHasWork = Object.keys(guest.lessons).length > 0

    let incoming: ProgressState
    let adoptedFromGuest = false
    if (remoteHasWork) {
      incoming = remote!
    } else if (cachedHasWork) {
      // Signed in here before but the upload never landed (offline) — keep the local copy.
      incoming = cached
    } else if (guestHasWork) {
      // A brand-new account claims the work done on this device first.
      incoming = guest
      adoptedFromGuest = true
    } else {
      incoming = defaultProgress
    }

    setSession(loadSession())
    setProgress((current) => {
      // Theme is really a per-device preference — keep what's on screen.
      const next = { ...defaultProgress, ...incoming, theme: current.theme }
      saveProgress(next)
      return next
    })
    // Only after the progress is safely stashed under the account's own key.
    if (adoptedFromGuest) adoptGuestSession()
    setAuth(user)
  }, [])

  // Probe the API once on boot. The session cookie is what lets a returning
  // learner land straight in their account; if there is no API at all (a
  // static-only deploy) the app simply stays on the guest profile.
  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const { available, user } = await fetchSession()
        if (cancelled) return
        setAccountsEnabled(available)
        if (available && user) await applyAccount(user)
      } finally {
        if (!cancelled) setAuthReady(true)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [applyAccount])

  // Mirror progress to the account's server record whenever it changes.
  useEffect(() => {
    if (!auth || !authReady) return
    const timer = setTimeout(() => {
      pushRemoteProgress(progress).catch(() => {
        /* offline — the local copy stays authoritative until the next change */
      })
    }, 900)
    return () => clearTimeout(timer)
  }, [progress, auth, authReady])

  const signUp = useCallback(
    async (email: string, password: string, name: string) => {
      const user = await apiSignUp({ email, password, name })
      await applyAccount(user)
    },
    [applyAccount],
  )

  const signIn = useCallback(
    async (email: string, password: string) => {
      const user = await apiSignIn({ email, password })
      await applyAccount(user)
    },
    [applyAccount],
  )

  const signOut = useCallback(async () => {
    try {
      // Save the final state while the session is still valid.
      await pushRemoteProgress(progress)
      await apiSignOut()
    } catch {
      /* still drop the local session below */
    }
    setStorageScope(null)
    setSession(loadSession())
    setProgress(loadProgress())
    setAuth(null)
  }, [progress])

  const continueAsGuest = useCallback(() => {
    try {
      localStorage.setItem(GUEST_KEY, '1')
    } catch {
      /* ignore */
    }
    setGuest(true)
  }, [])

  const mutate = useCallback((fn: (p: ProgressState) => ProgressState) => {
    setProgress((prev) => {
      const next = fn(prev)
      saveProgress(next)
      return next
    })
  }, [])

  const lessonCompleted = useCallback((id: string) => !!progress.lessons[id]?.completed, [progress])

  const getLessonProgress = useCallback(
    (id: string) => {
      const lp = progress.lessons[id]
      return { completed: !!lp?.completed, quizScore: lp?.quizScore, exerciseDone: lp?.exerciseDone ?? [] }
    },
    [progress],
  )

  const completeLesson = useCallback(
    (id: string) => {
      const already = !!progress.lessons[id]?.completed
      if (already) return
      mutate((p) => ({
        ...p,
        lessons: { ...p.lessons, [id]: { ...(p.lessons[id] ?? { completed: false }), completed: true } },
        xp: p.xp + XP.lessonComplete,
      }))
      pushToast(`Lesson complete! +${XP.lessonComplete} XP`, 'sparkles')
    },
    [progress, mutate, pushToast],
  )

  const recordQuiz = useCallback(
    (id: string, score: number, total: number) => {
      const ratio = total > 0 ? score / total : 0
      // Award XP only on the *first time* a learner reaches this score tier for this
      // quiz. Re-takes earn nothing for a tier already banked, so hitting "Score my quiz"
      // repeatedly never pays out twice.
      const prevBest = (p: ProgressState) => (p.lessons[id]?.quizScore ?? 0)

      mutate((p: ProgressState) => {
        const currentBest = prevBest(p)
        const newBest = Math.max(currentBest, ratio)
        const gained = newBest > currentBest
          ? (ratio >= 1 ? XP.quizPerfect : ratio >= 0.6 ? XP.quizPass : 0)
          : 0
        return {
          ...p,
          lessons: { ...p.lessons, [id]: { ...p.lessons[id], quizScore: newBest } },
          xp: p.xp + gained,
        }
      })
      if (ratio >= 1) pushToast(`Perfect quiz! +${XP.quizPerfect} XP`, 'brain')
    },
    [mutate, pushToast],
  )

  const recordExercisePass = useCallback(
    (id: string, idx: number) => {
      const done = progress.lessons[id]?.exerciseDone ?? []
      if (done.includes(String(idx))) return
      mutate((p) => {
        const lp = p.lessons[id] ?? { completed: false }
        return {
          ...p,
          lessons: { ...p.lessons, [id]: { ...lp, exerciseDone: [...(lp.exerciseDone ?? []), String(idx)] } },
          xp: p.xp + XP.exercisePass,
        }
      })
      pushToast(`Exercise passed! +${XP.exercisePass} XP`, 'check-circle')
    },
    [progress, mutate, pushToast],
  )

  // ── session (drafts, quiz answers, notes, last lesson) ──
  const setDraft = useCallback((key: string, code: string) => {
    setSession((s) => {
      const next = { ...s, drafts: { ...s.drafts, [key]: code } }
      saveSessionDebounced(next)
      return next
    })
  }, [])
  const getDraft = useCallback((key: string) => session.drafts[key], [session])

  const setQuizDraft = useCallback((lessonId: string, qIdx: number, choice: number) => {
    setSession((s) => {
      const cur = s.quizDrafts[lessonId] ?? {}
      const next = { ...s, quizDrafts: { ...s.quizDrafts, [lessonId]: { ...cur, [qIdx]: choice } } }
      saveSessionDebounced(next)
      return next
    })
  }, [])
  const getQuizDraft = useCallback((lessonId: string) => session.quizDrafts[lessonId], [session])

  const setNote = useCallback((lessonId: string, text: string) => {
    setSession((s) => {
      const next = { ...s, notes: { ...s.notes, [lessonId]: text } }
      saveSessionDebounced(next)
      return next
    })
  }, [])
  const getNote = useCallback((lessonId: string) => session.notes[lessonId], [session])

  const setLastLesson = useCallback((id: string) => {
    setSession((s) => {
      const next = { ...s, lastLesson: id }
      saveSessionDebounced(next)
      return next
    })
  }, [])

  /** wipe a lesson's saved quiz answers (used by Retake) */
  const clearQuizDraft = useCallback((lessonId: string) => {
    setSession((s) => {
      if (!(lessonId in s.quizDrafts)) return s
      const quizDrafts = { ...s.quizDrafts }
      delete quizDrafts[lessonId]
      const next = { ...s, quizDrafts }
      saveSessionDebounced(next)
      return next
    })
  }, [])

  // ── derived ──
  const allLessons = useMemo(() => tracks.flatMap((t) => t.modules.flatMap((m) => m.lessons)), [tracks])

  // achievements + certificates re-evaluate on every progress change
  useEffect(() => {
    const have = new Set(progress.achievements)
    const add: string[] = []
    const doneCount = allLessons.filter((l) => progress.lessons[l.id]?.completed).length
    const perfectQuizzes = Object.values(progress.lessons).filter((l) => ((l.quizScore ?? 0) - 1) > -1e-9 && ((l.quizScore ?? 0) - 1) < 1e-9).length

    if (progress.streak >= 3 && !have.has('streak-3')) add.push('streak-3')
    if (progress.streak >= 7 && !have.has('streak-7')) add.push('streak-7')
    if (progress.streak >= 30 && !have.has('streak-30')) add.push('streak-30')
    if (doneCount >= 1 && !have.has('first-lesson')) add.push('first-lesson')
    if (doneCount >= 10 && !have.has('ten-lessons')) add.push('ten-lessons')
    if (doneCount >= 50 && !have.has('fifty-lessons')) add.push('fifty-lessons')
    if (doneCount >= 100 && !have.has('centurion')) add.push('centurion')
    if (allLessons.length > 0 && doneCount === allLessons.length && !have.has('graduate')) add.push('graduate')
    if (perfectQuizzes >= 5 && !have.has('quiz-5')) add.push('quiz-5')
    if (perfectQuizzes >= 20 && !have.has('quiz-20')) add.push('quiz-20')

    for (const track of tracks) {
      const lessons = track.modules.flatMap((m) => m.lessons)
      if (lessons.length === 0) continue
      const allDone = lessons.every((l) => progress.lessons[l.id]?.completed)
      const cert = `track-${track.id}`
      if (allDone && !progress.certificates.includes(track.id)) {
        if (!have.has(cert) && !add.includes(cert)) add.push(cert)
      }
    }

    if (add.length > 0) {
      mutate((p) => ({
        ...p,
        achievements: [...p.achievements, ...add],
        certificates: [
          ...p.certificates,
          ...tracks.filter((t) => add.includes(`track-${t.id}`)).map((t) => t.id),
        ],
      }))
      for (const id of add) {
        const label = ACHIEVEMENTS[id]?.label ?? (id.startsWith('track-') ? `Certificate: ${id.slice(6)}` : id)
        pushToast(`Achievement unlocked — ${label}`, 'medal')
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [progress])

  const resetAll = useCallback(() => {
    clearScopedStorage()
    setProgress({ ...defaultProgress, theme: progress.theme })
    setSession({ version: 1, updatedAt: 0, drafts: {}, quizDrafts: {}, notes: {} })
  }, [progress.theme])

  const value: Ctx = {
    tracks,
    progress,
    session,
    theme,
    toggleTheme,
    lessonCompleted,
    getLessonProgress,
    completeLesson,
    recordQuiz,
    recordExercisePass,
    setDraft,
    getDraft,
    setQuizDraft,
    getQuizDraft,
    clearQuizDraft,
    setNote,
    getNote,
    setLastLesson,
    resetAll,
    toasts,
    pushToast,
    auth,
    authReady,
    accountsEnabled,
    guest,
    signUp,
    signIn,
    signOut,
    continueAsGuest,
  }

  return <AppCtx.Provider value={value}>{children}</AppCtx.Provider>
}

export function levelFromXp(xp: number): { level: number; into: number; need: number } {
  let level = 1
  let need = 250
  let rest = xp
  while (rest >= need) {
    rest -= need
    level++
    need = 250 + (level - 1) * 50
  }
  return { level, into: rest, need }
}
