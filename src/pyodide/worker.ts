/// <reference lib="webworker" />
// Pyodide worker: loads the runtime once, executes code, streams stdout back,
// auto-installs packages referenced by imports (numpy, pandas, matplotlib…)
// and captures matplotlib figures as base64 PNGs.
// The main thread terminates this worker on timeout, so no cleanup is needed.
//
// Two stdin modes:
// - queued (lessons): lines were typed before the run; input() pops them and
//   raises EOFError when they run out.
// - interactive (playground): input() with no queued line raises a private
//   __NeedInput signal; the worker reports it and the main thread collects a
//   line from the terminal, then re-runs the code with the full answer queue.
//   Output the replay re-prints is skipped on the UI side (runner.ts sends
//   printedChars so the terminal knows how much to suppress).

const PYODIDE_VERSION = '0.28.3'
const INDEX_URL = `https://cdn.jsdelivr.net/pyodide/v${PYODIDE_VERSION}/full/`

let pyodide: any = null

const PLOT_CAPTURE = `
import sys, io, base64, json
_plts = []
if 'matplotlib.pyplot' in sys.modules:
    import matplotlib.pyplot as plt
    for _n in plt.get_fignums():
        _f = plt.figure(_n)
        _b = io.BytesIO()
        _f.savefig(_b, format='png', dpi=110, bbox_inches='tight')
        _plts.append(base64.b64encode(_b.getvalue()).decode())
        plt.close(_f)
json.dumps(_plts)
`

// Offline web for the scraping lesson: a tiny fake `requests` (status_code,
// raise_for_status, .text) and a BeautifulSoup-compatible mini `soup` with
// find/findall over a few hand-authored pages. Real API surface, no network.
const WEB_SANDBOX = `
import sys, types

_PAGES = {
    'https://news.example.dev': '''<html><body><h1>Daily Byte</h1><ul><li>Python 4 rumored</li><li>Semicolons strike back</li><li>Tabs vs spaces: peace treaty signed</li></ul></body></html>''',
    'https://quotes.example.dev': '''<html><body><ul><li>Grace: Simplicity is a feature</li><li>Dijkstra: Two problems chose me</li></ul></body></html>''',
    'https://shop.example.dev': '''<html><body><h1>Gadget shop</h1><div id="price">49.99 EUR</div><a href="#">buy</a></body></html>''',
}

class _El:
    def __init__(self, text):
        self.text = text

class _Soup:
    def __init__(self, html):
        self._html = html
    def find(self, tag=None, id=None):
        html = self._html
        if id is not None:
            i = html.find('id="' + id + '"')
            if i == -1:
                return None
            start = html.find('>', i) + 1
            end = html.find('<', start)
            return _El(html[start:end])
        i = html.find('<' + tag)
        if i == -1:
            return None
        start = html.find('>', i) + 1
        end = html.find('</' + tag + '>', start)
        return _El(html[start:end])
    def findall(self, tag):
        out, html, i = [], self._html, 0
        while True:
            i = html.find('<' + tag + '>', i)
            if i == -1:
                return out
            start = i + len(tag) + 2
            end = html.find('</' + tag + '>', start)
            out.append(_El(html[start:end]))
            i = end

def _BeautifulSoup(html, parser=None):
    return _Soup(html)

requests = types.ModuleType('requests')
class _Resp:
    def __init__(self, url):
        self.text = _PAGES.get(url, '')
        self.status_code = 200 if self.text else 404
    def raise_for_status(self):
        if self.status_code >= 400:
            raise Exception('HTTP error ' + str(self.status_code) + ' for ' + getattr(self, 'url', 'url'))
requests.get = lambda url, *a, **k: _Resp(url)
sys.modules['requests'] = requests

bs4 = types.ModuleType('bs4')
bs4.BeautifulSoup = _BeautifulSoup
sys.modules['bs4'] = bs4
`

async function boot() {
  const scriptUrl = INDEX_URL + 'pyodide.mjs'
  const mod: any = await import(/* @vite-ignore */ scriptUrl)
  pyodide = await mod.loadPyodide({ indexURL: INDEX_URL })
  // Non-interactive plotting backend so savefig works headlessly
  await pyodide.runPythonAsync(`import os\nos.environ["MPLBACKEND"] = "AGG"`)
  // offline requests/bs4 for the scraping lesson (harmless elsewhere)
  try {
    await pyodide.runPythonAsync(WEB_SANDBOX)
  } catch {
    /* sandbox is best-effort */
  }
  ;(self as any).postMessage({ type: 'ready' })
}

const bootPromise = boot().catch((err) => {
  ;(self as any).postMessage({
    type: 'bootError',
    error: 'Failed to load Python runtime: ' + (err?.message ?? String(err)),
  })
})

