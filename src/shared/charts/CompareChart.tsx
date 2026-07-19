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
  /** 범례 라벨 [실선, 점선] — 기본은 원금 vs 평가 용도 */
  labels?: [string, string]
  /** 라인 색 [실선, 점선] — 지정하면 두 선이 다른 색으로 그려진다 (기본 currentColor 단색) */
  colors?: [string, string]
}

function toLine(pts: Pt[]): string {
  return pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ')
}

/**
 * 원금 vs 평가액 비교 차트 — 두 선이 벌어지는 틈이 곧 수익.
 * 월 단위 직선 폴리라인(꺾임 = 월별 변화), 공용 스케일 + 범례·축 라벨.
 */
export function CompareChart({ value, principal, width = 216, height = 110, xLabels, labels = ['평가액', '원금'], colors }: Props) {
  const valueColor = colors?.[0] ?? 'currentColor'
  const principalColor = colors?.[1] ?? 'currentColor'
  // 색 구분 모드(비교)에서는 두 번째 선도 실선+도트로 — 사용자 선과 같은 문법
  const principalOpacity = colors ? 0.9 : 0.35
  const principalDash = colors ? undefined : '3 4'
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
      {/* 범례 — 라벨 길이에 맞춰 두 번째 항목 위치를 계산 */}
      <g fontSize={9} fontWeight={600} fill="currentColor">
        <line x1={0} y1={5} x2={16} y2={5} stroke={valueColor} strokeWidth={3} strokeLinecap="round" />
        <text x={20} y={8}>{labels[0]}</text>
        {(() => {
          const x2 = 20 + labels[0].length * 9.5 + 9
          return (
            <>
              <line x1={x2} y1={5} x2={x2 + 16} y2={5} stroke={principalColor} strokeWidth={2.5} strokeOpacity={principalOpacity} strokeDasharray={principalDash} strokeLinecap="round" />
              <text x={x2 + 20} y={8} opacity={0.6}>{labels[1]}</text>
            </>
          )
        })()}
      </g>

      {/* y축: 최소/최대 그리드 + 금액 라벨 (최대=좌상단, 최소=우하단 빈 공간) */}
      {[
        { y: plotTop + pad, v: max, x: 2, anchor: 'start' as const },
        { y: plotBottom - pad, v: min, x: width - 2, anchor: 'end' as const },
      ].map(({ y, v, x, anchor }) => (
        <g key={v}>
          <line x1={0} y1={y} x2={width} y2={y} stroke="currentColor" strokeOpacity={0.18} strokeWidth={1} strokeDasharray="3 4" />
          <text x={x} y={y - 4} textAnchor={anchor} fontSize={9} fontWeight={600} fill="currentColor" opacity={0.8}>
            {formatKrwCompact(v)}
          </text>
        </g>
      ))}

      <motion.path
        d={gapArea}
        fill={valueColor}
        opacity={0.12}
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.12 }}
        transition={{ delay: 0.55, duration: 0.5 }}
      />

      {/* 두 번째 선 — 기본은 원금 점선, 색 구분 모드에선 메이트 실선 */}
      <motion.path
        d={toLine(principalPts)}
        fill="none"
        stroke={principalColor}
        strokeOpacity={principalOpacity}
        strokeWidth={colors ? 3 : 2.5}
        strokeDasharray={colors ? undefined : '4 6'}
        strokeLinecap="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.9, ease: [0.3, 0, 0.2, 1] }}
      />

      {/* 색 구분 모드: 메이트 선에도 월 도트 마커 */}
      {colors &&
        principalPts.map((p, i) => (
          <motion.circle
            key={`p-${i}`}
            cx={p.x}
            cy={p.y}
            r={3}
            fill="var(--color-elevated, white)"
            stroke={principalColor}
            strokeWidth={2.2}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.15 + (i / principalPts.length) * 0.9, type: 'spring', stiffness: 300, damping: 20 }}
          />
        ))}

      {/* 평가액 실선 */}
      <motion.path
        d={toLine(valuePts)}
        fill="none"
        stroke={valueColor}
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
          stroke={valueColor}
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
        fill={valueColor}
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.75, type: 'spring', stiffness: 300, damping: 18 }}
      />
      <motion.circle
        cx={last.x}
        cy={last.y}
        r={5}
        fill="none"
        stroke={valueColor}
        strokeWidth={2}
        initial={{ scale: 1, opacity: 0.6 }}
        animate={{ scale: 2.4, opacity: 0 }}
        transition={{ delay: 1, duration: 1.6, repeat: Infinity, repeatDelay: 1.2 }}
      />

      {/* x축: 월 라벨 — 가장자리에서 넘치면 안쪽 정렬로 바꿔 잘림을 막는다 */}
      {xLabels?.map((label, i) => {
        const raw = valuePts[i]?.x ?? 0
        const half = (label.length * 9) / 2
        const anchor = raw - half < 1 ? 'start' : raw + half > width - 1 ? 'end' : 'middle'
        const x = anchor === 'start' ? 1 : anchor === 'end' ? width - 1 : raw
        return (
          <text
            key={label}
            x={x}
            y={height - 3}
            textAnchor={anchor}
            fontSize={9.5}
            fontWeight={i === xLabels.length - 1 ? 800 : 600}
            fill="currentColor"
            opacity={i === xLabels.length - 1 ? 0.95 : 0.7}
          >
            {label}
          </text>
        )
      })}
    </svg>
  )
}
