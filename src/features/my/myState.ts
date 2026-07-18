import type { Metric, Period } from '../../data/types'

export type { Metric, Period }

export const METRICS: Metric[] = ['budget', 'saving', 'invest']
export const PERIODS: Period[] = ['daily', 'weekly', 'monthly']

export const PERIOD_LABEL: Record<Period, string> = {
  daily: '일간',
  weekly: '주간',
  monthly: '월간',
}

export const PERIOD_PREFIX: Record<Period, string> = {
  daily: '오늘',
  weekly: '이번 주',
  monthly: '이번 달',
}

export function nextPeriod(p: Period): Period {
  return PERIODS[(PERIODS.indexOf(p) + 1) % PERIODS.length]
}

/** 지표별 고유 색 클래스 — 카드가 활성이 아니어도 자기 색을 유지한다 */
export const METRIC_TEXT: Record<Metric, string> = {
  budget: 'text-budget',
  saving: 'text-saving',
  invest: 'text-invest',
}
