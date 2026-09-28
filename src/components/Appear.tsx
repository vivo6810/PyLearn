import { useEffect, useRef, type CSSProperties, type ReactNode } from 'react'

/**
 * On-mount entrance animation (Vesper-style): renders children in a wrapper
 * that plays a one-shot keyframe — staggered via `delay`, eased with an expo
 * curve — then "settles" by removing the animation entirely, so the resting
 * frame is the authored design. Content is never stranded invisible: resting
 * opacity is 1, and a fallback forces the settled state if animations never run.
 */
export function Appear({
  children,
  variant = 'soft',
  delay = 0,
  duration,
  className,
  style,
}: {
  children: ReactNode
  variant?: 'scale' | 'soft' | 'pop' | 'btn' | 'wipe' | 'side' | 'rise'
  delay?: number
  duration?: number
  className?: string
  style?: CSSProperties
}) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const settle = () => el.classList.add('is-in')
    el.addEventListener('animationend', settle, { once: true })
    // Fallback: if no animation is running (reduced motion, old browsers),
    // force the settled state after two frames.
    const raf = requestAnimationFrame(() =>
      requestAnimationFrame(() => {
        const running = el.getAnimations().some((a) => a.playState === 'running' || a.playState === 'finished')
        if (!running) el.classList.add('is-in')
      }),
    )
    return () => {
      el.removeEventListener('animationend', settle)
      cancelAnimationFrame(raf)
    }
  }, [])

  const css = {
    ...style,
    '--d': `${delay}s`,
    ...(duration ? { '--dur': `${duration}s` } : {}),
  } as CSSProperties

  return (
    <div ref={ref} className={'appear appear--' + variant + (className ? ' ' + className : '')} style={css}>
      {children}
    </div>
  )
}
