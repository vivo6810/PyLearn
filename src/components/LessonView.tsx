import { useEffect, useRef, useState } from 'react'
import { renderMd } from '../markdown'
import { useApp } from '../state/AppContext'
import { findLesson, lessonNeighbors } from '../curriculum'
import { CodeRunner } from './CodeRunner'
import { ExerciseRunner } from './ExerciseRunner'
import { QuizCard } from './QuizCard'
import { Icon } from './Icon'
import type { Example } from '../types'

export function LessonView({ id, navigate }: { id: string; navigate: (v: string) => void }) {
  const found = findLesson(id)
  const { completeLesson, lessonCompleted, setLastLesson } = useApp()

  useEffect(() => {
    if (found) setLastLesson(id)
    window.scrollTo(0, 0)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  if (!found) {
    return (
      <div className="page">
        <p>Lesson not found.</p>
        <button className="btn primary" onClick={() => navigate('dashboard')}>
          ← Back to dashboard
        </button>
      </div>
    )
  }

  const { track, lesson } = found
  const { prev, next } = lessonNeighbors(id)
  const completed = lessonCompleted(id)

  return (
    <div className="page lesson">
      <nav className="crumbs">
        <button className="link" onClick={() => navigate('dashboard')}>
          <Icon name={track.icon} size={14} /> {track.title}
        </button>
        <span>›</span>
        <span>{lesson.title}</span>
      </nav>

      <header className="lesson-head">
        <h1>{lesson.title}</h1>
        <div className="lesson-meta">
          <span>
            <Icon name="clock" size={14} /> ~{lesson.minutes} min
          </span>
          {lesson.sourceRef && (
            <span>
              <Icon name="book" size={14} /> {lesson.sourceRef}
            </span>
          )}
          {completed && <span className="pill pill-pass">completed</span>}
        </div>
      </header>

      {lesson.objectives.length > 0 && (
        <div className="objectives">
          <strong>You will be able to</strong>
          <ul>
            {lesson.objectives.map((o) => (
              <li key={o}>{o}</li>
            ))}
          </ul>
        </div>
      )}

      {lesson.sections.map((s, i) => (
        <section key={i} className="lesson-sec">
          <h2>{s.h}</h2>
          <div className="md" dangerouslySetInnerHTML={{ __html: renderMd(s.md) }} />
        </section>
      ))}

      {lesson.examples.length > 0 && (
        <section className="lesson-sec">
          <h2>
            <Icon name="code" size={20} /> Worked examples
          </h2>
          {lesson.examples.map((ex, i) => (
            <ExampleBlock key={i} example={ex} lessonId={lesson.id} idx={i} />
          ))}
        </section>
      )}

      {lesson.exercises.length > 0 && (
        <section className="lesson-sec">
          <h2>
            <Icon name="wrench" size={20} /> Exercises
          </h2>
          {lesson.exercises.map((ex, i) => (
            <ExerciseRunner key={i} lessonId={lesson.id} index={i} exercise={ex} onPassed={() => {}} />
          ))}
        </section>
      )}

      {lesson.quiz.length > 0 && (
        <section className="lesson-sec">
          <h2>
            <Icon name="brain" size={20} /> Check yourself
          </h2>
          <QuizCard lessonId={lesson.id} questions={lesson.quiz} />
        </section>
      )}

      <Notes lessonId={lesson.id} />

      <div className="lesson-complete">
        <button
          className="btn primary big"
          onClick={() => {
            completeLesson(lesson.id)
            if (next) navigate(`lesson:${next.id}`)
          }}
        >
          {completed ? 'Next lesson →' : 'Mark complete & continue'}
        </button>
      </div>

      <nav className="pager">
        {prev ? (
          <button className="btn ghost" onClick={() => navigate(`lesson:${prev.id}`)}>
            ← {prev.title}
          </button>
        ) : (
          <span />
        )}
        {next ? (
          <button className="btn ghost" onClick={() => navigate(`lesson:${next.id}`)}>
            {next.title} →
          </button>
        ) : (
          <span />
        )}
      </nav>
    </div>
  )
}

function ExampleBlock({ example, lessonId, idx }: { example: Example; lessonId: string; idx: number }) {
  return (
    <figure className="example">
      <figcaption>{example.caption}</figcaption>
      {example.static ? (          <div className="static-code">
          <div className="static-code-bar">
            <Icon name="window" size={14} /> python · runs on your computer (GUI)
          </div>
          <pre>{example.code}</pre>
        </div>
      ) : (
        <CodeRunner
          initialCode={example.code}
          draftKey={`${lessonId}:ex${idx}`}
          minHeight={110}
          compact
          stdinHint={example.stdinHint}
        />
      )}
    </figure>
  )
}

function Notes({ lessonId }: { lessonId: string }) {
  const { getNote, setNote } = useApp()
  const [text, setText] = useState(() => getNote(lessonId) ?? '')
  const [saved, setSaved] = useState(false)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    setText(getNote(lessonId) ?? '')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lessonId])

  function onChange(v: string) {
    setText(v)
    setSaved(false)
    if (timer.current) clearTimeout(timer.current)
    timer.current = setTimeout(() => {
      setNote(lessonId, v)
      setSaved(true)
    }, 500)
  }

  return (
    <section className="lesson-sec notes">
      <h2>
        <Icon name="pencil" size={20} /> My notes
      </h2>
      <textarea
        value={text}
        placeholder="Write anything you want to remember about this lesson…"
        onChange={(e) => onChange(e.target.value)}
      />
      {saved && (
        <span className="saved-note">
          <Icon name="check" size={12} /> saved
        </span>
      )}
    </section>
  )
}
