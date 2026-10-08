/**
 * UTM capture: the first time a visitor lands with utm_* (or ref/gclid/fbclid)
 * parameters, record them. Stored once — later visits without params must not
 * overwrite the original attribution. Nothing is sent anywhere by itself; the
 * stored attribution is available for future sign-up payloads or support
 * requests.
 */
const KEY = 'pylearn.utm.v1'

const UTM_KEYS = [
  'utm_source',
  'utm_medium',
  'utm_campaign',
  'utm_term',
  'utm_content',
  'ref',
  'gclid',
  'fbclid',
] as const

export type Attribution = Partial<Record<(typeof UTM_KEYS)[number], string>> & {
  capturedAt?: string
  landingPath?: string
}

export function captureUtm(): Attribution | null {
  try {
    const existing = JSON.parse(localStorage.getItem(KEY) ?? 'null') as Attribution | null
    const params = new URLSearchParams(window.location.search)
    const found: Record<string, string> = {}
    for (const k of UTM_KEYS) {
      const v = params.get(k)
      if (v) found[k] = v.slice(0, 120)
    }
    if (Object.keys(found).length === 0) return existing

    const next: Attribution = { ...existing, ...found }
    if (!existing?.capturedAt) {
      next.capturedAt = new Date().toISOString()
      next.landingPath = window.location.pathname
    }
    localStorage.setItem(KEY, JSON.stringify(next))
    return next
  } catch {
    return null
  }
}

export function getUtm(): Attribution | null {
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? 'null') as Attribution | null
  } catch {
    return null
  }
}
