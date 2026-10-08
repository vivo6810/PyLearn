// Interactive playground session: owns the Pyodide worker and implements the
// input() loop. When the program asks for input with no queued answer, the
// worker raises __NeedInput; we surface the prompt, collect a line from the
// terminal, and replay the code with all answers queued — suppressing the
// output the user already saw so the run reads as one continuous session.
//
// The worker is owned exclusively here (a fresh Worker per session), so
// lessons using runPython() on the shared runner worker are unaffected.

import type { TerminalLine } from '../components/Terminal'

type Events = {
  output: (line: TerminalLine) => void
  needInput: (prompt: string) => void
  finished: (r: { ok: boolean; error?: string; plots: number; timedOut?: boolean }) => void
}

const HEAVY_IMPORTS = /(^|\n)\s*(import|from)\s+(numpy|pandas|matplotlib|scipy|sklearn)/

export class PlaygroundSession {
  private worker: Worker | null = null
  private seq = 0
  private answers: string[] = []
  private suppress = 0
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
    this.stop() // clears any previous run
    this.running = true
    this.aborted = false
    this.answers = []
    this.suppress = 0
    const w = this.ensureWorker()

    const heavy = HEAVY_IMPORTS.test(code)
    const limit = heavy ? 180_000 : 30_000

    const attempt = (): Promise<void> =>
      new Promise((resolve) => {
        const id = ++this.seq
        let seen = 0
        let promptShown = false

        const timer = setTimeout(() => {
          cleanup()
          this.killWorker()
          this.ev.output({ kind: 'err', text: `Timed out after ${Math.round(limit / 1000)} s — possible infinite loop. The Python runtime was restarted.` })
          this.running = false
          resolve()
        }, limit)

        const cleanup = () => {
          w.removeEventListener('message', onMsg)
          clearTimeout(timer)
        }

        const onMsg = (ev: MessageEvent) => {
          const msg = ev.data as any
          if (msg.type === 'ready') return
          if (msg.id !== id) return

          if (msg.type === 'stdout') {
            // Replays re-print the prefix the user already saw; drop it.
            seen += msg.chunk.length
            if (seen <= this.suppress) return
            let chunk: string = msg.chunk
            if (seen - msg.chunk.length < this.suppress) {
              chunk = chunk.slice(this.suppress - (seen - msg.chunk.length))
            }
            for (const line of chunk.replace(/\n$/, '').split('\n')) {
              this.ev.output({ kind: 'out', text: line })
            }
            return
          }
          if (msg.type === 'needsInput') {
            cleanup()
            this.suppress = msg.printedChars
            if (!promptShown) {
              promptShown = true
              this.ev.needInput(msg.prompt ?? '')
            }
            return
          }
          if (msg.type === 'result') {
            cleanup()
            if (msg.ok) {
              if (msg.plots?.length) {
                this.ev.output({ kind: 'sys', text: `${msg.plots.length} plot(s) opened in the plot panel.` })
                this.ev.finished({ ok: true, plots: msg.plots.length })
              } else {
                this.ev.finished({ ok: true, plots: 0 })
              }
            } else {
              this.ev.output({ kind: 'err', text: msg.error ?? 'Unknown error' })
              this.ev.finished({ ok: false, error: msg.error, plots: 0 })
            }
            this.running = false
            resolve()
            return
          }
        }

        w.addEventListener('message', onMsg)
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
      this.ev.output({ kind: 'out', text: line }) // echo the answer
    }
  }

  private lineResolver: ((line: string | null) => void) | null = null

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

  /** Stop everything and dispose the worker. */
  stop() {
    this.aborted = true
    this.running = false
    this.lineResolver?.(null)
    this.lineResolver = null
    this.killWorker()
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
