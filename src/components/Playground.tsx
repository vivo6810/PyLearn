import { CodeRunner } from './CodeRunner'
import { Icon } from './Icon'

export function Playground({ navigate }: { navigate: (v: string) => void }) {
  return (
    <div className="page">
      <h1>
        <Icon name="flask" size={22} /> Playground
      </h1>
      <p>A free scratchpad — your code is saved automatically on this device.</p>
      <CodeRunner initialCode={`# Play with Python here — try anything!\nprint("Hello from the playground!")\n\nfor i in range(1, 6):\n    print("*" * i)`} draftKey="playground" minHeight={260} />
      <button className="btn ghost" onClick={() => navigate('dashboard')}>
        ← Dashboard
      </button>
    </div>
  )
}
