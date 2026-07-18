import { DEMO_TODAY } from './demo'
import type { Period } from './types'

/** 로컬 기준 "YYYY-MM-DD" */
export function toKey(d: Date): string {
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${d.getFullYear()}-${m}-${day}`
}

export function fromKey(key: string): Date {
  const [y, m, d] = key.split('-').map(Number)
  return new Date(y, m - 1, d)
}

export function addDays(d: Date, n: number): Date {
  const out = new Date(d)
  out.setDate(out.getDate() + n)
  return out
}

export const TODAY_KEY = toKey(DEMO_TODAY)

export interface PeriodRange {
  /** 포함 */
  startKey: string
  /** 포함 */
  endKey: string
  label: string
}

/** 일간=오늘, 주간=이번 주 일요일~오늘, 월간=이번 달 1일~오늘 */
export function getPeriodRange(period: Period): PeriodRange {
  const end = DEMO_TODAY
  if (period === 'daily') {
    return {
      startKey: TODAY_KEY,
      endKey: TODAY_KEY,
      label: `${end.getMonth() + 1}월 ${end.getDate()}일`,
    }
  }
  if (period === 'weekly') {
    const start = addDays(end, -end.getDay())
    const weekIndex = Math.ceil((end.getDate() + new Date(end.getFullYear(), end.getMonth(), 1).getDay()) / 7)
    return {
      startKey: toKey(start),
      endKey: TODAY_KEY,
      label: `${end.getMonth() + 1}월 ${weekIndex}주차`,
    }
  }
  const start = new Date(end.getFullYear(), end.getMonth(), 1)
  return { startKey: toKey(start), endKey: TODAY_KEY, label: `${end.getMonth() + 1}월` }
}

export function keysInRange(range: PeriodRange): string[] {
  const keys: string[] = []
  let cur = fromKey(range.startKey)
  const end = fromKey(range.endKey)
  while (cur <= end) {
    keys.push(toKey(cur))
    cur = addDays(cur, 1)
  }
  return keys
}
