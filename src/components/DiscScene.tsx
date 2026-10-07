import { useEffect, useRef, useState, useMemo } from 'react'
import { Icon } from './Icon'
import { tracks } from '../curriculum'

/** Existing images / badges that orbit the disc. We reuse the track icon set
    so no new image assets are required. */
const ORBIT_ITEMS = tracks.map((t) => ({
  label: t.title,
  accent: t.accent,
  icon: t.icon,
}))

const RADIUS_PCT = 42 // percent of disc diameter

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
  const [mouseY, setMouseY] = useState(0.5) // 0 = top of viewport, 1 = bottom
  const [inside, setInside] = useState(true)
  const points = useMemo(() => orbitPoints(ORBIT_ITEMS.length), [])

  useEffect(() => {
    if (!discRef.current) return

    const stage = discRef.current.getBoundingClientRect()
    const cy = stage.top + stage.height / 2
    const half = stage.height / 2

    const onMove = (e: MouseEvent) => {
      const y = e.clientY
      // normalize so top edge → 0, bottom edge → 1; outside the stage we let
      // it keep its last value (no jump when the pointer leaves the stage).
      setMouseY(Math.max(0, Math.min(1, (y - (cy - half)) / (half * 2))))
      setInside(true)
    }
    const onLeave = () => setInside(false)

    window.addEventListener('mousemove', onMove)
    discRef.current.addEventListener('mouseleave', onLeave)
    return () => {
      window.removeEventListener('mousemove', onMove)
      discRef.current?.removeEventListener('mouseleave', onLeave)
    }
  }, [])

  // Y-tilt: center position (0.5) → tilt 0; top (0) → tilted up, bottom (1) → tilted down.
  // Map to a modest angle range so the disc never tips past readability.
  const yTiltDeg = useMemo(() => {
    const n = inside ? mouseY : 0.5
    return (n - 0.5) * 26 // ±13°
  }, [mouseY, inside])

  // a tiny X-wobble based on mouse X makes the disc feel more alive without
  // requiring a second axis from the user.
  const xTiltDeg = 0

  return (
    <div className="disc-scene" ref={discRef}>
      {/* the 3D stage */}
      <div
        className="disc-stage"
        style={{
          '--y-tilt': `${yTiltDeg}deg`,
          '--x-tilt': `${xTiltDeg}deg`,
        } as React.CSSProperties}
      >
        {/* central hub */}
        <div className="disc-hub" aria-hidden="true">
          <Icon name="snake" size={46} />
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
                  <Icon name={item.icon} size={18} />
                </span>
                <span className="disc-badge-title">{item.label}</span>
              </div>
            )
          })}
        </div>

        {/* subtle guide ring */}
        <div className="disc-guide" aria-hidden="true" />
      </div>

      {/* caption: the disc reacts to where your mouse is on the Y axis */}
      <div className="disc-caption">
        <span>Move your mouse up and down — the disc tilts with it.</span>
      </div>
    </div>
  )
}
