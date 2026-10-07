import { useEffect, useState } from 'react'
import { useApp } from '../state/AppContext'
import { Icon } from './Icon'
import type { QuizQuestion } from '../types'

export function QuizCard({ lessonId, questions }: { lessonId: string; questions: QuizQuestion[] }) {
  const { getQuizDraft, setQuizDraft, clearQuizDraft, recordQuiz } = useApp()
  const [picked, setPicked] = useState<Record<number, number>>({})
  const [checked, setChecked] = useState<Record<number, boolean>>({})
  const [finished, setFinished] = useState(false)

  // reset the UI when the learner opens a different quiz
  useEffect(() => {
    setPicked({})
    setChecked({})
    setFinished(false)
    const draft = getQuizDraft(lessonId)
    if (draft && typeof draft === 'object') {
      setPicked({ ...draft } as Record<number, number>)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lessonId])

  function choose(qi: number, ci: number) {
    if (checked[qi]) return
    const next = { ...picked, [qi]: ci }
    setPicked(next)
    setChecked((c) => ({ ...c, [qi]: true }))
    setQuizDraft(lessonId, qi, ci)
  }

  function allChecked() {
    return questions.every((_, qi) => checked[qi])
  }

  function finish() {
    if (!allChecked() || finished) return
    const score = questions.reduce((acc, q, qi) => acc + (picked[qi] === q.answer ? 1 : 0), 0)
    recordQuiz(lessonId, score, questions.length)
    setFinished(true)
  }

  function retake() {
    setPicked({})
    setChecked({})
    setFinished(false)
    clearQuizDraft(lessonId)
  }

  // use the local draft for the live score (answers are confirmed on finish only)
  const score = Object.keys(picked).length
    ? questions.reduce((acc, q, qi) => acc + (picked[qi] === q.answer ? 1 : 0), 0)
    : 0
  const perfect = questions.length > 0 && score === questions.length

  return (
    <div className="quiz">
      {questions.map((q, qi) => {
        const isCorrect = picked[qi] === q.answer
        return (
          <div className="quiz-q" key={qi}>
            <p className="quiz-prompt">
              <strong>{qi + 1}.</strong>{' '}
              <span dangerouslySetInnerHTML={{ __html: renderMdInline(q.q) }} />
            </p>
            <div className="quiz-choices">
              {q.choices.map((c, ci) => {
                const isPicked = picked[qi] === ci
                const reveal = checked[qi]
                const cls = [
                  'quiz-choice',
                  isPicked ? 'picked' : '',
                  reveal && ci === q.answer ? 'correct' : '',
                  reveal && isPicked && ci !== q.answer ? 'wrong' : '',
                ]
                  .filter(Boolean)
                  .join(' ')
                return (
                  <button key={ci} className={cls} onClick={() => choose(qi, ci)} disabled={reveal}>
                    <span className="quiz-letter">{String.fromCharCode(65 + ci)}</span>
                    <span dangerouslySetInnerHTML={{ __html: renderMdInline(c) }} />
                  </button>
                )
              })}
            </div>
            {checked[qi] && (
              <p className={'quiz-explain ' + (isCorrect ? 'ok' : 'no')}>
                <Icon name={isCorrect ? 'check-circle' : 'x-circle'} size={15} />
                <span>{q.explain}</span>
              </p>
            )}
          </div>
        )
      })}

      {!allChecked() && <p className="quiz-note">Answer all {questions.length} questions to see your score.</p>}
      {allChecked() && !finished && (
        <button className="btn primary" onClick={finish}>
          Score my quiz
        </button>
      )}
      {finished && (
        <div className={'quiz-result ' + (perfect ? 'perfect' : '')}>
          <strong>
            {score} / {questions.length}{' '}
            {perfect ? '— perfect!' : score >= Math.ceil(questions.length / 2) ? '— nice' : '— review and retry'}
          </strong>
          {score < questions.length && (
            <button className="btn ghost" onClick={retake}>
              <Icon name="rotate" size={14} /> Retry
            </button>
          )}
        </div>
      )}
    </div>
  )
}

// inline markdown (code ticks) only — no block elements inside a sentence
function renderMdInline(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/`([^`]+)`/g, '<code>$1</code>')
}
