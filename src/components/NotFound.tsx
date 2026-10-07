import { useMemo } from 'react'
import { allLessons, tracks } from '../curriculum'
import { Icon } from './Icon'

interface NotFoundProps {
  seed: string
  navigate: (v: string) => void
}

function pickRandomLesson() {
  if (allLessons.length === 0) return null
  return allLessons[Math.floor(Math.random() * allLessons.length)]
}

export function NotFound({ seed, navigate }: NotFoundProps) {
  const suggestion = useMemo(pickRandomLesson, [])

  return (
    <div className="page">
      <div className="not-found">
        <div className="not-found-code" aria-hidden="true">404</div>
        <h1>Page not found</h1>
        <p className="muted">
          That page doesn’t exist on PyLearn. It may have moved, or the address was typed wrong.
        </p>

        <div className="not-found-actions">
          <button className="btn primary big" onClick={() => navigate('dashboard')}>
            <Icon name="home" size={16} /> Back to dashboard
          </button>
          <button className="btn ghost" onClick={() => navigate('reference')}>
            <Icon name="search" size={16} /> Search lessons
          </button>
        </div>

        {suggestion ? (
          <div className="not-found-suggest">
            <p className="muted" style={{ margin: '0 0 6px' }}>Try a real lesson instead:</p>
            <button
              className="btn ghost"
              onClick={() => navigate(`lesson:${suggestion.id}`)}
            >
              <Icon name="book" size={16} /> {suggestion.title}
            </button>
          </div>
        ) : null}

        <div className="not-found-tracks">
          <p className="muted" style={{ margin: '0 0 8px' }}>Or pick a track:</p>
          <div className="not-found-track-list">
            {tracks.map((t) => (
              <button
                key={t.id}
                className="not-found-track"
                onClick={() => navigate(`track:${t.id}`)}
              >
                <span className="not-found-track-icon" style={{ color: t.accent }}>
                  <Icon name={t.icon} size={18} />
                </span>
                <span>{t.title}</span>
              </button>
            ))}
          </div>
        </div>

        <p className="muted not-found-meta">
          The address you tried:{' '}
          <code>/{seed}</code>
        </p>
      </div>
    </div>
  )
}
