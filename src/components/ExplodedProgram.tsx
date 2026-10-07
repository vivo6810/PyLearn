import { useEffect, useRef } from 'react'

/**
 * The "car teardown" effect, for a Python program: as the user scrolls
 * through a tall scroller, a sticky viewport shows an intact program whose
 * layers (imports → data → logic → output) peel off one by one into a
 * bounded vertical fan — every card stays inside the stage, so each is
 * fully readable at every point of the scroll.
 *
 * Each layer has its own explode progress --e ∈ [0,1] (peel window inside
 * the global scroll progress p), so cards animate independently and settle
 * into fixed slots. The HUD caption box swaps text per phase.
 */

const LAYERS = [
  {
    id: 'imports',
    label: 'imports — load your tools',
    code: 'import numpy as np\nimport matplotlib.pyplot as plt',
    color: '#8a7f6a',
    detail: 'Modules are code other people wrote. One line and you have 15 years of library engineering at your fingertips.',
  },
  {
    id: 'data',
    label: 'data — the raw material',
    code: 'temps = [21, 23, 22, 25, 27]',
    color: '#6a7a5c',
    detail: 'Variables label your data. Lists hold many values; NumPy arrays crunch millions.',
  },
  {
    id: 'logic',
    label: 'logic — the transformation',
    code: 'fahrenheit = [c * 9 / 5 + 32 for c in temps]',
    color: '#a06a58',
    detail: 'Expressions and comprehensions transform data. This is where programs actually think.',
  },
  {
    id: 'output',
    label: 'output — talk to the world',
    code: 'plt.plot(temps, fahrenheit)\nplt.show()',
    color: '#96741f',
    detail: 'Plots, prints and files are how a program answers back. Everything before this exists to make this moment right.',
  },
]

/** scroll progress at which layer i begins peeling off the base program */
const peelStart = (i: number) => 0.12 + i * 0.19

export function ExplodedProgram() {
  const scrollerRef = useRef<HTMLDivElement>(null)
  const viewportRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const scroller = scrollerRef.current
    const viewport = viewportRef.current
    if (!scroller || !viewport) return
    let raf = 0

    const onScroll = () => {
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(() => {
        const sc = scrollerRef.current
        const vp = viewportRef.current
        if (!sc || !vp) return
        const rect = sc.getBoundingClientRect()
        const vh = window.innerHeight
        // progress: 0 when scroller top hits viewport top; 1 when bottom passes
        const total = rect.height - vh
        const p = total > 0 ? Math.min(Math.max(-rect.top / total, 0), 1) : 0
        vp.style.setProperty('--p', String(p))

        // per-layer peel progress: each card explodes inside its own window
        vp.querySelectorAll<HTMLElement>('.xp-layer').forEach((el, i) => {
          const e = Math.min(Math.max((p - peelStart(i)) / 0.2, 0), 1)
          el.style.setProperty('--e', String(e))
          el.classList.toggle('active', e > 0.02)
          el.classList.toggle('passing', e > 0.02 && e < 0.98)
        })

        // caption phase: -1 = intact program, 0..3 = the peeled layer
        const phase = p < 0.1 ? -1 : Math.min(3, Math.floor(((p - 0.1) / 0.9) * 4))
        vp.querySelectorAll<HTMLElement>('.xp-detail').forEach((d) => {
          d.classList.toggle('active', Number(d.dataset.i) === phase)
        })
      })
    }

    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      cancelAnimationFrame(raf)
    }
  }, [])

  return (
    <div className="xp" ref={scrollerRef}>
      <div className="xp-sticky" ref={viewportRef}>
        <div className="xp-stage" aria-hidden="true">
          {/* backboard: the intact program (fades as its layers peel away) */}
          <div className="xp-card base">
            <div className="xp-card-bar">
              <span className="dot" /> <span className="dot" /> <span className="dot" />
              <span className="xp-file">program.py</span>
            </div>
            <pre>{LAYERS.map((l) => l.code).join('\n')}</pre>
          </div>

          {/* the four layers, each peeling into its own slot via --e */}
          {LAYERS.map((l, i) => (
            <div
              key={l.id}
              className="xp-card xp-layer"
              style={{ '--i': i, '--c': l.color } as React.CSSProperties}
            >
              <div className="xp-card-bar">
                <span className="dot" style={{ background: l.color }} />
                <span className="xp-tag">{l.label}</span>
              </div>
              <pre>{l.code}</pre>
            </div>
          ))}
        </div>

        {/* captions: one visible at a time (mobile) / annotated list (desktop) */}
        <div className="xp-hud">
          <p className="xp-detail" data-i={-1}>
            <strong>Every program is four layers.</strong> Keep scrolling — it comes apart.
          </p>
          {LAYERS.map((l, i) => (
            <p key={l.id} className="xp-detail" data-i={i} style={{ '--c': l.color } as React.CSSProperties}>
              <strong style={{ color: l.color }}>{l.label.split(' — ')[0]}</strong> — {l.detail}
            </p>
          ))}
        </div>
      </div>

      {/* spacer scroller: the section is tall so scrolling drives the animation */}
      <div className="xp-spacer" style={{ height: '420vh' }} />
    </div>
  )
}
