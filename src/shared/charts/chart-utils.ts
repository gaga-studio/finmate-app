export interface Pt {
  x: number
  y: number
}

export function scaleLinear(
  value: number,
  domain: [number, number],
  range: [number, number],
): number {
  const [d0, d1] = domain
  const [r0, r1] = range
  if (d1 === d0) return (r0 + r1) / 2
  return r0 + ((value - d0) / (d1 - d0)) * (r1 - r0)
}

/** Catmull-Rom → cubic bezier: 점들을 부드러운 곡선 path로 */
export function smoothPath(pts: Pt[]): string {
  if (pts.length < 2) return ''
  let d = `M ${pts[0].x} ${pts[0].y}`
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[Math.max(0, i - 1)]
    const p1 = pts[i]
    const p2 = pts[i + 1]
    const p3 = pts[Math.min(pts.length - 1, i + 2)]
    const c1x = p1.x + (p2.x - p0.x) / 6
    const c1y = p1.y + (p2.y - p0.y) / 6
    const c2x = p2.x - (p3.x - p1.x) / 6
    const c2y = p2.y - (p3.y - p1.y) / 6
    d += ` C ${c1x} ${c1y}, ${c2x} ${c2y}, ${p2.x} ${p2.y}`
  }
  return d
}

export function seriesToPts(
  points: number[],
  width: number,
  height: number,
  pad = 6,
): Pt[] {
  const min = Math.min(...points)
  const max = Math.max(...points)
  return points.map((v, i) => ({
    x: scaleLinear(i, [0, points.length - 1], [pad, width - pad]),
    y: scaleLinear(v, [min, max], [height - pad, pad]),
  }))
}

/** 물결 사인파 path — width의 2배 폭으로 만들어 수평 루프에 쓴다 */
export function wavePath(width: number, amplitude: number, cycles = 2): string {
  const w2 = width * 2
  const step = w2 / (cycles * 2 * 8)
  let d = `M 0 0`
  const total = cycles * 2 * 8
  for (let i = 1; i <= total; i++) {
    const x = i * step
    const y = Math.sin((i / 8) * Math.PI) * amplitude
    d += ` L ${x.toFixed(1)} ${y.toFixed(1)}`
  }
  // 아래로 닫아 면으로 만든다 (물 본체)
  d += ` L ${w2} 400 L 0 400 Z`
  return d
}
