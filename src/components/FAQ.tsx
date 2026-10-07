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

function FAQItemInner({ item, open, onToggle }: { item: FAQItem; open: boolean; onToggle: () => void }) {
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
    <div className="faq-item">
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
          transition: 'height 0.28s cubic-bezier(0.2, 0.7, 0.2, 1)',
        }}
      >
        <div className="faq-a" ref={bodyRef}>
          {item.a}
        </div>
      </div>
    </div>
  )
}

export function FAQ({ items, className }: FAQProps) {
  return (
    <section className={`faq ${className ?? ''}`} aria-label="Frequently asked questions">
      <h2 className="faq-title">
        <Icon name="help" size={20} /> Frequently asked
      </h2>
      <p className="faq-sub">Tap a question to expand the answer.</p>
      <div className="faq-list">
        {items.map((item, i) => {
          const [open, setOpen] = useState(false)
          return (
            <FAQItemInner
              key={i}
              item={item}
              open={open}
              onToggle={() => setOpen((v) => !v)}
            />
          )
        })}
      </div>
    </section>
  )
}
