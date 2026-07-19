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

/** 보유 종목 트리맵 — 면적 = 비중. transform/opacity만 사용. */
export function Treemap({ items, width = 216, height = 148 }: Props) {
  const sorted = [...items].sort((a, b) => b.value - a.value)
  const cells = layout(sorted, 0, 0, width, height, 0)
  const gap = 1.5

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} aria-hidden>
      {cells.map((c, i) => {
        const light = CELL_L[Math.min(c.rank, CELL_L.length - 1)]
        const showLabel = c.weight >= 0.12 && c.w > 52 && c.h > 34
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
            {showLabel && (
              <>
                <text
                  x={c.x + 10}
                  y={c.y + 20}
                  fontSize={10.5}
                  fontWeight={700}
                  fill={light > 0.72 ? 'oklch(0.35 0.1 295)' : 'white'}
                >
                  {c.label}
                </text>
                <text
                  x={c.x + 10}
                  y={c.y + 34}
                  fontSize={11}
                  fontWeight={800}
                  fill={light > 0.72 ? 'oklch(0.35 0.1 295)' : 'white'}
                  opacity={0.92}
                >
                  {Math.round(c.weight * 100)}%
                </text>
              </>
            )}
          </motion.g>
        )
      })}
    </svg>
  )
}
