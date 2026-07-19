import { useEffect, useId } from 'react'
import { motion, useMotionValue, useSpring, useTransform } from 'motion/react'

interface Props {
  /** 목표 진행률 0~1 = 동전 높이 */
  pct: number
  width?: number
  height?: number
}

const INNER_TOP = 52
const INNER_BOTTOM = 128

/**
 * 투명 돼지 저금통 게이지 — 몸통 안 동전 더미가 pct만큼 차오른다.
 * 수위는 WaterGlass와 같은 스프링 구동(전환 시 자연스러운 출렁임),
 * 진입 시 등 슬롯으로 동전이 떨어지는 1회성 연출. transform/opacity만 사용.
 */
export function CoinJar({ pct, width = 172, height = 150 }: Props) {
  const clipId = useId()
  const level = useMotionValue(pct)
  const springLevel = useSpring(level, { stiffness: 90, damping: 16 })

  useEffect(() => {
    level.set(pct)
  }, [level, pct])

  // 동전 더미 전체를 아래로 밀어두고 수위만큼 올린다 (WaterGlass 패턴)
  const pileY = useTransform(springLevel, (l) => (1 - Math.max(0, Math.min(1, l))) * (INNER_BOTTOM - INNER_TOP))

  // 동전 더미: 규칙 배치 행렬 (시드 불필요 — 결정적)
  const coins: { cx: number; cy: number }[] = []
  for (let row = 0; row < 11; row++) {
    const cy = INNER_BOTTOM - 4 - row * 7.6
    const shift = row % 2 === 0 ? 0 : 8
    for (let col = 0; col < 8; col++) {
      coins.push({ cx: 34 + shift + col * 16, cy })
    }
  }

  return (
    <svg width={width} height={height} viewBox="0 0 180 150" aria-hidden>
      <defs>
        <clipPath id={clipId}>
          <ellipse cx="88" cy="88" rx="62" ry="45" />
        </clipPath>
      </defs>

      {/* 반투명 몸통 */}
      <ellipse cx="88" cy="88" rx="62" ry="45" fill="currentColor" opacity={0.07} />

      {/* 동전 더미 */}
      <g clipPath={`url(#${clipId})`}>
        <motion.g style={{ y: pileY }}>
          {coins.map((c, i) => (
            <g key={i}>
              <ellipse cx={c.cx} cy={c.cy} rx={8} ry={3.2} fill="currentColor" opacity={0.5} />
              <ellipse cx={c.cx} cy={c.cy - 1.4} rx={8} ry={3.2} fill="currentColor" opacity={0.85} />
            </g>
          ))}
        </motion.g>
      </g>

      {/* 진입 연출: 슬롯으로 떨어지는 동전 3개 (1회성) */}
      {[0, 1, 2].map((i) => (
        <motion.ellipse
          key={i}
          cx={88}
          cy={34}
          rx={7}
          ry={4.5}
          fill="currentColor"
          initial={{ y: -26, opacity: 0 }}
          animate={{ y: [-26, -10, 4], opacity: [0, 1, 0] }}
          transition={{ duration: 0.7, delay: 0.25 + i * 0.3, ease: 'easeIn' }}
        />
      ))}

      {/* 돼지 실루엣 — 외곽선 */}
      <g stroke="currentColor" strokeOpacity={0.3} strokeWidth={3} fill="none" strokeLinecap="round">
        <ellipse cx="88" cy="88" rx="62" ry="45" />
        {/* 코 (오른쪽) */}
        <rect x="148" y="76" width="18" height="24" rx="8" fill="var(--color-elevated, white)" />
        {/* 귀 */}
        <path d="M118 47 L132 32 L138 52" />
        {/* 다리 */}
        <path d="M56 130 L56 141" strokeWidth={7} />
        <path d="M118 130 L118 141" strokeWidth={7} />
        {/* 꼬리 (왼쪽 돌돌이) */}
        <path d="M27 82 C 16 78, 14 92, 24 92" strokeWidth={2.5} />
        {/* 동전 슬롯 (등 위) */}
        <path d="M76 42 L102 42" strokeWidth={4} strokeOpacity={0.45} />
      </g>
      {/* 콧구멍 */}
      <g fill="currentColor" opacity={0.4}>
        <circle cx="154.5" cy="85" r="1.8" />
        <circle cx="154.5" cy="92" r="1.8" />
      </g>
      {/* 하이라이트 */}
      <path
        d="M 44 66 C 38 74, 36 84, 38 96"
        stroke="white"
        strokeOpacity={0.6}
        strokeWidth={5}
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  )
}
