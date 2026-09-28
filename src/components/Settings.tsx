import { useState } from 'react'
import { useApp } from '../state/AppContext'
import { tracks } from '../curriculum'
import { Icon } from './Icon'

export function Settings({ navigate }: { navigate: (v: string) => void }) {
  const { progress, resetAll, auth, guest, accountsEnabled, signOut } = useApp()
  const [signingOut, setSigningOut] = useState(false)

  async function handleSignOut() {
    setSigningOut(true)
    await signOut()
    setSigningOut(false)
    navigate('auth')
  }

  function exportData() {
    const data = {
      progress: localStorage.getItem('pylearn.progress.v1'),
      session: localStorage.getItem('pylearn.session.v1'),
    }
    const blob = new Blob([JSON.stringify(data)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `pylearn-backup-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  function importData(file: File) {
    const reader = new FileReader()
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result))
        if (parsed.progress) localStorage.setItem('pylearn.progress.v1', parsed.progress)
        if (parsed.session) localStorage.setItem('pylearn.session.v1', parsed.session)
        location.reload()
      } catch {
        alert('Not a valid PyLearn backup file.')
      }
    }
    reader.readAsText(file)
  }

  const certTracks = tracks.filter((t) => progress.certificates.includes(t.id))

  return (
    <div className="page">
      <h1>
        <Icon name="gear" size={22} /> Settings
      </h1>

      <section className="settings-sec">
        <h2>
          <Icon name="lock" size={18} /> Account
        </h2>
        {auth ? (
          <>
            <p className="muted">
              Signed in as <strong>{auth.name}</strong> ({auth.email}). Your XP, lessons and certificates are saved to
              this account and follow you to any browser.
            </p>
            <div className="settings-actions">
              <button className="btn ghost" onClick={handleSignOut} disabled={signingOut}>
                <Icon name="lock" size={15} /> {signingOut ? 'Signing out…' : 'Sign out'}
              </button>
            </div>
          </>
        ) : accountsEnabled ? (
          <>
            <p className="muted">
              {guest
                ? "You're using PyLearn without an account, so your progress is stored only in this browser."
                : 'No account is signed in on this device.'}
            </p>
            <div className="settings-actions">
              <button className="btn primary" onClick={() => navigate('auth')}>
                <Icon name="lock" size={15} /> Create an account or sign in
              </button>
            </div>
          </>
        ) : (
          <p className="muted">
            This deployment runs without accounts yet, so your progress, XP and certificates are saved in this browser
            only. Clearing site data will lose them — use the backup tools below to keep a copy.
          </p>
        )}
      </section>

      <section className="settings-sec">
        <h2>
          <Icon name="grad" size={18} /> Certificates earned ({certTracks.length})
        </h2>
        {certTracks.length === 0 && <p className="muted">Complete every lesson in a track to earn its certificate.</p>}
        <ul className="cert-list">
          {certTracks.map((t) => (
            <li key={t.id}>
              <Icon name="trophy" size={15} /> {t.title}
            </li>
          ))}
        </ul>
      </section>

      <section className="settings-sec">
        <h2>
          <Icon name="save" size={18} /> Your data
        </h2>
        <p className="muted">
          {auth
            ? 'Your account holds your progress, but notes and code drafts stay in this browser. Back them up to move them to another device.'
            : 'Progress, notes, and drafts live in this browser. Back them up or move them to another device.'}
        </p>
        <div className="settings-actions">
          <button className="btn ghost" onClick={exportData}>
            <Icon name="download" size={15} /> Export backup
          </button>
          <label className="btn ghost file-btn">
            <Icon name="upload" size={15} /> Import backup
            <input
              type="file"
              accept="application/json"
              style={{ display: 'none' }}
              onChange={(e) => e.target.files?.[0] && importData(e.target.files[0])}
            />
          </label>
        </div>
      </section>

      <section className="settings-sec">
        <h2 className="danger-title">
          <Icon name="alert" size={18} /> Danger zone
        </h2>
        <p className="muted">
          {auth
            ? 'Wipes progress, XP, achievements, notes, and saved code for this account.'
            : 'Wipes progress, XP, achievements, notes, and saved code on this device.'}
        </p>
        <button
          className="btn ghost danger"
          onClick={() => {
            if (confirm('Really reset ALL progress? This cannot be undone.')) resetAll()
          }}
        >
          Reset everything
        </button>
      </section>

      <button className="btn ghost" onClick={() => navigate('dashboard')}>
        ← Dashboard
      </button>
    </div>
  )
}
