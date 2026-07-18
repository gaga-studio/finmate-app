import { useEffect, useId } from 'react'
import { motion, useMotionValue, useSpring, useTransform } from 'motion/react'

interface Props {
  /** 남은 비율 0~1 = 수위 */
  pct: number
  width?: number
  height?: number
}

const GLASS_INSET_TOP = 10
const GLASS_INSET_BOTTOM = 12

/**
 * 물잔 게이지. 수위는 스프링으로 구동해 기간 전환 시
 * 오버슈트가 자연스러운 출렁임이 된다. 물결은 사인파 path 2장의
 * 수평 무한 루프(transform만 사용, 리페인트 없음).
 */
export function WaterGlass({ pct, width = 150, height = 170 }: Props) {
  const clipId = useId()
  const level = useMotionValue(pct)
  const springLevel = useSpring(level, { stiffness: 90, damping: 16 })

  useEffect(() => {
    level.set(pct)
  }, [level, pct])

  const innerTop = GLASS_INSET_TOP + 8
  const innerBottom = height - GLASS_INSET_BOTTOM - 8
  const surfaceY = useTransform(springLevel, (l) => innerBottom - (innerBottom - innerTop) * Math.max(0, Math.min(1, l)))

  // 잔: 위가 넓고 아래가 살짝 좁은 둥근 사다리꼴
  const w = width
  const h = height
  const glassPath = `
    M ${w * 0.18} ${GLASS_INSET_TOP}
    L ${w * 0.82} ${GLASS_INSET_TOP}
    C ${w * 0.84} ${GLASS_INSET_TOP} ${w * 0.84} ${GLASS_INSET_TOP + 6} ${w * 0.835} ${GLASS_INSET_TOP + 12}
    L ${w * 0.75} ${h - GLASS_INSET_BOTTOM - 10}
    C ${w * 0.74} ${h - GLASS_INSET_BOTTOM} ${w * 0.72} ${h - GLASS_INSET_BOTTOM} ${w * 0.7} ${h - GLASS_INSET_BOTTOM}
    L ${w * 0.3} ${h - GLASS_INSET_BOTTOM}
    C ${w * 0.28} ${h - GLASS_INSET_BOTTOM} ${w * 0.26} ${h - GLASS_INSET_BOTTOM} ${w * 0.25} ${h - GLASS_INSET_BOTTOM - 10}
    L ${w * 0.165} ${GLASS_INSET_TOP + 12}
    C ${w * 0.16} ${GLASS_INSET_TOP + 6} ${w * 0.16} ${GLASS_INSET_TOP} ${w * 0.18} ${GLASS_INSET_TOP}
    Z
  `

  const waveW = w
  const wave = (amp: number) => {
    let d = `M 0 0`
    const total = 32
    for (let i = 1; i <= total; i++) {
      const x = (i / total) * waveW * 2
      const y = Math.sin((i / total) * Math.PI * 4) * amp
      d += ` L ${x.toFixed(1)} ${y.toFixed(1)}`
    }
    return `${d} L ${waveW * 2} ${h} L 0 ${h} Z`
  }

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} aria-hidden>
      <defs>
        <clipPath id={clipId}>
          <path d={glassPath} />
        </clipPath>
      </defs>

      <g clipPath={`url(#${clipId})`}>
        {/* 물 본체 + 물결 2장 (위상차 수평 루프) */}
        <motion.g style={{ y: surfaceY }}>
          <motion.path
            d={wave(4)}
            fill="currentColor"
            opacity={0.35}
            animate={{ x: [0, -waveW] }}
            transition={{ repeat: Infinity, ease: 'linear', duration: 4.2 }}
          />
          <motion.path
            d={wave(3)}
            fill="currentColor"
            opacity={0.75}
            animate={{ x: [-waveW, 0] }}
            transition={{ repeat: Infinity, ease: 'linear', duration: 3 }}
          />
        </motion.g>
      </g>

      {/* 잔 외곽선 + 하이라이트 */}
      <path d={glassPath} fill="none" stroke="currentColor" strokeOpacity={0.28} strokeWidth={3} />
      <path
        d={`M ${w * 0.235} ${GLASS_INSET_TOP + 18} L ${w * 0.29} ${h - GLASS_INSET_BOTTOM - 22}`}
        stroke="white"
        strokeOpacity={0.55}
        strokeWidth={5}
        strokeLinecap="round"
      />
    </svg>
  )
}
