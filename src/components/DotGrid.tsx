import { useEffect, useRef } from 'react'

/**
 * A faint, evenly-spaced dot grid painted behind the whole site. The cursor
 * gently illuminates nearby dots — a soft "pool of light" whose strength
 * falls off with distance. Barely noticeable until you move the mouse.
 *
 * - Static pattern on touch devices and for prefers-reduced-motion.
 * - Only dots within REACH of the cursor are redrawn each frame; the base
 *   grid is cached to an offscreen canvas, so steady-state cost is ~0.
 * - pointer-events: none — pure decoration, never blocks clicks/selection.
 */

const SPACING = 26 // px between dots
const REACH = 140 // px around the cursor that react
const BASE_ALPHA = 0.07 // idle dot opacity (barely visible)
const GLOW_ALPHA = 0.3 // extra opacity for a dot right under the cursor

/** Muted Python blue for the glow, softened toward white so it never reads as neon. */
const PY_BLUE = { r: 0x37, g: 0x76, b: 0xab }
const GLOW_COLOR = `${Math.round(PY_BLUE.r + (255 - PY_BLUE.r) * 0.35)}, ${Math.round(
  PY_BLUE.g + (255 - PY_BLUE.g) * 0.35,
)}, ${Math.round(PY_BLUE.b + (255 - PY_BLUE.b) * 0.35)}`

function themeColors(): { base: string; glow: string } {
  const dark = document.documentElement.dataset.theme !== 'light'
  return dark
    ? { base: '245, 242, 234', glow: GLOW_COLOR } // warm ink dots on dark bg
    : { base: '20, 18, 14', glow: GLOW_COLOR }
}

export function DotGrid() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const coarse = window.matchMedia('(pointer: coarse)').matches
    const interactive = !reduceMotion && !coarse

    let base = document.createElement('canvas')
    let baseCtx = base.getContext('2d')!
    let cols = 0
    let rows = 0
    let dpr = 1
    let raf = 0
    let running = false
    const target = { x: -9999, y: -9999 }
    const pos = { x: -9999, y: -9999 }
    let lastMove = 0

    function paintBase() {
      const w = window.innerWidth
      const h = window.innerHeight
      dpr = Math.min(window.devicePixelRatio || 1, 2)
      canvas!.width = w * dpr
      canvas!.height = h * dpr
      canvas!.style.width = `${w}px`
      canvas!.style.height = `${h}px`
      base.width = canvas!.width
      base.height = canvas!.height
      cols = Math.ceil(w / SPACING) + 1
      rows = Math.ceil(h / SPACING) + 1
      baseCtx.setTransform(dpr, 0, 0, dpr, 0, 0)
      const { base: rgb } = themeColors()
      baseCtx.fillStyle = `rgba(${rgb}, ${BASE_ALPHA})`
      for (let i = 0; i < cols; i++) {
        for (let j = 0; j < rows; j++) {
          baseCtx.beginPath()
          baseCtx.arc(i * SPACING + SPACING / 2, j * SPACING + SPACING / 2, 1, 0, Math.PI * 2)
          baseCtx.fill()
        }
      }
    }

    function draw() {
      const w = window.innerWidth
      const h = window.innerHeight
      const ctx2 = ctx!
      ctx2.setTransform(1, 0, 0, 1, 0, 0)
      ctx2.clearRect(0, 0, canvas!.width, canvas!.height)
      ctx2.drawImage(base, 0, 0)
      if (!interactive) return

      ctx2.setTransform(dpr, 0, 0, dpr, 0, 0)
      const { glow } = themeColors()
      // only dots inside the reach rectangle
      const i0 = Math.max(0, Math.floor((pos.x - REACH) / SPACING))
      const i1 = Math.min(cols - 1, Math.ceil((pos.x + REACH) / SPACING))
      const j0 = Math.max(0, Math.floor((pos.y - REACH) / SPACING))
      const j1 = Math.min(rows - 1, Math.ceil((pos.y + REACH) / SPACING))
      for (let i = i0; i <= i1; i++) {
        for (let j = j0; j <= j1; j++) {
          const dx = i * SPACING + SPACING / 2 - pos.x
          const dy = j * SPACING + SPACING / 2 - pos.y
          const d = Math.sqrt(dx * dx + dy * dy)
          if (d >= REACH) continue
          const t = 1 - d / REACH
          const alpha = GLOW_ALPHA * t * t * (3 - 2 * t) // smoothstep falloff
          if (alpha < 0.01) continue
          ctx2.fillStyle = `rgba(${glow}, ${alpha})`
          ctx2.beginPath()
          ctx2.arc(i * SPACING + SPACING / 2, j * SPACING + SPACING / 2, 1.4, 0, Math.PI * 2)
          ctx2.fill()
        }
      }
      void w
      void h
    }

    function tick() {
      // ease the light pool toward the cursor so the glow glides, not snaps
      pos.x += (target.x - pos.x) * 0.18
      pos.y += (target.y - pos.y) * 0.18
      draw()
      const settled =
        Math.abs(target.x - pos.x) < 0.3 &&
        Math.abs(target.y - pos.y) < 0.3 &&
        performance.now() - lastMove > 400
      if (settled) {
        running = false
        return
      }
      raf = requestAnimationFrame(tick)
    }

    function wake() {
      if (!running) {
        running = true
        raf = requestAnimationFrame(tick)
      }
    }

    function onMove(e: MouseEvent) {
      target.x = e.clientX
      target.y = e.clientY
      if (pos.x < -999) {
        pos.x = target.x
        pos.y = target.y
      }
      lastMove = performance.now()
      wake()
    }

    function onLeave() {
      target.x = -9999
      target.y = -9999
      lastMove = performance.now()
      wake()
    }

    function onResize() {
      paintBase()
      draw()
    }

    paintBase()
    draw()

    if (interactive) {
      window.addEventListener('mousemove', onMove, { passive: true })
      document.documentElement.addEventListener('mouseleave', onLeave)
    }
    window.addEventListener('resize', onResize)

    // repaint when the theme flips (data-theme attribute on <html>)
    const themeObs = new MutationObserver(() => {
      paintBase()
      draw()
    })
    themeObs.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] })

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('mousemove', onMove)
      document.documentElement.removeEventListener('mouseleave', onLeave)
      window.removeEventListener('resize', onResize)
      themeObs.disconnect()
    }
  }, [])

  return <canvas ref={canvasRef} className="dotgrid" aria-hidden="true" />
}
