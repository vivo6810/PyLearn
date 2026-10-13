import { useEffect, useRef, useState } from 'react'
import { AppProvider, useApp } from './state/AppContext'
import { tracks } from './curriculum'
import { Dashboard } from './components/Dashboard'
import { TrackView } from './components/TrackView'
import { LessonView } from './components/LessonView'
import { Playground } from './components/Playground'
import { Reference } from './components/Reference'
import { Settings } from './components/Settings'
import { Landing } from './components/Landing'
import { Auth } from './components/Auth'
import { NotFound } from './components/NotFound'
import { Icon } from './components/Icon'
import { Logo } from './components/Logo'
import { DotGrid } from './components/DotGrid'
import { ScrollProgress } from './components/ScrollProgress'
import { preloadPython } from './pyodide/runner'
import { useHead } from './useHead'
import { ThemeSwitch, type ThemeSwitchHandle } from './components/ThemeSwitch'

export type View =
  | 'landing'
  | 'auth'
  | 'dashboard'
  | 'playground'
  | 'reference'
  | 'settings'
  | 'not-found'
  | `track:${string}`
  | `lesson:${string}`

/** Views that need an account (or an explicit guest choice). */
const PROTECTED = ['dashboard', 'reference', 'settings', 'playground', 'track', 'lesson']

