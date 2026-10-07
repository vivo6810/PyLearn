import type { Track } from '../types'

// Core Python track (wave 2) — from Halterman ch. 6–12, Ward ch. 9–10,
// Sweigart ch. 3/8, enriched with Pylearn-original material.

export const core: Track = {
  id: 'core',
  title: 'Core Python',
  blurb: 'Functions, classes, exceptions and files — the toolbox of every real Python program.',
  icon: 'puzzle',
  accent: '#6e6a58',
  modules: [
    {
      id: 'c1',
      title: 'Module 1 · Functions',
      summary: 'Package logic into reusable, testable units — the single most important structuring tool in programming.',
      lessons: [
        {
          id: 'c1-1',
          title: 'Defining & calling functions',
          minutes: 80,
          source: 'halterman',
          sourceRef: 'Halterman §7.1–7.4',
          objectives: ['Define functions with def', 'Pass arguments and return values', 'Write docstrings'],
          sections: [
            {
              h: 'Why functions?',
              md: `A **function** packages a piece of logic under a name so you can reuse it, test it, and read your program as a story of named steps instead of a wall of code.\n\n\`\`\`python\ndef greet(name):\n    return f"Hello, {name}!"\n\nprint(greet("Ada"))   # Hello, Ada!\n\`\`\`\n\n- \`def\` introduces the definition; calling \`greet("Ada")\` **runs** it.\n\`name\` is a **parameter** (the placeholder); \`"Ada"\` is an **argument** (the actual value).\n- \`return\` sends a value back to the caller. A function with no \`return\` gives back \`None\`.`,
            },
            {
              h: 'return ends the function',
              md: `The moment \`return\` executes, the function is over — even mid-loop. Use \`return\` for early exits:\n\n\`\`\`python\ndef is_even(n):\n    return n % 2 == 0\n\`\`\`\n\nReturning a boolean expression directly (instead of \`if ...\ return True else return False\`) is the Pythonic style.`,
            },
            {
              h: 'Docstrings — built-in documentation',
              md: `A string on the first line of the body becomes the function's **docstring**, visible to \`help()\` and editors:\n\n\`\`\`python\ndef area(width, height):\n    """Return the area of a rectangle."""\n    return width * height\n\`\`\``,
            },
            {
              h: 'Design tip: one job per function',
              md: `If you can't describe what a function does in one short sentence, it probably does too much. Split it. Functions that fit on one screen are easier to test and reuse — this habit separates struggling beginners from effective developers.`,
            },
          ],
          examples: [
            {
              caption: 'Parameters & return',
              code: `def BMI(weight_kg, height_m):
    """Body Mass Index = weight / height²."""
    return weight_kg / height_m ** 2

b = BMI(70, 1.75)
print(f"BMI = {b:.1f}")`,
              expected: 'BMI = 22.9',
            },
            {
              caption: 'Early return',
              code: `def first_negative(numbers):
    for n in numbers:
        if n < 0:
            return n
    return None

print(first_negative([3, 7, -2, 9]))
print(first_negative([1, 2, 3]))`,
              expected: '-2\nNone',
            },
            {
              caption: 'None return by default',
              code: `def shout(word):
    word.upper()      # bug: result discarded!

result = shout("hey")
print(result)`,
              expected: 'None',
            },
          ],
          quiz: [
            {
              q: 'What does a function return when it has no return statement?',
              choices: ['0', 'None', '""', 'Error'],
              answer: 1,
              explain: 'Python implicitly returns None.',
            },
            {
              q: 'In greet("Ada"), what is "Ada"?',
              choices: ['A parameter', 'An argument', 'A docstring', 'A keyword'],
              answer: 1,
              explain: 'The value passed at the call site is the argument; the placeholder in the def is the parameter.',
            },
            {
              q: 'What happens after `return` runs inside a loop in a function?',
              choices: ['Loop continues', 'Function ends immediately', 'Error', 'Loop restarts'],
              answer: 1,
              explain: 'return exits the whole function at once, loop included.',
            },
            {
              q: 'Which is the Pythonic is_positive?',
              choices: [
                'def f(n):\\n    if n > 0: return True\\n    else: return False',
                'def f(n):\\n    return n > 0',
                'def f(n):\\n    print(n > 0)',
                'def f(n):\\n    n > 0',
              ],
              answer: 1,
              explain: 'The comparison already produces the boolean — return it directly.',
            },
            {
              q: 'A docstring is…',
              choices: ['A comment with #', 'A string on the first line of the body', 'A type hint', 'A README file'],
              answer: 1,
              explain: 'The first string literal in the function body becomes its documentation — visible via help().',
            },
            {
              q: 'Why write one job per function?',
              choices: ['Faster runtime', 'Easier to test, reuse and read', 'Python requires it', 'Uses less memory'],
              answer: 1,
              explain: 'Small named units compose and test well — the habit that separates effective developers.',
            },
          ],
          exercises: [
            {
              title: 'Password strength meter',
              brief:
                'Write `strength(pw)` returning `"weak"` (<6 chars), `"medium"` (6–9), or `"strong"` (10+). The tests try several passwords.',
              starter: `def strength(pw):
    """Classify a password's strength."""
    pass

print(strength("abc"))        # weak
print(strength("abcdefgh"))   # medium
print(strength("abcdefghijkl"))  # strong`,
              tests: `
assert strength('abc') == 'weak', f"weak got {strength('abc')!r}"
assert strength('abcdef') == 'medium', '6 chars should be medium'
assert strength('abcdefg') == 'medium', '7 chars should be medium'
assert strength('abcdefghij') == 'strong', '10 chars should be strong'
assert strength('') == 'weak', 'empty is weak'
`,
              hint: 'if len(pw) < 6: return "weak" — then an elif for < 10, else strong.',
            },
          ],
        },
        {
          id: 'c1-2',
          title: 'Arguments: default, keyword, *args/**kwargs',
          minutes: 80,
          source: 'halterman',
          sourceRef: 'Halterman §8.2, §11.2, §11.7',
          objectives: ['Use default parameter values', 'Call with keyword arguments', 'Accept variable arguments'],
          sections: [
            {
              h: 'Default values',
              md: `\`\`\`python\ndef power(base, exp=2):\n    return base ** exp\n\npower(5)        # 25 — exp defaults\npower(5, 3)     # 125\n\`\`\`\n\nDefaults make common cases effortless. Never use a **mutable default** (\`def f(x, items=[])\`) — it is created once and shared between calls; use \`None\` and create inside.`,
            },
            {
              h: 'Keyword arguments',
              md: `Call with \`name=value\` to label intent and skip order:\n\n\`\`\`python\npower(exp=3, base=2)   # 8 — order doesn't matter\n\`\`\``,
            },
            {
              h: '*args — any number of positionals',
              md: `\`\`\`python\ndef total(*nums):\n    return sum(nums)\n\ntotal(1, 2, 3, 4)   # 10\n\`\`\`\n\nInside, \`nums\` is a tuple of everything extra that was passed.`,
            },
            {
              h: '**kwargs — any number of keywords',
              md: `\`\`\`python\ndef show(**opts):\n    for k, v in opts.items():\n        print(k, "=", v)\n\nshow(color="red", size=10)\n\`\`\`\n\nThis is how flexible APIs (matplotlib, pandas…) accept dozens of options. Full signature order: \`def f(pos, default=1, *args, **kwargs)\`.`,
            },
          ],
          examples: [
            {
              caption: 'Flexible greeting',
              code: `def greet(name, punct="!", times=1):
    return (f"Hi {name}{punct} " * times).strip()

print(greet("Ada"))
print(greet("Bob", times=2))
print(greet("Eve", punct="?"))`,
              expected: 'Hi Ada!\nHi Bob! Hi Bob!\nHi Eve?',
            },
            {
              caption: '*args and **kwargs',
              code: `def order_summary(table, *items, **options):
    print(f"Table {table}: {', '.join(items)}")
    print("options:", options)

order_summary(4, "tea", "cake", rush=True, tip=2.5)`,
              expected: "Table 4: tea, cake\noptions: {'rush': True, 'tip': 2.5}",
            },
          ],
          quiz: [
            {
              q: 'def f(a, b=2): — which call is invalid?',
              choices: ['f(1)', 'f(1, 5)', 'f(b=3, a=1)', 'f()'],
              answer: 3,
              explain: 'a has no default, so it must always be provided.',
            },
            {
              q: 'What does `def f(*args)` collect args into?',
              choices: ['A list', 'A tuple', 'A dict', 'A string'],
              answer: 1,
              explain: '*args is a tuple; **kwargs is a dict.',
            },
            {
              q: 'Why avoid def f(x, items=[])?',
              choices: [
                'Syntax error',
                'The list is shared across all calls',
                'Too slow',
                'Items cannot be appended',
              ],
              answer: 1,
              explain: 'Mutable defaults are created once at definition time and persist between calls — a classic bug.',
            },
            {
              q: 'f(name="Ada") passes…',
              choices: ['A positional argument', 'A keyword argument', '*args', 'A default'],
              answer: 1,
              explain: 'name=value at the call site is a keyword argument.',
            },
            {
              q: 'Inside `def f(**kwargs)`, kwargs is…',
              choices: ['A tuple of positionals', 'A dict of keyword arguments', 'A list of defaults', 'A string'],
              answer: 1,
              explain: '**kwargs collects extra keyword arguments into a dictionary.',
            },
            {
              q: 'The safe mutable-default idiom is…',
              choices: [
                'def f(x, items=[])',
                'def f(x, items=None): items = [] if items is None else items',
                'def f(x, items=())',
                'def f(x, items=[None])',
              ],
              answer: 1,
              explain: 'Default to None, create a fresh list inside — each call gets its own.',
            },
          ],
          exercises: [
            {
              title: 'Flexible logger',
              brief:
                'Write `log(msg, level="INFO", *tags)` returning `"LEVEL: msg [tag1,tag2]"` (tags part omitted when none). Level uppercase.',
              starter: `def log(msg, level="INFO", *tags):
    pass

print(log("started"))                    # INFO: started
print(log("disk full", "ERROR"))         # ERROR: disk full
print(log("cache", tags_allowed := "x")) # hmm — no, use positional/keyword correctly`,
              tests: `
assert log('started') == 'INFO: started'
assert log('boom', 'ERROR') == 'ERROR: boom'
assert log('sync', 'DEBUG', 'net', 'io') == 'DEBUG: sync [net,io]'
assert log('x', level='WARN') == 'WARN: x'
`,
              hint: "Build 'LEVEL: msg' first; if tags: append ' [' + ','.join(tags) + ']'.",
            },
          ],
        },
      ],
    },
    {
      id: 'c2',
      title: 'Module 2 · Object-Oriented Python',
      summary: 'Model the world as classes: bundles of data (attributes) and behavior (methods).',
      lessons: [
        {
          id: 'c2-1',
          title: 'Classes & objects',
          minutes: 85,
          source: 'ward',
          sourceRef: 'Ward ch. 10, Halterman ch. 13',
          objectives: ['Define a class with __init__', 'Create instances', 'Write methods and use self'],
          sections: [
            {
              h: 'A class is a blueprint',
              md: `\`\`\`python\nclass Dog:\n    def __init__(self, name, age):\n        self.name = name\n        self.age = age\n\n    def speak(self):\n        return f"{self.name} says woof"\n\nrex = Dog("Rex", 3)\nprint(rex.speak())\n\`\`\`\n\n- \`__init__\` runs when you create an instance — it **initializes** attributes.\n- \`self\` is the instance being operated on; Python passes it automatically (\`rex.speak()\` ≡ \`Dog.speak(rex)\`).\n- **Attributes** (\`rex.name\`) store data; **methods** (\`rex.speak()\`) define behavior.`,
            },
            {
              h: '__str__ — printable objects',
              md: `\`print(obj)\` calls \`__str__\` if you define it — return a friendly string, and your objects debug like built-ins:\n\n\`\`\`python\ndef __str__(self):\n    return f"Dog({self.name}, {self.age})"\n\`\`\``,
            },
            {
              h: 'Why OOP?',
              md: `When data and the operations on it travel together (a bank account *knows* its balance and *how* to withdraw), code stops being a swamp of parallel lists. Classes also enable **inheritance** (next lesson) and map naturally onto real domains — \`DataFrame\`, \`Button\`, \`Model\` are all classes.`,
            },
            {
              h: 'Class vs instance attributes',
              md: `Attributes set on \`self\` belong to each instance. Attributes set directly on the class are **shared** by all instances — good for constants (\`Dog.species = "canis familiaris"\`), dangerous for mutable values.`,
            },
          ],
          examples: [
            {
              caption: 'BankAccount',
              code: `class BankAccount:
    def __init__(self, owner, balance=0):
        self.owner = owner
        self.balance = balance

    def deposit(self, amount):
        self.balance += amount
        return self.balance

    def withdraw(self, amount):
        if amount > self.balance:
            raise ValueError("insufficient funds")
        self.balance -= amount
        return self.balance

    def __str__(self):
        return f"{self.owner}: {self.balance:.2f}"

acct = BankAccount("Ada", 100)
acct.deposit(50)
acct.withdraw(30)
print(acct)`,
              expected: 'Ada: 120.00',
            },
          ],
          quiz: [
            {
              q: 'What is self?',
              choices: ['The class', 'The instance the method runs on', 'A keyword', 'The module'],
              answer: 1,
              explain: 'self is the instance; Python passes it automatically on method calls.',
            },
            {
              q: '__init__ runs when…',
              choices: ['The class is defined', 'An instance is created', 'A method is called', 'The program ends'],
              answer: 1,
              explain: 'It initializes each new instance.',
            },
            {
              q: 'print(obj) shows a friendly string if the class defines…',
              choices: ['__repr__ only', '__str__', '__print__', '__doc__'],
              answer: 1,
              explain: '__str__ (or __repr__ as fallback) controls printing.',
            },
            {
              q: 'Attributes assigned in __init__ via self.x = … belong to…',
              choices: ['The class, shared', 'That instance', 'The module', 'The method'],
              answer: 1,
              explain: 'Each instance gets its own copy of instance attributes.',
            },
            {
              q: 'How many arguments does a.deposit(50) actually pass to deposit?',
              choices: ['One (50)', 'Two (a and 50)', 'None', 'Depends on the class'],
              answer: 1,
              explain: 'Python turns a.deposit(50) into deposit(a, 50) — self arrives automatically.',
            },
            {
              q: 'Methods vs functions: a method is…',
              choices: [
                'Any function in a file',
                'A function defined inside a class, called on instances',
                'A lambda',
                'A built-in only',
              ],
              answer: 1,
              explain: 'Methods belong to a class and receive the instance as their first parameter.',
            },
          ],
          exercises: [
            {
              title: 'Shopping cart class',
              brief:
                'Build `Cart` with `add(item, price)`, `total()` returning the sum, and `__str__` like `"3 items, $56.00"`. Track items in a list of (item, price) tuples.',
              starter: `class Cart:
    def __init__(self):
        self.items = []

    def add(self, item, price):
        pass

    def total(self):
        pass

    def __str__(self):
        pass

c = Cart()
c.add("tea", 4.5)
c.add("cake", 6.0)
print(c)          # 2 items, $10.50
print(c.total())  # 10.5`,
              tests: `
c = Cart()
c.add('tea', 4.5)
c.add('cake', 6.0)
assert abs(c.total() - 10.5) < 1e-9, f'total was {c.total()}'
assert str(c) == '2 items, $10.50', f'str was {str(c)!r}'
c.add('book', 12.0)
assert abs(c.total() - 22.5) < 1e-9
assert str(c) == '3 items, $22.50'
`,
              hint: 'add appends (item, price) to self.items; total sums p for _, p in self.items; __str__ uses f"{len(self.items)} items, ${self.total():.2f}".',
            },
          ],
        },
        {
          id: 'c2-2',
          title: 'Inheritance & composition',
          minutes: 85,
          source: 'halterman',
          sourceRef: 'Halterman ch. 14',
          objectives: ['Extend classes with inheritance', 'Override and call up with super()', 'Choose composition when appropriate'],
          sections: [
            {
              h: 'Inheritance — an "is-a"',
              md: `\`\`\`python\nclass Animal:\n    def __init__(self, name):\n        self.name = name\n    def speak(self):\n        return "..."\n\nclass Cat(Animal):\n    def speak(self):\n        return "meow"\n\nclass Kitten(Cat):\n    def speak(self):\n        return super().speak() + " (tiny)"\n\`\`\`\n\n\`Cat\` **inherits** \`name\` and gets everything from \`Animal\`; it **overrides** \`speak\`. \`super()\` calls the parent version — the standard way to *extend* rather than replace behavior.`,
            },
            {
              h: 'Composition — a "has-a"',
              md: `Instead of inheriting, an object can **contain** others: a \`Car\` *has an* \`Engine\`. Favor composition when the relationship is "has-a", inheritance when it's genuinely "is-a". Deep inheritance trees are fragile; shallow ones plus composition age well.`,
            },
            {
              h: 'Polymorphism',
              md: `Any \`Animal\` can \`speak()\` — callers don't care which subclass. Loops like \`for a in menagerie: print(a.speak())\` just work. This replaceability is the real payoff of OOP.`,
            },
          ],
          examples: [
            {
              caption: 'Shapes with polymorphism',
              code: `class Shape:
    def area(self):
        raise NotImplementedError

class Circle(Shape):
    def __init__(self, r):
        self.r = r
    def area(self):
        return 3.14159 * self.r ** 2

class Square(Shape):
    def __init__(self, s):
        self.s = s
    def area(self):
        return self.s * self.s

for sh in (Circle(1), Square(2)):
    print(f"{type(sh).__name__}: {sh.area():.2f}")`,
              expected: 'Circle: 3.14\nSquare: 4.00',
            },
          ],
          quiz: [
            {
              q: 'class B(A): means…',
              choices: ['A inherits B', 'B inherits A', 'B equals A', 'B contains A'],
              answer: 1,
              explain: 'B is a subclass of A: B inherits from A.',
            },
            {
              q: 'super().__init__(x) does what?',
              choices: ['Creates a new object', 'Calls the parent initializer', 'Deletes self', 'Nothing'],
              answer: 1,
              explain: "It delegates to the parent class's __init__ so both levels initialize.",
            },
            {
              q: '"A Car has-an Engine" is best modeled with…',
              choices: ['Inheritance', 'Composition', 'Recursion', 'A global variable'],
              answer: 1,
              explain: 'has-a → composition (attribute); is-a → inheritance.',
            },
            {
              q: 'Polymorphism means…',
              choices: [
                'Many forms — same call, type-dependent behavior',
                'Multiple inheritance',
                'Copying objects',
                'Private attributes',
              ],
              answer: 0,
              explain: 'Different objects respond to the same method call in their own way.',
            },
            {
              q: 'When should composition win over inheritance?',
              choices: [
                'Always',
                'For has-a relationships (a Car has-an Engine)',
                'For is-a relationships (a Dog is-an Animal)',
                'Never — inheritance is deprecated',
              ],
              answer: 1,
              explain: 'Model parts with composition; reserve inheritance for genuine is-a relationships.',
            },
          ],
          exercises: [
            {
              title: 'Employee → Manager',
              brief:
                '`Employee(name, salary)` has `annual()` = salary. `Manager` extends it with a `bonus` attribute and overrides `annual()` to add the bonus (use super() for the base part).',
              starter: `class Employee:
    def __init__(self, name, salary):
        pass

    def annual(self):
        pass

class Manager(Employee):
    def __init__(self, name, salary, bonus):
        pass

    def annual(self):
        pass

e = Employee("Ada", 50000)
m = Manager("Grace", 60000, 10000)
print(e.annual())  # 50000
print(m.annual())  # 70000`,
              tests: `
e = Employee('Ada', 50000)
m = Manager('Grace', 60000, 10000)
assert e.annual() == 50000
assert m.annual() == 70000, f'manager annual was {m.annual()}'
assert isinstance(m, Employee), 'Manager should be an Employee'
assert 'super()' in _user_code, 'use super() in Manager'
`,
              hint: "Manager.__init__: super().__init__(name, salary) then self.bonus = bonus; annual: return super().annual() + self.bonus.",
            },
          ],
        },
      ],
    },
    {
      id: 'c3',
      title: 'Module 3 · Robust Programs',
      summary: 'Fail gracefully: catch errors, validate input, and persist data to files.',
      lessons: [
        {
          id: 'c3-1',
          title: 'Exceptions: try / except / finally',
          minutes: 80,
          source: 'halterman',
          sourceRef: 'Halterman ch. 12',
          objectives: ['Catch and distinguish exceptions', 'Raise your own', 'Clean up with finally'],
          sections: [
            {
              h: 'Errors are values you can handle',
              md: `\`\`\`python\ntry:\n    n = int("abc")\nexcept ValueError as e:\n    print("not a number:", e)\n\`\`\`\n\nAn unhandled exception crashes the program with a **traceback**; a handled one becomes a normal code path. Common types: \`ValueError\`, \`TypeError\`, \`KeyError\`, \`IndexError\`, \`ZeroDivisionError\`, \`FileNotFoundError\`.`,
            },
            {
              h: 'Multiple excepts, else, finally',
              md: `\`\`\`python\ntry:\n    risky()\nexcept ValueError:\n    ...\nexcept (KeyError, IndexError):\n    ...\nelse:\n    ...   # ran when NO exception occurred\nfinally:\n    ...   # ALWAYS runs — cleanup lives here\n\`\`\``,
            },
            {
              h: 'Raising',
              md: `\`raise ValueError("quantity must be positive")\` — fail loudly with a helpful message. Catch-all \`except Exception\` only at program boundaries (top-level, task queues); swallowing errors mid-program hides bugs.`,
            },
            {
              h: 'EAFP style',
              md: `Python prefers *"Easier to Ask Forgiveness than Permission"*: try the operation, handle the rare failure — rather than pre-checking everything with ifs. \`int(s)\` in a try beats checking whether \`s\` "looks like" a number.`,
            },
          ],
          examples: [
            {
              caption: 'Safe division',
              code: `def safe_div(a, b):
    try:
        return a / b
    except ZeroDivisionError:
        return float('inf')

print(safe_div(9, 3), safe_div(1, 0))

try:
    int("abc")
except ValueError as e:
    print("caught:", e)
finally:
    print("(always runs)")`,
              expected: "3.0 inf\ncaught: invalid literal for int() with base 10: 'abc'\n(always runs)",
            },
          ],
          quiz: [
            {
              q: 'Which block always executes?',
              choices: ['try', 'except', 'else', 'finally'],
              answer: 3,
              explain: 'finally runs whether or not an exception occurred — ideal for cleanup.',
            },
            {
              q: 'int("3.5") raises…',
              choices: ['TypeError', 'ValueError', 'KeyError', 'No error'],
              answer: 1,
              explain: "The type is right (str) but the value isn't a valid integer literal — ValueError.",
            },
            {
              q: 'The else clause of try runs when…',
              choices: ['An exception occurred', 'No exception occurred', 'Always', 'Never'],
              answer: 1,
              explain: 'else runs only when the try body completed without exception.',
            },
            {
              q: 'Raising your own error uses…',
              choices: ['throw', 'raise', 'error()', 'panic'],
              answer: 1,
              explain: "Python's keyword is raise.",
            },
            {
              q: 'Catching bare `except:` with no exception type is discouraged because…',
              choices: ['It is slower', 'It hides real bugs like typos', 'It only catches ValueError', 'It is illegal in Python 3'],
              answer: 1,
              explain: 'It swallows everything — even NameError from your own typo. Catch specific exceptions.',
            },
          ],
          exercises: [
            {
              title: 'Bulletproof to_int',
              brief:
                'Write `to_int(s)` that returns the integer if s converts cleanly, returns `None` on any failure (wrong type included), and never raises.',
              starter: `def to_int(s):
    pass

print(to_int("42"))    # 42
print(to_int("3.5"))   # None
print(to_int(None))    # None`,
              tests: `
assert to_int('42') == 42
assert to_int('-7') == -7
assert to_int('3.5') is None
assert to_int('abc') is None
assert to_int(None) is None
assert to_int(['1']) is None
`,
              hint: 'Wrap int(s) in try/except (ValueError, TypeError) and return None in the handler.',
            },
          ],
        },
        {
          id: 'c3-2',
          title: 'Files & JSON',
          minutes: 85,
          source: 'sweigart',
          sourceRef: 'Sweigart ch. 8/14 (adapted for the browser sandbox)',
          objectives: ['Read/write files with with-blocks', 'Parse structured JSON', 'Persist state between runs'],
          sections: [
            {
              h: 'The with pattern',
              md: `\`\`\`python\nwith open("notes.txt", "w") as f:\n    f.write("hello\\n")\n\nwith open("notes.txt") as f:\n    content = f.read()\n\`\`\`\n\nThe \`with\` block **closes the file automatically**, even on errors. Modes: \`"r"\` read (default), \`"w"\` overwrite, \`"a"\` append. Reading line-by-line: \`for line in f:\`.`,
            },
            {
              h: 'JSON — the data interchange format',
              md: `\`\`\`python\nimport json\n\ndata = {"name": "Ada", "scores": [90, 85]}\ntext = json.dumps(data)          # serialize → string\nback = json.loads(text)          # parse → Python objects\n\`\`\`\n\nJSON maps cleanly: objects↔dicts, arrays↔lists, plus strings/numbers/booleans/null. Every API you will ever call speaks it.`,
            },
            {
              h: 'In this app',
              md: `Your code runs in a browser sandbox with a small in-memory filesystem — \`open\` works exactly as taught, files just don't survive between separate runs. On your own computer the identical code touches the real disk. (Sweigart's full chapters — organizing folders, CSV, Excel — come in the Automation track.)`,
            },
          ],
          examples: [
            {
              caption: 'Write, read, parse',
              code: `import json

with open("scores.json", "w") as f:
    json.dump({"ada": 90, "alan": 85}, f)

with open("scores.json") as f:
    data = json.load(f)

print(data["ada"], sum(data.values()))`,
              expected: '90 175',
            },
            {
              caption: 'Line processing',
              code: `with open("fruit.txt", "w") as f:
    f.write("apple\\nbanana\\ncherry\\n")

with open("fruit.txt") as f:
    for i, line in enumerate(f, 1):
        print(i, line.strip())`,
              expected: '1 apple\n2 banana\n3 cherry',
            },
          ],
          quiz: [
            {
              q: 'Why use `with open(...)`?',
              choices: ['Shorter', 'Auto-closes even on errors', 'Faster IO', 'Required syntax'],
              answer: 1,
              explain: 'The context manager guarantees the file is closed.',
            },
            {
              q: 'Mode "a" does what?',
              choices: ['Reads', 'Overwrites', 'Appends to the end', 'Creates only'],
              answer: 2,
              explain: 'Append mode adds to the end without erasing existing content.',
            },
            {
              q: 'json.dumps does…',
              choices: ['Python → JSON string', 'JSON string → Python', 'Reads a file', 'Formats output'],
              answer: 0,
              explain: 'dumps serializes to a string; loads parses back.',
            },
            {
              q: 'JSON arrays become Python…',
              choices: ['tuples', 'lists', 'sets', 'dicts'],
              answer: 1,
              explain: 'Arrays → lists; objects → dicts.',
            },
            {
              q: 'json.load(f) vs json.loads(text) — the s means…',
              choices: ['Secure', 'String (parse from a string, not a file)', 'Serialize', 'Sorted'],
              answer: 1,
              explain: 'loads = load from string; load = read from an open file object.',
            },
          ],
          exercises: [
            {
              title: 'Save & load high score',
              brief:
                'Write a dict `{"high": 120, "games": 3}` to `progress.json`, read it back with json.load into `loaded`, bump `"games"` by 1, and print the updated dict.',
              starter: `import json

# write, then load, then update games and print`,
              tests: `
import json as _j
with open('progress.json') as _f:
    _on_disk = _j.load(_f)
assert _on_disk['games'] == 4, f'disk has {_on_disk}'
assert loaded['games'] == 4
assert loaded['high'] == 120
`,
              hint: 'json.dump(d, open(...,"w")) — or with-block; then loaded = json.load(open(...)); loaded["games"] += 1; print(loaded).',
            },
          ],
        },
      ],
    },
    {
      id: 'c4',
      title: 'Module 4 · Batteries Included',
      summary: 'The standard library — import ready-made tools instead of reinventing them.',
      lessons: [
        {
          id: 'c4-1',
          title: 'Modules & the standard library',
          minutes: 70,
          source: 'pylearn',
          sourceRef: 'PyLearn original · topics informed by Asabeneh 30-Days-Of-Python',
          objectives: [
            'Import from the standard library three ways',
            'Pick the right stdlib module for a task',
            'Generate reproducible randomness with random.seed',
            'Explain the if __name__ == "__main__" idiom',
          ],
          sections: [
            {
              h: 'A module is a toolbox',
              md: `A **module** is a file of ready-made code. Python ships with a huge collection of them — the **standard library**, nicknamed “batteries included”:\n\n\`\`\`python\nimport math\nprint(math.sqrt(144))   # 12.0\n\`\`\`\n\nYou have already used \`json\`, \`datetime\` and \`random\` in these lessons — all standard library. Dotted access (\`module.thing\`) keeps every toolbox tidy and tells readers where a name came from.`,
            },
            {
              h: 'Three ways to import',
              md: `\`\`\`python\nimport math                   # whole toolbox: math.sqrt(2)\nfrom math import sqrt, pi     # just the tools: sqrt(2)\nimport statistics as stats    # nickname: stats.mean([1, 2, 3])\n\`\`\`\n\nPrefer plain \`import\` for readability, \`from … import\` for a heavily used name, and \`as\` for long module names. Avoid \`from math import *\` — it dumps every name into your program and buries where things came from.`,
            },
            {
              h: 'A quick tour',
              md: `- \`math\` — sqrt, pi, ceil, floor, factorial\n- \`random\` — dice, shuffles, random picks\n- \`statistics\` — mean, median, stdev\n- \`datetime\` — dates & times (last lesson!)\n- \`json\` — save/load structured data (Module 3)\n- \`os\` & \`pathlib\` — files, folders, paths\n- \`re\` — regular expressions (Advanced track)\n- \`collections\` — Counter, defaultdict superpowers\n\nWhen you need a tool, check the [official library tour](https://docs.python.org/3/library/) first — chances are it is already installed.`,
            },
            {
              h: 'random — repeatable chaos',
              md: `\`random.randint(1, 6)\` rolls a die; \`random.choice(seq)\` picks an item; \`random.shuffle(lst)\` mixes a list in place.\n\nReal programs often need *reproducible* randomness — tests, demos, graded homework. \`random.seed(42)\` rewinds the generator to a fixed starting point, so every run rolls the same “random” numbers.`,
            },
            {
              h: 'Your own modules',
              md: `Save functions in a file like \`tools.py\`, then \`import tools\` from any other file in the same folder — that is exactly how modules work.\n\nAt the bottom of a module you will often see:\n\n\`\`\`python\nif __name__ == "__main__":\n    demo()\n\`\`\`\n\nThat block runs only when the file is executed **directly** — never when someone imports it. It is the standard “self-test” hook of a module.`,
            },
          ],
          examples: [
            {
              caption: 'import math',
              code: `import math

print(math.sqrt(144))
print(math.pi)
print(math.ceil(4.2), math.floor(4.8))
print(math.factorial(5))`,
              expected: '12.0\n3.141592653589793\n5 4\n120',
            },
            {
              caption: 'Three import styles',
              code: `import math
from math import sqrt, pi
import statistics as stats

print(sqrt(16), pi > 3)
print(stats.mean([2, 4, 9]))
print(math.gcd(12, 18))`,
              expected: '4.0 True\n5\n6',
            },
            {
              caption: 'Seeded dice',
              code: `import random

random.seed(7)
rolls = []
for _ in range(5):
    rolls.append(random.randint(1, 6))
print(rolls)
print(random.choice(["red", "green", "blue"]))

random.seed(7)  # rewind the randomness
again = []
for _ in range(5):
    again.append(random.randint(1, 6))
print(again)   # identical — the seed makes it repeatable`,
              expected: '[3, 2, 4, 6, 1]\nred\n[3, 2, 4, 6, 1]',
            },
            {
              caption: 'The __main__ self-test hook',
              code: `def to_fahrenheit(celsius):
    return celsius * 9 / 5 + 32

if __name__ == "__main__":
    print("running directly!")
    print(to_fahrenheit(100))`,
              expected: 'running directly!\n212.0',
            },
          ],
          quiz: [
            {
              q: 'A module is…',
              choices: ['a file of ready-made code you can import', 'a list that cannot change', 'a special kind of loop', 'a Python error type'],
              answer: 0,
              explain: 'Any .py file can be a module, and Python ships with a big collection of them — the standard library.',
            },
            {
              q: 'Which import lets you call sqrt(2) directly, with no dot?',
              choices: ['import math', 'from math import sqrt', 'import sqrt from math', 'sqrt = math'],
              answer: 1,
              explain: 'from math import sqrt copies the name into your program — call it without the math. prefix.',
            },
            {
              q: 'After import random as rnd, you roll a die with…',
              choices: ['random.randint(1, 6)', 'rnd.randint(1, 6)', 'rnd.randomint(1, 6)', 'roll.rnd(1, 6)'],
              answer: 1,
              explain: 'The as nickname replaces the module name: everything goes through rnd.',
            },
            {
              q: 'Why call random.seed(42) in a program?',
              choices: ['It makes Python faster', 'It limits random numbers to 42', 'Every run replays the same “random” sequence', 'It adds entropy to the pool'],
              answer: 2,
              explain: 'A fixed seed makes results reproducible — essential for tests, demos and graded work.',
            },
            {
              q: 'The block under if __name__ == "__main__": runs…',
              choices: ['when the file is imported', 'when the file is run directly', 'once per function call', 'never — it is just documentation'],
              answer: 1,
              explain: 'Importing sets __name__ to the module name, so the self-test block stays quiet.',
            },
            {
              q: 'Which of these is NOT in the standard library?',
              choices: ['math', 'random', 'json', 'requests'],
              answer: 3,
              explain: 'requests is third-party — installed separately with pip. The others ship with Python.',
            },
          ],
          exercises: [
            {
              title: 'Seeded dice lab',
              brief:
                'Simulate 100 rolls of a six-sided die: `import random`, `random.seed(42)`, fill `rolls` with 100 ints from `random.randint(1, 6)`, then set `mean_rolls` to their average and `sixes` to how many rolls came up 6. The seed gives everyone the same dice.',
              starter: `import random

random.seed(42)  # same dice for everyone

rolls = []        # TODO: append 100 rolls of random.randint(1, 6)
mean_rolls = 0.0  # TODO: average of the rolls
sixes = 0         # TODO: how many rolls equal 6

print(rolls[:10], "...")
print("mean:", mean_rolls, "sixes:", sixes)`,
              tests: `
import random, statistics
random.seed(42)
exp = [random.randint(1, 6) for _ in range(100)]
assert rolls == exp, f'your first 5 rolls {rolls[:5]!r} vs expected {exp[:5]!r}'
assert abs(mean_rolls - statistics.mean(exp)) < 1e-9, f'mean_rolls = {mean_rolls!r}, expected {statistics.mean(exp)!r}'
assert sixes == exp.count(6), f'sixes = {sixes!r}, expected {exp.count(6)}'
assert 'seed(42)' in _user_code, 'keep random.seed(42) so the dice are reproducible'
`,
              hint: 'Grow the list in a loop: for _ in range(100): rolls.append(random.randint(1, 6)). Then mean_rolls = sum(rolls) / len(rolls) and sixes = rolls.count(6).',
            },
          ],
        },
      ],
    },
  ],
}
