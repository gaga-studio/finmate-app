import { motion } from 'motion/react'
import { snappy } from '../../shared/motion/springs'
import type { Metric } from './myState'

const ITEMS = [
  { value: 'budget', label: '소비', color: 'text-budget' },
  { value: 'saving', label: '저축', color: 'text-saving' },
  { value: 'invest', label: '투자', color: 'text-invest' },
] as const

/** 지표 탭 — 지표색은 활성 상태에서만 쓰고, 비활성은 중립색으로 정리한다 */
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
    <div className="relative mx-5 flex rounded-full border border-line bg-white p-1 shadow-soft">
      {ITEMS.map(({ value, label, color }) => (
        <button
          key={value}
          type="button"
          onClick={() => onChange(value)}
          className={`relative flex-1 rounded-full py-2 text-section font-extrabold transition-all active:scale-[0.98] ${
            metric === value ? color : 'text-ink-faint'
          }`}
        >
          {metric === value && (
            <motion.span
              layoutId={layoutId}
              className="absolute inset-0 rounded-full bg-current/10 ring-1 ring-current/15"
              transition={snappy}
            />
          )}
          <span className="relative">{label}</span>
        </button>
      ))}
    </div>
  )
}
