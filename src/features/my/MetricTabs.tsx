import { motion } from 'motion/react'
import { snappy } from '../../shared/motion/springs'
import type { Metric } from './myState'

const ITEMS = [
  { value: 'budget', label: '소비', color: 'text-budget' },
  { value: 'saving', label: '저축', color: 'text-saving' },
  { value: 'invest', label: '투자', color: 'text-invest' },
] as const

/** 지표 밑줄 탭 — 활성색 = 지표 테마색. 마이/메이트가 공유한다 */
export function MetricTabs({
  metric,
  onChange,
  layoutId,
}: {
  metric: Metric
  onChange: (m: Metric) => void
  layoutId: string
}) {
  return (
    <div className="relative flex border-b border-line px-5">
      {ITEMS.map(({ value, label, color }) => (
        <button
          key={value}
          type="button"
          onClick={() => onChange(value)}
          className={`relative flex-1 pb-2.5 pt-1 text-section font-bold ${
            metric === value ? color : 'text-ink-faint'
          }`}
        >
          {label}
          {metric === value && (
            <motion.span
              layoutId={layoutId}
              className="absolute inset-x-8 bottom-0 h-0.5 rounded-full bg-current"
              transition={snappy}
            />
          )}
        </button>
      ))}
    </div>
  )
}
