import { motion } from 'motion/react'
import { snappy } from '../../shared/motion/springs'
import type { Metric } from './myState'

const ITEMS = [
  { value: 'budget', label: '소비', color: 'text-budget' },
  { value: 'saving', label: '저축', color: 'text-saving' },
  { value: 'invest', label: '투자', color: 'text-invest' },
] as const

/** 지표 탭 — 각 지표 고유색을 유지하고, 활성 탭만 말랑한 색면으로 강조한다 */
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
    <div className="clay-pressed relative mx-5 flex rounded-full bg-white/75 p-1 ring-1 ring-line/70">
      {ITEMS.map(({ value, label, color }) => (
        <button
          key={value}
          type="button"
          onClick={() => onChange(value)}
          className={`relative flex-1 rounded-full py-2 text-section font-extrabold transition-all active:scale-[0.98] ${color} ${
            metric === value ? 'opacity-100' : 'opacity-55'
          }`}
        >
          {metric === value && (
            <motion.span
              layoutId={layoutId}
              className="absolute inset-0 rounded-full bg-current/12 shadow-soft ring-1 ring-current/20"
              transition={snappy}
            />
          )}
          <span className="relative">{label}</span>
        </button>
      ))}
    </div>
  )
}
