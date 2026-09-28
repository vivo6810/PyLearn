import type { Track } from '../types'
import { Icon } from './Icon'
import { Logo } from './Logo'

export function Certificate({ track, onClose }: { track: Track; onClose: () => void }) {
  const date = new Date().toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })
  return (
    <div className="modal" onClick={onClose}>
      <div className="modal-card cert" onClick={(e) => e.stopPropagation()}>
        <div className="cert-inner">
          <div className="cert-brand">
            PyLearn <Logo size={16} plain />
          </div>
          <h1>Certificate of Completion</h1>
          <p className="cert-line">This certifies that the bearer has completed every lesson of</p>
          <h2 className="cert-track">
            <Icon name={track.icon} size={22} /> {track.title}
          </h2>
          <p className="cert-line">including all quizzes and coding exercises</p>
          <p className="cert-date">Awarded {date}</p>
        </div>
        <div className="modal-actions">
          <button className="btn primary" onClick={() => window.print()}>
            <Icon name="printer" size={15} /> Print / Save as PDF
          </button>
          <button className="btn ghost" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  )
}
