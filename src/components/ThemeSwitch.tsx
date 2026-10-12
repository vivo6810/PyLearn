import { forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState } from 'react'

import PixelSwap from './PixelSwap'
import './ThemeSwitch.css'

/**
 * Light/dark theme flip, animated with PixelSwap.
 *
 * A fixed scrim covers the viewport and dissolves into the *incoming* theme's
 * surface colour (its two PixelSwap layers are solid theme colours rather than
 * page content, so the same component that swaps two DOM layers also works
 * full-screen). Because the pixels are windows onto the new colour, the
 * dissolve finishes fully opaque — which is the safe moment to commit the
 * theme change — and the scrim then fades out to reveal the flipped page.
 *
 * If the client prefers reduced motion the commit happens immediately.
 */

export type ThemeSwitchHandle = {
  /** Play the swap, then run `commit` (the actual theme toggle) under cover. */
  play: (commit: () => void) => void
}

type Theme = 'light' | 'dark'

/** Resolve a theme's background without leaving the document in that theme. */
function readSurface(theme: Theme): string {
  const root = document.documentElement
  const before = root.getAttribute('data-theme')
  root.setAttribute('data-theme', theme)
  const value = getComputedStyle(root).getPropertyValue('--bg').trim()
  if (before === null) root.removeAttribute('data-theme')
  else root.setAttribute('data-theme', before)
  return value || (theme === 'dark' ? '#14120e' : '#e9e4d6')
}

function currentTheme(): Theme {
  return document.documentElement.getAttribute('data-theme') === 'light' ? 'light' : 'dark'
}

const SWAP_MS = 460 // pixel dissolve (must match PixelSwap's duration)
const PIXEL_MS = 280 // per-pixel grow time
const SETTLE_MS = 240 // scrim fade after the theme has flipped

export const ThemeSwitch = forwardRef<ThemeSwitchHandle>(function ThemeSwitch(_props, ref) {
  const [run, setRun] = useState<{ id: number; from: string; to: string } | null>(null)
  const [leaving, setLeaving] = useState(false)
  const [armed, setArmed] = useState(false)
  const commitRef = useRef<(() => void) | null>(null)
  const timers = useRef<number[]>([])
  const busy = useRef(false)

  const play = useCallback((commit: () => void) => {
    if (busy.current) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      commit()
      return
    }
    busy.current = true
    commitRef.current = commit
    const from = currentTheme()
    const to: Theme = from === 'dark' ? 'light' : 'dark'
    setLeaving(false)
    setArmed(false)
    setRun({ id: Date.now(), from: readSurface(from), to: readSurface(to) })
  }, [])

  useImperativeHandle(ref, () => ({ play }), [play])

  // PixelSwap starts from its `active` flag, so arm it one frame after the
  // scrim exists — by then it has been measured and the grid is real.
  useEffect(() => {
    if (!run || armed) return
    const id = requestAnimationFrame(() => setArmed(true))
    return () => cancelAnimationFrame(id)
  }, [run, armed])

  useEffect(
    () => () => {
      timers.current.forEach((id) => window.clearTimeout(id))
      timers.current = []
      commitRef.current = null
    },
    [],
  )

  const handleComplete = useCallback(() => {
    commitRef.current?.()
    commitRef.current = null
    // Two frames: one for the flip, one for it to paint under the scrim.
    requestAnimationFrame(() => requestAnimationFrame(() => setLeaving(true)))
    timers.current.push(
      window.setTimeout(() => {
        setRun(null)
        setLeaving(false)
        setArmed(false)
        busy.current = false
      }, SETTLE_MS),
    )
  }, [])

  if (!run) return null

  return (
    <div className={`theme-switch${leaving ? ' is-leaving' : ''}`} aria-hidden="true">
      <PixelSwap
        key={run.id}
        className="theme-switch__swap"
        firstContent={<span className="theme-switch__surface" style={{ background: run.from }} />}
        secondContent={<span className="theme-switch__surface" style={{ background: run.to }} />}
        initialActive={false}
        active={armed}
        trigger="manual"
        aspectRatio="auto"
        pixelSize={88}
        pattern="spiral"
        randomness={0}
        pixelScale={0.14}
        pixelRadius={0}
        fade
        duration={SWAP_MS}
        pixelDuration={PIXEL_MS}
        easing="cubic-bezier(0.33, 0, 0.2, 1)"
        onComplete={handleComplete}
      />
    </div>
  )
})