function parseHash(): View {
  const h = location.hash.replace(/^#\/?/, '')
  if (h.startsWith('track:') || h.startsWith('lesson:')) return h as View
  if (['landing', 'auth', 'dashboard', 'playground', 'reference', 'settings', 'not-found'].includes(h)) return h as View
  // a returning learner with progress skips the landing page
  try {
    const p = JSON.parse(localStorage.getItem('pylearn.progress.v1') ?? '{}')
    if (Object.keys(p.lessons ?? {}).length > 0) return 'dashboard'
  } catch {
    /* fresh visitor */
  }
  return 'landing'
}

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return '?'
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

function Shell() {
  const [view, setView] = useState<View>(parseHash)
  const { theme, toggleTheme, toasts, auth, authReady, accountsEnabled, guest } = useApp()
  const themeRef = useRef<ThemeSwitchHandle>(null)

  // Flip the theme through the pixel dissolve instead of instantly.
  const swapTheme = () => themeRef.current?.play(toggleTheme)

  // Top-nav FAQ shortcut: make sure the landing page is up, then scroll to it
  // (twice — once for the scroll, again in case the section is still settling).
  const goFaq = () => {
    if (view !== 'landing') navigate('landing')
    const jump = () => document.getElementById('faq')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    window.setTimeout(jump, 160)
    window.setTimeout(jump, 900)
  }

  function navigate(v: string) {
    location.hash = '/' + v
    setView(v as View)
  }

  useHead(view, auth?.name ?? null, navigate)

  useEffect(() => {
    const onHash = () => setView(parseHash())
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])

  // Publish the sticky topbar height so CSS can size the playground IDE to
  // exactly the remaining viewport (the bar hides on the auth screen).
  useEffect(() => {
    const setTopH = () => {
      const h = document.querySelector('.topbar')?.getBoundingClientRect().height ?? 56
      document.documentElement.style.setProperty('--top-h', `${Math.round(h)}px`)
    }
    setTopH()
    window.addEventListener('resize', setTopH)
    return () => window.removeEventListener('resize', setTopH)
  }, [view])

  // If the boot splash is still showing on reload but we already have a cached
  // account, skip straight to the app so the splash can't get stuck.
  useEffect(() => {
    if (!authReady) return
    if (checkingSession) return
    if (!auth && accountsEnabled && view === 'auth') {
      // no cookie, no guest accept — show the sign-in form
      return
    }
    if (authReady && auth && view === 'auth') {
      // signed in while on the auth page (e.g. reload) — leave it behind
      location.hash = '/dashboard'
      setView('dashboard')
    }
  }, [auth, view, authReady, accountsEnabled])

  const root = view.split(':')[0]
  // The session cookie is checked once on boot; until then we don't know which
  // profile to show, so render a brief splash rather than flashing the wrong one.
  const checkingSession = !authReady
  // Gating only makes sense when an account API actually exists.
  const needsAuth = accountsEnabled && authReady && !auth && !guest && PROTECTED.includes(root)
  const showAuth = needsAuth || (accountsEnabled && root === 'auth' && !auth)

  if (checkingSession) {
    return (
      <div className="boot">
        <Logo size={36} />
        <span className="muted">Loading your account…</span>
      </div>
    )
  }

  return (
    <div className="app">
      <a
        className="skip-link"
        href="#/"
        onClick={(e) => {
          e.preventDefault()
          const main = document.getElementById('main-content')
          main?.setAttribute('tabindex', '-1')
          main?.focus({ preventScroll: false })
          main?.scrollIntoView({ behavior: 'smooth' })
        }}
      >
        Skip to content
      </a>
      <DotGrid />
      {root === 'landing' && <ScrollProgress />}
      {!showAuth && (
        <header className="topbar">
          <button className="brand" onClick={() => navigate('dashboard')}>
            <Logo size={26} /> PyLearn
          </button>
          <nav className="topnav">
            <button className={'toplink' + (root === 'reference' ? ' active' : '')} onClick={() => navigate('reference')} aria-label="Search">
              <Icon name="search" size={16} /> <span className="toplink-label">Search</span>
            </button>
            <button className={'toplink' + (root === 'playground' ? ' active' : '')} onClick={() => navigate('playground')} aria-label="Playground">
              <Icon name="flask" size={16} /> <span className="toplink-label">Playground</span>
            </button>
            <button className="toplink" onClick={goFaq} title="Frequently asked questions" aria-label="Frequently asked questions">
              <Icon name="help" size={16} /> <span className="toplink-label">FAQ</span>
            </button>
            <button className={'toplink' + (root === 'settings' ? ' active' : '')} onClick={() => navigate('settings')} title="Settings" aria-label="Settings">
              <Icon name="gear" size={16} />
            </button>
            {auth ? (
              <button className="toplink account-btn" onClick={() => navigate('settings')} title={`${auth.name} — account settings`} aria-label={`${auth.name} — account settings`}>
                <span className="avatar">{initials(auth.name)}</span>
                <span className="account-name">{auth.name}</span>
              </button>
            ) : accountsEnabled ? (
              <button className="toplink" onClick={() => navigate('auth')} title="Sign in" aria-label="Sign in">
                <Icon name="lock" size={16} /> <span className="toplink-label">Sign in</span>
              </button>
            ) : null}
            <button className="toplink" onClick={swapTheme} title="Toggle theme" aria-label="Toggle theme">
              <Icon name={theme === 'dark' ? 'sun' : 'moon'} size={16} />
            </button>
          </nav>
        </header>
      )}

      <main
        id="main-content"
        className={
          showAuth
            ? 'main main-auth'
            : root === 'landing'
              ? 'main main-landing'
              : root === 'playground'
                ? 'main main-playground'
                : 'main'
        }
      >
        {showAuth && <Auth />}
        {!showAuth && root === 'landing' && (
          <Landing
            navigate={navigate}
            onStart={() => {
              preloadPython()
              navigate('dashboard')
            }}
          />
        )}
        {!showAuth && root === 'dashboard' && <Dashboard navigate={navigate} />}
        {!showAuth && root === 'playground' && <Playground navigate={navigate} />}
        {!showAuth && root === 'reference' && <Reference navigate={navigate} />}
        {!showAuth && root === 'settings' && <Settings navigate={navigate} />}
        {!showAuth && root === 'track' && <TrackView trackId={view.split(':')[1]} navigate={navigate} />}
        {!showAuth && root === 'lesson' && (
          <LessonView key={view.split(':')[1]} id={view.split(':')[1]} navigate={navigate} />
        )}
        {!showAuth && root === 'not-found' && <NotFound seed={view} navigate={navigate} />}
      </main>

      <nav className="tabbar" style={showAuth || root === 'landing' ? { display: 'none' } : undefined}>
        <button className={'tab' + (root === 'dashboard' ? ' active' : '')} onClick={() => navigate('dashboard')}>
          <Icon name="home" size={20} /><span>Courses</span>
        </button>
        <button className={'tab' + (root === 'reference' ? ' active' : '')} onClick={() => navigate('reference')}>
          <Icon name="search" size={20} /><span>Search</span>
        </button>
        <button className={'tab' + (root === 'playground' ? ' active' : '')} onClick={() => navigate('playground')}>
          <Icon name="flask" size={20} /><span>Play</span>
        </button>
        <button className={'tab' + (root === 'settings' ? ' active' : '')} onClick={() => navigate('settings')}>
          <Icon name="gear" size={20} /><span>Settings</span>
        </button>
      </nav>

      <div className="toasts">
        {toasts.map((t) => (
          <div key={t.id} className="toast">
            {t.icon && <Icon name={t.icon} size={16} className="toast-icon" />} {t.text}
          </div>
        ))}
      </div>

      <ThemeSwitch ref={themeRef} />
    </div>
  )
}

export default function App() {
  return (
    <AppProvider tracks={tracks}>
      <Shell />
    </AppProvider>
  )
}
