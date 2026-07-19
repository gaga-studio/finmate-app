import { useId } from 'react'
import { mulberry32 } from '../../../data/seed'
import { ASSET_SERIES } from '../../../data/domain'
import type { Metric, Period } from '../../../data/types'

/**
 * 코드 드로잉 Wrapped 아트 — 팀 AI 아트 도착 전 플레이스홀더.
 * 지표(색·모티프) × 기간(시간대) 조합으로 9종이 모두 다른 장면이 된다.
 *
 * 캡처 안전 규칙: SVG filter·애니메이션 금지 (html-to-image 직렬화 호환).
 * 효과는 그라디언트와 시드 기하로만 낸다.
 */
export function WrappedArt({ metric, period }: { metric: Metric; period: Period }) {
  const uid = useId()
  const id = (name: string) => `${uid}-${name}`
  const url = (name: string) => `url(#${id(name)})`

  const h = HUE[metric]
  const sky = SKY[period](h)
  const cel = CELESTIAL[period](h)
  // 실루엣 톤 — 기간이 밤으로 갈수록 어두워진다
  const silL = { daily: 0.3, weekly: 0.26, monthly: 0.2 }[period]
  const sil = (alpha: number) => `oklch(${silL} 0.055 ${h} / ${alpha})`
  const bright = (alpha = 1) => `oklch(0.92 0.04 ${h} / ${alpha})`

  return (
    <svg
      viewBox="0 0 270 480"
      preserveAspectRatio="xMidYMid slice"
      className="absolute inset-0 h-full w-full"
      aria-hidden
    >
      <defs>
        <linearGradient id={id('sky')} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={sky[0]} />
          <stop offset="0.55" stopColor={sky[1]} />
          <stop offset="1" stopColor={sky[2]} />
        </linearGradient>
        <radialGradient id={id('glow')}>
          <stop offset="0" stopColor="white" stopOpacity="0.4" />
          <stop offset="1" stopColor="white" stopOpacity="0" />
        </radialGradient>
        <radialGradient id={id('vignette')} cx="0.5" cy="0.45" r="0.8">
          <stop offset="0.55" stopColor="black" stopOpacity="0" />
          <stop offset="1" stopColor="black" stopOpacity="0.3" />
        </radialGradient>
      </defs>

      {/* 하늘 */}
      <rect width="270" height="480" fill={url('sky')} />

      {/* 별 — 밤(월간)에만 */}
      {period === 'monthly' && <Stars />}

      {/* 천체 글로우 + 원반 */}
      <circle cx={cel.cx} cy={cel.cy} r={cel.glowR} fill={url('glow')} />
      <circle cx={cel.cx} cy={cel.cy} r={cel.r} fill={cel.fill} />

      {/* 지표별 장면 */}
      {metric === 'budget' && <BudgetScene sil={sil} bright={bright} />}
      {metric === 'saving' && <SavingScene sil={sil} bright={bright} />}
      {metric === 'invest' && <InvestScene sil={sil} hue={h} />}

      {/* 그레인 + 비네트 */}
      <Grain seedKey={`${metric}-${period}`} />
      <rect width="270" height="480" fill={url('vignette')} />
    </svg>
  )
}

const HUE: Record<Metric, number> = { budget: 230, saving: 168, invest: 295 }

/** 기간 = 시간대: 일간 아침 / 주간 노을 / 월간 밤 */
const SKY: Record<Period, (h: number) => [string, string, string]> = {
  daily: (h) => [`oklch(0.9 0.05 ${h})`, `oklch(0.74 0.1 ${h})`, `oklch(0.6 0.14 ${h})`],
  weekly: (h) => [`oklch(0.76 0.1 ${h})`, `oklch(0.7 0.13 ${h + 50})`, `oklch(0.44 0.13 ${h + 15})`],
  monthly: (h) => [`oklch(0.36 0.07 ${h})`, `oklch(0.26 0.06 ${h})`, `oklch(0.17 0.04 ${h})`],
}

interface Celestial {
  cx: number
  cy: number
  r: number
  glowR: number
  fill: string
}

