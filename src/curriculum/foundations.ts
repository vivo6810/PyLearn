import type { Track } from '../types'
import { foundationsModule2 } from './foundations2'
import { foundationsModule3 } from './foundations3'

export const foundations: Track = {
  id: 'foundations',
  title: 'Foundations',
  blurb: 'From zero to writing real programs: values, variables, expressions, conditionals, and loops.',
  icon: 'sprout',
  accent: '#4ade80',
  modules: [
    {
      id: 'f1',
      title: 'Module 1 · First Steps',
      summary: 'What a program is, how to store and transform data, and how to talk to your user.',
      lessons: [
        {
          id: 'f1-1',
          title: 'Hello, Python — values & print',
          minutes: 75,
          source: 'halterman',
          sourceRef: 'Halterman ch. 1–2',
          objectives: [
            'Run your first Python program',
            'Print text and numbers',
            'Understand what a value and a type are',
          ],
          sections: [
            {
              h: 'Why Python?',
              md: `Python is a **general-purpose, interpreted** language: you write text, and the Python interpreter reads it top to bottom, doing what you say. There is no visible compile step, which makes experimenting instant.\n\nThree things make Python special:\n\n1. **Readable syntax** — code looks close to English.\n2. **Interpreted** — press Run, see the result. Fast feedback makes learning fast.\n3. **A huge ecosystem** — from automating boring files to training neural networks.\n\n> **Every code block with a ▶ button runs real Python in your browser.** Nothing to install.`,
            },
            {
              h: 'Your first program',
              md: `By tradition, your first program prints \`Hello, world!\`.\n\n- \`print(...)\` is a **function call**: it performs an action (shows text).\n- \`"Hello, world!"\` is a **string literal** — text in quotes.\n\nChange the text and run it again. Nothing can break — the worst outcome is an error message telling you what it didn't understand.`,
            },
            {
              h: 'Values have types',
              md: `Every value has a **type**. The two you meet first:\n\n- \`str\` — text: \`"hello"\`, \`'42'\` (quotes mean text)\n- \`int\` — whole numbers: \`42\`, \`-7\`\n\n\`"42"\` and \`42\` are **completely different values**. Ask Python with \`type(...)\`.`,
            },
            {
              h: 'print can do more',
              md: `\`print\` accepts several values separated by commas, plus options:\n\n- \`sep\` — what goes *between* items (default: one space)\n- \`end\` — what goes *after* the last item (default: newline)`,
            },
            {
              h: 'Common mistakes',
              md: `- **Missing/mismatched quotes** → \`SyntaxError\`.\n- \`print(2+2)\` prints \`4\`; \`print("2+2")\` prints the text \`2+2\`.\n- Python is case-sensitive: \`Print\` ≠ \`print\`.`,
            },
          ],
          examples: [
            {
              caption: 'Run it — your first program',
              code: `print("Hello, world!")`,
              expected: 'Hello, world!',
            },
            {
              caption: 'Numbers vs text',
              code: `print(42)        # an int
print("42")      # a str — the quotes matter!
print(type(42))
print(type("42"))`,
              expected: `42\n42\n<class 'int'>\n<class 'str'>`,
            },
            {
              caption: 'Multiple values, sep & end',
              code: `print("a", "b", "c")             # a b c
print("a", "b", "c", sep="-")    # a-b-c
print("loading", end="... ")
print("done")`,
              expected: `a b c\na-b-c\nloading... done`,
            },
          ],
          quiz: [
            {
              q: 'What does print("2 + 2") display?',
              choices: ['4', '2 + 2', 'Error', '"2 + 2"'],
              answer: 1,
              explain: 'Quotes make it a string: Python prints the literal characters, not the arithmetic result.',
            },
            {
              q: 'Which of these is a string?',
              choices: ["'hello'", '3.14', 'True', '42'],
              answer: 0,
              explain: 'Text in matching quotes is a string, whatever characters are inside.',
            },
            {
              q: 'What does print(1, 2, sep="") print?',
              choices: ['1 2', '12', '1,2', 'Error'],
              answer: 1,
              explain: 'An empty separator means the items are joined with nothing between them.',
            },
            {
              q: 'What does print("hi", end="!") followed by print("yo") output?',
              choices: ['hi!yo', 'hi!\\nyo', 'hi! yo', 'hiyo!'],
              answer: 0,
              explain: 'end="!" replaces the newline, so the next print continues on the same line: hi!yo.',
            },
            {
              q: 'What does print("3" + "4") display?',
              choices: ['7', '34', 'Error', '3 4'],
              answer: 1,
              explain: '+ on strings concatenates: "3" + "4" is "34". Arithmetic needs real numbers: 3 + 4.',
            },
            {
              q: 'Which is a valid string literal?',
              choices: ["'it's fine'", '"it\'s fine"', "it's", '"unterminated'],
              answer: 1,
              explain: 'A double-quoted string can contain a single apostrophe — matching pairs are what matter.',
            },
          ],
          exercises: [
            {
              title: 'Personal introduction',
              brief:
                'Using the strings "Name:", "Ada", "Role:", "programmer", produce exactly:\n```\nName: Ada\nRole: programmer\n```',
              starter: `# use the four strings; combine them however you like\n`,
              tests: `
assert _out_lines[0] == 'Name: Ada', f'first line was {_out_lines[0]!r}'
assert _out_lines[1] == 'Role: programmer', f'second line was {_out_lines[1]!r}'
`,
              hint: 'Two print calls: print("Name:", "Ada") and print("Role:", "programmer") already produce those lines.',
            },
          ],
        },
        {
          id: 'f1-2',
          title: 'Variables & assignment',
          minutes: 75,
          source: 'halterman',
          sourceRef: 'Halterman §2.2–2.3, Ward ch. 1',
          objectives: [
            'Store values in named variables',
            'Follow Python naming rules',
            'Reassign and update variables',
          ],
          sections: [
            {
              h: 'A variable is a label',
              md: `A **variable** is a name that refers to a value. The right side is evaluated first, then the name is bound to the result:\n\n\`\`\`python\nage = 21\nname = "Ada"\n\`\`\`\n\nRead \`=\` as **"becomes"**, not "equals". Re-assigning re-points the label.`,
            },
            {
              h: 'Naming rules',
              md: `Letters, digits, underscores — **not starting with a digit**. Case-sensitive.\n\n\`\`\`python\nuser_name = "Ada"   # OK: snake_case, the Python convention\n2fast = 1           # SyntaxError\nmy-name = 1         # hyphen reads as minus\n\`\`\`\n\nAvoid **keywords** (\`if\`, \`for\`, \`class\`…) — see \`import keyword; print(keyword.kwlist)\`.`,
            },
            {
              h: 'Statements vs expressions',
              md: `\`x = 5\` is a **statement** (an instruction). \`x + 1\` is an **expression** (produces a value). You *can* chain \`x = y = 5\`, and swap without a temp:\n\n\`\`\`python\na, b = 1, 2\na, b = b, a\n\`\`\``,
            },
            {
              h: 'Updating a variable',
              md: `\`\`\`python\nscore = 10\nscore = score + 5   # 15\nscore += 5          # shorthand — augmented assignment\n\`\`\`\n\nAlso \`-=\`, \`*=\`, \`/=\`. You will use \`+=\` constantly in loops.`,
            },
            {
              h: 'Common mistakes',
              md: `- Using a variable before assigning → \`NameError\`.\n- Case slips: \`Name\` vs \`name\`.\n- Confusing \`=\` (assign) with \`==\` (compare).`,
            },
          ],
          examples: [
            {
              caption: 'Binding and re-binding',
              code: `message = "Hello"
count = 3
print(message, count)
count = count + 1
print("count is now", count)`,
              expected: 'Hello 3\ncount is now 4',
            },
            {
              caption: 'Swap trick',
              code: `a, b = 10, 20
a, b = b, a
print(a, b)   # 20 10`,
              expected: '20 10',
            },
            {
              caption: 'Augmented assignment',
              code: `balance = 100
balance += 50
balance -= 30
balance *= 2
print(balance)`,
              expected: '240',
            },
          ],
          quiz: [
            {
              q: 'After `x = 5` then `x = x + 2`, what is x?',
              choices: ['5', '2', '7', 'Error'],
              answer: 2,
              explain: 'Right side first: 5+2=7, then x rebinds to 7.',
            },
            {
              q: 'Which name is invalid?',
              choices: ['total_2', '_temp', '2nd_place', 'forYou'],
              answer: 2,
              explain: 'Names may not start with a digit.',
            },
            {
              q: 'What does `a, b = 3, 8` do?',
              choices: ['a=3, b=8', 'a=8, b=3', 'Syntax error', 'a and b both 11'],
              answer: 0,
              explain: 'Multiple assignment binds positionally.',
            },
            {
              q: '`score += 5` is the same as…',
              choices: ['score = 5', 'score = score + 5', 'score == score + 5', '5 = score'],
              answer: 1,
              explain: '+= adds to the existing value and rebinds.',
            },
            {
              q: 'Which name is the clearest for a value holding a tax rate?',
              choices: ['x', 'tr', 'tax_rate', 'TAXRATE1'],
              answer: 2,
              explain: 'snake_case describing the content (tax_rate) is the Python convention — readable beats clever.',
            },
            {
              q: 'After `a = 1` then `b = a` then `a = 2`, what is b?',
              choices: ['2', '1', 'Undefined', 'Error'],
              answer: 1,
              explain: 'b was bound to the value 1. Reassigning a later does not touch b.',
            },
          ],
          exercises: [
            {
              title: 'Counter arithmetic',
              brief:
                'Starting from `score = 10`, use **only** augmented assignments (`+=`, `-=`, `*=`) so the final print shows `90`.',
              starter: `score = 10\n\n# your augmented assignments\n\nprint(score)  # must print 90`,
              tests: `
assert score == 90, f'score ended as {score}, expected 90'
assert '//' not in _user_code, 'no division needed'
`,
              hint: 'score += 40; score *= 2; score -= 10 → 10→50→100→90.',
            },
          ],
        },
        {
          id: 'f1-3',
          title: 'Numbers & expressions',
          minutes: 80,
          source: 'halterman',
          sourceRef: 'Halterman ch. 3, Ward ch. 3',
          objectives: [
            'Compute with ints, floats, and mixed types',
            'Predict operator precedence',
            'Use //, %, and ** with confidence',
          ],
          sections: [
            {
              h: 'Two kinds of numbers',
              md: `- \`int\` — integers, unlimited precision\n- \`float\` — decimals, ~15 significant digits, stored in binary\n\nMixing them produces a \`float\` (**type coercion**).`,
            },
            {
              h: 'The operators',
              md: `| operator | meaning | example | result |\n|---|---|---|---|\n| \`+\` \`-\` \`*\` | arithmetic | \`7 * 6\` | \`42\` |\n| \`/\` | true division (always float) | \`7 / 2\` | \`3.5\` |\n| \`//\` | floor division | \`7 // 2\` | \`3\` |\n| \`%\` | remainder (modulo) | \`7 % 2\` | \`1\` |\n| \`**\` | power | \`2 ** 10\` | \`1024\` |\n\n\`//\` floors toward **negative infinity**: \`-7 // 2 == -4\`.`,
            },
            {
              h: 'Precedence',
              md: `\`**\` → unary minus → \`* / // %\` → \`+ -\`. Parentheses win. Same-level operators run left→right, **except** \`**\` which is right-associative: \`2 ** 3 ** 2 == 512\`.`,
            },
            {
              h: 'Floating-point surprises',
              md: `\`\`\`python\nprint(0.1 + 0.2)         # 0.30000000000000004\nprint(0.1 + 0.2 == 0.3)  # False!\n\`\`\`\n\nNot a bug — binary floats (IEEE-754), same in every language. For money: count integer cents or use \`round\`/\`decimal\`.`,
            },
            {
              h: 'Common mistakes',
              md: `- Expecting \`1/2\` to be \`0\` — Python 3 \`/\` is always float division.\n- \`% \` sign follows the **divisor**: \`-7 % 3 == 2\`.\n- \`2(x+1)\` is an error — write \`2 * (x + 1)\`.`,
            },
          ],
          examples: [
            {
              caption: 'Division family',
              code: `print(7 / 2)    # 3.5
print(7 // 2)   # 3
print(7 % 2)    # 1
print(-7 // 2)  # -4
print(2 ** 10)  # 1024`,
              expected: '3.5\n3\n1\n-4\n1024',
            },
            {
              caption: 'Precedence',
              code: `print(2 + 3 * 4)      # 14
print((2 + 3) * 4)    # 20
print(2 ** 3 ** 2)    # 512
print(-3 ** 2)        # -9`,
              expected: '14\n20\n512\n-9',
            },
            {
              caption: 'Float precision',
              code: `print(0.1 + 0.2)
print(round(0.1 + 0.2, 2) == 0.3)`,
              expected: '0.30000000000000004\nTrue',
            },
          ],
          quiz: [
            {
              q: 'What is `11 // 4`?',
              choices: ['2.75', '2', '3', '2.0'],
              answer: 1,
              explain: '// floors to the integer 2.',
            },
            {
              q: 'What is `17 % 5`?',
              choices: ['3', '2', '3.4', '0'],
              answer: 1,
              explain: '17 = 5*3 + 2 → remainder 2.',
            },
            {
              q: 'What is `2 + 3 * 4 ** 2`?',
              choices: ['100', '50', '400', '26'],
              answer: 1,
              explain: '4**2=16 → 3*16=48 → 2+48=50.',
            },
            {
              q: 'Why is 0.1 + 0.2 != 0.3?',
              choices: ['Python bug', 'Binary floats cannot represent 0.1 exactly', '0.3 is int', 'import needed'],
              answer: 1,
              explain: 'IEEE-754 binary representation; tiny error accumulates.',
            },
            {
              q: 'What is `10 / 4`?',
              choices: ['2', '2.5', '2.0', 'Error'],
              answer: 1,
              explain: 'A single / is true division and always gives a float: 2.5.',
            },
            {
              q: '`%` is handy for…',
              choices: ['Percentages only', 'Even/odd tests and wrapping numbers', 'Rounding', 'Division'],
              answer: 1,
              explain: 'n % 2 == 0 detects even numbers; n % 60 cycles through seconds/minutes.',
            },
          ],
          exercises: [
            {
              title: 'Seconds → h:m:s',
              brief:
                'Using only `//` and `%`, split `total_seconds` into `h`, `m`, `s` so the print is correct.',
              starter: `total_seconds = 7385\n\nh = 0\nm = 0\ns = 0\nprint(h, "hours", m, "minutes", s, "seconds")`,
              tests: `
assert (h, m, s) == (2, 3, 5), f'got {(h, m, s)} for 7385'
assert '//' in _user_code and '%' in _user_code, 'use // and %'
`,
              hint: 'h = total_seconds // 3600; leftover = total_seconds % 3600; m = leftover // 60; s = leftover % 60.',
            },
          ],
        },
      ],
    },
    foundationsModule2,
    foundationsModule3,
  ],
}
