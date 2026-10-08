import { useEffect, useRef, useState } from 'react'
import { Icon } from './Icon'

/**
 * Small copy-to-clipboard button with instant "Copied" feedback.
 * Falls back to a hidden textarea for non-secure contexts.
 */
export function CopyButton({
  getText,
  label = 'Copy code',
  className = '',
}: {
  getText: () => string
  label?: string
  className?: string
}) {
  const [copied, setCopied] = useState(false)
  const timer = useRef<number>(0)

  useEffect(() => () => window.clearTimeout(timer.current), [])

  async function copy() {
    const text = getText()
    try {
      await navigator.clipboard.writeText(text)
    } catch {
      // Non-secure context fallback (e.g. http:// LAN preview).
      const ta = document.createElement('textarea')
      ta.value = text
      ta.style.position = 'fixed'
      ta.style.opacity = '0'
      document.body.appendChild(ta)
      ta.select()
      try {
        document.execCommand('copy')
      } catch {
        /* nothing else we can do */
      }
      ta.remove()
    }
    setCopied(true)
    window.clearTimeout(timer.current)
    timer.current = window.setTimeout(() => setCopied(false), 1400)
  }

  return (
    <button
      type="button"
      className={`copy-btn ${className}`.trim()}
      onClick={copy}
      title={label}
      aria-label={copied ? 'Copied' : label}
    >
      <Icon name={copied ? 'check' : 'copy'} size={14} />
      <span>{copied ? 'Copied' : 'Copy'}</span>
    </button>
  )
}
