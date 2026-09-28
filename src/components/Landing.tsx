import { Reveal } from './Reveal'
import { Appear } from './Appear'
import { Icon } from './Icon'
import { Parallax } from './Parallax'
import { ExplodedProgram } from './ExplodedProgram'
import { tracks, allLessons, totalMinutes } from '../curriculum'
import { upcomingTracks } from '../curriculum'

/** faint code glyphs floating behind the hero at different depths */
const HERO_GLYPHS = [
  { ch: 'def', x: '8%', y: '18%', size: 22, depth: 0.22, opacity: 0.16 },
  { ch: 'lambda', x: '78%', y: '12%', size: 20, depth: 0.1, opacity: 0.14 },
  { ch: 'for', x: '14%', y: '68%', size: 26, depth: 0.3, opacity: 0.12 },
  { ch: '[ ]', x: '86%', y: '60%', size: 24, depth: 0.16, opacity: 0.15 },
  { ch: '=>', x: '68%', y: '82%', size: 20, depth: 0.26, opacity: 0.1 },
  { ch: 'print', x: '30%', y: '8%', size: 18, depth: 0.12, opacity: 0.1 },
]

export function Landing({ navigate, onStart }: { navigate: (v: string) => void; onStart: () => void }) {
  return (
    <div className="landing">
      {/* ── hero ── */}
      <section className="hero-landing">
        <div className="hero-glow" aria-hidden="true" />
        {/* parallax glyph field behind the copy */}
        <div className="hero-glyphs" aria-hidden="true">
          {HERO_GLYPHS.map((g, i) => (
            <Parallax key={i} speed={g.depth} className="hero-glyph-slot" style={{ left: g.x, top: g.y }}>
              <span className="hero-glyph" style={{ fontSize: g.size, opacity: g.opacity }}>
                {g.ch}
              </span>
            </Parallax>
          ))}
        </div>
        <Parallax speed={-0.06} className="hero-copy">
          <Appear variant="soft" delay={0.05}>
            <p className="hero-kicker">
              beginner → advanced · from your own coursebooks
            </p>
          </Appear>
          {/* headline lines wipe up out of a masked box, staggered */}
          <span className="wipe-mask">
            <Appear variant="wipe" delay={0.14} duration={0.95}>
              <h1 className="hero-title">
                Learn Python by <span className="grad">breaking</span>
              </h1>
            </Appear>
          </span>
          <span className="wipe-mask">
            <Appear variant="wipe" delay={0.24} duration={0.95}>
              <h1 className="hero-title">
                <span className="grad">it apart</span>
              </h1>
            </Appear>
          </span>
          <Appear variant="soft" delay={0.42}>
            <p className="hero-sub">
              {allLessons.length} deep lessons · ~{Math.round(totalMinutes / 60)} hours · real Python running in your
              browser. No installs, no setup — scroll on to see what a program is made of.
            </p>
          </Appear>
          <Appear variant="btn" delay={0.55}>
            <div className="hero-cta">
              <button className="btn primary big" onClick={onStart}>
                Start learning →
              </button>
              <button className="btn ghost big" onClick={() => document.getElementById('exploded')?.scrollIntoView({ behavior: 'smooth' })}>
                See inside a program ↓
              </button>
            </div>
          </Appear>
        </Parallax>
        <div className="hero-stats" aria-hidden="true">
          <Reveal delay={320}>
            <div className="hstat"><strong>{tracks.length}</strong><span>tracks</span></div>
          </Reveal>
          <Reveal delay={380}>
            <div className="hstat"><strong>{allLessons.length}</strong><span>lessons</span></div>
          </Reveal>
          <Reveal delay={440}>
            <div className="hstat"><strong>{Math.round(totalMinutes / 60)}h</strong><span>of material</span></div>
          </Reveal>
          <Reveal delay={500}>
            <div className="hstat"><strong>0</strong><span>installs</span></div>
          </Reveal>
        </div>
      </section>

      {/* ── scroll-driven exploded program ── */}
      <section id="exploded" className="xp-section">
        <Reveal>
          <h2 className="xp-title">
            What is a program <span className="grad">made of?</span>
          </h2>
        </Reveal>
        <Reveal delay={100}>
          <p className="xp-sub">Keep scrolling — the program separates into its internals, layer by layer.</p>
        </Reveal>
        <ExplodedProgram />
      </section>

      {/* ── features ── */}
      <section className="landing-feats">
        <Parallax speed={0.05}>
          <h2 className="sec-title center">Learn by doing, not watching</h2>
        </Parallax>
        <div className="feat-grid">
          {[
            { icon: 'snake', title: 'Real Python, in-browser', text: 'Every example runs on a genuine Python runtime — including NumPy, Pandas and Matplotlib plots. Your edits run too.' },
            { icon: 'target', title: 'Checked exercises', text: 'Hidden test suites grade your code instantly, test by test, with hints when you stall.' },
            { icon: 'save', title: 'Sessions that survive', text: 'Half-finished quizzes, edited examples, notes and drafts — all saved. Close the tab, resume tomorrow.' },
            { icon: 'medal', title: 'XP, streaks & certificates', text: 'Levels, achievements and a printable certificate for every completed track.' },
            { icon: 'book', title: 'Built from real books', text: 'Halterman, Sweigart, Klein, Moore — your PDF library, structured into a 3-month path.' },
            { icon: 'phone', title: 'Made for your pocket', text: 'Phone-first design: learn in the queue, on the bus, wherever life finds you.' },
          ].map((f, i) => (
            <Reveal key={f.title} delay={i * 70}>
              <div className="feat">
                <span className="feat-icon"><Icon name={f.icon} size={26} /></span>
                <h3>{f.title}</h3>
                <p>{f.text}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ── curriculum ── */}
      <section className="landing-tracks">
        <Parallax speed={0.05}>
          <h2 className="sec-title center">The path</h2>
        </Parallax>
        <div className="ltrack-list">
          {tracks.map((t, i) => {
            const lessons = t.modules.flatMap((m) => m.lessons)
            return (
              <Reveal key={t.id} delay={i * 60}>
                <button className="ltrack" style={{ '--c': t.accent } as React.CSSProperties} onClick={() => navigate(`track:${t.id}`)}>
                  <span className="ltrack-num">{String(i + 1).padStart(2, '0')}</span>
                  <span className="ltrack-icon"><Icon name={t.icon} size={24} /></span>
                  <span className="ltrack-body">
                    <strong>{t.title}</strong>
                    <span>{t.blurb}</span>
                  </span>
                  <span className="ltrack-meta">{lessons.length} lessons · {Math.round(lessons.reduce((a, l) => a + l.minutes, 0) / 60)}h</span>
                </button>
              </Reveal>
            )
          })}
          {upcomingTracks.map((u) => (
            <Reveal key={u.id}>
              <div className="ltrack upcoming">
                <span className="ltrack-num">··</span>
                <span className="ltrack-icon"><Icon name={u.icon} size={24} /></span>
                <span className="ltrack-body">
                  <strong>{u.title}</strong>
                  <span>{u.note}</span>
                </span>
                <span className="ltrack-meta">soon</span>
              </div>
            </Reveal>
          ))}
        </div>
        <div className="landing-cta-final">
          <Reveal>
            <button className="btn primary big" onClick={onStart}>
              Begin the journey →
            </button>
          </Reveal>
        </div>
      </section>
    </div>
  )
}
