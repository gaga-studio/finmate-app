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
    <div className={`flex rounded-full bg-ink/6 p-1 ${className ?? ''}`}>
      {items.map((item) => {
        const active = item.value === value
        return (
          <button
            key={item.value}
            type="button"
            onClick={() => onChange(item.value)}
            className="relative flex-1 rounded-full px-3.5 py-1.5 text-[13px] font-semibold"
          >
            {active && (
              <motion.span
                layoutId={`seg-${id}`}
                className="absolute inset-0 rounded-full bg-elevated shadow-soft"
                transition={snappy}
              />
            )}
            <span className={`relative ${active ? 'text-ink' : 'text-ink-soft'}`}>{item.label}</span>
          </button>
        )
      })}
    </div>
  )
}
