import { Reveal } from './Reveal'
import { Appear } from './Appear'
import { Icon } from './Icon'
import { Parallax } from './Parallax'
import FlexCarousel from './FlexCarousel'
import { FAQ } from './FAQ'
import { tracks, allLessons, totalMinutes } from '../curriculum'
import logoUrl from '../assets/logo.png'

/** faint code glyphs floating behind the hero at different depths */
const HERO_GLYPHS = [
  { ch: 'def', x: '8%', y: '18%', size: 22, depth: 0.22, opacity: 0.16 },
  { ch: 'lambda', x: '78%', y: '12%', size: 20, depth: 0.1, opacity: 0.14 },
  { ch: 'for', x: '14%', y: '68%', size: 26, depth: 0.3, opacity: 0.12 },
  { ch: '[ ]', x: '86%', y: '60%', size: 24, depth: 0.16, opacity: 0.15 },
  { ch: '=>', x: '68%', y: '82%', size: 20, depth: 0.26, opacity: 0.1 },
  { ch: 'print', x: '30%', y: '8%', size: 18, depth: 0.12, opacity: 0.1 },
]

/** Slides for the track carousel. */
const carouselImage = (name: string) => `${import.meta.env.BASE_URL}images/${name}`

const CAROUSEL_ITEMS = [
  { src: carouselImage('playground.png'), alt: 'PyLearn Playground code editor', title: 'PyLearn', subtitle: 'Playground' },
  { src: carouselImage('practice.png'), alt: 'Interactive Python lesson with runnable worked examples', title: 'Learn Python', subtitle: 'Practice as you learn' },
  { src: carouselImage('topics.png'), alt: 'PyLearn course topics including Foundations, Core Python, Advanced Python, Tkinter, Data Analysis, and Automation', title: 'Learning paths', subtitle: 'Topics' },
  { src: carouselImage('achievements.png'), alt: 'PyLearn achievements and certificates for lessons, learning streaks, quizzes, and completed tracks', title: 'Achievements', subtitle: 'Motivation as you learn' },
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
          <Appear variant="pop" delay={0}>
            <img src={logoUrl} alt="PyLearn" className="hero-logo" draggable={false} />
          </Appear>
          <Appear variant="soft" delay={0.05}>
            <p className="hero-kicker">
              beginner → advanced
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
              Short lessons, live examples and graded practice — a straight path from your first print() to programs
              you actually want to build.
            </p>
          </Appear>
          <Appear variant="btn" delay={0.55}>
            <div className="hero-cta">
              <button className="btn primary big" onClick={onStart}>
                Start learning →
              </button>
              <button className="btn ghost big" onClick={() => document.getElementById('disc')?.scrollIntoView({ behavior: 'smooth' })}>
                See the tracks ↓
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
        </div>
      </section>

      {/* ── carousel: the 6 tracks through a liquid lens ── */}
      <section id="disc" className="xp-section">
        <div style={{ width: '100%', height: '680px', position: 'relative' }}>
          <FlexCarousel
            items={CAROUSEL_ITEMS}
            preset="liquid"
            intro="rise"
            cardHeight={0.56}
            gap={12}
            squeeze={0.2}
            focusOnClick
            captions
            fit="natural"
            radius={0}
            lensWidth={0.74}
            lensHeight={1.18}
            tilt={74}
            roundness={1}
            bend={0.34}
            reach={0.38}
            curl="twist"
            dispersion={0.45}
            liquid={0}
            followCursor={false}
            autoplay={false}
            interval={4}
            captureWheel
          />
        </div>
      </section>

      {/* ── features ── */}
      <section className="landing-feats">
        <Parallax speed={0.05}>
          <h2 className="sec-title center">Learn by doing, not watching</h2>
        </Parallax>
        <div className="feat-grid">
          {[
            { icon: null, title: 'Edit any example', text: 'Change the code and press Run — NumPy, Pandas and Matplotlib plots included.' },
            { icon: 'target', title: 'Checked exercises', text: 'Hidden test suites grade your code instantly, test by test, with hints when you stall.' },
            { icon: 'save', title: 'Sessions that survive', text: 'Half-finished quizzes, edited examples, notes and drafts — all saved. Close the tab, resume tomorrow.' },
            { icon: 'medal', title: 'XP, streaks & certificates', text: 'Levels, achievements and a printable certificate for every completed track.' },
          ].map((f, i) => (
            <Reveal key={f.title} delay={i * 70}>
              <div className="feat">
                <span className="feat-icon">
                  {f.icon ? (
                    <Icon name={f.icon} size={26} />
                  ) : (
                    <img src={logoUrl} alt="" aria-hidden="true" width={26} height={26} />
                  )}
                </span>
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
        </div>
        <div className="landing-cta-final">
          <Reveal>
            <button className="btn primary big" onClick={onStart}>
              Start learning →
            </button>
          </Reveal>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="landing-faq" id="faq">
        <Parallax speed={0.05}>
          <h2 className="sec-title center">Questions before you start?</h2>
        </Parallax>
        <Reveal>
          <FAQ
            items={landingFaq()}
            className="center"
          />
        </Reveal>
      </section>
    </div>
  )
}

function landingFaq() {
  return [
    {
      q: 'How is the course organized?',
      a: 'There are 6 tracks from beginner to advanced. Each track is a sequence of modules and lessons, and every lesson has a short reading, runnable examples, a quiz and one or more graded exercises.',
    },
    {
      q: 'Do I have to follow the tracks in order?',
      a: 'No. Each lesson is usable on its own, but the tracks are arranged so the ideas build smoothly. If you are new to Python, starting at the top of a track is the easiest path.',
    },
    {
      q: 'How do I keep my progress?',
      a: 'If you sign in, your XP, lessons, streaks and certificates follow you to any browser. If you use PyLearn without an account, everything is saved in this browser only — use Settings → Export backup to keep a copy.',
    },
  ]
}
