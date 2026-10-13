import { useRef, useState } from 'react'
import type { Track } from '../types'
import { Icon } from './Icon'
import './TrackPreviewCarousel.css'

function TrackPagePreview({ track, onOpen }: { track: Track; onOpen: () => void }) {
  const lessons = track.modules.flatMap((module) => module.lessons)
  const firstModule = track.modules[0]
  const firstLesson = firstModule?.lessons[0]
  const example = firstLesson?.examples[0]

  return (
    <article className="track-preview-page">
      <div className="track-preview-page__bar">
        <span className="track-preview-page__brand"><Icon name="snake" size={17} /> PyLearn</span>
        <span className="track-preview-page__bar-link">My learning</span>
        <span className="track-preview-page__avatar" aria-hidden="true">V</span>
      </div>

      <div className="track-preview-page__body">
        <aside className="track-preview-page__sidebar" aria-hidden="true">
          <span className="track-preview-page__sidebar-label">YOUR TRACK</span>
          <strong>{track.title}</strong>
          {track.modules.slice(0, 5).map((module, index) => (
            <span
              key={module.id}
              className={`track-preview-page__module${index === 0 ? ' is-active' : ''}`}
              title={module.title}
            >
              <span>{String(index + 1).padStart(2, '0')}</span>
              {module.title.replace(/^Module \d+ · /, '')}
            </span>
          ))}
          {track.modules.length > 5 && <span className="track-preview-page__more">+ {track.modules.length - 5} more modules</span>}
        </aside>

        <div className="track-preview-page__content">
          <div className="track-preview-page__eyebrow">LEARNING PATH <span>/</span> {track.title.toUpperCase()}</div>
          <div className="track-preview-page__title-row">
            <span className="track-preview-page__icon" style={{ color: `color-mix(in srgb, ${track.accent} 35%, #ede8db)` }}>
              <Icon name={track.icon} size={22} />
            </span>
            <div>
              <h2>{track.title}</h2>
              <p>{track.blurb}</p>
            </div>
          </div>

          <div className="track-preview-page__progress">
            <span><strong>{track.modules.length}</strong> modules <i>·</i> <strong>{lessons.length}</strong> lessons</span>
            <span className="track-preview-page__progress-track"><span /></span>
            <small>Ready when you are</small>
          </div>

          {firstModule && (
            <section className="track-preview-page__lesson">
              <div className="track-preview-page__lesson-heading">
                <div><small>START HERE</small><h3>{firstModule.title}</h3></div>
                <Icon name="arrow-right" size={17} />
              </div>
              {firstLesson && (
                <div className="track-preview-page__lesson-row">
                  <Icon name="play" size={14} />
                  <span>{firstLesson.title}</span>
                  <small>{firstLesson.minutes} min</small>
                </div>
              )}
              {example && <pre><code>{example.code.split('\n').slice(0, 3).join('\n')}</code></pre>}
            </section>
          )}

          <button className="track-preview-page__open" type="button" onClick={onOpen}>
            Explore this track <span aria-hidden="true">→</span>
          </button>
        </div>
      </div>
    </article>
  )
}

export function TrackPreviewCarousel({ tracks, onOpen }: { tracks: Track[]; onOpen: (trackId: string) => void }) {
  const railRef = useRef<HTMLDivElement>(null)
  const slideRefs = useRef<Array<HTMLElement | null>>([])
  const [active, setActive] = useState(0)

  const goTo = (index: number) => {
    const next = Math.min(Math.max(index, 0), tracks.length - 1)
    slideRefs.current[next]?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' })
    setActive(next)
  }

  const updateActive = () => {
    const rail = railRef.current
    if (!rail) return
    const center = rail.getBoundingClientRect().left + rail.clientWidth / 2
    let closest = 0
    let distance = Infinity
    slideRefs.current.forEach((slide, index) => {
      if (!slide) return
      const rect = slide.getBoundingClientRect()
      const currentDistance = Math.abs(rect.left + rect.width / 2 - center)
      if (currentDistance < distance) {
        closest = index
        distance = currentDistance
      }
    })
    setActive(closest)
  }

  const onRailKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'ArrowRight') {
      event.preventDefault()
      goTo(active + 1)
    } else if (event.key === 'ArrowLeft') {
      event.preventDefault()
      goTo(active - 1)
    }
  }

  return (
    <div className="track-preview-carousel">
      <div
        ref={railRef}
        className="track-preview-carousel__rail"
        role="region"
        aria-label="Course previews"
        tabIndex={0}
        onScroll={updateActive}
        onKeyDown={onRailKeyDown}
      >
        {tracks.map((track, index) => (
          <div
            key={track.id}
            ref={(element) => { slideRefs.current[index] = element }}
            className="track-preview-carousel__slide"
            role="group"
            aria-label={`${track.title} course preview, ${index + 1} of ${tracks.length}`}
          >
            <TrackPagePreview track={track} onOpen={() => onOpen(track.id)} />
          </div>
        ))}
      </div>

      <div className="track-preview-carousel__controls">
        <button className="track-preview-carousel__arrow" type="button" onClick={() => goTo(active - 1)} disabled={active === 0} aria-label="Previous course">
          <Icon name="arrow-left" size={16} />
        </button>
        <div className="track-preview-carousel__dots" aria-label={`${active + 1} of ${tracks.length}`}>
          {tracks.map((track, index) => (
            <button
              key={track.id}
              type="button"
              className={`track-preview-carousel__dot${active === index ? ' is-active' : ''}`}
              aria-label={`Show ${track.title}`}
              aria-current={active === index ? 'true' : undefined}
              onClick={() => goTo(index)}
            />
          ))}
        </div>
        <span className="track-preview-carousel__count">{String(active + 1).padStart(2, '0')} / {String(tracks.length).padStart(2, '0')}</span>
        <button className="track-preview-carousel__arrow" type="button" onClick={() => goTo(active + 1)} disabled={active === tracks.length - 1} aria-label="Next course">
          <Icon name="arrow-right" size={16} />
        </button>
      </div>
      <span className="sr-only" aria-live="polite">{tracks[active]?.title} course preview</span>
    </div>
  )
}
