import { useMemo, useState } from 'react'
import { useApp, levelFromXp } from '../state/AppContext'
import { tracks, allLessons, totalMinutes, upcomingTracks } from '../curriculum'
import { findLesson } from '../curriculum'
import { ACHIEVEMENTS } from '../achievements'
import { Icon } from './Icon'

function AchievementsModal({ onClose }: { onClose: () => void }) {
  const { progress } = useApp()
  const earned = new Set(progress.achievements)
  const trackCerts = tracks.filter((t) => progress.certificates.includes(t.id))
  const earnedCount = progress.achievements.length
  const total = Object.keys(ACHIEVEMENTS).length + tracks.length

  return (
    <div className="modal" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <h2>
            <Icon name="medal" size={20} /> Achievements
          </h2>
          <span className="muted ach-score">
            {earnedCount}/{total} earned
          </span>
          <button className="btn ghost modal-close" onClick={onClose} aria-label="Close">
            <Icon name="x" size={16} />
          </button>
        </div>
        <p className="muted modal-sub">Certificates from finishing whole tracks count too.</p>
        <div className="ach-grid">
          {Object.entries(ACHIEVEMENTS).map(([id, a]) => (
            <div key={id} className={'ach' + (earned.has(id) ? ' earned' : '')} title={a.hint}>
              <span className="ach-icon">
                <Icon name={a.icon} size={24} />
              </span>
              <span className="ach-label">{a.label}</span>
              <span className="ach-hint">{a.hint}</span>
            </div>
          ))}
          {tracks.map((t) => {
            const has = trackCerts.includes(t)
            return (
              <div key={t.id} className={'ach' + (has ? ' earned' : '')} title={`Finish every lesson in ${t.title}`}>
                <span className="ach-icon" style={{ color: has ? t.accent : undefined }}>
                  <Icon name="trophy" size={24} />
                </span>
                <span className="ach-label">{t.title}</span>
                <span className="ach-hint">complete the track</span>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export function Dashboard({ navigate }: { navigate: (v: string) => void }) {
  const { progress, session } = useApp()
  const [showAch, setShowAch] = useState(false)
  const doneIds = useMemo(
    () => new Set(Object.entries(progress.lessons).filter(([, l]) => l.completed).map(([id]) => id)),
    [progress],
  )
  const doneCount = doneIds.size
  const doneMinutes = allLessons.filter((l) => doneIds.has(l.id)).reduce((a, l) => a + l.minutes, 0)
  const pct = allLessons.length ? Math.round((doneCount / allLessons.length) * 100) : 0
  const { level, into, need } = levelFromXp(progress.xp)

  const resume = session.lastLesson ? findLesson(session.lastLesson) : null
  const resumedDone = resume ? doneIds.has(resume.lesson.id) : false

  const hoursLeft = Math.max(0, Math.round((totalMinutes - doneMinutes) / 60))

  return (
    <div className="page">
      <section className="hero">
        <h1>Master Python</h1>
        <p>
          {allLessons.length} deep lessons · ~{Math.round(totalMinutes / 60)} h of material · 3 months at 3 h/day ·
          structured from your own coursebooks.
        </p>
        <div className="hero-actions">
          <button
            className="btn primary big"
            onClick={() => {
              if (resumedDone || !resume) {
                const firstUndone = allLessons.find((l) => !doneIds.has(l.id))
                navigate(firstUndone ? `lesson:${firstUndone.id}` : 'tracks')
              } else {
                navigate(`lesson:${resume.lesson.id}`)
              }
            }}
          >
            {resumedDone || !resume ? 'Start learning' : `Continue: ${resume.lesson.title}`}
          </button>
          <button className="btn ghost" onClick={() => navigate('playground')}>
            <Icon name="flask" size={16} /> Playground
          </button>
        </div>
        {resume && !resumedDone && (
          <p className="resume-note">
            Picking up where you left off — your code and quiz answers are saved.
          </p>
        )}
      </section>

      <section className="stats">
        <div className="stat">
          <span className="stat-num">Lvl {level}</span>
          <span className="stat-sub">
            {into}/{need} XP
          </span>
          <div className="bar">
            <div className="bar-fill" style={{ width: `${(into / need) * 100}%` }} />
          </div>
          <span className="stat-sub">{progress.xp} XP total</span>
        </div>
        <button className="stat stat-btn" onClick={() => setShowAch(true)} title="View your achievements">
          <span className="stat-num stat-streak">
            {progress.streak} <Icon name="flame" size={20} className="flame-icon" />
          </span>
          <span className="stat-sub">day streak</span>
          <span className="stat-ach-cta">
            <Icon name="medal" size={14} /> {progress.achievements.length} achievements
          </span>
        </button>
        <div className="stat">
          <span className="stat-num">{pct}%</span>
          <span className="stat-sub">
            {doneCount}/{allLessons.length} lessons
          </span>
          <div className="bar">
            <div className="bar-fill" style={{ width: `${pct}%` }} />
          </div>
          <span className="stat-sub">≈{hoursLeft} h remaining</span>
        </div>
      </section>

      <h2 className="sec-title">Your tracks</h2>
      <div className="track-grid">
        {tracks.map((t) => {
          const lessons = t.modules.flatMap((m) => m.lessons)
          const done = lessons.filter((l) => doneIds.has(l.id)).length
          const tp = lessons.length ? Math.round((done / lessons.length) * 100) : 0
          const locked = false
          return (
            <button
              key={t.id}
              className="track-card"
              style={{ '--accent': t.accent } as React.CSSProperties}
              onClick={() => navigate(`track:${t.id}`)}
            >
              <span className="track-icon" style={{ color: t.accent }}>
                <Icon name={t.icon} size={26} />
              </span>
              <span className="track-name">{t.title}</span>
              <span className="track-blurb">{t.blurb}</span>
              <div className="bar">
                <div className="bar-fill" style={{ width: `${tp}%`, background: t.accent }} />
              </div>
              <span className="track-count">
                {done}/{lessons.length} lessons
                {progress.certificates.includes(t.id) && (
                  <span className="count-trophy" title="Certificate earned">
                    <Icon name="trophy" size={14} />
                  </span>
                )}
              </span>
              {locked && (
                <span className="lock">
                  <Icon name="lock" size={14} />
                </span>
              )}
            </button>
          )
        })}
      </div>

      <h2 className="sec-title">Achievements</h2>
      <div style={{ marginBottom: 10 }}>
        {upcomingTracks.map((u) => (
          <span key={u.id} className="muted upcoming-note" style={{ fontSize: '0.85rem' }}>
            <Icon name={u.icon} size={15} /> {u.title} — {u.note}
          </span>
        ))}
      </div>
      <button className="btn ghost ach-open-btn" onClick={() => setShowAch(true)}>
        <Icon name="medal" size={16} /> View all achievements
        <span className="muted">
          ({progress.achievements.length} earned)
        </span>
      </button>

      {showAch && <AchievementsModal onClose={() => setShowAch(false)} />}
    </div>
  )
}
