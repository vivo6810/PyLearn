import { useState, useRef, useEffect, type ReactNode } from 'react'
import { Icon } from './Icon'

interface FAQItem {
  q: string
  a: string | ReactNode
  icon?: string
}

interface FAQProps {
  items: FAQItem[]
  className?: string
}

/** hover-capable pointer? (touch devices expand on tap instead) */
function canHover(): boolean {
  return window.matchMedia('(hover: hover) and (pointer: fine)').matches
}

function FAQItemInner({
  item,
  open,
  onToggle,
  onHover,
  onLeave,
}: {
  item: FAQItem
  open: boolean
  onToggle: () => void
  onHover: (() => void) | undefined
  onLeave: (() => void) | undefined
}) {
  const bodyRef = useRef<HTMLDivElement>(null)
  const [height, setHeight] = useState<number | null>(null)

  useEffect(() => {
    if (!bodyRef.current) return
    setHeight(open ? bodyRef.current.scrollHeight : 0)
  }, [open])

  // keep the measured height correct when the content changes while open
  useEffect(() => {
    if (!open || !bodyRef.current) return
    const observer = new ResizeObserver(() => setHeight(bodyRef.current?.scrollHeight ?? 0))
    observer.observe(bodyRef.current)
    return () => observer.disconnect()
  }, [open])

  return (
    <div className="faq-item" onMouseEnter={onHover} onMouseLeave={onLeave}>
      <button
        className={`faq-q ${open ? 'faq-q--open' : ''}`}
        onClick={onToggle}
        aria-expanded={open}
        type="button"
      >
        <span className="faq-q-row">
          <span className="faq-q-title">{item.q}</span>
          <span className="faq-q-icon">
            <Icon name={item.icon ?? 'plus'} size={16} />
          </span>
        </span>
      </button>
      <div
        className="faq-a-wrap"
        style={{
          overflow: 'hidden',
          height: height !== null ? `${height}px` : '0px',
          transition: 'height 0.24s cubic-bezier(0.23, 1, 0.32, 1)',
        }}
      >
        <div className="faq-a" ref={bodyRef}>
          {item.a}
        </div>
      </div>
    </div>
  )
}

/**
 * Expands on hover on desktop (the item stays open while the pointer is on
 * it), on tap elsewhere. Clicking pins an item open so it survives the
 * pointer moving away, and clicking again unpins it.
 */
function FaqEntry({ item, hoverable }: { item: FAQItem; hoverable: boolean }) {
  const [open, setOpen] = useState(false)
  const [pinned, setPinned] = useState(false)

  return (
    <FAQItemInner
      item={item}
      open={open}
      onToggle={() => {
        setPinned((p) => {
          const next = !p
          setOpen(next)
          return next
        })
      }}
      onHover={
        hoverable
          ? () => {
              setOpen(true)
            }
          : undefined
      }
      onLeave={
        hoverable
          ? () => {
              if (!pinned) setOpen(false)
            }
          : undefined
      }
    />
  )
}

export function FAQ({ items, className }: FAQProps) {
  const [hoverable, setHoverable] = useState(false)

  useEffect(() => {
    setHoverable(canHover())
  }, [])

  return (
    <section className={`faq ${className ?? ''}`} aria-label="Frequently asked questions">
      <h2 className="faq-title">
        <Icon name="help" size={20} /> Frequently asked
      </h2>
      <div className="faq-list">
        {items.map((item, i) => (
          <FaqEntry key={i} item={item} hoverable={hoverable} />
        ))}
      </div>
    </section>
  )
}
