import logoUrl from '../assets/logo.png'

/**
 * PyLearn brand mark — the official two-snakes Python logo (grungy cutout).
 * Rendered at the requested height; width follows the native aspect ratio.
 * `plain` accepted for call-site compatibility; the cutout needs no tile.
 */
export function Logo({ size = 28 }: { size?: number; plain?: boolean }) {
  return (
    <img
      src={logoUrl}
      alt="PyLearn logo"
      className="brand-logo"
      style={{ height: size, width: 'auto' }}
      draggable={false}
    />
  )
}
