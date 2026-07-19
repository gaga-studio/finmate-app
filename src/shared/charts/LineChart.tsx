import { useId } from 'react'
import { motion } from 'motion/react'
import { seriesToPts, smoothPath } from './chart-utils'
import { formatKrwCompact } from '../format/krw'

const X_LABEL_H = 16

interface Props {
  points: number[]
  width?: number
  height?: number
  /** 재드로잉 트리거용 — 기간 전환 시 바꿔주면 처음부터 다시 그린다 */
  drawKey?: string
  /** 각 포인트에 도트 마커 — 구간(월)별 변화를 강조할 때 */
  markers?: boolean
  /** 하단 x축 라벨 (포인트 수와 같으면 포인트 정렬, 아니면 균등 분배) */
  xLabels?: string[]
  /** 최소/최대 수평 그리드 + 금액 라벨 */
  yTicks?: boolean
}

export function LineChart({ points, width = 220, height = 120, drawKey, markers, xLabels, yTicks }: Props) {
  const gradId = useId()
  const plotH = height - (xLabels ? X_LABEL_H : 0)
  const pts = seriesToPts(points, width, plotH, 8)
  const line = smoothPath(pts)
  const last = pts[pts.length - 1]
  const area = `${line} L ${last.x} ${plotH} L ${pts[0].x} ${plotH} Z`
  const min = Math.min(...points)
  const max = Math.max(...points)
  const minY = Math.max(...pts.map((p) => p.y))
  const maxY = Math.min(...pts.map((p) => p.y))

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} aria-hidden>
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="currentColor" stopOpacity={0.28} />
          <stop offset="100%" stopColor="currentColor" stopOpacity={0} />
        </linearGradient>
      </defs>

      {/* y축: 최소/최대 그리드 + 금액 라벨 */}
      {yTicks && (
        <g>
          {/* 최대 = 좌상단(곡선이 낮아 빈 곳), 최소 = 우하단(곡선이 높아 빈 곳) */}
          {[
            { y: maxY, v: max, x: 2, anchor: 'start' as const },
            { y: minY, v: min, x: width - 2, anchor: 'end' as const },
          ].map(({ y, v, x, anchor }) => (
            <g key={v}>
              <line x1={0} y1={y} x2={width} y2={y} stroke="currentColor" strokeOpacity={0.12} strokeWidth={1} strokeDasharray="3 4" />
              <text x={x} y={y - 4} textAnchor={anchor} fontSize={9} fontWeight={600} fill="currentColor" opacity={0.55}>
                {formatKrwCompact(v)}
              </text>
            </g>
          ))}
        </g>
      )}

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
        {/* 구간 마커 — 선 드로잉을 따라 순차 등장 */}
        {markers &&
          pts.slice(0, -1).map((p, i) => (
            <motion.circle
              key={i}
              cx={p.x}
              cy={p.y}
              r={3.5}
              fill="var(--color-elevated, white)"
              stroke="currentColor"
              strokeWidth={2.5}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.15 + (i / pts.length) * 0.9, type: 'spring', stiffness: 300, damping: 20 }}
            />
          ))}
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

      {/* x축: 월 라벨 */}
      {xLabels?.map((label, i) => {
        const x =
          xLabels.length === pts.length ? pts[i].x : 8 + (i / (xLabels.length - 1)) * (width - 16)
        return (
          <text
            key={label}
            x={x}
            y={height - 3}
            textAnchor="middle"
            fontSize={9.5}
            fontWeight={i === xLabels.length - 1 ? 800 : 600}
            fill="currentColor"
            opacity={i === xLabels.length - 1 ? 0.85 : 0.45}
          >
            {label}
          </text>
        )
      })}
    </svg>
  )
}
