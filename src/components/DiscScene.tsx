import { useEffect, useMemo, useRef } from 'react'
import { Icon } from './Icon'
import logoUrl from '../assets/logo.png'
import { tracks } from '../curriculum'

/** Existing images / badges that orbit the disc. We reuse the track icon set
    so no new image assets are required. */
const ORBIT_ITEMS = tracks.map((t) => ({
  label: t.title,
  accent: t.accent,
  icon: t.icon,
}))

const RADIUS_PCT = 42 // percent of disc diameter
const MAX_TILT = 13 // degrees either way

type Point = { x: number; y: number }

function orbitPoints(count: number): Point[] {
  return Array.from({ length: count }, (_, i) => {
    const angle = (i / count) * Math.PI * 2 // start at top, go clockwise
    // rotate so the first item starts at the front (12 o'clock)
    const a = angle - Math.PI / 2
    return {
      x: Math.cos(a) * RADIUS_PCT,
      y: Math.sin(a) * RADIUS_PCT,
    }
  })
}

export function DiscScene() {
  const discRef = useRef<HTMLDivElement>(null)
  const points = useMemo(() => orbitPoints(ORBIT_ITEMS.length), [])

  // Y-tilt follows the mouse. The stage rect is re-measured on every move so
  // scrolling never leaves the mapping stale (the old one-shot measurement is
  // what made the tilt "stick" at an edge). The transform is written directly
  // to the element from a rAF loop — no React re-render per mousemove, and the
  // pointer eases toward the target so the motion glides instead of snapping.
  useEffect(() => {
    const el = discRef.current
    if (!el) return

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    let targetY = 0.5 // 0 = top of the stage, 1 = bottom
    let currentY = 0.5
    let raf = 0
    let running = false
    let queuedMove = false

    function apply() {
      currentY += (targetY - currentY) * 0.22
      const deg = (currentY - 0.5) * 2 * MAX_TILT
      el!.style.transform = `perspective(900px) rotateX(-8deg) rotateY(${deg.toFixed(3)}deg)`
      if (queuedMove || Math.abs(targetY - currentY) > 0.001) {
        queuedMove = false
        raf = requestAnimationFrame(apply)
      } else {
        running = false
      }
    }

    function wake() {
      if (!running) {
        running = true
        raf = requestAnimationFrame(apply)
      }
    }

    const onMove = (e: MouseEvent) => {
      const r = el!.getBoundingClientRect()
      if (r.height < 1) return
      targetY = Math.max(0, Math.min(1, (e.clientY - r.top) / r.height))
      queuedMove = true
      wake()
    }

    const onLeave = () => {
      targetY = 0.5
      queuedMove = true
      wake()
    }

    if (!reduceMotion) {
      window.addEventListener('mousemove', onMove, { passive: true })
      el.addEventListener('mouseleave', onLeave)
    }

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('mousemove', onMove)
      el.removeEventListener('mouseleave', onLeave)
    }
  }, [])

  return (
    <div className="disc-scene">
      {/* the 3D stage (tilt is driven imperatively; CSS holds the rest pose) */}
      <div className="disc-stage" ref={discRef}>
        {/* central hub */}
        <div className="disc-hub" aria-hidden="true">
          <img
            src={logoUrl}
            alt=""
            className="disc-hub-logo"
            draggable={false}
          />
        </div>

        {/* orbiting track badges */}
        <div className="disc-ring" aria-hidden="true">
          {ORBIT_ITEMS.map((item, i) => {
            const p = points[i % points.length]
            return (
              <div
                key={item.label}
                className="disc-badge"
                style={{
                  '--x': `${p.x}%`,
                  '--y': `${p.y}%`,
                  '--c': item.accent,
                } as React.CSSProperties}
              >
                <span className="disc-badge-label" style={{ color: item.accent }}>
                  <Icon name={item.icon} size={26} />
                </span>
                <span className="disc-badge-title">{item.label}</span>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
