import { motion } from 'motion/react'
import { snappy } from '../motion/springs'

interface Props<T extends string> {
  items: { value: T; label: string }[]
  value: T
  onChange: (v: T) => void
  /** layoutId 네임스페이스 — 화면에 여러 개 있을 때 구분 */
  id: string
  className?: string
}

export function SegmentedControl<T extends string>({ items, value, onChange, id, className }: Props<T>) {
  return (
    <div className={`flex rounded-full border border-line bg-white p-1 shadow-soft ${className ?? ''}`}>
      {items.map((item) => {
        const active = item.value === value
        return (
          <button
            key={item.value}
            type="button"
            onClick={() => onChange(item.value)}
            className="relative flex-1 rounded-full px-3.5 py-1.5 text-body font-semibold transition-transform active:scale-[0.97]"
          >
            {active && (
              <motion.span
                layoutId={`seg-${id}`}
                className="absolute inset-0 rounded-full bg-point ring-1 ring-accent/15"
                transition={snappy}
              />
            )}
            <span className={`relative ${active ? 'text-accent' : 'text-ink-soft'}`}>{item.label}</span>
          </button>
        )
      })}
    </div>
  )
}
