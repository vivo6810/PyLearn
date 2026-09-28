import { useState } from 'react'
import type { FormEvent } from 'react'
import { useApp } from '../state/AppContext'
import { ApiError } from '../state/auth'
import { guestHasProgress } from '../state/storage'
import { Icon } from './Icon'
import { Logo } from './Logo'

type Mode = 'signin' | 'signup'

export function Auth() {
  const { signIn, signUp, continueAsGuest } = useApp()
  const [mode, setMode] = useState<Mode>('signin')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  // Adopting only applies when creating an account — signing in loads the
  // account's own saved progress instead.
  const adopting = mode === 'signup' && guestHasProgress()
  const isSignup = mode === 'signup'

  async function submit(event: FormEvent) {
    event.preventDefault()
    if (busy) return
    setError(null)
    setBusy(true)
    try {
      if (isSignup) await signUp(email, password, name)
      else await signIn(email, password)
      // On success the app switches view and this component unmounts, so the
      // button deliberately stays in its busy state instead of flickering.
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Something went wrong. Please try again.')
      setBusy(false)
    }
  }

  function switchMode(next: Mode) {
    if (busy) return
    setMode(next)
    setError(null)
  }

  return (
    <div className="auth-wrap">
      <div className="auth-card">
        <div className="auth-brand">
          <Logo size={32} />
          <span>PyLearn</span>
        </div>

        <h1>{isSignup ? 'Create your account' : 'Welcome back'}</h1>
        <p className="muted auth-lede">
          {isSignup
            ? 'One account keeps your XP, streak and certificates — you only do this once.'
            : 'Sign in to pick up your lessons, XP and certificates where you left off.'}
        </p>

        <div className="auth-tabs" role="tablist" aria-label="Sign in or create an account">
          <button
            type="button"
            role="tab"
            aria-selected={!isSignup}
            className={'auth-tab' + (!isSignup ? ' active' : '')}
            onClick={() => switchMode('signin')}
          >
            Sign in
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={isSignup}
            className={'auth-tab' + (isSignup ? ' active' : '')}
            onClick={() => switchMode('signup')}
          >
            Create account
          </button>
        </div>

        <form className="auth-form" onSubmit={submit} noValidate>
          {isSignup && (
            <label className="field">
              <span>
                Name <em className="muted">(optional)</em>
              </span>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoComplete="name"
                placeholder="Ada"
                maxLength={60}
                disabled={busy}
              />
            </label>
          )}

          <label className="field">
            <span>Email</span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              placeholder="you@example.com"
              required
              disabled={busy}
            />
          </label>

          <label className="field">
            <span>Password</span>
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete={isSignup ? 'new-password' : 'current-password'}
              placeholder={isSignup ? 'at least 8 characters' : '••••••••'}
              required
              minLength={8}
              disabled={busy}
            />
          </label>

          <button type="button" className="link auth-reveal" onClick={() => setShowPassword((v) => !v)}>
            {showPassword ? 'Hide password' : 'Show password'}
          </button>

          {error && (
            <div className="auth-error" role="alert">
              <Icon name="alert" size={15} /> {error}
            </div>
          )}

          {adopting && (
            <div className="auth-note">
              <Icon name="sparkles" size={15} /> The progress on this device moves into your new account.
            </div>
          )}

          <button className="btn primary big auth-submit" type="submit" disabled={busy}>
            <Icon name="lock" size={15} />
            {busy ? (isSignup ? 'Creating account…' : 'Signing in…') : isSignup ? 'Create account' : 'Sign in'}
          </button>
        </form>

        <button className="btn ghost auth-guest" type="button" onClick={continueAsGuest} disabled={busy}>
          Continue without an account
        </button>
        <p className="muted auth-foot">
          Without an account your progress stays in this browser only — clearing site data loses it.
        </p>
      </div>
    </div>
  )
}
