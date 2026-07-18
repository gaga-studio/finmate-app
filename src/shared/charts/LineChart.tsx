import { useId } from 'react'
import { motion } from 'motion/react'
import { seriesToPts, smoothPath } from './chart-utils'

interface Props {
  points: number[]
  width?: number
  height?: number
  /** 재드로잉 트리거용 — 기간 전환 시 바꿔주면 처음부터 다시 그린다 */
  drawKey?: string
}

export function LineChart({ points, width = 220, height = 120, drawKey }: Props) {
  const gradId = useId()
  const pts = seriesToPts(points, width, height, 8)
  const line = smoothPath(pts)
  const last = pts[pts.length - 1]
  const area = `${line} L ${last.x} ${height} L ${pts[0].x} ${height} Z`

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} aria-hidden>
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="currentColor" stopOpacity={0.28} />
          <stop offset="100%" stopColor="currentColor" stopOpacity={0} />
        </linearGradient>
      </defs>
      <g key={drawKey}>
        <motion.path
          d={area}
          fill={`url(#${gradId})`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.55, duration: 0.5 }}
        />
        <motion.path
          d={line}
          fill="none"
          stroke="currentColor"
          strokeWidth={3.5}
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.9, ease: [0.3, 0, 0.2, 1] }}
        />
        {/* 끝점 펄스 */}
        <motion.circle
          cx={last.x}
          cy={last.y}
          r={5}
          fill="currentColor"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.75, type: 'spring', stiffness: 300, damping: 18 }}
        />
        <motion.circle
          cx={last.x}
          cy={last.y}
          r={5}
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          initial={{ scale: 1, opacity: 0.6 }}
          animate={{ scale: 2.4, opacity: 0 }}
          transition={{ delay: 1, duration: 1.6, repeat: Infinity, repeatDelay: 1.2 }}
        />
      </g>
    </svg>
  )
}
