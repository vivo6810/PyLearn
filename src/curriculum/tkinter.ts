import type { Track } from '../types'

// Tkinter GUI track (wave 4) — structured from Alan D. Moore's
// "Python GUI Programming with Tkinter". GUIs cannot run in a browser, so
// examples are shown as code and exercises are checked by static analysis
// of the learner's source text.

export const tkinter: Track = {
  id: 'tkinter',
  title: 'Tkinter GUI',
  blurb: 'Desktop applications with Python’s built-in GUI toolkit — windows, widgets, events and layout.',
  icon: 'window',
  accent: '#f97316',
  modules: [
    {
      id: 't1',
      title: 'Module 1 · Your First Desktop Apps',
      summary: 'Windows, widgets, geometry managers and events — the anatomy of every GUI program.',
      lessons: [
        {
          id: 't1-1',
          title: 'Windows, widgets & the event loop',
          minutes: 80,
          source: 'moore',
          sourceRef: 'Moore ch. 1–2',
          objectives: ['Understand the GUI program anatomy', 'Place widgets with pack/grid', 'Explain the event loop'],
          sections: [
            {
              h: 'Every GUI program has the same skeleton',
              md: `\`\`\`python\nimport tkinter as tk\n\nroot = tk.Tk()            # 1. the main window\nroot.title("My App")\n\nlabel = tk.Label(root, text="Hello, GUI!")   # 2. widgets\nlabel.pack(padx=20, pady=20)                 # 3. layout\n\nroot.mainloop()           # 4. the event loop\n\`\`\`\n\nThe **event loop** is the heart: it waits (sleeping, using ~0% CPU) for events — clicks, keys, window resizes — and dispatches them to your callbacks. Your code reacts; Tk redraws. This is the same architecture as every GUI framework you'll ever touch.`,
            },
            {
              h: 'Widgets',
              md: `\`Label\` (text/image), \`Button\`, \`Entry\` (one-line input), \`Text\` (multiline), \`Frame\` (container box), \`Canvas\` (free drawing), \`Checkbutton\`/\`Radiobutton\`, \`Listbox\`, \`Scale\`, and more. First argument is always the **parent** — widgets form a tree: widgets inside frames inside the root window.`,
            },
            {
              h: 'Two geometry managers',
              md: `- \`.pack()\` — stack things top-to-bottom or left-to-right; great for simple layouts\n- \`.grid()\` — a spreadsheet of rows/columns; great for forms\n\nNever mix pack and grid in the same container — the geometry managers fight and your app freezes.\n\n\`\`\`python\nname = tk.Entry(root)\nname.grid(row=0, column=1)\ntk.Label(root, text="Name:").grid(row=0, column=0)\n\`\`\``,
            },
            {
              h: 'Running it',
              md: `These programs run on your computer (Tk is in Python's standard installer) — in this app they're shown as code, and exercises are checked by reading your source. Type them into any real Python to see windows appear.`,
            },
          ],
          examples: [
            {
              caption: 'Minimal window',
              code: `import tkinter as tk

root = tk.Tk()
root.title("Hello")
root.geometry("300x120")

tk.Label(root, text="Hello, desktop!", font=("Arial", 16)).pack(pady=20)
tk.Button(root, text="Close", command=root.destroy).pack()

root.mainloop()`,
              expected: '(opens a 300×120 window with a label and close button)',
              static: true,
            },
            {
              caption: 'Form with grid',
              code: `import tkinter as tk

root = tk.Tk()
root.title("Login")

tk.Label(root, text="User:").grid(row=0, column=0, sticky="e")
tk.Entry(root).grid(row=0, column=1)
tk.Label(root, text="Pass:").grid(row=1, column=0, sticky="e")
tk.Entry(root, show="•").grid(row=1, column=1)
tk.Button(root, text="Sign in").grid(row=2, column=1, sticky="e")

root.mainloop()`,
              expected: '(login form laid out in a 2-column grid)',
              static: true,
            },
          ],
          quiz: [
            {
              q: 'root.mainloop() does what?',
              choices: ['Loops forever burning CPU', 'Waits for and dispatches events', 'Renders once', 'Imports widgets'],
              answer: 1,
              explain: 'The event loop sleeps until events arrive, then dispatches callbacks.',
            },
            {
              q: 'Which places a widget in row 2, column 3?',
              choices: ['.pack(row=2, column=3)', '.grid(row=2, column=3)', '.place_grid(2, 3)', '.row(2).col(3)'],
              answer: 1,
              explain: 'grid() uses rows and columns; pack() stacks.',
            },
            {
              q: 'The first argument of tk.Label(parent, …) is…',
              choices: ['The text', 'The parent widget', 'The font', 'The callback'],
              answer: 1,
              explain: 'Widgets take their parent first — they form a tree.',
            },
            {
              q: 'Mixing pack and grid in the same container…',
              choices: ['Is fine', 'Alternates', 'Freezes the app', 'Is required'],
              answer: 2,
              explain: 'The two managers deadlock — never mix them in one container.',
            },
            {
              q: 'What is the event loop doing between events?',
              choices: ['Spinning at 100% CPU', 'Sleeping, using ~0% CPU', 'Polling the keyboard', 'Redrawing everything'],
              answer: 1,
              explain: 'It blocks efficiently until the OS delivers an event — no busy-waiting.',
            },
            {
              q: 'A Frame is…',
              choices: ['A border style', 'A container widget that holds other widgets', 'The window title', 'A font'],
              answer: 1,
              explain: 'Frames group widgets — the sections of your layout.',
            },
          ],
          exercises: [
            {
              title: 'Anatomy check',
              brief:
                'Write (without running) a minimal Tkinter app: import tkinter, create the root window with a title "Counter", add a Button (text "+", command does nothing yet), and start the event loop. Structure matters more than polish.',
              starter: `# write the four-step GUI skeleton\n`,
              tests: `
code = _user_code
assert 'import tkinter' in code, 'import tkinter (as tk is fine)'
assert __import__('re').search(r'Tk\\s*\\(', code), 'create the root window with tk.Tk()'
assert 'title(' in code, 'set a window title'
assert 'Button' in code, 'add a Button widget'
assert 'mainloop' in code, 'start root.mainloop()'
assert code.count('mainloop') >= 1
`,
              hint: 'Follow the skeleton: import → root = tk.Tk() → root.title("Counter") → tk.Button(root, text="+") → root.mainloop().',
              staticOnly: true,
            },
          ],
        },
        {
          id: 't1-2',
          title: 'Events & callbacks',
          minutes: 80,
          source: 'moore',
          sourceRef: 'Moore ch. 3–4',
          objectives: ['Wire buttons to functions', 'Read Entry text', 'Bind keyboard/mouse events'],
          sections: [
            {
              h: 'command= callbacks',
              md: `\`\`\`python\ndef increment():\n    counter.set(counter.get() + 1)\n\ntk.Button(root, text="+", command=increment)  # NOTE: no parentheses!\n\`\`\`\n\n\`command=increment\` passes the **function itself** for Tk to call later. \`command=increment()\` would call it immediately and pass \`None\` — the #1 beginner bug.`,
            },
            {
              h: 'Variable trick: StringVar / IntVar',
              md: `Widgets don't return values; they hold **linked variables**:\n\n\`\`\`python\ncounter = tk.IntVar(value=0)\ntk.Label(root, textvariable=counter)\n\`\`\`\n\nChange the variable → every linked widget updates automatically. This "reactive" pattern previews how modern UI frameworks work.`,
            },
            {
              h: 'Reading and binding',
              md: `- \`entry.get()\` reads an Entry's current text; \`entry.delete(0, tk.END)\` clears it\n- \`.bind(event, handler)\` attaches any event: \`"<Return>"\` (Enter key), \`"<Button-1>"\` (left click), \`"<Key>"\`\n\n\`\`\`python\nentry.bind("<Return>", lambda e: submit())\n\`\`\``,
            },
          ],
          examples: [
            {
              caption: 'Click counter',
              code: `import tkinter as tk

root = tk.Tk()
counter = tk.IntVar(value=0)

tk.Label(root, textvariable=counter, font=("Arial", 24)).pack()
tk.Button(root, text="+1", command=lambda: counter.set(counter.get() + 1)).pack()

root.mainloop()`,
              expected: '(label shows a number; each click bumps it)',
              static: true,
            },
            {
              caption: 'Entry with Enter-to-submit',
              code: `import tkinter as tk

def greet(event=None):
    name = entry.get().strip() or "stranger"
    out.config(text=f"Hello, {name}!")

root = tk.Tk()
entry = tk.Entry(root)
entry.pack()
entry.bind("<Return>", greet)
out = tk.Label(root, text="type your name")
out.pack()
root.mainloop()`,
              expected: '(typing a name and pressing Enter greets you)',
              static: true,
            },
          ],
          quiz: [
            {
              q: 'command=increment vs command=increment()',
              choices: [
                'Both work the same',
                'The () calls immediately — wrong',
                'The () runs later',
                'increment needs parentheses',
              ],
              answer: 1,
              explain: 'You pass the function object; calling it immediately defeats the callback.',
            },
            {
              q: 'What reads the text of an Entry?',
              choices: ['entry.text', 'entry.value', 'entry.get()', 'entry.read()'],
              answer: 2,
              explain: 'Entry exposes .get() (and .delete/.insert).',
            },
            {
              q: 'textvariable=counter means…',
              choices: ['Copies the text once', 'Live-updates when counter changes', 'Sets font', 'Binds Enter'],
              answer: 1,
              explain: 'Tk variable links keep widget and value in sync both ways.',
            },
            {
              q: 'entry.bind("<Return>", f) triggers when…',
              choices: ['Mouse enters the widget', 'The Enter key is pressed', 'The app starts', 'Return key released'],
              answer: 1,
              explain: '"<Return>" is the Enter/Return key event.',
            },
            {
              q: 'Why is command=self.increment in a class?',
              choices: [
                'Style only',
                'The bound method remembers self, so it touches the right instance state',
                'It is faster',
                'Tk requires static methods',
              ],
              answer: 1,
              explain: 'self.increment is already bound — the callback knows which instance it belongs to.',
            },
          ],
          exercises: [
            {
              title: 'Callback discipline',
              brief:
                'Write a click-counter: an IntVar, a Label bound with textvariable, a Button whose command increments the variable via a named function (not lambda, not a direct call), and mainloop.',
              starter: `# click counter with a named callback function\n`,
              tests: `
code = _user_code
assert 'IntVar' in code, 'use tk.IntVar for the counter'
assert 'textvariable' in code, 'bind the label with textvariable='
assert 'command=' in code, 'wire the button with command='
assert 'command=' in code and not __import__('re').search(r'command=\\w+\\(\\)', code), 'command must reference the function, not call it: command=increment'
assert 'mainloop' in code
`,
              hint: 'def increment(): counter.set(counter.get() + 1) — then tk.Button(root, text="+1", command=increment).',
              staticOnly: true,
            },
          ],
        },
      ],
    },
    {
      id: 't2',
      title: 'Module 2 · Real Applications',
      summary: 'Canvas drawing, dialogs, and structure that survives growing into a real product.',
      lessons: [
        {
          id: 't2-1',
          title: 'Canvas & dialogs',
          minutes: 85,
          source: 'moore',
          sourceRef: 'Moore ch. 14, 6',
          objectives: ['Draw with Canvas coordinates', 'Open message/file dialogs', 'Structure larger GUI code'],
          sections: [
            {
              h: 'Canvas — a drawing surface',
              md: `\`\`\`python\ncanvas = tk.Canvas(root, width=400, height=300, bg="white")\ncanvas.create_rectangle(10, 10, 100, 80, fill="blue")\ncanvas.create_oval(120, 10, 220, 110, outline="red", width=3)\ncanvas.create_text(200, 150, text="drawn with code")\n\`\`\`\n\nCoordinates start top-left. Every shape gets an id you can move/delete — that's how simple games and data visualizations work in Tk.`,
            },
            {
              h: 'Dialogs',
              md: `\`\`\`python\nfrom tkinter import messagebox, filedialog\n\nmessagebox.showinfo("Saved", "File written!")\npath = filedialog.asksaveasfilename(defaultextension=".json")\n\`\`\`\n\nDialogs are modal windows that return values (or empty strings when cancelled).`,
            },
            {
              h: 'Structure as you grow',
              md: `Once beyond 50 lines: build the window in a class (\`class App(tk.Tk)\` or a plain class holding \`self.root\`), one method per panel, callbacks as methods. Moore's book drives this hard — his full app chapters (forms → validation → menus → Treeview → SQL storage) are your roadmap for the capstone project: a real notepad/contacts app.`,
            },
          ],
          examples: [
            {
              caption: 'Bouncing ball sketch',
              code: `import tkinter as tk

root = tk.Tk()
canvas = tk.Canvas(root, width=300, height=200, bg="black")
canvas.pack()

x, y, dx, dy = 50, 50, 3, 2
ball = canvas.create_oval(x-10, y-10, x+10, y+10, fill="yellow")

def move():
    global x, y, dx, dy
    x, y = x + dx, y + dy
    if x < 10 or x > 290: dx = -dx
    if y < 10 or y > 190: dy = -dy
    canvas.coords(ball, x-10, y-10, x+10, y+10)
    root.after(16, move)   # ~60 fps

move()
root.mainloop()`,
              expected: '(a yellow ball bouncing inside a black box)',
              static: true,
            },
          ],
          quiz: [
            {
              q: 'Canvas coordinates start at…',
              choices: ['Center', 'Top-left', 'Bottom-left', 'Random'],
              answer: 1,
              explain: 'GUI y grows downward — (0,0) is the top-left corner.',
            },
            {
              q: 'root.after(16, fn) does what?',
              choices: ['Sleeps the app', 'Schedules fn to run in ~16 ms', 'Runs fn 16 times', 'Exits'],
              answer: 1,
              explain: "after schedules a callback on the event loop — the GUI-safe way to animate (never use time.sleep in a GUI!).",
            },
            {
              q: 'filedialog.asksaveasfilename returns…',
              choices: ['A file object', 'The chosen path string', 'True/False', 'None always'],
              answer: 1,
              explain: 'It returns the path (empty string if cancelled).',
            },
            {
              q: 'As a GUI app grows, prefer…',
              choices: ['One giant script', 'A class bundling window + callbacks', 'Global variables', 'More mainloops'],
              answer: 1,
              explain: 'Class-based structure keeps state and callbacks together; exactly one mainloop runs.',
            },
            {
              q: 'Animating a bouncing ball should use…',
              choices: ['time.sleep in a loop', 'root.after scheduling', 'A while True outside mainloop', 'More canvases'],
              answer: 1,
              explain: 'after() keeps control on the event loop; sleep freezes the whole UI.',
            },
          ],
          exercises: [
            {
              title: 'Plan a real app',
              brief:
                'Write the class skeleton for a notepad app: class NotepadApp holding self.root and self.text (a tk.Text widget in __init__), a save() method using filedialog.asksaveasfilename, a run() method calling mainloop, and `if __name__ == "__main__":` guard instantiating and running it.',
              starter: `# NotepadApp class skeleton\n`,
              tests: `
code = _user_code
assert 'class NotepadApp' in code, 'define class NotepadApp'
assert 'tk.Text' in code, 'include a tk.Text widget'
assert 'asksaveasfilename' in code, 'use filedialog.asksaveasfilename in save()'
assert 'def save' in code, 'define a save method'
assert 'def run' in code and 'mainloop' in code, 'run() should call mainloop'
assert '__main__' in code, 'add the if __name__ == "__main__" guard'
`,
              hint: 'class NotepadApp:\n    def __init__(self): self.root = tk.Tk(); self.text = tk.Text(self.root); self.text.pack()\n    def save(self): path = filedialog.asksaveasfilename(defaultextension=".txt")\n    def run(self): self.root.mainloop()',
              staticOnly: true,
            },
          ],
        },
      ],
    },
  ],
}
