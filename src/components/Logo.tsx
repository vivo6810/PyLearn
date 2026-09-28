let uid = 0

/**
 * PyLearn brand mark: the snake glyph rendered with a blue gradient, an eye
 * and tail accent, on a bordered rounded tile with a soft glow underneath.
 * Same color family as before — just more craft. `plain` drops the tile for
 * tiny inline uses.
 */
export function Logo({ size = 28, plain = false }: { size?: number; plain?: boolean }) {
  const id = `pl${++uid}`
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" aria-hidden="true">
      <defs>
        <linearGradient id={`${id}-snake`} x1="12" y1="8" x2="36" y2="40" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#9dbcff" />
          <stop offset="0.55" stopColor="#4f8cff" />
          <stop offset="1" stopColor="#2e6be6" />
        </linearGradient>
        <linearGradient id={`${id}-tile`} x1="6" y1="4" x2="42" y2="44" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#1d2946" />
          <stop offset="1" stopColor="#0c1322" />
        </linearGradient>
        <filter id={`${id}-glow`} x="-40%" y="-40%" width="180%" height="180%">
          <feGaussianBlur stdDeviation="2.2" />
        </filter>
      </defs>

      {!plain && (
        <>
          <rect x="2" y="2" width="44" height="44" rx="12" fill={`url(#${id}-tile)`} />
          <rect x="2.75" y="2.75" width="42.5" height="42.5" rx="11.25" stroke="#2c3a5c" strokeWidth="1.5" fill="none" />
          <rect x="4.5" y="4.5" width="39" height="39" rx="9.5" stroke="rgba(255,255,255,0.09)" strokeWidth="1" fill="none" />
        </>
      )}

      {/* soft glow copy of the snake */}
      <path
        d="M36 12a6 6 0 0 0-6-6H18a7 7 0 0 0 0 14h12a7 7 0 0 1 0 14H18a6 6 0 0 1-6-6"
        stroke="#4f8cff"
        strokeWidth="5"
        strokeLinecap="round"
        opacity="0.45"
        filter={`url(#${id}-glow)`}
      />
      {/* the snake */}
      <path
        d="M36 12a6 6 0 0 0-6-6H18a7 7 0 0 0 0 14h12a7 7 0 0 1 0 14H18a6 6 0 0 1-6-6"
        stroke={`url(#${id}-snake)`}
        strokeWidth="4.4"
        strokeLinecap="round"
      />
      {/* tail + eye accents */}
      <circle cx="11.5" cy="28" r="2.3" fill="#9dbcff" />
      <circle cx="32.6" cy="9.8" r="1.5" fill="#dbe7ff" />
    </svg>
  )
}
