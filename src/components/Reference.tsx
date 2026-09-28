import { useMemo, useState } from 'react'
import { allLessons } from '../curriculum'
import { Icon } from './Icon'

const CHEATS: { title: string; icon: string; items: [string, string][] }[] = [
  {
    title: 'Core syntax',
    icon: 'snake',
    items: [
      ['print("hi", sep=", ", end="\\n")', 'output with options'],
      ['x = 5; x += 1', 'assign & augment'],
      ['if c: … elif: … else: …', 'branching'],
      ['for i in range(10): …', 'counted loop (0..9)'],
      ['while cond: …', 'conditional loop'],
      ['7 / 2 → 3.5, 7 // 2 → 3, 7 % 2 → 1', 'division family'],
      ['f"{name} is {age:.1f}"', 'f-string formatting'],
      ['s[1:4], s[::-1]', 'slice, reverse'],
      ['len(xs), sum(xs), max(xs)', 'aggregates'],
    ],
  },
  {
    title: 'Data structures',
    icon: 'box',
    items: [
      ['xs.append(x) / xs.extend(ys)', 'add one / many'],
      ['xs.pop() / xs.remove(x)', 'remove by pos / value'],
      ['sorted(xs) / xs.sort()', 'new list / in place'],
      ['d[k] / d.get(k, 0)', 'lookup / safe lookup'],
      ['d.items() → (k, v) pairs', 'iterate dict'],
      ['set(xs)', 'dedupe'],
      ['x in xs / x in d / x in s', 'membership'],
      ['list(range(5)), "a,b".split(",")', 'quick builders'],
    ],
  },
  {
    title: 'NumPy (track 6 preview)',
    icon: 'hash',
    items: [
      ['np.array([[1, 2], [3, 4]])', '2-D array'],
      ['a.shape, a.dtype, a.ndim', 'shape info'],
      ['a * 2, a + b', 'vectorized math'],
      ['a[1:, a > 2]', 'slices + boolean masks'],
      ['np.linspace(0, 1, 5)', 'evenly spaced values'],
    ],
  },
  {
    title: 'Pandas (track 6 preview)',
    icon: 'table',
    items: [
      ['pd.read_csv("file.csv")', 'load data'],
      ['df.head(), df.info(), df.describe()', 'first look'],
      ['df["col"], df[["a", "b"]]', 'select columns'],
      ['df[df["age"] > 30]', 'filter rows'],
      ['df.groupby("city")["sales"].sum()', 'aggregate'],
    ],
  },
]

export function Reference({ navigate }: { navigate: (v: string) => void }) {
  const [q, setQ] = useState('')
  const results = useMemo(() => {
    const needle = q.trim().toLowerCase()
    if (needle.length < 2) return []
    return allLessons
      .map((l) => {
        const hay = (
          l.title +
          ' ' +
          l.sections.map((s) => s.h + ' ' + s.md).join(' ') +
          ' ' +
          l.objectives.join(' ')
        ).toLowerCase()
        const hits = needle.split(/\s+/).filter((w) => hay.includes(w)).length
        return { lesson: l, hits }
      })
      .filter((r) => r.hits > 0)
      .sort((a, b) => b.hits - a.hits)
      .slice(0, 20)
  }, [q])

  return (
    <div className="page">
      <h1>
        <Icon name="search" size={22} /> Search & cheat sheets
      </h1>
      <input
        className="search"
        placeholder="Search all lessons… (e.g. slice, while, dictionary)"
        value={q}
        onChange={(e) => setQ(e.target.value)}
      />
      {q.trim().length >= 2 && (
        <div className="search-results">
          {results.length === 0 && <p className="muted">No lessons matched.</p>}
          {results.map(({ lesson }) => (
            <button key={lesson.id} className="search-hit" onClick={() => navigate(`lesson:${lesson.id}`)}>
              {lesson.title}
            </button>
          ))}
        </div>
      )}

      {q.trim().length < 2 && (
        <div className="cheats">
          {CHEATS.map((c) => (
            <section key={c.title} className="cheat">
              <h2>
                <Icon name={c.icon} size={17} /> {c.title}
              </h2>
              <table>
                <tbody>
                  {c.items.map(([code, desc]) => (
                    <tr key={code}>
                      <td><code>{code}</code></td>
                      <td className="muted">{desc}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>
          ))}
        </div>
      )}
    </div>
  )
}
