import { useCallback, useEffect, useRef, useState } from 'react'
import { Icon } from './Icon'

export type TerminalLine =
  | { kind: 'out'; text: string } // program output
  | { kind: 'err'; text: string } // tracebacks / errors
  | { kind: 'sys'; text: string } // system notes (loaded, stopped…)
  | { kind: 'prompt'; text: string } // an input() prompt awaiting an answer

/**
 * Terminal-style output for the playground. Output streams in line by line;
 * when the program asks for input, an inline editor appears on the prompt
 * line — the user types straight into the terminal like a real REPL.
 * Auto-scrolls to the bottom unless the user scrolled up to read.
 */
export function Terminal({
  lines,
  waiting,
  onSubmit,
  onAbort,
  runtimeReady,
  busy = false,
}: {
  lines: TerminalLine[]
  waiting: boolean
  onSubmit: (line: string) => void
  onAbort: () => void
  runtimeReady: boolean
  /** a run is executing (even if not waiting for input) */
  busy?: boolean
}) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const [draft, setDraft] = useState('')
  const stick = useRef(true)

  // Keep pinned to the bottom while output streams, unless the user scrolled up.
  useEffect(() => {
    const el = scrollRef.current
    if (!el || !stick.current) return
    el.scrollTop = el.scrollHeight
  }, [lines])

  const onScroll = useCallback(() => {
    const el = scrollRef.current
    if (!el) return
    stick.current = el.scrollHeight - el.scrollTop - el.clientHeight < 40
  }, [])

  // Focus the inline input whenever a prompt appears.
  useEffect(() => {
    if (waiting) inputRef.current?.focus()
  }, [waiting])

  function submit() {
    const line = draft
    if (!waiting) return
    setDraft('')
    onSubmit(line)
  }

  return (
    <div className="term">
      <div className="term-bar">
        <span className="term-dots" aria-hidden="true">
          <i /><i /><i />
        </span>
        <span className="term-title">
          <Icon name="terminal" size={13} /> output
        </span>
        {busy && (
          <button className="term-stop" onClick={onAbort} title="Stop (restarts the Python runtime)">
            <Icon name="x" size={12} /> stop
          </button>
        )}
      </div>
      <div className="term-scroll" ref={scrollRef} onScroll={onScroll}>
        {lines.map((l, i) =>
          l.kind === 'prompt' ? (
            <div key={i} className="term-line term-prompt-row">
              <span className="term-prompt-text">{l.text}</span>
            </div>
          ) : (
            <pre key={i} className={`term-line term-${l.kind}`}>{l.text}</pre>
          ),
        )}
        {waiting && (
          <form
            className="term-input-row"
            onSubmit={(e) => {
              e.preventDefault()
              submit()
            }}
          >
            <span className="term-chevron" aria-hidden="true">›</span>
            <input
              ref={inputRef}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              spellCheck={false}
              autoComplete="off"
              aria-label="Answer the program's input prompt"
            />
          </form>
        )}
        {!waiting && lines.length === 0 && (
          <div className="term-empty">
            {runtimeReady ? 'Press Run — output appears here.' : 'First run loads Python (a few seconds).'}
          </div>
        )}
      </div>
    </div>
  )
}
