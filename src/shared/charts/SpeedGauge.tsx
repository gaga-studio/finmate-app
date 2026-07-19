import { motion } from 'motion/react'
import { dramatic } from '../motion/springs'

interface Props {
  /** 진행률 0~1 */
  pct: number
  width?: number
  height?: number
}

const SWEEP = 240
const START = 150 // SVG 각도(도) — 좌하단에서 시작해 시계방향 240°

function polar(c: { x: number; y: number }, r: number, deg: number) {
  const rad = (deg * Math.PI) / 180
  return { x: c.x + r * Math.cos(rad), y: c.y + r * Math.sin(rad) }
}

/**
 * 속도계형 게이지 — 240° 아크 트랙 + 진행 아크(pathLength 드로잉) +
 * 바늘(오버슈트 스프링 회전). transform/opacity만, 무한 루프 없음.
 */
export function SpeedGauge({ pct, width = 200, height = 152 }: Props) {
  const c = { x: 100, y: 92 }
  const r = 72
  const thickness = 12

  const a0 = polar(c, r, START)
  const a1 = polar(c, r, START + SWEEP)
  const arcPath = `M ${a0.x} ${a0.y} A ${r} ${r} 0 1 1 ${a1.x} ${a1.y}`

  const needleDeg = -120 + SWEEP * Math.max(0, Math.min(1, pct))

  return (
    <svg width={width} height={height} viewBox="0 0 200 152" aria-hidden>
      {/* 트랙 */}
      <path
        d={arcPath}
        fill="none"
        stroke="currentColor"
        strokeOpacity={0.14}
        strokeWidth={thickness}
        strokeLinecap="round"
      />
      {/* 진행 아크 — RingGauge와 같은 드로잉 스프링 */}
      <motion.path
        d={arcPath}
        fill="none"
        stroke="currentColor"
        strokeWidth={thickness}
        strokeLinecap="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: pct }}
        transition={{ type: 'spring', stiffness: 60, damping: 18 }}
      />

      {/* 눈금 — 20° 간격 13개, 0/25/50/75/100% 지점 강조 */}
      {Array.from({ length: 13 }, (_, i) => {
        const deg = START + (i / 12) * SWEEP
        const major = i % 3 === 0
        const outer = polar(c, r - thickness / 2 - 3, deg)
        const inner = polar(c, r - thickness / 2 - (major ? 11 : 7), deg)
        return (
          <line
            key={i}
            x1={outer.x}
            y1={outer.y}
            x2={inner.x}
            y2={inner.y}
            stroke="currentColor"
            strokeOpacity={major ? 0.5 : 0.22}
            strokeWidth={major ? 2.4 : 1.6}
            strokeLinecap="round"
          />
        )
      })}

      {/* 바늘 — 0%에서 목표치까지 오버슈트 스프링 회전 */}
      <motion.g
        initial={{ rotate: -120 }}
        animate={{ rotate: needleDeg }}
        transition={dramatic}
        style={{ transformBox: 'view-box', transformOrigin: `${c.x}px ${c.y}px` }}
      >
        <line
          x1={c.x}
          y1={c.y + 10}
          x2={c.x}
          y2={c.y - r + 16}
          stroke="currentColor"
          strokeWidth={4}
          strokeLinecap="round"
        />
      </motion.g>
      {/* 피벗 */}
      <circle cx={c.x} cy={c.y} r={7.5} fill="currentColor" />
      <circle cx={c.x} cy={c.y} r={3} fill="white" fillOpacity={0.9} />
    </svg>
  )
}
