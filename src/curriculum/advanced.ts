import type { Track } from '../types'

// Advanced Python track (wave 3) — Halterman ch. 8/15, Sweigart ch. 7,
// Guru99 interview material, Pylearn-original enrichment.

export const advanced: Track = {
  id: 'advanced',
  title: 'Advanced Python',
  blurb: 'Comprehensions, generators, decorators, regex and algorithmic thinking — write code that scales.',
  icon: 'rocket',
  accent: '#c084fc',
  modules: [
    {
      id: 'a1',
      title: 'Module 1 · Expressive Python',
      summary: 'Comprehensions, lambda and higher-order functions: more power per line.',
      lessons: [
        {
          id: 'a1-1',
          title: 'Comprehensions & lambda',
          minutes: 85,
          source: 'halterman',
          sourceRef: 'Halterman §8.7, §10.13',
          objectives: ['Transform collections with comprehensions', 'Filter with conditions', 'Use lambda with key functions'],
          sections: [
            {
              h: 'List comprehensions',
              md: `\`\`\`python\nsquares = [n * n for n in range(6)]          # [0,1,4,9,16,25]\nevens    = [n for n in range(20) if n % 2 == 0]\nlabels   = [f"{n}!" for n in range(3)]\n\`\`\`\n\nA comprehension is a compact **map + filter**: build a new list from an old one in one readable line. The general shape:\n\n\`\`\`\n[ expression  for item in iterable  if condition ]\n\`\`\``,
            },
            {
              h: 'Dict & set comprehensions',
              md: `\`\`\`python\nlengths = {w: len(w) for w in ["ada", "python"]}\nunique_initials = {w[0] for w in ["ada", "alan", "amy"]}\n\`\`\``,
            },
            {
              h: 'lambda — tiny anonymous functions',
              md: `\`\`\`python\ndouble = lambda x: x * 2\n\`\`\`\n\nA lambda is a one-expression function with no name. Its real power shows as **arguments to higher-order functions**:\n\n\`\`\`python\nwords = ["banana", "fig", "cherry"]\nwords.sort(key=lambda w: len(w))     # sort by length\npeople.sort(key=lambda p: p.age, reverse=True)\n\`\`\``,
            },
            {
              h: 'map / filter / sorted',
              md: `\`map(f, xs)\` applies f to each item, \`filter(pred, xs)\` keeps matching ones — both return lazy iterators (wrap in \`list()\` to see items). In modern Python a comprehension usually reads better than map/filter chains; know both, prefer the comprehension. \`sorted(xs, key=...)\` never mutates its input.`,
            },
          ],
          examples: [
            {
              caption: 'Comprehension patterns',
              code: `temps_c = [21.5, 24.1, 19.8, 30.2]
temps_f = [c * 9 / 5 + 32 for c in temps_c]
hot = [c for c in temps_c if c > 22]
print([f"{t:.1f}" for t in temps_f])
print(hot)

lengths = {w: len(w) for w in ["ada", "python", "fig"]}
print(lengths)`,
              expected: "['70.7', '75.4', '67.6', '86.4']\n[24.1, 30.2]\n{'ada': 3, 'python': 6, 'fig': 3}",
            },
            {
              caption: 'Sorting with keys',
              code: `people = [("Ada", 36), ("Alan", 41), ("Grace", 85)]
oldest_first = sorted(people, key=lambda p: p[1], reverse=True)
print(oldest_first[0])

words = ["hi", "banana", "ok"]
print(sorted(words, key=lambda w: len(w)))`,
              expected: "('Grace', 85)\n['hi', 'ok', 'banana']",
            },
          ],
          quiz: [
            {
              q: '[n*2 for n in range(4)] produces…',
              choices: ['[0, 2, 4, 6]', '[2, 4, 6, 8]', '[0, 1, 2, 3]', '[1, 2, 4, 8]'],
              answer: 0,
              explain: 'range(4) is 0..3; each doubles to 0,2,4,6.',
            },
            {
              q: 'Where does the if go in a comprehension?',
              choices: [
                'Before the for',
                'After the for, filtering items',
                'Inside the expression only',
                'Comprehensions cannot filter',
              ],
              answer: 1,
              explain: '[x for x in xs if cond] — the condition filters which items enter the result.',
            },
            {
              q: 'lambda x: x * 3 is equivalent to…',
              choices: ['def f(x): return x * 3', 'x * 3 as a statement', 'map(3, x)', 'A generator'],
              answer: 0,
              explain: 'A lambda is just a nameless single-expression function.',
            },
            {
              q: 'sorted(words, key=len) sorts by…',
              choices: ['Alphabet', 'Length', 'Reversed alphabet', 'Hash order'],
              answer: 1,
              explain: 'The key function is applied to each item; sorting uses its result.',
            },
            {
              q: '{w: len(w) for w in words} builds…',
              choices: ['A set of lengths', 'A dict word → length', 'A list of pairs', 'A tuple'],
              answer: 1,
              explain: 'Braces with key: value make a dict comprehension.',
            },
            {
              q: 'When is a raw for-loop still better than a comprehension?',
              choices: [
                'Never',
                'When the logic needs multiple statements or side effects like print',
                'When the list is long',
                'When sorting is involved',
              ],
              answer: 1,
              explain: 'Comprehensions are for building collections from an expression — not multi-step procedures.',
            },
          ],
          exercises: [
            {
              title: 'Comprehension workout',
              brief:
                'Using comprehensions (no explicit loops): from `words`, build `long_words` (length > 3), `word_lengths` (dict word→length), and sort `by_length` longest→shortest.',
              starter: `words = ["the", "quick", "brown", "fox", "jumps"]

long_words = []
word_lengths = {}
by_length = []

print(long_words)
print(word_lengths)
print(by_length)`,
              tests: `
assert long_words == ['quick', 'brown', 'jumps'], f'{long_words!r}'
assert word_lengths == {'the': 3, 'quick': 5, 'brown': 5, 'fox': 3, 'jumps': 5}
assert by_length[0] in ('quick', 'brown', 'jumps'), f'{by_length!r}'
assert len(by_length[0]) >= len(by_length[-1])
assert 'for ' in _user_code, 'use comprehensions'
`,
              hint: 'long = [w for w in words if len(w) > 3]; lengths = {w: len(w) for w in words}; by_length = sorted(words, key=len, reverse=True).',
            },
          ],
        },
      ],
    },
    {
      id: 'a2',
      title: 'Module 2 · Under the Hood',
      summary: 'Generators that stream data, decorators that wrap functions, and regex that eats text.',
      lessons: [
        {
          id: 'a2-1',
          title: 'Generators & decorators',
          minutes: 90,
          source: 'halterman',
          sourceRef: 'Halterman §8.8, §8.10',
          objectives: ['Write generator functions with yield', 'Explain laziness', 'Write and apply decorators'],
          sections: [
            {
              h: 'Generators produce values on demand',
              md: `\`\`\`python\ndef countdown(n):\n    while n > 0:\n        yield n\n        n -= 1\n\nfor x in countdown(3):\n    print(x)    # 3, 2, 1\n\`\`\`\n\n\`yield\` pauses the function, hands out one value, and **resumes later**. Nothing is computed until asked — a generator of a billion numbers uses a few bytes, because only the *current* value exists. This is exactly how \`range\` and file iteration work.`,
            },
            {
              h: 'Why laziness matters',
              md: `Pipelines compose without materializing intermediates: \`sum(x * x for x in big_data)\` streams. In data science and web APIs you stream rows/pages rather than loading everything into RAM.`,
            },
            {
              h: 'Decorators wrap functions',
              md: `\`\`\`python\ndef logged(fn):\n    def wrapper(*args, **kwargs):\n        print("calling", fn.__name__)\n        return fn(*args, **kwargs)\n    return wrapper\n\n@logged\ndef add(a, b):\n    return a + b\n\`\`\`\n\n\`@logged\` is sugar for \`add = logged(add)\`: the decorator receives the function and returns a **replacement** that adds behavior (logging, timing, caching, auth) without touching the original code. Frameworks (Flask routes, pytest fixtures) are decorator-driven.`,
            },
          ],
          examples: [
            {
              caption: 'Lazy generator, tiny memory',
              code: `def fibonacci():
    a, b = 0, 1
    while True:
        yield a
        a, b = b, a + b

fib = fibonacci()
first = [next(fib) for _ in range(10)]
print(first)`,
              expected: '[0, 1, 1, 2, 3, 5, 8, 13, 21, 34]',
            },
            {
              caption: 'A timing decorator',
              code: `import time

def timed(fn):
    def wrapper(*args, **kwargs):
        t0 = time.time()
        result = fn(*args, **kwargs)
        print(f"{fn.__name__} took {time.time()-t0:.3f}s")
        return result
    return wrapper

@timed
def slow_sum(n):
    return sum(range(n))

slow_sum(1_000_000)`,
              expected: 'slow_sum took ~0.02s (timing varies by machine)'
            },
          ],
          quiz: [
            {
              q: 'yield makes a function a…',
              choices: ['Coroutine only', 'Generator', 'Decorator', 'Lambda'],
              answer: 1,
              explain: 'Any function containing yield returns a generator when called.',
            },
            {
              q: 'Generators are…',
              choices: ['Eager', 'Lazy', 'Immutable', 'Threaded'],
              answer: 1,
              explain: 'Values are produced one at a time, on demand.',
            },
            {
              q: '@deco above def f is sugar for…',
              choices: ['f = deco(f)', 'deco = f(deco)', 'f.__deco__()', 'class f(deco)'],
              answer: 0,
              explain: 'The name f rebinds to whatever the decorator returned.',
            },
            {
              q: 'A decorator wrapper commonly uses *args/**kwargs to…',
              choices: ['Speed up calls', 'Forward any arguments', 'Validate types', 'Cache results'],
              answer: 1,
              explain: 'It makes the wrapper transparent to any signature.',
            },
            {
              q: 'What does calling a generator function actually execute?',
              choices: ['The whole body', 'Nothing yet — it builds the generator', 'Only the first yield', 'The cleanup code'],
              answer: 1,
              explain: 'Calling it creates the generator; the body runs lazily as you iterate.',
            },
          ],
          exercises: [
            {
              title: 'Write a call-counter decorator',
              brief:
                'Write decorator `counted` that attaches a `.calls` attribute to the wrapped function and increments it on every call. Verify by calling twice.',
              starter: `def counted(fn):
    def wrapper(*args, **kwargs):
        pass  # your code
    return wrapper

@counted
def ping():
    return "pong"

ping()
ping()
print(ping.calls)  # 2`,
              tests: `
assert callable(ping), 'ping should stay callable'
assert ping() == 'pong'
assert ping.calls == 3, f'calls was {getattr(ping, "calls", None)}'
assert 'wrapper' in _user_code and 'yield' not in _user_code
`,
              hint: 'wrapper.calls = 0 (after def, on wrapper); inside: wrapper.calls += 1 before returning fn(*args, **kwargs).',
            },
          ],
        },
        {
          id: 'a2-2',
          title: 'Regular expressions',
          minutes: 85,
          source: 'sweigart',
          sourceRef: 'Sweigart ch. 7',
          objectives: ['Match patterns with re', 'Use character classes and quantifiers', 'Extract groups'],
          sections: [
            {
              h: 'Patterns for text',
              md: `\`\`\`python\nimport re\n\nprint(re.findall(r"\\d+", "room 12, floor 3"))   # ['12', '3']\nprint(bool(re.search(r"^Hello", "Hello world")))\n\`\`\`\n\nCore atoms: \`\\d\` digit, \`\\w\` word char, \`\\s\` whitespace; \`.\` any char; \`[abc]\` a set; \`^ $\` anchors; \`* + ?\` quantifiers (0+, 1+, optional); \`{3,5}\` range; \`|\` alternation. Raw strings (\`r"..."\`) stop Python eating the backslashes.`,
            },
            {
              h: 'Groups extract pieces',
              md: `\`\`\`python\nm = re.search(r"(\\d{4})-(\\d{2})-(\\d{2})", "due 2026-09-30")\nprint(m.group(0))   # 2026-09-30\nprint(m.group(1))   # 2026\n\`\`\``,
            },
            {
              h: 'The workhorses',
              md: `- \`re.search(pat, s)\` — first match anywhere\n- \`re.findall(pat, s)\` — all matches as a list\n- \`re.sub(pat, repl, s)\` — search & replace\n- \`re.match(pat, s)\` — anchored at the start\n\nTest tricky patterns interactively — run them right here!`,
            },
          ],
          examples: [
            {
              caption: 'Find & clean',
              code: `import re

text = "Ping 8.8.8.8 at 12ms, then 10.1.1.1 at 34ms"
ips = re.findall(r"\\d+\\.\\d+\\.\\d+\\.\\d+", text)
print(ips)
print(re.sub(r"\\s+", "_", "too   many    spaces"))`,
              expected: "['8.8.8.8', '10.1.1.1']\ntoo_many_spaces",
            },
            {
              caption: 'Groups & validation',
              code: `import re

def is_valid_tag(tag):
    return bool(re.fullmatch(r"#[a-z]{2,8}\\d{0,2}", tag))

print(is_valid_tag("#python"))   # True
print(is_valid_tag("#Py3"))      # False (uppercase)

m = re.search(r"#([a-z]+)", "#python3")
print(m.group(1))`,
              expected: 'True\nFalse\npython',
            },
          ],
          quiz: [
            {
              q: 'Which matches one or more digits?',
              choices: ['d*', '\\d+', '\\d?', '[digits]', '\\d{0}'],
              answer: 1,
              explain: '\\d+ = one or more; \\d* would allow zero.',
            },
            {
              q: 'r"\\d+" — why the r prefix?',
              choices: ['Read-only', 'Raw string keeps backslashes', 'Regex required', 'Reverse'],
              answer: 1,
              explain: 'Raw strings stop Python interpreting \\d as an escape.',
            },
            {
              q: 're.sub(r"a+", "x", "caaat") gives…',
              choices: ['cxxt', 'cxt', 'xxx', 'caaatx'],
              answer: 1,
              explain: 'Each run of a+s collapses to x: c-x-t.',
            },
            {
              q: 'In r"(\\d{2})-(\\d{2})", group(2) of "12-34" is…',
              choices: ['12', '34', '12-34', 'None'],
              answer: 1,
              explain: 'Groups number from 1 left to right; group 2 is the second parentheses.',
            },
            {
              q: 'Which pattern matches exactly three uppercase letters?',
              choices: ['[A-Z]{3}', '[A-Z]*3', 'AZZ', '[a-z]{3}'],
              answer: 0,
              explain: '[A-Z] is the character class; {3} demands exactly three repetitions.',
            },
          ],
          exercises: [
            {
              title: 'Log parser',
              brief:
                'From `log`, extract all IPv4 addresses into `ips` and all timestamps like `[12:34:56]` (without brackets) into `times`, using regex.',
              starter: `import re

log = "[12:00:01] GET / from 10.0.0.3\\n[12:00:04] POST /api from 192.168.1.7\\n[12:01:22] GET / from 10.0.0.3"

ips = []
times = []

print(ips)
print(times)`,
              tests: `
assert ips == ['10.0.0.3', '192.168.1.7', '10.0.0.3'], f'{ips!r}'
assert times == ['12:00:01', '12:00:04', '12:01:22'], f'{times!r}'
assert 're.' in _user_code, 'use the re module'
`,
              hint: 'findall(r"\\d+\\.\\d+\\.\\d+\\.\\d+", log); findall(r"\\[(\\d+:\\d+:\\d+)\\]", log) — the parentheses capture without brackets.',
            },
          ],
        },
      ],
    },
    {
      id: 'a3',
      title: 'Module 3 · Algorithmic Thinking',
      summary: 'Judge code by how it scales: big-O intuition, searching, sorting, and classic interview patterns.',
      lessons: [
        {
          id: 'a3-1',
          title: 'Big-O, search & sort',
          minutes: 90,
          source: 'halterman',
          sourceRef: 'Halterman ch. 15 + Guru99 Q&A',
          objectives: ['Reason about growth rates', 'Implement binary search', 'Choose sort strategies'],
          sections: [
            {
              h: 'Growth rates',
              md: `| complexity | n = 1,000 steps | example |\n|---|---|---|\n| O(1) | 1 | dict lookup |\n| O(log n) | ~10 | binary search |\n| O(n) | 1,000 | one loop |\n| O(n log n) | ~10,000 | good sorting |\n| O(n²) | 1,000,000 | nested loops |\n\nBig-O answers one question: **when input grows 10×, how much slower does it get?** An O(n²) calendar importer is fine for 100 events and dies at 100,000 — algorithm choice beats micro-optimization every time.`,
            },
            {
              h: 'Binary search',
              md: `On **sorted** data, halve the search space every step: 1,000,000 items found in ~20 comparisons. This is the classic interview algorithm:\n\n\`\`\`python\ndef binary_search(xs, target):\n    lo, hi = 0, len(xs) - 1\n    while lo <= hi:\n        mid = (lo + hi) // 2\n        if xs[mid] == target:\n            return mid\n        if xs[mid] < target:\n            lo = mid + 1\n        else:\n            hi = mid - 1\n    return -1\n\`\`\``,
            },
            {
              h: 'Sorting in practice',
              md: `Use \`sorted()\`/\`.sort()\` (Timsort, O(n log n)) and shape the comparison with \`key=\`. Know conceptually how bubble/insertion (O(n²), teaching tools) differ from merge/quick sort — and that "which sort is faster for nearly-sorted data?" is a favorite interview question (Timsort exploits runs).`,
            },
          ],
          examples: [
            {
              caption: 'Binary search in action',
              code: `def binary_search(xs, target):
    lo, hi = 0, len(xs) - 1
    steps = 0
    while lo <= hi:
        mid = (lo + hi) // 2
        steps += 1
        if xs[mid] == target:
            return mid, steps
        if xs[mid] < target:
            lo = mid + 1
        else:
            hi = mid - 1
    return -1, steps

xs = list(range(0, 1_000_000, 7))
idx, steps = binary_search(xs, 700_000)
print("found at", idx, "after", steps, "steps")`,
              expected: 'found at 100000 after 14 steps',
            },
            {
              caption: 'O(n²) vs O(n)',
              code: `import time

data = list(range(1200))   # keep this small: Python in the browser is slow

t0 = time.time()
pairs = 0
for a in data:            # nested loops:
    for b in data:        # 1,440,000 iterations
        pairs += 1
t2 = time.time() - t0

t0 = time.time()
total = len(data) * (len(data) - 1) // 2   # constant formula
t3 = time.time() - t0

print(f"nested: {t2:.3f}s, formula: {t3:.6f}s")`,
              expected: 'nested: ~0.5s, formula: ~0.000001s (timing varies)'
            },
          ],
          quiz: [
            {
              q: 'Binary search needs the input to be…',
              choices: ['Any list', 'Sorted', 'Small', 'Unique'],
              answer: 1,
              explain: 'Halving relies on order; unsorted data breaks the invariant.',
            },
            {
              q: 'Two nested loops over n items are…',
              choices: ['O(n)', 'O(n log n)', 'O(n²)', 'O(2ⁿ)'],
              answer: 2,
              explain: 'n × n = n².',
            },
            {
              q: 'Fastest lookup of a key in 1M records?',
              choices: ['List scan', 'Dict (hash) lookup', 'Nested loop', 'String find'],
              answer: 1,
              explain: 'Dict/set hash lookups are O(1) average.',
            },
            {
              q: 'sorted() is O(n log n). At 10× data it takes roughly…',
              choices: ['10× time', '100× time', 'Same time', '1000× time'],
              answer: 0,
              explain: 'n log n grows a bit faster than linear: ~10–13× for 10× data — vastly better than 100× for O(n²).',
            },
            {
              q: 'In binary search over 1,000,000 items, the worst case inspects about…',
              choices: ['1,000,000 items', '50,000 items', '20 items', '1,000 items'],
              answer: 2,
              explain: 'Each pass halves the range: log₂(10⁶) ≈ 20 steps. That is the magic of O(log n).',
            },
          ],
          exercises: [
            {
              title: 'Implement binary search',
              brief: 'Write `binary_search(xs, target)` returning the index or -1. The tests check correctness AND that it touches few elements (no linear scans!).',
              starter: `def binary_search(xs, target):
    pass

xs = [1, 3, 5, 7, 9, 11, 13]
print(binary_search(xs, 7))   # 3
print(binary_search(xs, 4))   # -1`,
              tests: `
xs = [1, 3, 5, 7, 9, 11, 13, 15, 17, 19, 21, 23, 25]
assert binary_search(xs, 13) == 6
assert binary_search(xs, 1) == 0
assert binary_search(xs, 25) == 12
assert binary_search(xs, 14) == -1
assert binary_search([], 5) == -1
`,
              hint: 'Maintain lo/hi; loop while lo <= hi; compare xs[mid] to target and move one boundary past mid each time.',
            },
          ],
        },
      ],
    },
  ],
}
