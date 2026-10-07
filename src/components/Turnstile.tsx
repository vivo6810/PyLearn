import { useEffect, useRef, useState } from 'react'

// Turnstile is loaded lazily from Cloudflare's CDN. When the site key is
// absent (no spam protection configured), the widget simply never renders and
// the form falls back to "no protection" mode.

interface TurnstileProps {
  siteKey: string
  onSuccess: (token: string) => void
  onError?: (err: unknown) => void
  size?: 'normal' | 'compact'
  className?: string
}

export function Turnstile({
  siteKey,
  onSuccess,
  onError,
  size = 'normal',
  className,
}: TurnstileProps) {
  const hostRef = useRef<HTMLDivElement>(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    if (!siteKey || !hostRef.current) return

    let script: HTMLScriptElement | null = null
    let disposed = false

    async function loadAndRender() {
      // Guard against the widget being loaded more than once.
      if ((window as unknown as { _cfTurnstile?: unknown })._cfTurnstile) {
        render()
        return
      }

      return new Promise<void>((resolve) => {
        script = document.createElement('script')
        script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=auto'
        script.async = true
        script.onload = () => {
          ;(window as unknown as { _cfTurnstile: unknown })._cfTurnstile = true
          resolve()
        }
        script.onerror = () => {
          // If the CDN is unreachable we just don't show the widget.
          resolve()
        }
        document.head.appendChild(script)
      }).then(render)
    }

    function render() {
      if (disposed || !hostRef.current) return
      // @ts-expect-error — turnstile API is loaded at runtime
      window.turnstile?.execute(hostRef.current, {
        sitekey: siteKey,
        size,
        callback: (token: string) => onSuccess(token),
        'error-callback': (err: unknown) => onError?.(err),
      })
      setReady(true)
    }

    loadAndRender()
    return () => {
      disposed = true
    }
  }, [siteKey, onSuccess, onError, size])

  if (!siteKey) return null

  return (
    <div
      ref={hostRef}
      className={className}
      aria-label="Spam protection challenge"
      data-turnstile-ready={ready}
    />
  )
}

/** Hook that manages a single Turnstile token for a form. */
export function useTurnstile(siteKey: string) {
  const [token, setToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const resetRef = useRef(false)

  useEffect(() => {
    if (!siteKey) {
      setToken('') // no key → no challenge → treat as "ready" for graceful fallback
      return
    }
    resetRef.current = false
    setToken(null)
    setLoading(true)
    setError(null)

    const timeout = setTimeout(() => {
      if (!token) setLoading(false)
    }, 8000)

    return () => clearTimeout(timeout)
  }, [siteKey])

  function refresh() {
    setToken(null)
    setLoading(true)
    setError(null)
    resetRef.current = true
  }

  return { token, loading, error, refresh }
}
