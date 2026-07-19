import { useId } from 'react'
import { motion } from 'motion/react'
import { snappy } from '../motion/springs'

export interface TreemapItem {
  key: string
  label: string
  value: number
  /** 비중 0~1 (라벨 표기용) */
  weight: number
}

interface Props {
  items: TreemapItem[]
  width?: number
  height?: number
}

interface Cell extends TreemapItem {
  x: number
  y: number
  w: number
  h: number
  rank: number
}

/** 이진 분할: 최대 항목이 한 변을 차지하고 나머지를 재귀 배치 (가로/세로 교대) */
function layout(items: TreemapItem[], x: number, y: number, w: number, h: number, rank: number): Cell[] {
  const [first, ...rest] = items
  if (!first) return []
  if (rest.length === 0) return [{ ...first, x, y, w, h, rank }]
  const total = items.reduce((sum, i) => sum + i.value, 0)
  const frac = first.value / total
  if (w >= h) {
    const fw = w * frac
    return [{ ...first, x, y, w: fw, h, rank }, ...layout(rest, x + fw, y, w - fw, h, rank + 1)]
  }
  const fh = h * frac
  return [{ ...first, x, y, w, h: fh, rank }, ...layout(rest, x, y + fh, w, h - fh, rank + 1)]
}

/** 지표색 계열 명도 단계 — 비중이 클수록 진하다 */
const CELL_L = [0.52, 0.6, 0.68, 0.76, 0.83]

/** 대략적 텍스트 폭 추정 (10.5px 기준, 한글은 폭이 넓다) */
function textWidth(label: string): number {
  let w = 0
  for (const ch of label) w += /[가-힣]/.test(ch) ? 10.5 : 6.3
  return w
}

/** 보유 종목 트리맵 — 면적 = 비중. 라벨은 렉트 위 레이어 + 셀 클립으로 잘림 방지. */
export function Treemap({ items, width = 216, height = 148 }: Props) {
  const uid = useId()
  const sorted = [...items].sort((a, b) => b.value - a.value)
  const cells = layout(sorted, 0, 0, width, height, 0)
  const gap = 1.5

  const labelColor = (light: number) => (light > 0.72 ? 'oklch(0.35 0.1 295)' : 'white')

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} aria-hidden>
      <defs>
        {cells.map((c) => (
          <clipPath key={c.key} id={`${uid}-${c.rank}`}>
            <rect
              x={c.x + gap}
              y={c.y + gap}
              width={Math.max(c.w - gap * 2, 2)}
              height={Math.max(c.h - gap * 2, 2)}
              rx={7}
            />
          </clipPath>
        ))}
      </defs>

      {cells.map((c, i) => {
        const light = CELL_L[Math.min(c.rank, CELL_L.length - 1)]
        const showPct = c.h > 30 && c.w > 34
        const showName = showPct && textWidth(c.label) <= c.w - 18
        return (
          <motion.g
            key={c.key}
            initial={{ scale: 0.82, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ ...snappy, delay: 0.08 + i * 0.05 }}
            style={{ transformBox: 'fill-box', transformOrigin: 'center' }}
          >
            <rect
              x={c.x + gap}
              y={c.y + gap}
              width={Math.max(c.w - gap * 2, 2)}
              height={Math.max(c.h - gap * 2, 2)}
              rx={7}
              fill={`oklch(${light} 0.15 295)`}
            />
            <g clipPath={`url(#${uid}-${c.rank})`}>
              {showName && (
                <text x={c.x + 9} y={c.y + 19} fontSize={10.5} fontWeight={700} fill={labelColor(light)}>
                  {c.label}
                </text>
              )}
              {showPct && (
                <text
                  x={c.x + 9}
                  y={c.y + (showName ? 33 : 21)}
                  fontSize={11}
                  fontWeight={800}
                  fill={labelColor(light)}
                  opacity={0.92}
                >
                  {Math.round(c.weight * 100)}%
                </text>
              )}
            </g>
          </motion.g>
        )
      })}
    </svg>
  )
}
