// Utility for building hidden test harnesses for exercises.
// Normal mode: user code is exec'd with stdout captured into `_out_lines`;
// their source is available as `_user_code`; hidden tests then run in the
// same globals and print a machine-readable verdict block.
// staticOnly mode (GUI etc.): the code is NOT executed (it couldn't run in a
// browser anyway); tests inspect `_user_code` textually.

export function buildTestProgram(userCode: string, tests: string, staticOnly = false): string {
  const indentedTests = tests
    .split('\n')
    .map((l) => (l.trim() === '' ? '' : '        ' + l))
    .join('\n')

  const execBlock = staticOnly
    ? `_out_lines = []\nprint('(source check — this code type does not run in the browser)')`
    : `_out_buf = _io.StringIO()
with _cl.redirect_stdout(_out_buf), _cl.redirect_stderr(_io.StringIO()):
    try:
        exec(compile(_user_code, "<your code>", "exec"), globals())
    except EOFError:
        pass  # interactive code ran out of pretend keystrokes - expected for games
    except BaseException as _e:
        print(f'[USER-ERROR] {type(_e).__name__}: {_e}')
_out_lines = _out_buf.getvalue().splitlines()
for _l in _out_lines:
    print(_l)`

  // Pyodide's package auto-loader scans the PROGRAM text for imports. User
  // code only exists here as a string literal, so its imports would be
  // invisible and pandas/numpy would fail with ModuleNotFoundError. Hoist
  // the user's import lines into real (try-guarded) statements so the
  // loader sees and installs them before the program runs.
  const userImports = userCode
    .split('\n')
    .filter((l) => /^\s*(?:import|from)\s+\w/.test(l))
    .map((l) => '    ' + l.trim())
    .join('\n')
  const preloadBlock = !staticOnly && userImports ? `try:\n${userImports}\nexcept Exception:\n    pass\n` : ''

  return `import io as _io, contextlib as _cl
_user_code = ${JSON.stringify(userCode)}
${preloadBlock}${execBlock}
_tests_results = []
with _cl.redirect_stdout(_io.StringIO()), _cl.redirect_stderr(_io.StringIO()):
    try:
${indentedTests}
    except AssertionError as _e:
        _tests_results.append(('FAIL', str(_e) or 'assertion failed'))
    except BaseException as _e:
        _tests_results.append(('ERROR', f'{type(_e).__name__}: {_e}'))
if not _tests_results:
    _tests_results.append(('PASS', 'all tests passed'))
for _r in _tests_results:
    print(f'[TEST-{_r[0]}] {_r[1]}')
`
}
