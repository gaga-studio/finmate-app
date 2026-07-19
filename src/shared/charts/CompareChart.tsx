import { motion } from 'motion/react'
import { scaleLinear, type Pt } from './chart-utils'
import { formatKrwCompact } from '../format/krw'

const X_LABEL_H = 16
const LEGEND_H = 14

interface Props {
  /** 평가액 (실선) */
  value: number[]
  /** 누적 원금 (점선) — value와 같은 길이 */
  principal: number[]
  width?: number
  height?: number
  /** 하단 x축 라벨 (포인트 수와 동일 길이) */
  xLabels?: string[]
}

function toLine(pts: Pt[]): string {
  return pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ')
}

/**
 * 원금 vs 평가액 비교 차트 — 두 선이 벌어지는 틈이 곧 수익.
 * 월 단위 직선 폴리라인(꺾임 = 월별 변화), 공용 스케일 + 범례·축 라벨.
 */
export function CompareChart({ value, principal, width = 216, height = 110, xLabels }: Props) {
  const pad = 8
  const plotTop = LEGEND_H
  const plotBottom = height - (xLabels ? X_LABEL_H : 0)
  const all = [...value, ...principal]
  const min = Math.min(...all)
  const max = Math.max(...all)
  const pts = (series: number[]): Pt[] =>
    series.map((v, i) => ({
      x: scaleLinear(i, [0, series.length - 1], [pad, width - pad]),
      y: scaleLinear(v, [min, max], [plotBottom - pad, plotTop + pad]),
    }))

  const valuePts = pts(value)
  const principalPts = pts(principal)
  const last = valuePts[valuePts.length - 1]

  // 두 선 사이 채움 폴리곤 — 수익 영역
  const gapArea =
    toLine(valuePts) +
    ' ' +
    [...principalPts]
      .reverse()
      .map((p) => `L ${p.x} ${p.y}`)
      .join(' ') +
    ' Z'

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} aria-hidden>
      {/* 범례 */}
      <g fontSize={9} fontWeight={600} fill="currentColor">
        <line x1={0} y1={5} x2={16} y2={5} stroke="currentColor" strokeWidth={3} strokeLinecap="round" />
        <text x={20} y={8}>평가액</text>
        <line x1={58} y1={5} x2={74} y2={5} stroke="currentColor" strokeWidth={2.5} strokeOpacity={0.4} strokeDasharray="3 4" strokeLinecap="round" />
        <text x={78} y={8} opacity={0.6}>원금</text>
      </g>

      {/* y축: 최소/최대 그리드 + 금액 라벨 (최대=좌상단, 최소=우하단 빈 공간) */}
      {[
        { y: plotTop + pad, v: max, x: 2, anchor: 'start' as const },
        { y: plotBottom - pad, v: min, x: width - 2, anchor: 'end' as const },
      ].map(({ y, v, x, anchor }) => (
        <g key={v}>
          <line x1={0} y1={y} x2={width} y2={y} stroke="currentColor" strokeOpacity={0.12} strokeWidth={1} strokeDasharray="3 4" />
          <text x={x} y={y - 4} textAnchor={anchor} fontSize={9} fontWeight={600} fill="currentColor" opacity={0.55}>
            {formatKrwCompact(v)}
          </text>
        </g>
      ))}

      <motion.path
        d={gapArea}
        fill="currentColor"
        opacity={0.12}
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.12 }}
        transition={{ delay: 0.55, duration: 0.5 }}
      />

      {/* 원금 점선 */}
      <motion.path
        d={toLine(principalPts)}
        fill="none"
        stroke="currentColor"
        strokeOpacity={0.35}
        strokeWidth={2.5}
        strokeDasharray="4 6"
        strokeLinecap="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.9, ease: [0.3, 0, 0.2, 1] }}
      />

      {/* 평가액 실선 */}
      <motion.path
        d={toLine(valuePts)}
        fill="none"
        stroke="currentColor"
        strokeWidth={3.5}
        strokeLinecap="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.9, ease: [0.3, 0, 0.2, 1] }}
      />

      {/* 평가액 월 마커 */}
      {valuePts.slice(0, -1).map((p, i) => (
        <motion.circle
          key={i}
          cx={p.x}
          cy={p.y}
          r={3.2}
          fill="var(--color-elevated, white)"
          stroke="currentColor"
          strokeWidth={2.4}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.15 + (i / valuePts.length) * 0.9, type: 'spring', stiffness: 300, damping: 20 }}
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

      {/* x축: 월 라벨 */}
      {xLabels?.map((label, i) => (
        <text
          key={label}
          x={valuePts[i]?.x ?? 0}
          y={height - 3}
          textAnchor="middle"
          fontSize={9.5}
          fontWeight={i === xLabels.length - 1 ? 800 : 600}
          fill="currentColor"
          opacity={i === xLabels.length - 1 ? 0.85 : 0.45}
        >
          {label}
        </text>
      ))}
    </svg>
  )
}
