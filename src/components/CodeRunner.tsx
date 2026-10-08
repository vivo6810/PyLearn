import { useCallback, forwardRef, useEffect, useImperativeHandle, useState } from 'react'
import CodeMirror from '@uiw/react-codemirror'
import { python } from '@codemirror/lang-python'
import { runPython, isPythonReady, onPythonReady } from '../pyodide/runner'
import { useApp } from '../state/AppContext'
import { Icon } from './Icon'
import { CopyButton } from './CopyButton'

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
  /** playground mode: terminal handles input; no stdin box / export here */
  hideStdin?: boolean
  hideExport?: boolean
  /** external run state (playground drives execution itself) */
  running?: boolean
  /** override the built-in run handler (playground) */
  onRun?: () => void
  /** stretch the editor to fill its container (playground split view) */
  fillHeight?: boolean
}

export const CodeRunner = forwardRef<{ getCode: () => string }, Props>(
  function CodeRunner(
    {
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
      hideStdin = false,
      hideExport = false,
      running: externalRunning,
      onRun,
      fillHeight = false,
    }: Props,
    ref,
  ) {
    const { theme, getDraft, setDraft } = useApp()
    const [code, setCode] = useState(initialCode)

    // playground calls runnerRef.current.getCode() to download the current code
    const getCode = useCallback(() => code, [code])
    useImperativeHandle(
      ref,
      () => ({
        getCode,
      }),
      [getCode],
    )
    const [output, setOutput] = useState<string | null>(null)
    const [plots, setPlots] = useState<string[]>([])
    const [internalRunning, setInternalRunning] = useState(false)
    const [ready, setReady] = useState(isPythonReady())
    const [stdin, setStdin] = useState('')

    const running = externalRunning ?? internalRunning

    useEffect(() => {
      if (!draftKey) return
      const saved = getDraft(draftKey)
      if (saved !== undefined) setCode(saved)
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    useEffect(() => onPythonReady(() => setReady(true)), [])

    async function run() {
      if (onRun) {
        if (!running) onRun()
        return
      }
      if (disabled || running || readOnly) return
      setInternalRunning(true)
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
      setInternalRunning(false)
    }

    const canRun = !running && !disabled && !readOnly && code.trim().length > 0

    return (
      <div className="coderunner" data-compact={compact || undefined}>
        <div className="coderunner-bar">
          <span className="coderunner-lang">
            <img src="/favicon.png" alt="" width={16} height={16} style={{ display: 'block' }} draggable={false} /> python
          </span>
          <div className="coderunner-actions">
            {!ready && <span className="coderunner-loadnote">first run loads Python…</span>}
            <CopyButton getText={() => code} label="Copy code" />
            {!readOnly && (
              <button className="btn-run" onClick={run} disabled={!canRun} title="Run">
                {running ? 'Running…' : buttonLabel}
              </button>
            )}
          </div>
        </div>
        <CodeMirror
          value={code}
          height={fillHeight ? '100%' : `${minHeight}px`}
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

        {!readOnly && !hideStdin && (
          <div className="stdin-box">
            <label htmlFor={`stdin-${draftKey ?? 'run'}`}>
              <Icon name="terminal" size={13} /> {stdinHint ?? 'Pretend keyboard — one line per input()'}
            </label>
            <textarea
              id={`stdin-${draftKey ?? 'run'}`}
              value={stdin}
              onChange={(e) => setStdin(e.target.value)}
              placeholder={'Alice\n25\n…'}
              rows={3}
              spellCheck={false}
            />
          </div>
        )}

        {!hideExport && (
          <button
            className="btn ghost"
            onClick={() => {
              const blob = new Blob([getCode()], { type: 'text/x-python' })
              const url = URL.createObjectURL(blob)
              const a = document.createElement('a')
              a.href = url
              a.download = `playground-${new Date().toISOString().slice(0, 10)}.py`
              a.click()
              URL.revokeObjectURL(url)
            }}
            disabled={readOnly || running}
            title="Download as .py"
          >
            <Icon name="download" size={14} /> Export .py
          </button>
        )}
      </div>
    )
  },
)
