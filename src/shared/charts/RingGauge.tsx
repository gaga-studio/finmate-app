import type { ReactNode } from 'react'
import { motion } from 'motion/react'

interface Props {
  /** 진행률 0~1 */
  pct: number
  size?: number
  thickness?: number
  children?: ReactNode
}

export function RingGauge({ pct, size = 150, thickness = 13, children }: Props) {
  const r = (size - thickness) / 2
  const c = size / 2

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden>
        <circle
          cx={c}
          cy={c}
          r={r}
          fill="none"
          stroke="currentColor"
          strokeOpacity={0.14}
          strokeWidth={thickness}
        />
        <motion.circle
          cx={c}
          cy={c}
          r={r}
          fill="none"
          stroke="currentColor"
          strokeWidth={thickness}
          strokeLinecap="round"
          transform={`rotate(-90 ${c} ${c})`}
          initial={{ pathLength: 0 }}
          animate={{ pathLength: pct }}
          transition={{ type: 'spring', stiffness: 60, damping: 18 }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">{children}</div>
    </div>
  )
}
