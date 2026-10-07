import { useEffect, useState } from 'react'
import { useApp } from '../state/AppContext'
import { tracks } from '../curriculum'
import { Certificate } from './Certificate'
import { Icon } from './Icon'

export function TrackView({ trackId, navigate }: { trackId: string; navigate: (v: string) => void }) {
  const { lessonCompleted } = useApp()
  const track = tracks.find((t) => t.id === trackId)
  const [openCert, setOpenCert] = useState(false)
  if (!track) {
    return (
      <div className="page">
        <p>Track not found.</p>
        <button className="btn primary" onClick={() => navigate('dashboard')}>← Dashboard</button>
      </div>
    )
  }

  useEffect(() => {
    if (openCert) setOpenCert(false)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trackId])
  const lessons = track.modules.flatMap((m) => m.lessons)
  const done = lessons.filter((l) => lessonCompleted(l.id)).length
  const allDone = lessons.length > 0 && done === lessons.length

  return (
    <div className="page">
      <button className="link" onClick={() => navigate('dashboard')}>← Dashboard</button>
      <header className="track-head">
        <span className="track-icon big" style={{ color: track.accent }}>
          <Icon name={track.icon} size={30} />
        </span>
        <div>
          <h1>{track.title}</h1>
          <p>{track.blurb}</p>
          <p className="track-progress">
            {done}/{lessons.length} lessons complete
            {allDone && (
              <>
                {' · '}
                <button className="link" onClick={() => setOpenCert(true)}>
                  view certificate <Icon name="trophy" size={14} />
                </button>
              </>
            )}
          </p>
        </div>
      </header>

      {track.modules.map((mod) => (
        <section key={mod.id} className="module">
          <h2>{mod.title}</h2>
          <p className="module-summary">{mod.summary}</p>
          <ol className="lesson-list">
            {mod.lessons.map((l) => {
              const isDone = lessonCompleted(l.id)
              return (
                <li key={l.id}>
                  <button className={'lesson-row' + (isDone ? ' done' : '')} onClick={() => navigate(`lesson:${l.id}`)}>
                    <span className={'lesson-row-check' + (isDone ? ' done' : '')}>
                      <Icon name={isDone ? 'check-circle' : 'circle'} size={18} />
                    </span>
                    <span className="lesson-row-title">
                      {l.title}
                      <small> · ~{l.minutes} min</small>
                    </span>
                    <span className="lesson-row-go">→</span>
                  </button>
                </li>
              )
            })}
          </ol>
        </section>
      ))}

      {openCert && <Certificate track={track} onClose={() => setOpenCert(false)} />}
    </div>
  )
}
