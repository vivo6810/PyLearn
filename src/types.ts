// ─── Curriculum domain model ────────────────────────────────────────────────

export interface QuizQuestion {
  q: string
  choices: string[]
  /** index into choices */
  answer: number
  explain: string
}

export interface Exercise {
  title: string
  brief: string
  starter: string
  /** hidden python test code; runs after user code with same globals */
  tests: string
  hint: string
  /** GUI/hardware-style code that cannot execute in-browser: tests inspect the
   * source text (_user_code) instead of running it. */
  staticOnly?: boolean
  /** Pre-typed "keystrokes" for input()-based exercises: one line per input().
   * Fed to the pretend-keyboard box so learners can play-test their game. */
  stdinHint?: string
}

export interface Section {
  h: string
  md: string
}

export type SourceBook =
  | 'halterman'
  | 'sweigart'
  | 'klein'
  | 'stackabuse'
  | 'moore'
  | 'ward'
  | 'guru99'
  | 'pylearn' // our own authored material

export interface Lesson {
  id: string
  title: string
  minutes: number
  /** what the learner will be able to do */
  objectives: string[]
  sections: Section[]
  examples: Example[]
  quiz: QuizQuestion[]
  exercises: Exercise[]
  source?: SourceBook
  sourceRef?: string
}

export interface Example {
  caption: string
  code: string
  expected?: string
  /** cannot run in a browser (tkinter etc.) — render as static code */
  static?: boolean
  /** hint shown above the pretend-keyboard stdin box (games use input()) */
  stdinHint?: string
}

export interface Module {
  id: string
  title: string
  summary: string
  lessons: Lesson[]
}

export interface Track {
  id: string
  title: string
  blurb: string
  icon: string
  accent: string
  modules: Module[]
}

// ─── Progress & sessions ────────────────────────────────────────────────────

export interface LessonProgress {
  completed: boolean
  quizScore?: number // 0..1
  exerciseDone?: string[] // exercise indexes passed
  minutesSpent?: number
}

export interface ProgressState {
  version: 1
  lessons: Record<string, LessonProgress>
  xp: number
  streak: number
  lastActiveDay?: string // YYYY-MM-DD
  theme: 'light' | 'dark'
  achievements: string[]
  certificates: string[] // track ids
}

export interface SessionState {
  version: 1
  updatedAt: number
  /** last lesson the learner had open */
  lastLesson?: string
  /** last scroll target within a lesson (example index etc.) */
  lastExampleIdx?: Record<string, number>
  /** per-lesson draft code: `lessonId:ex<i>` for examples, `lessonId:task<i>` for exercises */
  drafts: Record<string, string>
  /** per-lesson in-progress quiz answers: question index -> choice index */
  quizDrafts: Record<string, Record<number, number>>
  /** per-lesson notes */
  notes: Record<string, string>
}
