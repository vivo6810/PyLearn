import type { Track } from '../types'

// Automation & Games track (wave 6) — from Sweigart's "Automate the Boring
// Stuff" (files, CSV, web scraping) plus Pylearn-original game-building
// lessons. Games use input(); in PyLearn the editor's "pretend keyboard"
// stdin box feeds those lines, so turn-based games are fully playable here.

export const automation: Track = {
  id: 'automation',
  title: 'Automation & Games',
  blurb: 'Files, CSV data, web scraping — and your first playable Python games, built from scratch.',
  icon: 'terminal',
  accent: '#a06a58',
  modules: [
    {
      id: 'au1',
      title: 'Module 1 · Automate the Boring Stuff',
      summary: 'Read and write files, slice CSV data, and fetch live pages — the everyday automation toolkit.',
      lessons: [
        {
          id: 'au1-1',
          title: 'Files: read, write, append',
          minutes: 75,
          source: 'sweigart',
          sourceRef: 'Sweigart ch. 9',
          objectives: [
            'Open files in read, write and append modes',
            'Process a file line by line',
            'Use with-blocks so files always close',
          ],
          sections: [
            {
              h: 'Why files matter',
              md: `Variables die when the program ends. **Files are how programs remember** — notes, logs, scores, datasets. Sweigart's chapter 9 is built on one idea: boring chores (renaming 500 files, merging spreadsheets) are ten lines of Python.\n\nThree modes cover 95% of daily work:\n\n- \`"r"\` — **read** (default). File must exist.\n- \`"w"\` — **write**. Creates the file, or **erases it** if it exists.\n- \`"a"\` — **append**. Creates if missing, adds to the end.`,
            },
            {
              h: 'The with-block: the safe way',
              md: `\`\`\`python\nwith open("notes.txt", "w") as f:\n    f.write("hello\\n")\n    f.write("second line\\n")\n\nwith open("notes.txt") as f:\n    for line in f:\n        print(line.strip())\n\`\`\`\n\nThe \`with\` block closes the file even if an error happens inside — never build it by hand with \`open()\` + \`close()\`. Note \`\\n\`: \`write()\` does **not** add newlines for you. And when reading, each line keeps its trailing \`\\n\` — \`strip()\` it away.`,
            },
            {
              h: 'Processing line by line',
              md: `The classic automation shape — read, transform, collect:\n\n\`\`\`python\nscores = []\nwith open("scores.txt") as f:\n    for line in f:\n        text = line.strip()\n        if text:                      # skip blank lines\n            scores.append(int(text))\nprint(max(scores), sum(scores) / len(scores))\n\`\`\`\n\nThis loop is the skeleton of every log-parsing, report-generating script you will ever write.`,
            },
            {
              h: 'In this sandbox',
              md: `PyLearn's Python has a small in-memory file system: files you \`open(..., "w")\` persist for the rest of the session, so write-then-read examples work exactly like on your computer. At runtime paths are virtual — don't expect them on your disk.`,
            },
          ],
          examples: [
            {
              caption: 'Write, then read back',
              code: `with open("diary.txt", "w") as f:
    f.write("Monday: learned files\\n")
    f.write("Tuesday: learned loops\\n")

with open("diary.txt") as f:
    content = f.read()
print(content)
print("lines:", content.count("\\n"))`,
              expected: `Monday: learned files
Tuesday: learned loops

lines: 2`,
            },
            {
              caption: 'Append mode keeps history',
              code: `with open("log.txt", "w") as f:
    f.write("start\\n")

with open("log.txt", "a") as f:
    f.write("event 1\\n")
    f.write("event 2\\n")

with open("log.txt") as f:
    print(f.read())`,
              expected: `start
event 1
event 2`,
            },
            {
              caption: 'Line-by-line processing',
              code: `with open("temps.txt", "w") as f:
    f.write("21\\n19\\n25\\n\\n23\\n")

values = []
with open("temps.txt") as f:
    for line in f:
        text = line.strip()
        if text:
            values.append(int(text))

print("read:", values)
print("max:", max(values), "avg:", sum(values) / len(values))`,
              expected: 'read: [21, 19, 25, 23]\nmax: 25 avg: 22.0',
            },
          ],
          exercises: [
            {
              title: 'High-score file',
              brief:
                'Write 3 scores (980, 1200, 875) to **scores.txt** one per line, then read the file back and print `best:` followed by the largest score. Two with-blocks: one "w", one "r".',
              starter: `# 1) write the scores to scores.txt (one per line)

# 2) read the file back and find the best score

`,
              tests: `
code = _user_code
assert '"scores.txt"' in code or "'scores.txt'" in code, 'use the file name scores.txt'
assert '"w"' in code or "'w'" in code, 'open scores.txt in write mode'
assert '"r"' in code or "'r'" in code or 'open(scores.txt)' in code.replace('"', ''), 'read the file back'
assert 'max(' in code, 'use max() to find the best score'
assert 'best:' in code, 'print best: followed by the score'
`,
              hint: 'Write with a loop or three f.write("...\\n") calls. Reading: for line in f, int(line.strip()), collect, max().',
            },
          ],
          quiz: [
            {
              q: 'Opening an existing file with mode "w" does what?',
              choices: ['Appends to it', 'Erases its contents', 'Fails — file exists', 'Opens read-only'],
              answer: 1,
              explain: '"w" truncates: the file is created empty. Your old data is gone — "a" appends instead.',
            },
            {
              q: 'Why prefer a with-block over open() + close()?',
              choices: [
                'It is faster',
                'It closes the file even if an error occurs',
                'It reads files automatically',
                'close() does not exist',
              ],
              answer: 1,
              explain: 'The with-block guarantees cleanup on success OR exception — no leaked file handles.',
            },
            {
              q: 'f.write("hi") twice produces…',
              choices: ['hi\\nhi\\n', 'hihi', 'hi hi', 'an error'],
              answer: 1,
              explain: 'write() adds nothing between calls — no spaces, no newlines. Add "\\n" yourself.',
            },
            {
              q: 'Iterating a file gives you…',
              choices: ['Characters', 'Words', 'Lines (with trailing \\n)', 'One big string'],
              answer: 2,
              explain: 'for line in f yields lines including their newline — strip() removes it.',
            },
            {
              q: 'Which mode adds to the end of an existing file?',
              choices: ['"r"', '"w"', '"a"', '"x"'],
              answer: 2,
              explain: '"a" = append; it also creates the file if it does not exist yet.',
            },
            {
              q: 'Reading a blank line "" after strip() usually means…',
              choices: ['The file is broken', 'An empty line in the file', 'End of file', 'Encoding error'],
              answer: 1,
              explain: 'Files often end with (or contain) empty lines — filtering with `if text:` is standard.',
            },
          ],
        },
        {
          id: 'au1-2',
          title: 'CSV: the universal data format',
          minutes: 75,
          source: 'sweigart',
          sourceRef: 'Sweigart ch. 16 + Klein (pandas preview)',
          objectives: [
            'Parse CSV rows with the csv module',
            'Turn CSV rows into dictionaries',
            'Aggregate a dataset without any libraries',
          ],
          sections: [
            {
              h: 'One format to rule them all',
              md: `CSV — comma-separated values — is how spreadsheets, banks, and labs ship data: one **row per line**, values split by commas.\n\n\`\`\`\nname,city,age\nAda,London,36\nGrace,New York,85\n\`\`\`\n\nSplitting on \`,\` by hand breaks the moment a city is \`"New York"\`. The **csv module** knows the corner cases (quoted fields, embedded commas) — use it instead of \`line.split(",")\`.`,
            },
            {
              h: 'Two ways to read',
              md: `\`\`\`python\nimport csv\n\nwith open("people.csv") as f:\n    for row in csv.reader(f):      # each row: list of strings\n        print(row)\n\nwith open("people.csv") as f:\n    for person in csv.DictReader(f):   # each row: dict keyed by header\n        print(person["name"], person["age"])\n\`\`\`\n\n\`DictReader\` is the everyday choice: rows become dictionaries keyed by the header row — \`person["city"]\` reads like the data thinks.`,
            },
            {
              h: 'Mini pipeline: filter + aggregate',
              md: `The whole point of automation — answer a question from raw rows:\n\n\`\`\`python\nimport csv\n\nwith open("sales.csv") as f:\n    rows = list(csv.DictReader(f))\n\ntotals = {}\nfor r in rows:\n    totals[r["city"]] = totals.get(r["city"], 0) + int(r["amount"])\n\nfor city, total in sorted(totals.items(), key=lambda kv: -kv[1]):\n    print(city, total)\n\`\`\`\n\nRead → group → sum → sort. When you meet pandas in the Data track, \`df.groupby("city")["amount"].sum()\` will feel like this exact loop, compressed.`,
            },
          ],
          examples: [
            {
              caption: 'Parse a small table',
              code: `import csv

with open("people.csv", "w") as f:
    f.write("name,city,age\\n")
    f.write("Ada,London,36\\n")
    f.write("Grace,New York,85\\n")

with open("people.csv") as f:
    for person in csv.DictReader(f):
        print(person["name"], "is", person["age"])`,
              expected: 'Ada is 36\nGrace is 85',
            },
            {
              caption: 'Group and total',
              code: `import csv

with open("sales.csv", "w") as f:
    f.write("city,amount\\n")
    f.write("Oslo,120\\n")
    f.write("Cairo,300\\n")
    f.write("Oslo,80\\n")

totals = {}
with open("sales.csv") as f:
    for r in csv.DictReader(f):
        totals[r["city"]] = totals.get(r["city"], 0) + int(r["amount"])

print(totals)
print("top:", max(totals, key=totals.get))`,
              expected: "{'Oslo': 200, 'Cairo': 300}\ntop: Cairo",
            },
          ],
          exercises: [
            {
              title: 'Average from CSV',
              brief:
                'The file **readings.csv** exists with a header `value` and several integer rows. Read it with csv.DictReader and print `avg:` followed by the mean of the values (a float is fine).',
              starter: `import csv, os

# (sandbox: create the dataset if it isn't there yet)
if not os.path.exists("readings.csv"):
    with open("readings.csv", "w") as f:
        f.write("value\\n12\\n7\\n19\\n4\\n8\\n")

# your code: read readings.csv, average the "value" column, print avg: <mean>

`,
              tests: `
_out_lines
import csv, os
if not os.path.exists("readings.csv"):
    with open("readings.csv", "w") as f:
        f.write("value\\n12\\n7\\n19\\n4\\n8\\n")
rows = list(csv.DictReader(open("readings.csv")))
vals = [int(r["value"]) for r in rows]
expected = sum(vals) / len(vals)
found = None
for line in _out_lines:
    if line.startswith("avg:"):
        found = float(line.split("avg:")[1].strip())
assert found is not None, 'print a line starting with avg:'
assert abs(found - expected) < 1e-6, f'expected avg {expected}, got {found}'
`,
              hint: 'values = [int(r["value"]) for r in reader] then sum(values)/len(values).',
            },
          ],
          quiz: [
            {
              q: 'Why csv.DictReader over line.split(",")?',
              choices: [
                'It is the only legal parser',
                'It handles quoted fields with embedded commas',
                'It converts numbers automatically',
                'It reads faster',
              ],
              answer: 1,
              explain: 'Raw splitting breaks on quoted values like "New York, NJ" — the csv module respects quotes.',
            },
            {
              q: 'csv.DictReader keys each row by…',
              choices: ['Row number', 'The header row', 'The first column', 'Alphabetical order'],
              answer: 1,
              explain: 'The first file line becomes the keys: row["city"], row["age"]…',
            },
            {
              q: 'Every value from a CSV reader arrives as…',
              choices: ['A string', 'An int', 'A float', 'The right type automatically'],
              answer: 0,
              explain: 'CSV is text — convert with int()/float() yourself.',
            },
            {
              q: 'totals.get(city, 0) + n is the idiom for…',
              choices: ['Deleting a key', 'Counting/accumulating per key', 'Sorting keys', 'Merging dicts'],
              answer: 1,
              explain: 'get with a default of 0 lets you accumulate without checking if the key exists.',
            },
            {
              q: 'sorted(pairs, key=lambda kv: -kv[1]) sorts by…',
              choices: ['Key ascending', 'Value descending', 'Value ascending', 'Insertion order'],
              answer: 1,
              explain: 'kv[1] is the value; negating it flips the sort — biggest totals first.',
            },
            {
              q: 'pandas df.groupby("city")["v"].sum() is the library version of…',
              choices: ['Opening a file', 'The group-and-accumulate loop', 'csv.reader', 'print formatting'],
              answer: 1,
              explain: 'Same pipeline you wrote by hand: group rows by a key, sum each group.',
            },
          ],
        },
        {
          id: 'au1-3',
          title: 'Web scraping with requests',
          minutes: 80,
          source: 'sweigart',
          sourceRef: 'Sweigart ch. 12 + ch. 16',
          objectives: [
            'Fetch a page and check its status',
            'Find data inside HTML with find/findall',
            'Scrape politely and legally',
          ],
          sections: [
            {
              h: 'The shape of scraping',
              md: `Every scraper is three moves: **fetch** the page, **find** the data inside the HTML, **store** it (often into the CSVs you just learned).\n\nSweigart's ch. 12 uses \`requests\` for the fetch; ch. 16's BeautifulSoup-style \`soup.find()\` for the find. In this sandbox both are simulated — same API, a small offline site — so the patterns transfer 1:1 to the real internet.`,
            },
            {
              h: 'Fetch: requests.get',
              md: `\`\`\`python\nimport requests\n\nres = requests.get("https://example.com/news")\nprint(res.status_code)        # 200 = OK, 404 = missing\nres.raise_for_status()        # crash loudly on bad responses\nhtml = res.text\n\`\`\`\n\nAlways check before parsing: scraping a 404 page is the classic silent bug. \`raise_for_status()\` turns "empty data" into a clear exception.`,
            },
            {
              h: 'Find: the soup',
              md: `\`\`\`python\nsoup = BeautifulSoup(html, "html.parser")\n\nh1 = soup.find("h1")               # first <h1> or None\nprint(h1.text)\n\nfor item in soup.findall("li"):    # every <li>\n    print("-", item.text)\n\nbox = soup.find(id="prices")       # by attribute\`\`\`\n\n\`find\` returns one element (or \`None\` — check it!), \`findall\` returns a list. \`.text\` strips the tags and gives the words.`,
            },
            {
              h: 'Scrape like a decent human',
              md: `Real-world rules: read the site's \`robots.txt\`, never hammer a server (add delays), don't scrape login-walled or personal data, and prefer official APIs when they exist. Sweigart's rule of thumb: if the data is public and your use is light and attributed, you're fine — when in doubt, ask.`,
            },
          ],
          examples: [
            {
              caption: 'Fetch and parse headlines',
              code: `import requests

res = requests.get("https://news.example.dev")
res.raise_for_status()

soup = BeautifulSoup(res.text, "html.parser")
h = soup.find("h1")
print("headline:", h.text)

for li in soup.findall("li"):
    print("-", li.text)`,
              expected: 'headline: Daily Byte\n- Python 4 rumored\n- Semicolons strike back\n- Tabs vs spaces: peace treaty signed',
            },
            {
              caption: 'Scrape a table into rows',
              code: `import requests

res = requests.get("https://quotes.example.dev")
soup = BeautifulSoup(res.text, "html.parser")

rows = []
for div in soup.findall("li"):
    who, _, text = div.text.partition(": ")
    rows.append({"author": who, "quote": text})

for r in rows:
    print(r["author"], "->", r["quote"][:30])`,
              expected: 'Grace -> Simplicity is a feature\nDijkstra -> Two problems chose me',
            },
          ],
          exercises: [
            {
              title: 'Price watcher',
              brief:
                'Fetch **https://shop.example.dev** (use requests + raise_for_status), then BeautifulSoup: find the element with `id="price"` and print `now:` followed by its text. If the element is missing, print `sold out` instead.',
              starter: `import requests

# 1) fetch the page and raise_for_status()

# 2) soup.find(id="price"); print its text (or "sold out" if None)

`,
              tests: `
_out_lines
import requests
res = requests.get("https://shop.example.dev")
res.raise_for_status()
soup = BeautifulSoup(res.text, "html.parser")
expected = soup.find(id="price")
code = _user_code
assert 'raise_for_status' in code, 'call res.raise_for_status()'
assert 'find' in code and 'price' in code, 'find the id="price" element'
assert 'sold out' in code, "handle the missing-element case with 'sold out'"
out = [l for l in _out_lines if l.startswith('now:')]
assert out, 'print a line starting with now:'
assert out[0].split('now:')[1].strip() == (expected.text if expected else ''), 'wrong price printed'
`,
              hint: 'el = soup.find(id="price") — then if el is None: print("sold out") else: print("now:", el.text).',
            },
          ],
          quiz: [
            {
              q: 'res.status_code == 404 means…',
              choices: ['Success', 'Redirect', 'Page not found', 'Server crashed'],
              answer: 2,
              explain: '4xx = client error (404 not found); 200 = OK; 5xx = server error.',
            },
            {
              q: 'res.raise_for_status() does what?',
              choices: ['Retries the request', 'Raises an exception on 4xx/5xx', 'Prints the status', 'Refreshes the page'],
              answer: 1,
              explain: 'It fails loudly instead of letting you parse an error page as data.',
            },
            {
              q: 'soup.find("h1") returns…',
              choices: ['A list of h1s', 'The first h1, or None', 'The h1 text', 'Always an error if absent'],
              answer: 1,
              explain: 'find = first match or None (check before using .text!). findall = every match.',
            },
            {
              q: 'soup.findall("li") returns…',
              choices: ['The first li', 'All li elements as a list', 'li text joined', 'A dict'],
              answer: 1,
              explain: 'findall = every match, in document order — loop over it.',
            },
            {
              q: 'el.text gives you…',
              choices: ['The raw HTML', 'The visible text without tags', 'The attributes', 'A nested soup'],
              answer: 1,
              explain: '.text strips tags — the human-readable content.',
            },
            {
              q: 'Polite scraping includes…',
              choices: [
                'Requesting as fast as possible',
                'Ignoring robots.txt',
                'Adding delays and respecting robots.txt',
                'Scraping private accounts',
              ],
              answer: 2,
              explain: 'Light, delayed, public, attributed — and prefer official APIs when available.',
            },
          ],
        },
      ],
    },
    {
      id: 'au2',
      title: 'Module 2 · Build Your First Games',
      summary: 'Turn every concept so far — loops, state, functions, files — into two playable games.',
      lessons: [
        {
          id: 'au2-1',
          title: 'Game loop & player input: number hunt',
          minutes: 85,
          source: 'pylearn',
          sourceRef: 'Pylearn original (Sweigart ch. 4 + games)',
          objectives: [
            'Structure a program around a game loop',
            'Validate and act on player input',
            'Track state across turns (attempts, best score)',
          ],
          sections: [
            {
              h: 'Every game is a loop',
              md: `A game is: **state** (secret, lives, score) + a **loop** (read input → update state → show result → repeat) + an **exit condition** (win/lose/quit). Master this skeleton and every game — from guess-the-number to chess engines — is variations on it:\n\n\`\`\`python\nwhile True:\n    guess = input("your guess: ")\n    if not guess.isdigit():\n        print("numbers only!")\n        continue          # invalid: ask again\n    ...                   # update state, check win\n    break                 # only on win\n\`\`\`\n\n\`continue\` re-asks without consuming a turn; \`break\` ends the loop. That pair is the whole "feel" of a turn-based game.`,
            },
            {
              h: 'Input is always a string',
              md: `\`input()\` returns text. Convert with \`int()\` **after** checking \`isdigit()\`, or your game crashes the first time someone types "ten". Robust input handling is the difference between a toy and a game you show people.`,
            },
            {
              h: 'State: attempts and best score',
              md: `Track attempts in a counter you bump each valid guess. Best score is a **file** — the high-score pattern from the files lesson: read at start (default 9999 if missing), overwrite on a new record. Games that remember you between runs feel real.`,
            },
            {
              h: 'Playing in PyLearn',
              md: `Real games wait on a keyboard; a browser run cannot. Type the answers the player would give into the editor's **pretend keyboard** box (one line per \`input()\`) and press Run — the game plays through your "keystrokes". Try: a wrong guess, then the right one.`,
            },
          ],
          examples: [
            {
              caption: 'Number hunt — full game (stdin: 50, then 42)',
              code: `import random

random.seed(7)                 # same secret every run -> 42
secret = random.randint(1, 100)
tries = 0

while True:
    raw = input("your guess (1-100): ")
    if not raw.isdigit():
        print("numbers only!")
        continue
    guess = int(raw)
    tries += 1
    if guess < secret:
        print("higher!")
    elif guess > secret:
        print("lower!")
    else:
        print(f"got it in {tries} tries!")
        break`,
              stdinHint: 'guesses: try 50, then 42 (the secret is seeded to 42)',
            },
            {
              caption: 'Persistent high score',
              code: `import random
import os

random.seed(7)                 # same secret every run -> 6
secret = random.randint(1, 10)
best = 99
if os.path.exists("best.txt"):     # first run: no file yet
    with open("best.txt") as f:
        text = f.read().strip()
        if text:
            best = int(text)

tries = 0
while True:
    guess = int(input("guess 1-10: "))
    tries += 1
    if guess == secret:
        print(f"won in {tries}")
        if tries < best:
            best = tries
            with open("best.txt", "w") as f:
                f.write(str(best))
            print("new record!")
        break
    print("nope!")`,
              stdinHint: 'one guess per line — 5 then 6 wins',
            },
          ],
          exercises: [
            {
              title: 'Parity stack — odd or even, three rounds',
              brief:
                'Build a tiny game: loop **exactly 3 times**. Each round, read a number with input(); if it is even print `even`, else print `odd`. After the loop print `rounds: 3`.',
              starter: `for round_num in range(3):
    # read a number, print even/odd
    pass  # TODO: replace with the real round logic

# after the loop
`,
              tests: `
_out_lines
code = _user_code
assert 'range(3)' in code, 'loop exactly 3 times (range(3))'
assert 'input(' in code, 'read input each round'
assert 'even' in code and 'odd' in code, 'print even or odd'
assert 'rounds: 3' in code, 'print rounds: 3 after the loop'
# functional replay: run the learner's code with answers 2, 7, 8
_replay_answers = iter(['2', '7', '8'])
_replay_buf = _io.StringIO()
with _cl.redirect_stdout(_replay_buf):
    exec(compile(code, '<replay>', 'exec'), {'input': lambda prompt='': next(_replay_answers), '__name__': '__main__'})
_replay = _replay_buf.getvalue().splitlines()
assert _replay[:3] == ['even', 'odd', 'even'], f'with answers 2, 7, 8 expected even/odd/even, got {_replay[:3]}'
`,
              hint: 'n = int(input()); print("even" if n % 2 == 0 else "odd") inside the loop. Then print("rounds: 3").',
              stdinHint: 'try your game: one number per line (e.g. 4, 7, 8)',
            },
          ],
          quiz: [
            {
              q: 'The `continue` statement in a game loop…',
              choices: ['Ends the game', 'Restarts the program', 'Skips to the next loop round', 'Pauses the game'],
              answer: 2,
              explain: 'continue jumps to the next iteration — perfect for "invalid input, ask again".',
            },
            {
              q: 'input() always returns…',
              choices: ['An int', 'A string', 'A float', 'Whatever the user typed, typed'],
              answer: 1,
              explain: 'Always a string — isdigit()-check, then int().',
            },
            {
              q: '"ten".isdigit() evaluates to…',
              choices: ['True', 'False', 'An error', '"ten"'],
              answer: 1,
              explain: 'isdigit() is False for words — that is exactly the guard you want before int().',
            },
            {
              q: 'Why keep the best score in a file?',
              choices: [
                'Files are faster than variables',
                'Variables reset when the program ends',
                'The law requires it',
                'It makes the game harder',
              ],
              answer: 1,
              explain: 'State in files survives between runs — variables do not.',
            },
            {
              q: 'while True: with a break inside is…',
              choices: ['An infinite loop bug', 'The standard game-loop shape', 'Only for sockets', 'Infinite only if break never runs'],
              answer: 3,
              explain: 'Deliberate infinite loops with a win/quit break are exactly how game loops work.',
            },
            {
              q: 'In PyLearn, player keystrokes come from…',
              choices: ['The mouse', 'The pretend-keyboard box, one line per input()', 'The URL bar', 'They are impossible'],
              answer: 1,
              explain: 'Each stdin line answers one input() call, in order.',
            },
          ],
        },
        {
          id: 'au2-2',
          title: 'Project: quiz & dungeon crawlers',
          minutes: 90,
          source: 'pylearn',
          sourceRef: 'Pylearn original (capstone workshop)',
          objectives: [
            'Model game data with lists and dicts',
            'Build a scored quiz engine from a data structure',
            'Compose rooms, items and choices into a crawl',
          ],
          sections: [
            {
              h: 'Data-driven games',
              md: `Beginners hard-code every question and room. Programmers **put the game in data** and write one small engine to run it:\n\n\`\`\`python\nQUIZ = [\n    {"q": "2 + 2?", "answer": "4"},\n    {"q": "capital of France?", "answer": "paris"},\n]\n\nscore = 0\nfor item in QUIZ:\n    if input(item["q"] + " ").strip().lower() == item["answer"]:\n        score += 1\nprint(f"{score}/{len(QUIZ)}")\n\`\`\`\n\nAdding ten questions is now *editing data*, not rewriting logic — the same split that powers PyLearn itself.`,
            },
            {
              h: 'The quiz engine, upgraded',
              md: `Three cheap upgrades that make it feel professional: **shuffle** the questions (\`random.shuffle(QUIZ)\`), accept case-insensitive answers (\`.lower()\`), and grade at the end with a message per tier — perfect / pass / retry, exactly like the quiz cards you have been answering all along.`,
            },
            {
              h: 'Rooms: a dict of places',
              md: `A dungeon is a **graph**: rooms keyed by name, each with a description and exits:\n\n\`\`\`python\nROOMS = {\n    "hall": {"desc": "a long hall. Doors: north", "exits": {"north": "lab"}},\n    "lab":  {"desc": "glowing vials. Door: south", "exits": {"south": "hall"}},\n}\n\nplace = "hall"\nwhile True:\n    room = ROOMS[place]\n    print(room["desc"])\n    word = input("> ").strip().lower()\n    if word == "quit":\n        break\n    if word in room["exits"]:\n        place = room["exits"][word]\n    else:\n        print("you can't go that way")\n\`\`\`\n\nItems, traps and monsters slot in as more keys per room. Your entire Zork is 30 lines.`,
            },
            {
              h: 'Ship it',
              md: `You now have every piece Sweigart promises: files for persistence, loops for turns, dicts for world data, functions to keep it sane. The playground is your distribution channel — go make something silly and show someone.`,
            },
          ],
          examples: [
            {
              caption: 'Quiz engine (stdin: paris, 4, no)',
              code: `import random

QUIZ = [
    {"q": "capital of France?", "answer": "paris"},
    {"q": "2 + 2?", "answer": "4"},
    {"q": "Python creator?", "answer": "guido"},
]

random.shuffle(QUIZ)
score = 0
for item in QUIZ:
    ans = input(item["q"] + " ").strip().lower()
    if ans == item["answer"]:
        print("correct!")
        score += 1
    else:
        print("nope")

ratio = score / len(QUIZ)
print(f"{score}/{len(QUIZ)}", "perfect!" if ratio == 1 else "keep going")`,
              stdinHint: 'answers: paris, 4, guido',
            },
            {
              caption: 'Two-room dungeon (stdin: north, quit)',
              code: `ROOMS = {
    "hall": {"desc": "a long hall. Exits: north", "exits": {"north": "lab"}},
    "lab": {"desc": "glowing vials hum. Exits: south", "exits": {"south": "hall"}},
}

place = "hall"
while True:
    room = ROOMS[place]
    print(room["desc"])
    word = input("> ").strip().lower()
    if word == "quit":
        print("goodbye")
        break
    if word in room["exits"]:
        place = room["exits"][word]
    else:
        print("you can't go that way")`,
              stdinHint: 'commands: north, then quit',
            },
          ],
          exercises: [
            {
              title: 'Three-question quiz engine',
              brief:
                'Given the QUIZ list in the starter, loop over it, ask each question with input(), accept answers **case-insensitively**, count correct ones, and finish by printing `score: <n>/3`.',
              starter: `QUIZ = [
    {"q": "What is 7 x 8?", "answer": "56"},
    {"q": "First language of the web?", "answer": "html"},
    {"q": "len('abc')?", "answer": "3"},
]

score = 0
# ask each question, compare lowercased, count score

# print score: <n>/3
`,
              tests: `
_out_lines
code = _user_code
assert 'lower()' in code, 'accept answers case-insensitively (lower())'
assert 'input(' in code, 'ask with input()'
assert 'score: ' in code, 'print score: n/3 at the end'
correct = 0
for line in _out_lines:
    if line.startswith('score:'):
        correct = line.split('score:')[1].strip()
assert correct == '3/3', f'expected score: 3/3, got {correct!r} (feed the right answers in stdin!)'
`,
              hint: 'ans = input(item["q"] + " ").strip().lower(); if ans == item["answer"]: score += 1. Feed 56, html, 3 in the stdin box.',
            },
          ],
          quiz: [
            {
              q: 'Data-driven means…',
              choices: [
                'The game content lives in data structures',
                'The game runs on a database',
                'No functions are allowed',
                'Data is stored in the cloud',
              ],
              answer: 0,
              explain: 'Questions/rooms/items live in lists/dicts; one small engine interprets them.',
            },
            {
              q: 'Why .strip().lower() the answer?',
              choices: ['Style', 'So " Paris " and "PARIS" both count', 'It is faster', 'input() requires it'],
              answer: 1,
              explain: 'Normalization makes matching forgiving — the player types freely, the engine stays strict.',
            },
            {
              q: 'In the ROOMS dict, moving north means…',
              choices: [
                'Printing a map',
                'Looking up room["exits"]["north"] and reassigning place',
                'Deleting the room',
                'Restarting the loop',
              ],
              answer: 1,
              explain: 'The graph walk: place = room["exits"][direction].',
            },
            {
              q: 'random.shuffle(QUIZ) does what?',
              choices: ['Sorts it', 'Reorders it in place randomly', 'Picks one item', 'Reverses it'],
              answer: 1,
              explain: 'In-place shuffle — every run asks the questions in a new order.',
            },
            {
              q: 'Grading with tiers (perfect/pass/retry) is…',
              choices: [
                'A ratio compared to thresholds',
                'len(QUIZ) printed three times',
                'Only possible with pandas',
                'A file operation',
              ],
              answer: 0,
              explain: 'score/len(QUIZ) against 1.0 / 0.6 style thresholds — same logic as PyLearn quizzes.',
            },
            {
              q: 'Adding 10 more questions to the engine requires…',
              choices: [
                'Rewriting the loop',
                'Only editing the QUIZ data',
                'A new function per question',
                'Upgrading Python',
              ],
              answer: 1,
              explain: 'That is the payoff of data-driven design: content changes, engine stays.',
            },
          ],
        },
      ],
    },
  ],
}
