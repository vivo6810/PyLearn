import { useRef } from 'react'
import { CodeRunner } from './CodeRunner'
import { Icon } from './Icon'

export function Playground({ navigate }: { navigate: (v: string) => void }) {
  const runnerRef = useRef<{ getCode: () => string } | null>(null)

  return (
    <div className="page">
      <h1>
        <Icon name="flask" size={22} /> Playground
      </h1>
      <p>A free scratchpad — your code is saved automatically on this device.</p>
      <CodeRunner
        ref={runnerRef}
        initialCode={`# Write any Python here, then press Run\nprint("Hello from the playground!")\n\nfor i in range(1, 6):\n    print("*" * i)`}
        draftKey="playground"
        minHeight={340}
      />

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
