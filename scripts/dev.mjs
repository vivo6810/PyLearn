// Run the API server and the Vite dev server together: `npm run dev:all`.
// Dependency-free (no concurrently/npm-run-all) so the project stays lean.
import { spawn } from 'node:child_process'
import { existsSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = dirname(dirname(fileURLToPath(import.meta.url)))

const jobs = [
  { name: 'api ', color: '\x1b[36m', args: [join(root, 'server', 'index.js')] },
  { name: 'vite', color: '\x1b[35m', args: [join(root, 'node_modules', 'vite', 'bin', 'vite.js')] },
]

const children = []

for (const job of jobs) {
  const child = spawn(process.execPath, job.args, { cwd: root, stdio: ['ignore', 'pipe', 'pipe'] })
  const label = `${job.color}${job.name}\x1b[0m │ `
  for (const stream of [child.stdout, child.stderr]) {
    let buffer = ''
    stream.setEncoding('utf8')
    stream.on('data', (chunk) => {
      buffer += chunk
      const lines = buffer.split('\n')
      buffer = lines.pop() ?? ''
      for (const line of lines) if (line.trim()) process.stdout.write(label + line + '\n')
    })
  }
  child.on('exit', (code) => {
    process.stdout.write(`${label}exited with code ${code}\n`)
    for (const other of children) if (other !== child) other.kill()
    process.exit(code ?? 0)
  })
  children.push(child)
}

process.on('SIGINT', () => {
  for (const child of children) child.kill()
  process.exit(0)
})

if (!existsSync(join(root, 'node_modules', 'vite', 'bin', 'vite.js'))) {
  console.error('Vite is not installed — run `npm install` first.')
  process.exit(1)
}
