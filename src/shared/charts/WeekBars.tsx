import { motion } from 'motion/react'
import { snappy } from '../motion/springs'
import type { SavingWeekBar } from '../../data/selectors'

interface Props {
  bars: SavingWeekBar[]
  width?: number
  height?: number
}

const LABEL_H = 18

/** 이번 달 주차별 저축 막대 — scaleY 드로잉, 현재 주차 강조 */
export function WeekBars({ bars, width = 216, height = 120 }: Props) {
  const max = Math.max(...bars.map((b) => b.amount), 1)
  const gap = 14
  const barW = (width - gap * (bars.length - 1)) / bars.length
  const chartH = height - LABEL_H

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} aria-hidden>
      {bars.map((b, i) => {
        const x = i * (barW + gap)
        const h = Math.max((b.amount / max) * (chartH - 8), 4)
        return (
          <g key={b.week}>
            <motion.rect
              x={x}
              y={chartH - h}
              width={barW}
              height={h}
              rx={6}
              fill="currentColor"
              opacity={b.amount === 0 ? 0.12 : b.isCurrent ? 0.95 : 0.4}
              initial={{ scaleY: 0 }}
              animate={{ scaleY: 1 }}
              transition={{ ...snappy, delay: 0.1 + i * 0.06 }}
              style={{ originY: 1, transformBox: 'fill-box' }}
            />
            <text
              x={x + barW / 2}
              y={height - 4}
              textAnchor="middle"
              fontSize={10.5}
              fontWeight={b.isCurrent ? 800 : 600}
              fill="currentColor"
              opacity={b.isCurrent ? 0.9 : 0.45}
            >
              {b.week}주
            </text>
          </g>
        )
      })}
    </svg>
  )
}
