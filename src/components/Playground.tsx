import { useCallback, useEffect, useRef, useState } from 'react'
import { CodeRunner } from './CodeRunner'
import { Terminal, type TerminalLine } from './Terminal'
import { PlaygroundSession } from '../pyodide/session'
import { isPythonReady, onPythonReady } from '../pyodide/runner'
import { Icon } from './Icon'

/**
 * The playground: editor on the left, terminal on the right. input() prompts
 * appear in the terminal and the user answers inline — no separate input box.
 * Each Run gets a fresh session; code drafts are saved per device.
 */
export function Playground({ navigate }: { navigate: (v: string) => void }) {
  const runnerRef = useRef<{ getCode: () => string } | null>(null)
  const [lines, setLines] = useState<TerminalLine[]>([])
  const [waiting, setWaiting] = useState(false)
  const [running, setRunning] = useState(false)
  const [ready, setReady] = useState(isPythonReady())
  const [plots, setPlots] = useState<string[]>([])
  const sessionRef = useRef<PlaygroundSession | null>(null)

  useEffect(() => onPythonReady(() => setReady(true)), [])
  // Dispose the worker if the user navigates away mid-run.
  useEffect(() => () => sessionRef.current?.stop(), [])

  const push = useCallback((kind: TerminalLine['kind'], text: string) => {
    setLines((ls) => [...ls, { kind, text }])
  }, [])

  const startRun = useCallback(() => {
    const code = runnerRef.current?.getCode() ?? ''
    if (!code.trim() || sessionRef.current?.isRunning) return

    sessionRef.current?.stop()
    setLines([])
    setPlots([])
    setWaiting(false)
    setRunning(true)
    push('sys', ready ? '▶ running…' : '▶ running… (first run loads Python, hang tight)')

    const session = new PlaygroundSession({
      output: (l) => setLines((ls) => [...ls, l]),
      needInput: (prompt) => {
        setLines((ls) => [...ls, { kind: 'prompt', text: prompt }])
        setWaiting(true)
      },
      finished: (r) => {
        setRunning(false)
        setWaiting(false)
        if (r.ok && r.plots > 0) {
          // plots are rendered by CodeRunner on the shared runner worker for
          // lesson code; playground sessions capture them separately below.
        }
        if (r.ok && !r.error) {
          setLines((ls) => {
            const anyOutput = ls.some((l) => l.kind === 'out' || l.kind === 'err')
            return anyOutput ? ls : [...ls, { kind: 'sys', text: '(no output)' }]
          })
        }
      },
    })
    sessionRef.current = session
    void session.start(code)
  }, [push, ready])

  const stopRun = useCallback(() => {
    sessionRef.current?.stop()
    setRunning(false)
    setWaiting(false)
    push('sys', '■ stopped — the Python runtime was restarted.')
  }, [push])

  return (
    <div className="page playground-page">
      <h1>
        <Icon name="flask" size={22} /> Playground
      </h1>
      <p>A free scratchpad — your code is saved automatically on this device.</p>

      <div className="playground-split">
        <div className="playground-left">
          <CodeRunner
            ref={runnerRef}
            initialCode={`# Write any Python here, then press Run\nname = input("What's your name? ")\nprint(f"Hello, {name}!")\n\nage = input("Your age: ")\nyears = 65 - int(age)\nprint(f"{name}, you can retire in {years} years.")`}
            draftKey="playground"
            minHeight={440}
            fillHeight
            hideStdin
            hideExport
            running={running}
            onRun={startRun}
          />
          {plots.length > 0 && (
            <div className="coderunner-plots">
              {plots.map((p, i) => (
                <img key={i} src={`data:image/png;base64:${p}`} alt={`Plot ${i + 1}`} />
              ))}
            </div>
          )}
        </div>
        <div className="playground-right">
          <Terminal
            lines={lines}
            waiting={waiting}
            runtimeReady={ready}
            busy={running}
            onSubmit={(line) => {
              setWaiting(false)
              sessionRef.current?.submit(line)
            }}
            onAbort={stopRun}
          />
        </div>
      </div>

      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 10 }}>
        <button className="btn ghost" onClick={() => navigate('dashboard')}>
          ← Dashboard
        </button>
        <button
          className="btn ghost"
          onClick={() => {
            const code = runnerRef.current?.getCode() ?? ''
            const blob = new Blob([code], { type: 'text/x-python' })
            const url = URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            a.download = `playground-${new Date().toISOString().slice(0, 10)}.py`
            a.click()
            URL.revokeObjectURL(url)
          }}
          disabled={!runnerRef.current}
          title="Download the current code as a .py file"
        >
          <Icon name="download" size={14} /> Export .py
        </button>
      </div>
    </div>
  )
}
