import { useEffect, useState } from 'react'
import { useApp } from '../state/AppContext'
import { tracks } from '../curriculum'
import { Certificate } from './Certificate'
import { FAQ } from './FAQ'
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

      <FAQ items={trackFaq(track)} />
    </div>
  )
}

function trackFaq(_track: typeof tracks[number]) {
  return [
    {
      q: 'Do I have to finish the lessons in order?',
      a: 'No. Each lesson is usable on its own, but the modules are ordered so the ideas build on each other. If you are new to Python, starting at the top of the track is the smoothest path.',
    },
    {
      q: 'How long does a lesson take?',
      a: 'Each lesson shows an approximate time in minutes. A lesson usually includes a short reading, a worked example you can run and edit, a quiz and one or more graded exercises.',
    },
    {
      q: 'What happens when I mark a lesson complete?',
      a: 'Your progress, quiz scores and exercise results are saved on this device and, if you are signed in, synced to your account. Completing a lesson also awards XP and can unlock achievements.',
    },
    {
      q: 'Can I use this on my phone?',
      a: 'Yes. The course is designed mobile-first, so you can learn on the bus, in a queue or anywhere else. Code examples run in your browser, so there is nothing to install.',
    },
    {
      q: 'Where do the lessons come from?',
      a: 'The curriculum is built from real Python books (Halterman, Sweigart, Klein and others) and structured into a 3-month path. Each lesson lists its source in the header.',
    },
    {
      q: 'How do I get a certificate?',
      a: 'Finish every lesson in a track. When you do, the track certificate appears on the track page and in Settings.',
    },
  ]
}