function formatError(e: any): string {
  const msg = String(e?.message ?? e)
  const lines = msg.split('\n').filter((l: string) => l.trim() !== '')
  const useful = lines.filter((l: string) => !l.includes('pyodide.asm') && !l.includes('/lib/python'))
  const tail = useful.slice(-12).join('\n')
  return tail || msg
}

async function run(id: number, code: string, stdin?: string, interactiveQueue?: string[]) {
  if (!pyodide) await bootPromise
  let ok = true
  let error = ''
  let plots: string[] = []
  let needsInput = false
  let printed = 0
  try {
    pyodide.setStdout({
      batched: (s: string) => {
        printed += s.length + 1
        ;(self as any).postMessage({ type: 'stdout', id, chunk: s + '\n' })
      },
    })
    pyodide.setStderr({
      batched: (s: string) => {
        // matplotlib under the AGG backend warns on every plt.show(); harmless
        // in-browser (figures are captured and rendered below the code).
        const cleaned = s
          .split('\n')
          .filter((l: string) => !l.includes('FigureCanvasAgg is non-interactive'))
          .join('\n')
        if (cleaned.trim() !== '') {
          printed += cleaned.length + 1
          ;(self as any).postMessage({ type: 'stdout', id, chunk: cleaned + '\n' })
        }
      },
    })

    // Patch builtins.input.
    // Queued mode: each input() pops one pre-typed line and echoes
    // "prompt value"; empty queue raises EOFError (what a real terminal does
    // when stdin closes).
    // Interactive mode: empty queue raises __NeedInput so the run unwinds and
    // the UI can collect a line from the terminal. The prompt is printed and
    // flushed first so it is already visible (and counted in `printed`).
    let prologue: string
    if (interactiveQueue) {
      prologue =
        `import builtins as _b, sys as _s\n` +
        `class __NeedInput(Exception):\n` +
        `    pass\n` +
        `def _make_input(_q):\n` +
        `    def _input(prompt=''):\n` +
        `        prompt = str(prompt)\n` +
        `        if _q:\n` +
        `            line = _q.pop(0)\n` +
        `            print((prompt or '') + line)\n` +
        `            return line\n` +
        `        if prompt:\n` +
        `            print(prompt, end='')\n` +
        `            _s.stdout.flush()\n` +
        `        raise __NeedInput(prompt)\n` +
        `    return _input\n` +
        `_b.input = _make_input(${JSON.stringify(interactiveQueue)})\n` +
        `del _b, _make_input\n`
    } else {
      prologue =
        `import builtins as _b\n` +
        `def _make_input(_q):\n` +
        `    def _input(prompt=''):\n` +
        `        if not _q:\n` +
        `            if prompt:\n` +
        `                print(prompt)\n` +
        `            raise EOFError('EOF when reading a line - the pretend keyboard box ran out of lines')\n` +
        `        line = _q.pop(0)\n` +
        `        print((prompt or '') + line)\n` +
        `        return line\n` +
        `    return _input\n` +
        `_b.input = _make_input(${JSON.stringify((stdin ?? '').split('\n'))})\n` +
        `del _b, _make_input\n`
    }
    pyodide.runPython(prologue)

    // Auto-install imports from the Pyodide distribution (numpy, pandas,
    // matplotlib, etc.). Unknown imports (tkinter!) fall through to a normal
    // ImportError from the user code itself.
    try {
      await pyodide.loadPackagesFromImports(code, {
        messageCallback: () => {},
      })
    } catch {
      /* package resolution is best-effort */
    }

    try {
      await pyodide.runPythonAsync(code, { globals: pyodide.globals })
    } catch (e: any) {
      if (interactiveQueue && /__NeedInput\b/.test(String(e?.message ?? e))) {
        needsInput = true
      } else {
        throw e
      }
    }
    if (needsInput) {
      ;(self as any).postMessage({ type: 'needsInput', id, printedChars: printed })
      return
    }
    const plotsJson = await pyodide.runPythonAsync(PLOT_CAPTURE)
    plots = JSON.parse(plotsJson)
  } catch (e: any) {
    ok = false
    error = formatError(e)
  }
  ;(self as any).postMessage({ type: 'result', id, ok, error, plots })
}

self.onmessage = async (ev: MessageEvent) => {
  const msg = ev.data as
    | { type: 'run'; id: number; code: string; stdin?: string; interactiveQueue?: string[] }
  if (msg.type === 'run' && typeof msg.id === 'number' && typeof msg.code === 'string') {
    await run(msg.id, msg.code, msg.stdin, msg.interactiveQueue)
  }
}
