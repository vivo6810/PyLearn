import { useEffect, useState } from 'react'
import CodeMirror from '@uiw/react-codemirror'
import { python } from '@codemirror/lang-python'
import { runPython, isPythonReady, onPythonReady } from '../pyodide/runner'
import { buildTestProgram } from '../pyodide/testHarness'
import { renderMd } from '../markdown'
import { useApp } from '../state/AppContext'
import { Icon } from './Icon'
import type { Exercise } from '../types'

interface Props {
  lessonId: string
  index: number
  exercise: Exercise
  onPassed: () => void
}

export function ExerciseRunner({ lessonId, index, exercise, onPassed }: Props) {
  const { theme, getDraft, setDraft, recordExercisePass } = useApp()
  const draftKey = `${lessonId}:task${index}`
  const [code, setCode] = useState(exercise.starter)
  const [output, setOutput] = useState<string | null>(null)
  const [running, setRunning] = useState(false)
  const [busy, setBusy] = useState(false)
  const [hint, setHint] = useState(false)
  const [passed, setPassed] = useState(false)
  const [ready, setReady] = useState(isPythonReady())
  const [stdin, setStdin] = useState('')

  useEffect(() => {
    const saved = getDraft(draftKey)
    if (saved !== undefined) setCode(saved)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => onPythonReady(() => setReady(true)), [])

  async function check() {
    setBusy(true)
    setOutput(null)
    const program = buildTestProgram(code, exercise.tests, exercise.staticOnly ?? false)
    const result = await runPython(program, exercise.staticOnly ? 15000 : undefined, stdin.trim() ? stdin : undefined)
    if (!result.ok) {
      setOutput(result.error)
      setBusy(false)
      return
    }
    const lines = result.output.split('\n').filter((l) => l.startsWith('[TEST-'))
    const fails = lines.filter((l) => !l.startsWith('[TEST-PASS]'))
    const allPass = lines.length > 0 && fails.length === 0
    setOutput(result.output + (allPass ? '\nAll tests passed!' : '\nKeep going — see the failures above.'))
    if (allPass) {
      setPassed(true)
      recordExercisePass(lessonId, index)
      onPassed()
    }
    setBusy(false)
  }

  async function runOnly() {
    setRunning(true)
    setOutput(null)
    const result = await runPython(code, undefined, stdin.trim() ? stdin : undefined)
    setOutput(result.ok ? result.output || '(no output)' : result.error)
    setRunning(false)
  }

  const acting = busy || running

  return (
    <div className="exercise" data-passed={passed || undefined}>
      <div className="exercise-head">
        <h4>
          <Icon name="wrench" size={15} /> {exercise.title}
        </h4>
        {passed && <span className="pill pill-pass">passed</span>}
      </div>
      <div className="md" dangerouslySetInnerHTML={{ __html: renderMd(exercise.brief) }} />
      <CodeMirror
        value={code}
        height="190px"
        theme={theme === 'dark' ? 'dark' : 'light'}
        extensions={[python()]}
        basicSetup={{ foldGutter: false, autocompletion: false }}
        onChange={(v) => {
          setCode(v)
          setPassed(false)
          setDraft(draftKey, v)
        }}
      />
      {exercise.stdinHint !== undefined && (
        <div className="stdin-box">
          <label htmlFor={`stdin-${draftKey}-ex`}>{exercise.stdinHint}</label>
          <textarea
            id={`stdin-${draftKey}-ex`}
            value={stdin}
            onChange={(e) => setStdin(e.target.value)}
            rows={3}
            placeholder={'3\n7\n2\n…'}
            spellCheck={false}
          />
        </div>
      )}
      <div className="exercise-actions">
        <button className="btn ghost" onClick={runOnly} disabled={acting}>
          <Icon name="play" size={13} /> Run
        </button>
        <button className="btn primary" onClick={check} disabled={acting}>
          {busy ? 'Checking…' : (
            <>
              <Icon name="check" size={14} /> Check
            </>
          )}
        </button>
        <button className="btn ghost" onClick={() => setHint((h) => !h)}>
          <Icon name="lightbulb" size={14} /> Hint
        </button>
        <button
          className="btn ghost"
          onClick={() => {
            setCode(exercise.starter)
            setPassed(false)
            setDraft(draftKey, exercise.starter)
          }}
        >
          <Icon name="rotate" size={14} /> Reset
        </button>
        {!ready && <span className="coderunner-loadnote">first check loads Python…</span>}
      </div>
      {hint && (
        <div className="hint">
          <Icon name="lightbulb" size={14} /> {exercise.hint}
        </div>
      )}
      {output !== null && <pre className="coderunner-out">{output}</pre>}
    </div>
  )
}
