import { useEffect, useRef, type CSSProperties, type ReactNode } from 'react'

/**
 * Scroll parallax: drifts children vertically as the block crosses the
 * viewport. The OUTER div is measured (never transformed, so there is no
 * feedback loop); the INNER div carries the transform. speed is the fraction
 * of scroll distance the block lags behind — positive moves slower (deeper),
 * negative moves faster (closer). Disabled under prefers-reduced-motion.
 */
export function Parallax({
  children,
  speed = 0.1,
  className,
  style,
}: {
  children: ReactNode
  speed?: number
  className?: string
  style?: CSSProperties
}) {
  const outerRef = useRef<HTMLDivElement>(null)
  const innerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const outer = outerRef.current
    const inner = innerRef.current
    if (!outer || !inner) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    let raf = 0
    const update = () => {
      const r = outer.getBoundingClientRect()
      // distance from viewport center, in px; drift against it
      const fromCenter = r.top + r.height / 2 - window.innerHeight / 2
      inner.style.transform = `translate3d(0, ${(-fromCenter * speed).toFixed(1)}px, 0)`
    }
    const onScroll = () => {
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(update)
    }
    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      cancelAnimationFrame(raf)
    }
  }, [speed])

  return (
    <div ref={outerRef} className={className} style={style}>
      <div ref={innerRef} className="parallax-inner">
        {children}
      </div>
    </div>
  )
}
