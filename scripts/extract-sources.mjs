import { readdirSync, statSync } from 'node:fs'
import { join } from 'node:path'
import { execSync } from 'node:child_process'

// Re-extracts any PDFs in source/ into source/extracted/ using the system
// pdftotext when available. Extracted text is used only at authoring time;
// the shipped app bundles the curriculum as TS modules.

const SRC = 'source'
const OUT = join(SRC, 'extracted')

for (const f of readdirSync(SRC)) {
  if (!f.toLowerCase().endsWith('.pdf')) continue
  const full = join(SRC, f)
  if (!statSync(full).isFile()) continue
  const base = f.replace(/\.pdf$/i, '').replace(/[^\w-]+/g, '_')
  const dest = join(OUT, base + '.txt')
  try {
    execSync(`pdftotext -layout "${full}" "${dest}"`, { stdio: 'inherit' })
    console.log(`✓ ${f} -> ${dest}`)
  } catch {
    console.warn(`✗ ${f}: pdftotext failed or not installed (npm i pdf-parse fallback)`)
  }
}
console.log('Done.')
