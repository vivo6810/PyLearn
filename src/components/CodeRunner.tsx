import { useEffect, useState } from 'react'
import CodeMirror from '@uiw/react-codemirror'
import { python } from '@codemirror/lang-python'
import { runPython, isPythonReady, onPythonReady } from '../pyodide/runner'
import { useApp } from '../state/AppContext'
import { Icon } from './Icon'

interface Props {
  initialCode: string
  draftKey?: string
  minHeight?: number
  compact?: boolean
  onOutput?: (lines: string[]) => void
  disabled?: boolean
  buttonLabel?: string
  timeoutMs?: number
  readOnly?: boolean
  /** shown above the stdin box (e.g. "answers: 3, then names") */
  stdinHint?: string
}

export function CodeRunner({
  initialCode,
  draftKey,
  minHeight = 140,
  compact = false,
  onOutput,
  disabled = false,
  buttonLabel = '▶ Run',
  timeoutMs,
  readOnly = false,
  stdinHint,
}: Props) {
  const { theme, getDraft, setDraft } = useApp()
  const [code, setCode] = useState(initialCode)
  const [output, setOutput] = useState<string | null>(null)
  const [plots, setPlots] = useState<string[]>([])
  const [running, setRunning] = useState(false)
  const [ready, setReady] = useState(isPythonReady())
  const [stdin, setStdin] = useState('')

  useEffect(() => {
    if (!draftKey) return
    const saved = getDraft(draftKey)
    if (saved !== undefined) setCode(saved)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => onPythonReady(() => setReady(true)), [])

  async function run() {
    if (disabled || running || readOnly) return
    setRunning(true)
    setOutput(null)
    setPlots([])
    const result = await runPython(code, timeoutMs, stdin.trim() ? stdin : undefined)
    if (result.ok) {
      const text = result.output === '' ? '(no output)' : result.output
      setOutput(text)
      setPlots(result.plots)
      onOutput?.(text.split('\n'))
    } else {
      setOutput(result.error)
      onOutput?.([])
    }
    setRunning(false)
  }

  const canRun = !running && !disabled && !readOnly && code.trim().length > 0

  return (
    <div className="coderunner" data-compact={compact || undefined}>
      <div className="coderunner-bar">
        <span className="coderunner-lang">
          <Icon name="snake" size={14} /> python
        </span>
        <div className="coderunner-actions">
          {!ready && <span className="coderunner-loadnote">first run loads Python…</span>}
          {!readOnly && (
            <button className="btn-run" onClick={run} disabled={!canRun} title="Run">
              {running ? 'Running…' : buttonLabel}
            </button>
          )}
        </div>
      </div>
      <CodeMirror
        value={code}
        height={`${minHeight}px`}
        theme={theme === 'dark' ? 'dark' : 'light'}
        extensions={[python()]}
        editable={!readOnly}
        basicSetup={{ foldGutter: false, autocompletion: false }}
        onChange={(v) => {
          setCode(v)
          if (draftKey) setDraft(draftKey, v)
        }}
      />
      {output !== null && <pre className="coderunner-out">{output}</pre>}
      {plots.length > 0 && (
        <div className="coderunner-plots">
          {plots.map((p, i) => (
            <img key={i} src={`data:image/png;base64,${p}`} alt={`Plot ${i + 1}`} />
          ))}
        </div>
      )}
      {!readOnly && (
        <div className="stdin-box">
          <label htmlFor={`stdin-${draftKey ?? 'run'}`}>
            <Icon name="terminal" size={13} /> {stdinHint ?? 'Pretend keyboard — one line per input()'}
          </label>
          <textarea
            id={`stdin-${draftKey ?? 'run'}`}
            value={stdin}
            onChange={(e) => setStdin(e.target.value)}
            placeholder={'Alice\n25\n…' }
            rows={2}
            spellCheck={false}
          />
        </div>
      )}
    </div>
  )
}
