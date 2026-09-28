import { useEffect, useState } from 'react'
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
import { Icon } from './components/Icon'
import { Logo } from './components/Logo'
import { preloadPython } from './pyodide/runner'

type View =
  | 'landing'
  | 'auth'
  | 'dashboard'
  | 'playground'
  | 'reference'
  | 'settings'
  | `track:${string}`
  | `lesson:${string}`

/** Views that need an account (or an explicit guest choice). */
const PROTECTED = ['dashboard', 'reference', 'settings', 'playground', 'track', 'lesson']

function parseHash(): View {
  const h = location.hash.replace(/^#\/?/, '')
  if (h.startsWith('track:') || h.startsWith('lesson:')) return h as View
  if (['landing', 'auth', 'dashboard', 'playground', 'reference', 'settings'].includes(h)) return h as View
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
  const { theme, toggleTheme, toasts, auth, authReady, guest } = useApp()

  useEffect(() => {
    const onHash = () => setView(parseHash())
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])

  function navigate(v: string) {
    location.hash = '/' + v
    setView(v as View)
  }

  // Signing in *from* the #/auth route has to leave that route behind,
  // otherwise the gate would keep rendering on top of the signed-in app.
  useEffect(() => {
    if (auth && view === 'auth') {
      location.hash = '/dashboard'
      setView('dashboard')
    }
  }, [auth, view])

  const root = view.split(':')[0]
  // The session cookie is checked once on boot; until then we don't know which
  // profile to show, so render a brief splash rather than flashing the wrong one.
  const checkingSession = !authReady
  const needsAuth = authReady && !auth && !guest && PROTECTED.includes(root)
  const showAuth = needsAuth || (root === 'auth' && !auth)

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
      {!showAuth && (
        <header className="topbar">
          <button className="brand" onClick={() => navigate('dashboard')}>
            <Logo size={26} /> PyLearn
          </button>
          <nav className="topnav">
            <button className={'toplink' + (root === 'reference' ? ' active' : '')} onClick={() => navigate('reference')}>
              <Icon name="search" size={16} /> Search
            </button>
            <button className={'toplink' + (root === 'playground' ? ' active' : '')} onClick={() => navigate('playground')}>
              <Icon name="flask" size={16} /> Playground
            </button>
            <button className={'toplink' + (root === 'settings' ? ' active' : '')} onClick={() => navigate('settings')} title="Settings">
              <Icon name="gear" size={16} />
            </button>
            {auth ? (
              <button className="toplink account-btn" onClick={() => navigate('settings')} title={`${auth.name} — account settings`}>
                <span className="avatar">{initials(auth.name)}</span>
                <span className="account-name">{auth.name}</span>
              </button>
            ) : (
              <button className="toplink" onClick={() => navigate('auth')} title="Sign in">
                <Icon name="lock" size={16} /> Sign in
              </button>
            )}
            <button className="toplink" onClick={toggleTheme} title="Toggle theme">
              <Icon name={theme === 'dark' ? 'sun' : 'moon'} size={16} />
            </button>
          </nav>
        </header>
      )}

      <main className={showAuth ? 'main main-auth' : root === 'landing' ? 'main main-landing' : 'main'}>
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
