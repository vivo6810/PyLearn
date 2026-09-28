import type { Module } from '../types'

// Module 2 of the Foundations track, split out to keep files manageable.
// The main foundations.ts imports this as its second module.

const module2: Module = {
  id: 'f2',
  title: 'Module 2 · Decisions & Repetition',
  summary: 'Branching with if/elif/else and automating work with while and for loops.',
  lessons: [
    {
      id: 'f2-1',
      title: 'Booleans & comparisons',
      minutes: 70,
      source: 'halterman',
      sourceRef: 'Halterman §4.1–4.2',
      objectives: ['Evaluate comparison operators', 'Combine conditions with and/or/not', 'Grasp truthiness'],
      sections: [
        {
          h: 'bool — the two-valued type',
          md: `A **boolean** is \`True\` or \`False\` (capitalized!). Comparisons produce booleans:\n\n\`\`\`python\nprint(3 > 2)      # True\nprint(3 == 3)     # True — equality is TWO equals\nprint(3 != 3)     # False\n\`\`\``,
        },
        {
          h: 'The comparison operators',
          md: `| op | meaning |\n|---|---|\n| \`==\` | equal |\n| \`!=\` | not equal |\n| \`<\` \`>\` | less / greater |\n| \`<=\` \`>=\` | less-or-equal / greater-or-equal |\n\nThey work on numbers, strings (dictionary order), lists, and more. Chains work like math: \`0 <= x <= 100\` is valid and beautiful.`,
        },
        {
          h: 'and · or · not',
          md: `\`A and B\` — true only if **both** true. \`A or B\` — true if **at least one** true. \`not A\` — flips.\n\nPython evaluates these **short-circuit**: \`A and B\` doesn't even look at B if A is false. You will exploit this later for safe checks like \`x != 0 and 10/x > 1\`.`,
        },
        {
          h: 'Truthiness',
          md: `Any value can be tested for truth: \`0\`, \`0.0\`, \`""\`, empty containers, and \`None\` are **falsy**; everything else is **truthy**. So \`if items:\` reads as "if the list has anything".`,
        },
      ],
      examples: [
        {
          caption: 'Comparisons & chaining',
          code: `age = 20
print(13 <= age <= 19)   # teenage check
print("apple" < "banana")
print(2 == 2.0)          # True — value equality across types`,
          expected: 'False\nTrue\nTrue',
        },
        {
          caption: 'Logical operators',
          code: `print(True and False)   # False
print(True or False)    # True
print(not True)         # False
print(1 < 2 and 2 < 3)  # True`,
          expected: 'False\nTrue\nFalse\nTrue',
        },
        {
          caption: 'Truthiness',
          code: `print(bool(0), bool(42), bool(""), bool("hi"), bool([]), bool([1]))`,
          expected: 'False True False True False True',
        },
      ],
      quiz: [
        {
          q: 'What does `5 != 5` evaluate to?',
          choices: ['True', 'False', 'Error', 'None'],
          answer: 1,
          explain: '5 is equal to 5, so "not equal" is False.',
        },
        {
          q: 'Which is True?',
          choices: ['False and True', 'False or False', 'not True', 'not False'],
          answer: 3,
          explain: 'not False → True. The others are all False.',
        },
        {
          q: 'Is `1 < x < 10` legal Python?',
          choices: ['Yes — chained comparison', 'No — syntax error', 'Only with parentheses', 'Only for ints'],
          answer: 0,
          explain: 'Python supports chaining comparisons naturally, like math.',
        },
        {
          q: 'Which value is falsy?',
          choices: ['"0"', '[]', '[0]', '-1'],
          answer: 1,
          explain: 'An empty list is falsy; a string "0", a list containing 0, and -1 are all truthy.',
        },
        {
          q: 'What does `not (3 > 1 and 2 > 5)` evaluate to?',
          choices: ['True', 'False', 'Error', 'None'],
          answer: 0,
          explain: 'and needs both sides: 3>1 is True but 2>5 is False, so the and is False — not False is True.',
        },
        {
          q: 'Which is the Pythonic way to test “x is exactly 5”?',
          choices: ['x = 5', 'x == 5', 'x is 5', 'x.equals(5)'],
          answer: 1,
          explain: '== compares values. = assigns, and is compares identity — wrong tool for numbers.',
        },
      ],
      exercises: [
        {
          title: 'In range?',
          brief: 'Set `in_range` to True if `x` is between 1 and 100 **inclusive**, else False. One line, no if needed.',
          starter: `x = 100\n\nin_range = None  # TODO: write the comparison\nprint(in_range)`,
          tests: `
assert in_range == (1 <= x <= 100), 'in_range wrong for x=100'
`,
          hint: 'Just write the comparison chain directly: 1 <= x <= 100.',
        },
      ],
    },
    {
      id: 'f2-2',
      title: 'if / elif / else',
      minutes: 80,
      source: 'halterman',
      sourceRef: 'Halterman §4.3–4.9, Ward ch. 12',
      objectives: ['Write branching programs', 'Choose between sequential ifs and elif ladders', 'Nest conditionals sanely'],
      sections: [
        {
          h: 'The if statement',
          md: `\`\`\`python\nif condition:\n    # runs only when condition is True\n    do_something()\n\`\`\`\n\nThe colon and the **indentation** are the syntax. Four spaces is the convention. Indentation is how Python knows what belongs inside the branch.`,
        },
        {
          h: 'else and elif',
          md: `\`\`\`python\nif temp > 30:\n    print("hot")\nelif temp > 20:\n    print("warm")\nelse:\n    print("cold")\n\`\`\`\n\nBranches are checked **top to bottom**; the first true one wins and the rest are skipped. This is why the order matters: \`temp = 35\` hits the first branch only.`,
        },
        {
          h: 'elif ladder vs sequential ifs',
          md: `Several independent \`if\` statements all get checked; an \`elif\` ladder stops at the first match. Grading is the classic trap: with separate ifs, a score of 95 prints *both* "A" and "B" conditions unless you use elif.`,
        },
        {
          h: 'Nesting & style',
          md: `You can put ifs inside ifs. Deep nesting gets hard to read — prefer early exits and ladders. A dangling \`else\` attaches to the nearest unmatched \`if\`.`,
        },
      ],
      examples: [
        {
          caption: 'Ladder in action',
          code: `score = 86
if score >= 90:
    grade = "A"
elif score >= 80:
    grade = "B"
elif score >= 70:
    grade = "C"
else:
    grade = "F"
print(grade)`,
          expected: 'B',
        },
        {
          caption: 'Nested vs combined',
          code: `age, has_id = 19, True
if age >= 18 and has_id:
    print("allowed")
else:
    print("denied")`,
          expected: 'allowed',
        },
      ],
      quiz: [
        {
          q: 'In an if/elif ladder, how many branches run?',
          choices: ['All true ones', 'Exactly one — the first true', 'The last true one', 'At least two'],
          answer: 1,
          explain: 'Execution stops after the first true branch; the rest of the ladder is skipped.',
        },
        {
          q: 'What must follow an if condition?',
          choices: ['A semicolon', 'A colon and an indented block', 'Parentheses', 'The word then'],
          answer: 1,
          explain: 'Python uses a colon + indentation to define the branch body.',
        },
        {
          q: 'score = 95 with separate ifs for >=90 (A) and >=80 (B): what prints?',
          choices: ['A only', 'B only', 'A and B', 'F'],
          answer: 2,
          explain: 'Independent ifs are all checked; both conditions hold. Use elif for exclusive categories.',
        },
        {
          q: 'if x > 5: print("big") — with x = 5, what happens?',
          choices: ['Prints big', 'Prints nothing', 'Error', 'Prints small'],
          answer: 1,
          explain: '5 > 5 is False, so the branch is skipped; there is no else.',
        },
        {
          q: 'When is an `else` branch executed?',
          choices: ['Always', 'When every earlier condition was False', 'When the first condition is True', 'Only after elif'],
          answer: 1,
          explain: 'else is the fallback: it runs only when nothing above it matched.',
        },
        {
          q: 'What is the cleanest rewrite of `if n >= 10: return True\nelse: return False`?',
          choices: ['return n >= 10', 'return True', 'return n > 10', 'print(n >= 10)'],
          answer: 0,
          explain: 'The comparison already produces the boolean — return it directly.',
        },
      ],
      exercises: [
        {
          title: 'BMI categories',
          brief:
            '`bmi` is given. Print exactly one of: "under" (<18.5), "normal" (18.5–24.9), "over" (25–29.9), "obese" (30+).',
          starter: `bmi = 27.5\n\n# your ladder here\n`,
          tests: `
assert _out_lines == ['over'], f'printed {_out_lines!r} for bmi=27.5'
`,
          hint: 'if bmi < 18.5: ... elif bmi < 25: ... elif bmi < 30: ... else: ...',
        },
      ],
    },
    {
      id: 'f2-3',
      title: 'while loops',
      minutes: 75,
      source: 'halterman',
      sourceRef: 'Halterman §5.1–5.2, Ward ch. 13',
      objectives: ['Repeat work with while', 'Control loops with break/continue', 'Avoid infinite loops'],
      sections: [
        {
          h: 'Repetition',
          md: `\`\`\`python\ncount = 1\nwhile count <= 5:\n    print(count)\n    count += 1\n\`\`\`\n\nThe condition is checked **before** each pass. If it never becomes false → **infinite loop** (our runner will stop you after 10 s).`,
        },
        {
          h: 'break and continue',
          md: `\`break\` exits the loop immediately. \`continue\` skips to the next pass. Use sparingly — clear conditions are better — but they are essential tools.`,
        },
        {
          h: 'When while (not for)?',
          md: 'Use `while` when you do **not** know in advance how many passes you need — waiting for a value to grow past a limit, retrying, or consuming input. If you can count the passes, prefer `for` (next lesson).',
        },
      ],
      examples: [
        {
          caption: 'Countdown',
          code: `n = 5
while n > 0:
    print(n)
    n -= 1
print("Lift off!")`,
          expected: '5\n4\n3\n2\n1\nLift off!',
        },
        {
          caption: 'break & continue',
          code: `n = 0
while True:
    n += 1
    if n % 2 == 0:
        continue        # skip evens
    if n > 7:
        break           # stop entirely
    print(n)`,
          expected: '1\n3\n5\n7',
        },
      ],
      quiz: [
        {
          q: 'When is a while condition checked?',
          choices: ['After each pass', 'Before each pass', 'Once', 'Randomly'],
          answer: 1,
          explain: 'The test happens before every pass; a false start condition means zero passes.',
        },
        {
          q: '`break` does what?',
          choices: ['Skips one pass', 'Exits the loop now', 'Restarts the loop', 'Pauses'],
          answer: 1,
          explain: 'break terminates the loop immediately.',
        },
        {
          q: '`continue` does what?',
          choices: ['Exits the loop', 'Skips to next pass', 'Restarts pass', 'Nothing'],
          answer: 1,
          explain: 'continue jumps to the loop condition / next iteration.',
        },
        {
          q: 'What is missing if a while loop never stops?',
          choices: ['print', 'The condition never becomes False', 'A for loop', 'import'],
          answer: 1,
          explain: "Infinite loops happen when nothing changes the condition toward False.",
        },
        {
          q: '`while True:` with `break` inside is…',
          choices: ['Always a bug', 'A common intentional pattern', 'Illegal syntax', 'Slower than while False'],
          answer: 1,
          explain: 'Loop forever, exit on demand (a quit command, a win) — the game-loop shape.',
        },
        {
          q: 'In `while n > 0: n -= 1`, forgetting `n -= 1` causes…',
          choices: ['One pass', 'An infinite loop', 'A SyntaxError', 'n becomes negative'],
          answer: 1,
          explain: 'The condition can never change — the loop runs forever (PyLearn kills it at 10 s).',
        },
      ],
      exercises: [
        {
          title: 'Doubling savings',
          brief:
            'Starting from `balance = 1`, double it every year until it exceeds 1000. Print each year-end balance on its own line, then print `years` (the count of doublings).',
          starter: `balance = 1\nyears = 0\n\n# while loop here\n\nprint("---")\nprint(years)`,
          tests: `
assert _out_lines[-1] == '10', f'years was {_out_lines[-1]!r}'
assert 'while' in _user_code, 'use a while loop'
`,
          hint: 'while balance <= 1000: balance *= 2; years += 1. Ten doublings take 1 past 1000.',
        },
      ],
    },
    {
      id: 'f2-4',
      title: 'for loops & range',
      minutes: 75,
      source: 'halterman',
      sourceRef: 'Halterman §5.3–5.5, Ward ch. 13',
      objectives: ['Iterate with for over sequences and range', 'Use enumerate', 'Nest loops'],
      sections: [
        {
          h: 'for iterates over things',
          md: `Python's \`for\` is a **for-each**: it walks through the items of a sequence:\n\n\`\`\`python\nfor letter in "abc":\n    print(letter)\n\`\`\``,
        },
        {
          h: 'range()',
          md: `\`range(stop)\`, \`range(start, stop)\`, \`range(start, stop, step)\` — the stop is **exclusive**.\n\n\`\`\`python\nfor i in range(3):        # 0, 1, 2\nfor i in range(2, 5):     # 2, 3, 4\nfor i in range(10, 0, -2) # 10, 8, 6, 4, 2\n\`\`\``,
        },
        {
          h: 'enumerate when you need the index',
          md: `\`\`\`python\nfor i, ch in enumerate("abc", start=1):\n    print(i, ch)\n\`\`\``,
        },
        {
          h: 'Nested loops',
          md: 'A loop inside a loop: the inner loop runs fully for **each** outer pass. Great for grids and tables — and the reason nested loops get slow for big data.',
        },
      ],
      examples: [
        {
          caption: 'range variations',
          code: `for i in range(3):
    print(i, end=" ")
print()
for i in range(2, 6):
    print(i, end=" ")
print()
for i in range(10, 0, -3):
    print(i, end=" ")`,
          expected: '0 1 2 \n2 3 4 5 \n10 7 4 1 ',
        },
        {
          caption: 'Nested: times table',
          code: `for row in range(1, 4):
    for col in range(1, 4):
        print(row * col, end="\\t")
    print()`,
          expected: '1\t2\t3\n2\t4\t6\n3\t6\t9',
        },
        {
          caption: 'enumerate',
          code: `for i, fruit in enumerate(["apple", "kiwi", "fig"], start=1):
    print(i, fruit)`,
          expected: '1 apple\n2 kiwi\n3 fig',
        },
      ],
      quiz: [
        {
          q: 'How many numbers does range(2, 10, 3) yield?',
          choices: ['3', '2', '4', '8'],
          answer: 0,
          explain: 'It yields 2, 5, 8 — three values (next would be 11, past stop).',
        },
        {
          q: 'for x in "hi": prints…',
          choices: ['hi', 'h then i', 'Error', '0 1'],
          answer: 1,
          explain: 'Strings are sequences of characters; for-each walks them letter by letter.',
        },
        {
          q: 'What does range(5) start at?',
          choices: ['1', '0', 'Depends', '-1'],
          answer: 1,
          explain: 'range(n) counts from 0 up to n-1.',
        },
        {
          q: 'A nested loop (3 outer × 4 inner passes) runs the inner body how many times?',
          choices: ['7', '12', '4', '3'],
          answer: 1,
          explain: 'Inner body runs once per inner pass, for each outer pass: 3×4 = 12.',
        },
        {
          q: 'What does enumerate(["a", "b"], start=1) hand the loop each pass?',
          choices: ['The item only', 'An index and the item', 'The length', 'A dict'],
          answer: 1,
          explain: 'enumerate pairs each item with a counter — no manual i += 1 needed.',
        },
      ],
      exercises: [
        {
          title: 'FizzBuzz warmup',
          brief: 'Print numbers 1–15, one per line. Multiples of 3 → "Fizz", of 5 → "Buzz", of both → "FizzBuzz".',
          starter: `for n in range(1, 16):\n    # your logic\n    pass`,
          tests: `
assert _out_lines[:3] == ['1', '2', 'Fizz'], f'start is {_out_lines[:3]!r}'
assert _out_lines[14] == 'FizzBuzz', f'last is {_out_lines[14]!r}'
assert _out_lines[8] == 'Fizz', '9 should be Fizz'
assert _out_lines[9] == 'Buzz', '10 should be Buzz'
`,
          hint: 'Check the both-case first: n % 15 == 0 — then % 3, then % 5, else print the number.',
        },
      ],
    },
  ],
}

export { module2 as foundationsModule2 }
