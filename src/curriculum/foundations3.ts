import type { Module } from '../types'

// Module 3 of the Foundations track.
export const foundationsModule3: Module = {
  id: 'f3',
  title: 'Module 3 · Working with Data',
  summary: 'Strings, lists, and dictionaries — the workhorse data structures of everyday Python.',
  lessons: [
    {
      id: 'f3-1',
      title: 'Strings & slicing',
      minutes: 80,
      source: 'ward',
      sourceRef: 'Ward ch. 4',
      objectives: ['Index and slice strings', 'Use key string methods', 'Build strings with f-strings'],
      sections: [
        {
          h: 'Characters and indexes',
          md: `Strings are **sequences of characters**. Index from 0, negative indexes count from the end:\n\n\`\`\`python\ns = "Python"\ns[0]   # 'P'\ns[-1]  # 'n'\n\`\`\`\n\nOut-of-range indexes raise \`IndexError\`. Strings are **immutable** — you cannot assign to \`s[0]\`; you build a new string instead.`,
        },
        {
          h: 'Slicing',
          md: `\`s[start:stop:step]\` — stop is **exclusive**; negatives work; omitted pieces default sensibly:\n\n\`\`\`python\ns = "Python"\ns[0:3]    # 'Pyt'\ns[:3]     # 'Pyt'\ns[3:]     # 'hon'\ns[::-1]   # 'nohtyP' — reversed!\n\`\`\``,
        },
        {
          h: 'Methods you will use daily',
          md: `- \`.upper() .lower() .title() .strip()\`\n- \`.replace(old, new)\`, \`.split(sep)\`, \`.join(list)\`\n- \`.startswith() / .endswith()\`, \`.find()\`, \`.count()\`\n\nMethods return **new** strings — the original never changes.`,
        },
        {
          h: 'f-strings',
          md: `The modern way to build text — evaluate expressions right inside the braces:\n\n\`\`\`python\nname, score = "Ada", 97.5\nprint(f"{name} scored {score:.1f}%")   # Ada scored 97.5%\n\`\`\`\n\n\`:.1f\` = one decimal place; \`{x=}\` shows both name and value. f-strings beat string concatenation for readability every time.`,
        },
      ],
      examples: [
        {
          caption: 'Indexes & slices',
          code: `s = "Python"
print(s[0], s[-1])
print(s[1:4], s[:2], s[4:])
print(s[::-1])`,
          expected: "P n\nyth Py on\nnohtyP",
        },
        {
          caption: 'Everyday methods',
          code: `line = "  Hello, World  "
print(line.strip().upper())
print("a,b,c".split(","))
print("-".join(["2026", "09", "25"]))
print("banana".count("an"))`,
          expected: 'HELLO, WORLD\n[\'a\', \'b\', \'c\']\n2026-09-25\n2',
        },
        {
          caption: 'f-strings',
          code: `name, pi = "Ada", 3.14159
print(f"Hi {name}! pi ≈ {pi:.2f}")
print(f"{name=} {len(name)=}")`,
          expected: 'Hi Ada! pi ≈ 3.14\nname=\'Ada\' len(name)=3',
        },
      ],
      quiz: [
        {
          q: 'What is "Python"[1:4]?',
          choices: ['Pyt', 'yth', 'ytho', 'tho'],
          answer: 1,
          explain: 'Start at index 1, stop before index 4 → y, t, h.',
        },
        {
          q: 'How do you reverse a string s?',
          choices: ['s.reverse()', 'reversed(s)', 's[::-1]', 's.sort()'],
          answer: 2,
          explain: 'A step of -1 walks the string backwards; strings have no .reverse() method.',
        },
        {
          q: 'What does "a-b-c".split("-") return?',
          choices: ["'abc'", "['a','b','c']", "('a','b','c')", "{'a','b','c'}"],
          answer: 1,
          explain: 'split cuts the string at each separator into a list of pieces.',
        },
        {
          q: 'f"{2+3}" produces…',
          choices: ['"2+3"', '"5"', 'Error', '"{2+3}"'],
          answer: 1,
          explain: 'Expressions inside the braces are evaluated: 2+3 → 5.',
        },
        {
          q: 'What is "hello"[-1]?',
          choices: ['h', 'o', 'ello', 'Error'],
          answer: 1,
          explain: 'Negative indexes count from the end: -1 is the last character.',
        },
        {
          q: '"  Ada  ".strip() returns…',
          choices: ['"  Ada  "', '"Ada"', '"Ada  "', 'Error'],
          answer: 1,
          explain: 'strip() removes leading and trailing whitespace — the cleanup before comparing user input.',
        },
      ],
      exercises: [
        {
          title: 'Username generator',
          brief:
            'Build `username` from variables `first = "Grace"` and `last = "Hopper"`: first three letters of first + last three of last, all lowercase → "graper". Use slicing, not hardcoding.',
          starter: `first = "Grace"\nlast = "Hopper"\n\nusername = ""  # TODO: build it from first + last\nprint(username)`,
          tests: `
assert username == 'graper', f'got {username!r}'
assert 'Grace' not in _user_code.split('first =')[0], 'do not hardcode'
`,
          hint: 'first[:3].lower() + last[-3:].lower()',
        },
      ],
    },
    {
      id: 'f3-2',
      title: 'Lists',
      minutes: 85,
      source: 'halterman',
      sourceRef: 'Halterman ch. 10, Ward ch. 5',
      objectives: ['Create and index lists', 'Mutate with methods', 'Iterate safely'],
      sections: [
        {
          h: 'The workhorse container',
          md: `\`\`\`python\nscores = [90, 85, 77]\nprint(scores[0], scores[-1])\n\`\`\`\n\nLists are **ordered** and **mutable** — you can change, add, remove. Mixed types are allowed (though usually you keep one kind).`,
        },
        {
          h: 'Growing and shrinking',
          md: `- \`.append(x)\` — add one item at the end\n- \`.insert(i, x)\` — add at a position\n- \`.extend(other)\` / \`+=\` — add many\n- \`.pop()\` / \`.pop(i)\` — remove & return item\n- \`.remove(x)\` — remove first matching value\n- \`.clear()\` — empty it`,
        },
        {
          h: 'Sorting & friends',
          md: `\`.sort()\` sorts in place; \`sorted(lst)\` returns a new list. \`.reverse()\`, \`.count(x)\`, \`.index(x)\`, \`len(lst)\`, \`sum()\`, \`min()\`, \`max()\` round out the toolkit.`,
        },
        {
          h: 'Slicing copies',
          md: `\`lst[1:3]\` is a new list. But assignment \`b = a\` copies the **reference** — both names point at the same list! Use \`b = a.copy()\` or \`b = a[:]\` for a real copy. This is one of Python's most common beginner surprises.`,
        },
      ],
      examples: [
        {
          caption: 'Mutation methods',
          code: `todo = ["wash", "code"]
todo.append("sleep")
todo.insert(0, "wake")
print(todo)
last = todo.pop()
print(todo, "| removed:", last)`,
          expected: "['wake', 'wash', 'code', 'sleep']\n['wake', 'wash', 'code'] | removed: sleep",
        },
        {
          caption: 'Reference vs copy',
          code: `a = [1, 2, 3]
b = a            # same list!
b.append(4)
print(a)         # a changed too

c = a[:]         # real copy
c.append(99)
print(a, c)`,
          expected: '[1, 2, 3, 4]\n[1, 2, 3, 4] [1, 2, 3, 4, 99]',
        },
        {
          caption: 'Aggregates',
          code: `temps = [21.4, 22.1, 19.8, 25.3]
print(len(temps), sum(temps), max(temps))
temps.sort()
print(temps)`,
          expected: '4 88.6 25.3\n[19.8, 21.4, 22.1, 25.3]',
        },
      ],
      quiz: [
        {
          q: 'What does [10, 20, 30].append([40]) produce?',
          choices: ['[10, 20, 30, 40]', '[10, 20, 30, [40]]', 'Error', '[40, 10, 20, 30]'],
          answer: 1,
          explain: 'append adds its argument as a single item — even if that item is a list. Use extend to flatten.',
        },
        {
          q: 'After `a = [1,2]; b = a; b.append(3)`, what is a?',
          choices: ['[1, 2]', '[1, 2, 3]', 'Error', 'Undefined'],
          answer: 1,
          explain: 'b is another name for the same list, so the mutation is visible through a.',
        },
        {
          q: 'Which returns a NEW sorted list?',
          choices: ['lst.sort()', 'sorted(lst)', 'lst.sorted()', 'sort(lst)'],
          answer: 1,
          explain: 'sort() mutates in place and returns None; sorted() leaves the original alone.',
        },
        {
          q: 'What does [1, 2, 3, 4][1:3] give?',
          choices: ['[1, 2]', '[2, 3]', '[2, 3, 4]', '[1, 2, 3]'],
          answer: 1,
          explain: 'Slice from index 1 up to (not including) 3.',
        },
        {
          q: 'How do you add several items at once to a list?',
          choices: ['append', 'extend', 'add', 'push'],
          answer: 1,
          explain: 'extend adds each element of the given iterable; append would add the whole list as ONE item.',
        },
      ],
      exercises: [
        {
          title: 'Top-3 scorer',
          brief:
            'From `scores = [72, 95, 88, 61, 95, 83]`, build `top3` = the three highest scores, biggest first (duplicates allowed), using methods — no hardcoding.',
          starter: `scores = [72, 95, 88, 61, 95, 83]\n\ntop3 = []\nprint(top3)`,
          tests: `
assert top3 == [95, 95, 88], f'got {top3!r}'
assert scores == [72, 95, 88, 61, 95, 83], 'do not modify scores itself'
`,
          hint: 'sorted(scores, reverse=True)[:3]',
        },
      ],
    },
    {
      id: 'f3-3',
      title: 'Dictionaries & sets',
      minutes: 80,
      source: 'ward',
      sourceRef: 'Ward ch. 7–8, Halterman ch. 11',
      objectives: ['Store key→value pairs', 'Look up, add, iterate safely', 'Choose dict vs set vs list'],
      sections: [
        {
          h: 'Dictionaries map keys to values',
          md: `\`\`\`python\nages = {"ada": 36, "alan": 41}\nages["ada"]        # 36\nages["grace"] = 45 # add\n\`\`\`\n\nKeys are unique; since Python 3.7, insertion order is preserved. Looking up a missing key raises \`KeyError\` — use \`.get(key, default)\` to stay safe.`,
        },
        {
          h: 'Everyday patterns',
          md: `\`\`\`python\nfor key in ages:               # keys\nfor key, value in ages.items(): # both\nages.keys(); ages.values()\n\`\`\`\n\nCounting idiom (used everywhere):\n\n\`\`\`python\ncounts = {}\nfor word in words:\n    counts[word] = counts.get(word, 0) + 1\n\`\`\``,
        },
        {
          h: 'Sets — uniqueness machines',
          md: `\`\`\`python\nseen = {1, 2, 2, 3}    # {1, 2, 3}\nlen(set("mississippi")) # 4 unique letters\n\`\`\`\n\nSupports \`in\` (fast!), union \`|\`, intersection \`&\`, difference \`-\`.`,
        },
        {
          h: 'Choosing a structure',
          md: `- Order & position → **list**\n- Lookup by label → **dict**\n- Membership & dedup → **set**\n- Fixed record that won't change → **tuple**`,
        },
      ],
      examples: [
        {
          caption: 'Counting with get',
          code: `text = "to be or not to be"
counts = {}
for w in text.split():
    counts[w] = counts.get(w, 0) + 1
print(counts)`,
          expected: "{'to': 2, 'be': 2, 'or': 1, 'not': 1}",
        },
        {
          caption: 'Iterating items',
          code: `stock = {"apple": 12, "kiwi": 0, "fig": 7}
for name, qty in stock.items():
    print(f"{name}: {qty}")`,
          expected: 'apple: 12\nkiwi: 0\nfig: 7',
        },
        {
          caption: 'Sets',
          code: `a = {1, 2, 3}
b = {3, 4}
print(a | b, a & b, a - b)
print(len(set("mississippi")))`,
          expected: '{1, 2, 3, 4} {3} {1, 2}\n4',
        },
      ],
      quiz: [
        {
          q: 'What happens with d["missing"] when the key does not exist?',
          choices: ['Returns None', 'Returns 0', 'Raises KeyError', 'Creates it'],
          answer: 2,
          explain: 'Plain [] lookup on a missing key raises KeyError; .get() returns a default instead.',
        },
        {
          q: 'd.get("x", 0) does what when "x" is missing?',
          choices: ['KeyError', 'Returns 0', 'Returns None', 'Adds x=0'],
          answer: 1,
          explain: '.get returns the default you provide — a safe lookup.',
        },
        {
          q: 'Which is a valid set literal?',
          choices: ['{}', '{1, 2}', 'set[1,2]', '(1, 2)'],
          answer: 1,
          explain: '{} is an empty dict; non-empty braces with values make a set.',
        },
        {
          q: 'Fastest way to test membership of 1M items?',
          choices: ['list', 'set', 'string', 'tuple'],
          answer: 1,
          explain: 'Sets (and dicts) use hash tables — constant-time membership checks.',
        },
        {
          q: 'Which CANNOT be a dict key?',
          choices: ['"name"', '42', '(1, 2)', '[1, 2]'],
          answer: 3,
          explain: 'Keys must be immutable (hashable) — lists can change, so they are not allowed. Tuples are fine.',
        },
      ],
      exercises: [
        {
          title: 'Word frequency top',
          brief:
            'For `text = "the cat and the dog chased the cat"`, build `counts` (word → occurrences) and set `top_word` to the most frequent word.',
          starter: `text = "the cat and the dog chased the cat"\n\ncounts = {}\n# count words\n\ntop_word = ""\nprint(counts)\nprint(top_word)`,
          tests: `
assert counts == {'the': 3, 'cat': 2, 'and': 1, 'dog': 1, 'chased': 1}, f'counts = {counts!r}'
assert top_word == 'the', f'top_word = {top_word!r}'
`,
          hint: 'Count with counts.get(w, 0) + 1, then max(counts, key=counts.get) — or a loop tracking the best.',
        },
      ],
    },
    {
      id: 'f3-4',
      title: 'Dates & times',
      minutes: 70,
      source: 'pylearn',
      sourceRef: 'PyLearn original · topics informed by Asabeneh 30-Days-Of-Python',
      objectives: [
        'Create dates and read their parts',
        'Format and parse dates with strftime / strptime',
        'Do date arithmetic with timedelta',
      ],
      sections: [
        {
          h: 'The date object',
          md: `Dates live in the standard library — import them:\n\n\`\`\`python\nfrom datetime import date\n\ndue = date(2026, 10, 7)\nprint(due.year, due.month, due.day)\n\`\`\`\n\nMonths count from **1** — no zero-based surprise here. Handy methods: \`.weekday()\` (Monday = 0), \`.isoformat()\`, and \`date.today()\` for the current day.`,
        },
        {
          h: 'strftime — dates as text',
          md: `\`.strftime(format)\` turns a date into a string using % codes:\n\n\`\`\`python\ndue.strftime("%d %b %Y")   # '07 Oct 2026'\ndue.strftime("%A")         # 'Wednesday'\n\`\`\`\n\nEveryday codes: \`%Y\` year · \`%m\` month · \`%d\` day · \`%b\`/\`%B\` month name · \`%A\` weekday name · \`%H:%M\` time.`,
        },
        {
          h: 'strptime — text as dates',
          md: `The mirror twin: \`datetime.strptime(text, format)\` **parses** text into a date:\n\n\`\`\`python\nfrom datetime import datetime\ndatetime.strptime("25/12/2026", "%d/%m/%Y")  # datetime(2026, 12, 25, 0, 0)\n\`\`\`\n\nIt returns a **datetime** — call \`.date()\` on it if you only want the day. The format string must match the text exactly.`,
        },
        {
          h: 'timedelta — date arithmetic',
          md: `Subtracting two dates gives a \`timedelta\` — a duration you can add back onto dates:\n\n\`\`\`python\nfrom datetime import timedelta\nweek = timedelta(days=7)\nlater = due + week          # a new date, one week on\ngap = date(2027, 1, 1) - due\nprint(gap.days)             # whole days between the dates\n\`\`\`\n\nDates are **immutable**: arithmetic never changes the original — it returns a new date.`,
        },
      ],
      examples: [
        {
          caption: 'Meet date',
          code: `from datetime import date

release = date(2026, 10, 7)
print(release)
print(release.year, release.month, release.day)
print(release.weekday())   # Mon=0 … Sun=6
print(release.isoformat())`,
          expected: '2026-10-07\n2026 10 7\n2\n2026-10-07',
        },
        {
          caption: 'Format & parse',
          code: `from datetime import date, datetime

d = date(2026, 10, 7)
print(d.strftime("%d %b %Y"))
print(d.strftime("%A, %d %B %Y"))

back = datetime.strptime("25/12/2026", "%d/%m/%Y")
print(back.date())`,
          expected: '07 Oct 2026\nWednesday, 07 October 2026\n2026-12-25',
        },
        {
          caption: 'timedelta arithmetic',
          code: `from datetime import date, timedelta

launch = date(2026, 10, 7)
party = launch + timedelta(days=30)
print(party)

new_year = date(2027, 1, 1)
left = new_year - launch
print(left)
print(left.days, "days to go")`,
          expected: '2026-11-06\n86 days, 0:00:00\n86 days to go',
        },
        {
          caption: 'Right now',
          code: `from datetime import date, datetime

print(date.today())   # the day you run this
now = datetime.now()
print(now.year, now.month, now.day, now.hour, now.minute)
print(now.strftime("%H:%M"))`,
        },
      ],
      quiz: [
        {
          q: 'In date(2026, 10, 7), what does the 10 mean?',
          choices: ['Month — Python counts months 1–12', 'Hour (military time)', 'Day of the week', 'Month index like a list (so November)'],
          answer: 0,
          explain: 'Dates read like dates: year, month, day — months run 1…12, no zero-based surprise.',
        },
        {
          q: 'Which one turns the text "25/12/2026" into a date?',
          choices: ['date.today()', 'datetime.strptime("25/12/2026", "%d/%m/%Y")', 'd.strftime("%d/%m/%Y")', 'str(25/12/2026)'],
          answer: 1,
          explain: 'strptime PARSES text with the format you give it; strftime does the opposite — formats a date into text.',
        },
        {
          q: 'date(2027, 1, 1) - date(2026, 10, 7) gives…',
          choices: ['86 (an int)', 'a timedelta — use .days to get 86', 'a new date 86 days later', 'TypeError: cannot subtract dates'],
          answer: 1,
          explain: 'Subtracting dates produces a timedelta; its .days attribute is the whole-day count.',
        },
        {
          q: 'What does .weekday() return for a Monday?',
          choices: ['1', '0', 'Monday', 'None'],
          answer: 1,
          explain: 'Monday = 0 … Sunday = 6 — handy for “is it a weekday?” checks.',
        },
        {
          q: 'd = date(2026, 10, 7). What happens after d.month = 11?',
          choices: ['The date becomes Nov 7', 'A new date is returned', 'AttributeError — dates are immutable', 'The month is appended'],
          answer: 2,
          explain: 'Dates cannot be mutated. Build a new one instead: d + timedelta(days=…) or d.replace(month=11).',
        },
        {
          q: 'd.strftime("%d %b %Y") for 2026-10-07 makes…',
          choices: ['"10/07/26"', '"07 Oct 2026"', '"October 7"', '"2026-10-07"'],
          answer: 1,
          explain: '%d zero-pads the day, %b is the short month name, %Y the four-digit year.',
        },
      ],
      exercises: [
        {
          title: 'Countdown to New Year',
          brief:
            'Using `today = date(2026, 10, 7)` and `new_year = date(2027, 1, 1)`: set `left` to the whole days between them, and build `message` to read exactly `86 days until 01 Jan 2027` — computed, not typed (timedelta for the count, strftime for the date).',
          starter: `from datetime import date, timedelta

today = date(2026, 10, 7)
new_year = date(2027, 1, 1)

left = 0  # TODO: days from today until new_year
message = ""  # TODO: "{left} days until {new_year formatted %d %b %Y}"

print(left)
print(message)`,
          tests: `
from datetime import date
expected_days = (date(2027, 1, 1) - date(2026, 10, 7)).days
assert left == expected_days, f'left = {left!r}, expected {expected_days}'
assert message == f'{expected_days} days until {new_year.strftime("%d %b %Y")}', f'message = {message!r}'
assert '86' not in _user_code, 'compute the number with timedelta — do not hardcode it'
`,
          hint: 'left = (new_year - today).days — subtracting dates gives a timedelta. Then f"{left} days until {new_year.strftime(\"%d %b %Y\")}".',
        },
      ],
    },
  ],
}
