import { useCallback, useEffect, useRef, useState } from 'react'
import { CodeRunner } from './CodeRunner'
import { Terminal, type TerminalLine } from './Terminal'
import { PlaygroundSession } from '../pyodide/session'
import { isPythonReady, onPythonReady } from '../pyodide/runner'
import { CopyButton } from './CopyButton'
import { Icon } from './Icon'

/**
 * The playground, laid out like a small IDE: editor pane on the left, output
 * terminal on the right, a drag-to-resize divider between them, and a status
 * bar underneath. input() prompts appear in the terminal and the user answers
 * inline — no separate input box.
 *
 * One PlaygroundSession (and its Pyodide worker) is created lazily and reused
 * across Runs, so Python is only loaded once per visit. Stop keeps the runtime
 * warm when we're idle at an input prompt; the worker is only killed when it
 * may be stuck executing code (or on unmount / timeout).
 */
export function Playground({ navigate }: { navigate: (v: string) => void }) {
  const runnerRef = useRef<{ getCode: () => string } | null>(null)
  const [lines, setLines] = useState<TerminalLine[]>([])
  const [waiting, setWaiting] = useState(false)
  const [running, setRunning] = useState(false)
  const [ready, setReady] = useState(isPythonReady())
  const [plots, setPlots] = useState<string[]>([])
  const sessionRef = useRef<PlaygroundSession | null>(null)
  const splitRef = useRef<HTMLDivElement>(null)

  useEffect(() => onPythonReady(() => setReady(true)), [])

  // Create the session once; every handler only uses functional setState, so
  // it stays valid across runs.
  if (!sessionRef.current) {
    sessionRef.current = new PlaygroundSession({
      // A replay re-prints everything from scratch: keep the sys notes
      // (running…, stopped) but drop the previous attempt's program output.
      reset: () => setLines((ls) => ls.filter((l) => l.kind === 'sys')),
      output: (l) => setLines((ls) => [...ls, l]),
      needInput: (prompt) => {
        setLines((ls) => [...ls, { kind: 'prompt', text: prompt }])
        setWaiting(true)
      },
      finished: (r) => {
        setRunning(false)
        setWaiting(false)
        if (r.plots.length) setPlots(r.plots)
        if (r.ok) {
          setLines((ls) =>
            ls.some((l) => l.kind === 'out' || l.kind === 'err')
              ? ls
              : [...ls, { kind: 'sys', text: '(no output)' }],
          )
        }
      },
    })
  }

  // Dispose the worker if the user navigates away.
  useEffect(
    () => () => {
      sessionRef.current?.stop()
    },
    [],
  )

  const push = useCallback((kind: TerminalLine['kind'], text: string) => {
    setLines((ls) => [...ls, { kind, text }])
  }, [])

  const startRun = useCallback(() => {
    const code = runnerRef.current?.getCode() ?? ''
    if (!code.trim() || sessionRef.current?.isRunning) return

    setLines([])
    setPlots([])
    setWaiting(false)
    setRunning(true)
    push('sys', ready ? '▶ running…' : '▶ running… (first run loads Python, hang tight)')

    void sessionRef.current?.start(code)
  }, [push, ready])

  const stopRun = useCallback(() => {
    const mode = sessionRef.current?.stop()
    setRunning(false)
    setWaiting(false)
    push('sys', mode === 'warm' ? '■ stopped.' : '■ stopped — the Python runtime was restarted.')
  }, [push])

  // Drag the divider: 1:1 pointer tracking with capture, clamped 20–80%.
  const onSplitDown = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    const grid = splitRef.current
    if (!grid) return
    const handle = e.currentTarget
    handle.setPointerCapture(e.pointerId)

    const move = (ev: PointerEvent) => {
      const rect = grid.getBoundingClientRect()
      const pct = ((ev.clientX - rect.left) / rect.width) * 100
      grid.style.setProperty('--ide-left', `${Math.min(80, Math.max(20, pct))}%`)
    }
    const up = () => {
      handle.removeEventListener('pointermove', move)
      handle.removeEventListener('pointerup', up)
      handle.removeEventListener('pointercancel', up)
    }
    handle.addEventListener('pointermove', move)
    handle.addEventListener('pointerup', up)
    handle.addEventListener('pointercancel', up)
  }, [])

  const onSplitKey = useCallback((e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return
    e.preventDefault()
    const grid = splitRef.current
    if (!grid) return
    const cur = parseFloat(getComputedStyle(grid).getPropertyValue('--ide-left')) || 54
    const next = Math.min(80, Math.max(20, cur + (e.key === 'ArrowRight' ? 4 : -4)))
    grid.style.setProperty('--ide-left', `${next}%`)
  }, [])

  const visualizePlots = () => {
    if (plots.length === 0) {
      push('sys', 'Visualize: nothing to show yet — run a program that plots.')
      return
    }
    push('sys', `Visualize: ${plots.length} plot(s) captured.`)
    // In a fuller build this would open a chart overlay / chart viewer.
    // For now we surface them under the editor (CodeRunner already renders
    // plots once they're posted). Nothing else to wire for the reference look.
  }

  const exportPy = () => {
    const code = runnerRef.current?.getCode() ?? ''
    const blob = new Blob([code], { type: 'text/x-python' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `playground-${new Date().toISOString().slice(0, 10)}.py`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="page playground-page">
      <h1 className="sr-only">Playground</h1>

      <div className="ide" ref={splitRef}>
        <section className="ide-pane" aria-label="Editor">
          <header className="ide-toolbar">
            <span className="ide-tab">
              <img src="/favicon.png" alt="" width={14} height={14} draggable={false} />
              main.py
            </span>
            <div className="ide-tools">
              {!ready && <span className="coderunner-loadnote">first run loads Python…</span>}
              <CopyButton getText={() => runnerRef.current?.getCode() ?? ''} label="Copy code" />
              <button
                className="btn-run"
                onClick={startRun}
                disabled={running}
                title="Run the current code"
              >
                {running ? 'Running…' : 'Run ▶'}
              </button>
              <button
                className="btn ghost"
                onClick={visualizePlots}
                disabled={plots.length === 0 && !running}
                title="Visualize the last run's plots"
              >
                <Icon name="grid" size={14} /> Visualize
              </button>
            </div>
          </header>
          <div className="ide-editor">
            <CodeRunner
              ref={runnerRef}
              initialCode={`# Write any Python here, then press Run\nname = input("What's your name? ")\nprint(f"Hello, {name}!")\n\nage = input("Your age: ")\nyears = 65 - int(age)\nprint(f"{name}, you can retire in {years} years.")`}
              draftKey="playground"
              fillHeight
              hideStdin
              hideExport
              hideBar
            />
          </div>
          {plots.length > 0 && (
            <div className="coderunner-plots ide-plots">
              {plots.map((p, i) => (
                <img key={i} src={`data:image/png;base64,${p}`} alt={`Plot ${i + 1}`} />
              ))}
            </div>
          )}
        </section>

        <div
          className="ide-splitter"
          role="separator"
          aria-orientation="vertical"
          aria-label="Resize editor and output panes"
          tabIndex={0}
          onPointerDown={onSplitDown}
          onKeyDown={onSplitKey}
        >
          <span className="ide-splitter-handle" aria-hidden="true">
            <i className="dot" />
            <i className="dot" />
            <i className="dot" />
          </span>
        </div>

        <section className="ide-pane" aria-label="Output">
          <div className="term-toolbar">
            <span className="term-tab">
              <Icon name="terminal" size={12} /> output
            </span>
            <div className="term-tools">
              {running && (
                <button
                  className="btn-run alt"
                  onClick={stopRun}
                  title="Stop (restarts the Python runtime)"
                >
                  stop
                </button>
              )}
              <span className="term-dots" aria-hidden="true">
                <i /><i /><i />
              </span>
            </div>
          </div>
          <Terminal
            lines={lines}
            waiting={waiting}
            runtimeReady={ready}
            busy={running}
            hideBar
            onSubmit={(line) => {
              setWaiting(false)
              sessionRef.current?.submit(line)
            }}
            onAbort={stopRun}
          />
        </section>
      </div>

      <div className="ide-status">
        <button className="btn ghost" onClick={() => navigate('dashboard')}>
          ← Dashboard
        </button>
        <span className="ide-status-note">drafts save automatically on this device</span>
        <button className="btn ghost" onClick={exportPy} title="Download the current code as a .py file">
          <Icon name="download" size={14} /> Export .py
        </button>
      </div>
    </div>
  )
}
