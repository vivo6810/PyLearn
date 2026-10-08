// Pyodide runner: executes Python inside a Web Worker so infinite loops can
// be killed by terminating the worker. Results may carry matplotlib plot
// images (base64 PNGs) captured by the worker.
//
// The playground uses its own worker + protocol (see session.ts), which also
// goes through worker.ts and its interactive input() handling.

export type RunResult =
  | { ok: true; output: string; plots: string[] }
  | { ok: false; error: string; timedOut?: boolean; plots: string[] }

type Pending = { resolve: (r: RunResult) => void; timer: ReturnType<typeof setTimeout>; buf: string[]; plots: string[] }

let worker: Worker | null = null
let ready = false
let seq = 0
const pending = new Map<number, Pending>()

const WORKER_TIMEOUT_MS = 10_000
const LOAD_TIMEOUT_MS = 120_000
const PACKAGE_TIMEOUT_MS = 180_000 // numpy/pandas/matplotlib download on first use

export function isPythonReady() {
  return ready
}

export function onPythonReady(cb: () => void): () => void {
  readyListeners.add(cb)
  return () => readyListeners.delete(cb)
}
const readyListeners = new Set<() => void>()

function spawn(): Worker {
  const w = new Worker(new URL('./worker.ts', import.meta.url), { type: 'module' })
  w.onmessage = (ev: MessageEvent) => {
    const msg = ev.data as
      | { type: 'ready' }
      | { type: 'stdout'; id: number; chunk: string }
      | { type: 'result'; id: number; ok: boolean; output: string; error?: string; timedOut?: boolean; plots?: string[] }
      | { type: 'bootError'; error: string }

    if (msg.type === 'ready') {
      ready = true
      for (const cb of readyListeners) cb()
      return
    }
    if (msg.type === 'bootError') {
      failAll(msg.error)
      w.terminate()
      worker = null
      return
    }
    if (msg.type === 'stdout') {
      pending.get(msg.id)?.buf.push(msg.chunk)
      return
    }
    if (msg.type === 'result') {
      const p = pending.get(msg.id)
      if (!p) return
      clearTimeout(p.timer)
      pending.delete(msg.id)
      if (msg.ok) p.resolve({ ok: true, output: p.buf.join(''), plots: msg.plots ?? [] })
      else p.resolve({ ok: false, error: msg.error ?? 'Unknown error', timedOut: msg.timedOut, plots: msg.plots ?? [] })
    }
  }
  w.onerror = (ev) => {
    failAll('Worker crashed: ' + (ev.message ?? 'unknown'))
    worker = null
    ready = false
  }
  return w
}

function failAll(error: string) {
  for (const [, p] of pending) {
    clearTimeout(p.timer)
    p.resolve({ ok: false, error, plots: [] })
  }
  pending.clear()
}

function ensureWorker(): Worker {
  if (!worker) worker = spawn()
  return worker
}

const HEAVY_IMPORTS = /(^|\n)\s*(import|from)\s+(numpy|pandas|matplotlib|scipy|sklearn)/

/** Pick a sensible timeout: heavy scientific packages may download on first use. */
export function suggestTimeoutMs(code: string): number {
  if (HEAVY_IMPORTS.test(code)) return PACKAGE_TIMEOUT_MS
  return ready ? WORKER_TIMEOUT_MS : Math.max(WORKER_TIMEOUT_MS, LOAD_TIMEOUT_MS)
}

/** Normal (queued-stdin) execution — used by lessons and exercises. */
export async function runPython(code: string, timeoutMs?: number, stdin?: string): Promise<RunResult> {
  const w = ensureWorker()
  const id = ++seq
  const buf: string[] = []
  const plots: string[] = []
  const limit = timeoutMs ?? suggestTimeoutMs(code)

  return new Promise<RunResult>((resolve) => {
    const timer = setTimeout(() => {
      w.terminate()
      pending.delete(id)
      worker = null
      ready = false
      resolve({
        ok: false,
        timedOut: true,
        plots: [],
        error: `Timed out after ${Math.round(limit / 1000)} s — your code may contain an infinite loop, or a package is still downloading. The Python runtime was restarted.`,
      })
    }, limit)

    pending.set(id, { resolve, timer, buf, plots })
    try {
      w.postMessage({ type: 'run', id, code, stdin })
    } catch (err) {
      clearTimeout(timer)
      pending.delete(id)
      resolve({ ok: false, error: String(err), plots: [] })
    }
  })
}

/** Long window for data-track code that downloads numpy/pandas/matplotlib. */
export async function runPythonWithPackages(code: string): Promise<RunResult> {
  return runPython(code, PACKAGE_TIMEOUT_MS)
}

/** Warm up Pyodide in the background (call from a user gesture). */
export function preloadPython() {
  if (worker) return
  ensureWorker()
}
