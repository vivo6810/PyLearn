import { useEffect, useRef } from 'react'

/**
 * A 2px reading-progress bar pinned to the top of the viewport. Only mounted
 * on the long landing page. Uses transform: scaleX (GPU-composited, no
 * layout) with linear timing — progress is constant motion, not a UI easing.
 */
export function ScrollProgress() {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let raf = 0
    let queued = false

    function update() {
      queued = false
      const el = ref.current
      if (!el) return
      const doc = document.documentElement
      const max = doc.scrollHeight - window.innerHeight
      const p = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0
      el.style.transform = `scaleX(${p})`
    }

    function onScroll() {
      if (!queued) {
        queued = true
        raf = requestAnimationFrame(update)
      }
    }

    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [])

  return <div ref={ref} className="scroll-progress" aria-hidden="true" />
}