const CELESTIAL: Record<Period, (h: number) => Celestial> = {
  daily: (h) => ({ cx: 204, cy: 92, r: 28, glowR: 88, fill: `oklch(0.98 0.02 ${h})` }),
  // 주간 해는 모티프 뒤의 큰 역광 — 실루엣 포스터 톤
  weekly: (h) => ({ cx: 135, cy: 140, r: 44, glowR: 120, fill: `oklch(0.9 0.1 ${h + 55})` }),
  monthly: (h) => ({ cx: 194, cy: 96, r: 22, glowR: 76, fill: `oklch(0.95 0.02 ${h})` }),
}

/* ---------- 장면: 예산 — 언덕 위 운동화, 스카이라인, 커피 김 ---------- */

const SKYLINE = [14, 24, 10, 19, 28, 12, 22, 16, 26, 11, 18]

function BudgetScene({ sil, bright }: { sil: (a: number) => string; bright: (a?: number) => string }) {
  return (
    <g>
      {/* 지평선의 도시 스카이라인 — 은은한 배경 텍스처 */}
      {SKYLINE.map((height, i) => (
        <rect key={i} x={8 + i * 24} y={324 - height} width={16} height={height} fill={sil(0.28)} />
      ))}
      {/* 뒷언덕 / 앞언덕 */}
      <path d="M0,346 Q70,304 140,336 T270,328 L270,480 L0,480 Z" fill={sil(0.7)} />
      <path d="M0,392 Q90,344 184,376 T270,364 L270,480 L0,480 Z" fill={sil(0.95)} />

      {/* 운동화 — 하늘에 떠 있는 기념비 (초현실 포스터 톤, 오버레이 텍스트존 위) */}
      <g transform="translate(72,86) scale(1.05)">
        <path
          d="M6,44 C10,30 24,24 38,22 C54,20 64,12 74,6 C79,3 84,4 87,9 C92,18 104,26 112,30 C118,33 119,40 116,46 L114,52 L8,52 Z"
          fill={sil(0.92)}
        />
        <path d="M38,22 C54,20 64,12 74,6" stroke={bright(0.4)} strokeWidth="2" fill="none" strokeLinecap="round" />
        <rect x="2" y="52" width="118" height="9" rx="4.5" fill={sil(1)} />
      </g>
      {/* 떠 있는 운동화의 그림자 */}
      <ellipse cx="135" cy="368" rx="58" ry="7" fill="black" opacity="0.16" />

      {/* 커피잔 + 김 */}
      <g transform="translate(38,338)">
        <path d="M0,10 L19,10 L16,27 L3,27 Z" fill={sil(0.9)} />
        <path d="M19,13 C25,13 25,21 18,22" stroke={sil(0.9)} strokeWidth="2.4" fill="none" />
        <path d="M9,5 C4,-2 14,-9 9,-17" stroke={bright(0.55)} strokeWidth="2" fill="none" strokeLinecap="round" />
      </g>
    </g>
  )
}

/* ---------- 장면: 저축 — 바다 위 한라산, 종이비행기 궤적 ---------- */

function SavingScene({ sil, bright }: { sil: (a: number) => string; bright: (a?: number) => string }) {
  return (
    <g>
      {/* 구름 */}
      <g fill="white" opacity="0.16">
        <ellipse cx="58" cy="92" rx="30" ry="9" />
        <ellipse cx="76" cy="86" rx="20" ry="7" />
        <ellipse cx="206" cy="172" rx="26" ry="8" />
      </g>

      {/* 바다 */}
      <rect x="0" y="300" width="270" height="180" fill={sil(0.82)} />
      {/* 섬(한라산) + 수면 반영 */}
      <path d="M42,300 C84,256 188,256 228,300 Z" fill={sil(0.95)} />
      <ellipse cx="135" cy="308" rx="86" ry="7" fill="black" opacity="0.14" />
      {/* 잔물결 */}
      <g stroke={bright(0.22)} strokeWidth="1.6" strokeLinecap="round" fill="none">
        <path d="M30,336 q14,-4 28,0" />
        <path d="M170,352 q16,-4 32,0" />
        <path d="M92,394 q18,-5 36,0" />
      </g>

      {/* 점선 궤적 → 종이비행기 상승 (오버레이 텍스트존 위 고정 좌표) */}
      <path
        d="M36,268 C88,244 58,170 120,130"
        stroke={bright(0.6)}
        strokeWidth="2"
        strokeDasharray="1.5 7"
        strokeLinecap="round"
        fill="none"
      />
      <g transform="translate(126,106) rotate(-18)">
        <path d="M0,18 L36,0 L15,23 Z" fill={bright(0.95)} />
        <path d="M15,23 L36,0 L21,27 Z" fill={bright(0.6)} />
      </g>
    </g>
  )
}

