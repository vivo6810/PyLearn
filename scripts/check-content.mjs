// Content sanity checks (run via `npm run check`).
import { readFileSync } from 'node:fs'

const files = [
  'src/curriculum/foundations.ts',
  'src/curriculum/foundations2.ts',
  'src/curriculum/foundations3.ts',
  'src/curriculum/core.ts',
  'src/curriculum/advanced.ts',
  'src/curriculum/tkinter.ts',
  'src/curriculum/data.ts',
]
const errors = []

/** Count top-level elements of the array literal starting at `src[start]` === '['. */
function countArrayElements(src, start) {
  let depth = 0
  let quote = null
  let count = 0
  let sawContent = false
  for (let i = start; i < src.length; i++) {
    const c = src[i]
    if (quote) {
      if (c === '\\') i++
      else if (c === quote) quote = null
      continue
    }
    if (c === '"' || c === "'" || c === '`') {
      quote = c
      sawContent = true
      continue
    }
    if (c === '[' || c === '(' || c === '{') {
      depth++
      sawContent = true
      continue
    }
    if (c === ']' || c === ')' || c === '}') {
      depth--
      if (depth === 0) return count + (sawContent ? 1 : 0)
      continue
    }
    if (c === ',' && depth === 1) count++
    else if (!/\s/.test(c)) sawContent = true
  }
  return count
}

for (const f of files) {
  const src = readFileSync(f, 'utf8')

  // every `answer:` must reference a valid index of the choices array above it
  const re = /answer:\s*(\d+)/g
  let m
  while ((m = re.exec(src))) {
    const idx = Number(m[1])
    const before = src.slice(0, m.index)
    const cIdx = before.lastIndexOf('choices:')
    if (cIdx === -1) {
      errors.push(`${f}@${m.index}: answer without preceding choices`)
      continue
    }
    const bracket = src.indexOf('[', cIdx)
    const n = countArrayElements(src, bracket)
    if (idx >= n) errors.push(`${f}@${m.index}: answer ${idx} out of range (${n} choices)`)
  }

  const ids = [...src.matchAll(/id:\s*'([^']+)'/g)].map((x) => x[1])
  const dupes = ids.filter((id, i) => ids.indexOf(id) !== i)
  if (dupes.length) errors.push(`${f}: duplicate ids ${[...new Set(dupes)].join(', ')}`)
}

if (errors.length) {
  console.error('CONTENT ERRORS:\n' + errors.map((e) => ' - ' + e).join('\n'))
  process.exit(1)
}
console.log('✓ curriculum content checks passed')
