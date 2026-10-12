// Interactive playground session: owns the Pyodide worker and implements the
// input() loop. When the program asks for input with no queued answer, the
// worker raises __NeedInput; we surface the prompt, collect a line from the
// terminal, and replay the code with all answers queued — resetting the
// terminal to the fresh attempt's output so the run reads as one continuous
// session.
//
// The worker is owned exclusively here, so lessons using runPython() on the
// shared runner worker are unaffected. The worker (and the Python runtime
// inside it) is reused across Runs and only terminated on Stop, unmount, or
// timeout.

import type { TerminalLine } from '../components/Terminal'

type Events = {
  /** a new attempt began: discard everything shown so far */
  reset: () => void
  output: (line: TerminalLine) => void
  needInput: (prompt: string) => void
  finished: (r: { ok: boolean; error?: string; plots: string[]; timedOut?: boolean }) => void
}

const HEAVY_IMPORTS = /(^|\n)\s*(import|from)\s+(numpy|pandas|matplotlib|scipy|sklearn)/

export class PlaygroundSession {
  private worker: Worker | null = null
  private seq = 0
  private answers: string[] = []
  private running = false
  private aborted = false
  private ev: Events

  constructor(ev: Events) {
    this.ev = ev
  }

  get isRunning() {
    return this.running
  }

  async start(code: string) {
    if (this.running) return
    this.running = true
    this.aborted = false
    this.answers = []
    const w = this.ensureWorker()

    const heavy = HEAVY_IMPORTS.test(code)
    const limit = heavy ? 180_000 : 30_000

    const attempt = (): Promise<void> =>
      new Promise((resolve) => {
        const id = ++this.seq

        const timer = setTimeout(() => {
          cleanup()
          this.killWorker()
          this.ev.output({ kind: 'err', text: `Timed out after ${Math.round(limit / 1000)} s — possible infinite loop. The Python runtime was restarted.` })
          this.running = false
          this.ev.finished({ ok: false, error: 'timeout', plots: [] })
          resolve()
        }, limit)

        const cleanup = () => {
          w.removeEventListener('message', onMsg)
          clearTimeout(timer)
          if (this.pendingCancel === cancel) this.pendingCancel = null
        }
        // stop() must cancel the in-flight attempt, otherwise the timeout
        // timer fires long after the user pressed Stop and prints a bogus
        // "Timed out" error over their output.
        const cancel = () => {
          cleanup()
          resolve()
        }
        this.pendingCancel = cancel

        const onMsg = (ev: MessageEvent) => {
          const msg = ev.data as any
          if (msg.type === 'ready') return
          if (msg.type === 'bootError') {
            // Pyodide failed to load: fail the run cleanly instead of
            // waiting for the timeout.
            cleanup()
            const text = typeof msg.error === 'string' ? msg.error : 'Failed to load the Python runtime.'
            this.ev.output({ kind: 'err', text })
            this.ev.finished({ ok: false, error: text, plots: [] })
            this.running = false
            this.killWorker()
            resolve()
            return
          }
          if (msg.id !== id) return

          if (msg.type === 'stdout') {
            for (const line of msg.chunk.replace(/\n$/, '').split('\n')) {
              this.ev.output({ kind: 'out', text: line })
            }
            return
          }
          if (msg.type === 'needsInput') {
            // Resolve the attempt so the start() loop proceeds to waitLine()
            // — without this the session deadlocks on the first input().
            cleanup()
            this.ev.needInput(typeof msg.prompt === 'string' ? msg.prompt : '')
            resolve()
            return
          }
          if (msg.type === 'result') {
            cleanup()
            if (msg.ok) {
              const plots: string[] = msg.plots ?? []
              if (plots.length) {
                this.ev.output({ kind: 'sys', text: `${plots.length} plot(s) — shown under the editor.` })
              }
              this.ev.finished({ ok: true, plots })
            } else {
              this.ev.output({ kind: 'err', text: msg.error ?? 'Unknown error' })
              this.ev.finished({ ok: false, error: msg.error, plots: [] })
            }
            this.running = false
            resolve()
            return
          }
        }

        w.addEventListener('message', onMsg)
        // Fresh attempt: the terminal shows only this run's output.
        this.ev.reset()
        w.postMessage({ type: 'run', id, code, interactiveQueue: [...this.answers] })
      })

    // Loop: run → (maybe) need input → remember the answer → replay.
    // A generous cap guards against pathological programs that never stop
    // asking even though the user keeps answering.
    for (let i = 0; i < 1000; i++) {
      if (this.aborted) break
      await attempt()
      if (!this.running || this.aborted) break
      const line = await this.waitLine()
      if (line === null) break // aborted while waiting
      this.answers.push(line)
    }
  }

  private lineResolver: ((line: string | null) => void) | null = null
  /** cancels the in-flight attempt (set while a run is waiting on the worker) */
  private pendingCancel: (() => void) | null = null

  private waitLine(): Promise<string | null> {
    return new Promise((resolve) => {
      this.lineResolver = resolve
    })
  }

  /** Called by the terminal when the user submits a line at the prompt. */
  submit(line: string) {
    this.lineResolver?.(line)
    this.lineResolver = null
  }

  /** Stop the current run.
      Returns 'warm' when we were only waiting at an input() prompt (the
      worker is idle — Python stays loaded for the next Run), or
      'restarted' when the worker had to be killed (it may be stuck
      executing user code, so the runtime must restart). */
  stop(): 'warm' | 'restarted' {
    const wasWaiting = this.lineResolver !== null
    this.aborted = true
    this.running = false
    this.lineResolver?.(null)
    this.lineResolver = null
    if (wasWaiting && !this.pendingCancel) {
      // Idle at a prompt: nothing is executing, keep the runtime alive.
      return 'warm'
    }
    this.pendingCancel?.()
    this.pendingCancel = null
    this.killWorker()
    return 'restarted'
  }

  private killWorker() {
    this.worker?.terminate()
    this.worker = null
  }

  private ensureWorker(): Worker {
    if (!this.worker) {
      this.worker = new Worker(new URL('./worker.ts', import.meta.url), { type: 'module' })
    }
    return this.worker
  }
}