/* ---------- 장면: 투자 — 자산 곡선이 곧 능선인 산맥 ---------- */

function ridge(points: number[], top: number, bottom: number): { x: number; y: number }[] {
  const min = Math.min(...points)
  const max = Math.max(...points)
  return points.map((v, i) => ({
    x: Math.round((i / (points.length - 1)) * 270),
    y: Math.round(bottom - ((v - min) / (max - min)) * (bottom - top)),
  }))
}

function toLine(pts: { x: number; y: number }[]): string {
  return pts.map((p) => `${p.x},${p.y}`).join(' L')
}

function InvestScene({ sil, hue }: { sil: (a: number) => string; hue: number }) {
  const back = toLine(ridge(ASSET_SERIES.slice(-64, -16), 282, 380))
  const frontPts = ridge(ASSET_SERIES.slice(-32), 252, 404)
  const front = toLine(frontPts)
  const last = frontPts[frontPts.length - 1]
  const line = `oklch(0.85 0.09 ${hue})`
  return (
    <g>
      {/* 뒷능선 */}
      <path d={`M0,480 L${back} L270,480 Z`} fill={sil(0.5)} />
      {/* 앞능선 = 최근 32일 자산 곡선 */}
      <path d={`M0,480 L${front} L270,480 Z`} fill={sil(0.95)} />
      {/* 곡선 강조 — 넓은 저알파 + 얇은 밝은 선 (글로우 대체) */}
      <path d={`M${front}`} stroke={line} strokeOpacity="0.18" strokeWidth="7" fill="none" strokeLinecap="round" />
      <path d={`M${front}`} stroke={line} strokeWidth="2" fill="none" strokeLinecap="round" />
      {/* 끝점 */}
      <circle cx={last.x} cy={last.y} r="8" fill={line} opacity="0.25" />
      <circle cx={last.x} cy={last.y} r="3.5" fill={line} />
    </g>
  )
}

/* ---------- 공통 텍스처 ---------- */

function Stars() {
  const rng = mulberry32(4242)
  const stars = Array.from({ length: 42 }, (_, i) => ({
    key: i,
    cx: rng() * 270,
    cy: rng() * 200,
    r: 0.5 + rng() * 0.7,
    o: 0.25 + rng() * 0.6,
  }))
  return (
    <g fill="white">
      {stars.map((s) => (
        <circle key={s.key} cx={s.cx} cy={s.cy} r={s.r} opacity={s.o} />
      ))}
    </g>
  )
}

function hashKey(key: string): number {
  let acc = 0
  for (let i = 0; i < key.length; i++) acc = (acc * 31 + key.charCodeAt(i)) >>> 0
  return acc
}

function Grain({ seedKey }: { seedKey: string }) {
  const rng = mulberry32(hashKey(seedKey))
  const specks = Array.from({ length: 140 }, (_, i) => ({
    key: i,
    cx: rng() * 270,
    cy: rng() * 480,
    r: 0.3 + rng() * 0.5,
    dark: rng() > 0.5,
    o: 0.05 + rng() * 0.07,
  }))
  return (
    <g>
      {specks.map((s) => (
        <circle key={s.key} cx={s.cx} cy={s.cy} r={s.r} fill={s.dark ? 'black' : 'white'} opacity={s.o} />
      ))}
    </g>
  )
}
